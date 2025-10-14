"use server";
import axios from "axios";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function createServerApi() {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get("refresh_token_fe")?.value;

  // ✅ Lấy hoặc tạo session_id
  let sessionId = cookieStore.get("cart_session_id")?.value;

  if (!sessionId) {
    sessionId = uuidv4();
    cookieStore.set("cart_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  // ✅ Nếu có refresh_token → lấy access_token mới
  let accessToken: string | null = null;

  if (refreshToken) {
    try {
      const { data } = await axios.get(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api"
        }/users/refresh-token`,
        {
          headers: {
            Cookie: `refresh_token=${refreshToken}`,
          },
          withCredentials: true,
        }
      );
      accessToken = data?.data?.access_token;
      console.log("✅ Got new access_token from refresh_token");
    } catch (error) {
      console.error("❌ Failed to refresh access_token:", error);
      // Nếu refresh thất bại → xóa refresh_token
      cookieStore.delete("refresh_token_fe");
    }
  }

  // ✅ Xây dựng headers
  const headers: Record<string, string> = {
    "x-session-id": sessionId,
  };

  if (refreshToken) {
    headers.Cookie = `refresh_token=${refreshToken}`;
  }

  // ✅ Thêm Authorization header nếu có access_token
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  console.log(">> Headers:", {
    hasRefreshToken: !!refreshToken,
    hasAccessToken: !!accessToken,
    sessionId,
  });

  const instance = axios.create({
    baseURL:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api",
    headers,
    withCredentials: true,
  });

  // ✅ Interceptor để tự động retry khi token hết hạn
  let isRefreshing = false;
  let queue: Array<(t: string | null) => void> = [];
  const flush = (t: string | null) => {
    queue.forEach((cb) => cb(t));
    queue = [];
  };

  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config as any;

      // Không retry nếu đang gọi refresh-token
      if (original?.url?.includes("/users/refresh-token")) throw error;

      // Nếu 401 và có refresh_token → thử refresh
      if (error.response?.status === 401 && !original?._retry && refreshToken) {
        original._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            queue.push((token) => {
              if (token) {
                original.headers.Authorization = `Bearer ${token}`;
              }
              instance(original).then(resolve).catch(reject);
            });
          });
        }

        isRefreshing = true;
        try {
          const { data } = await axios.get(
            `${
              process.env.NEXT_PUBLIC_API_BASE_URL ||
              "http://localhost:4000/api"
            }/users/refresh-token`,
            {
              headers: {
                Cookie: `refresh_token=${refreshToken}`,
              },
              withCredentials: true,
            }
          );
          const newToken: string | undefined = data?.data?.access_token;

          flush(newToken ?? null);

          if (newToken) {
            original.headers.Authorization = `Bearer ${newToken}`;
            return instance(original);
          }
        } catch (refreshError) {
          console.error("❌ Refresh token failed:", refreshError);
          cookieStore.delete("refresh_token_fe");
          flush(null);
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      throw error;
    }
  );

  return instance;
}
