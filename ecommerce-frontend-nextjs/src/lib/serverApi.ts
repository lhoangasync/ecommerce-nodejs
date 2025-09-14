// lib/serverApi.ts
import axios from "axios";
import { cookies } from "next/headers";

export async function createServerApi() {
  const cookieHeader = (await cookies()).toString();

  const instance = axios.create({
    baseURL:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api",
    headers: { cookie: cookieHeader },
  });

  // (optional) refresh ở server
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
      if (original?.url?.includes("/users/refresh-token")) throw error;

      if (error.response?.status === 401 && !original?._retry) {
        original._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            queue.push((token) => {
              if (token) {
                original.headers = {
                  ...(original.headers || {}),
                  Authorization: `Bearer ${token}`,
                };
              }
              instance(original).then(resolve).catch(reject);
            });
          });
        }

        isRefreshing = true;
        try {
          const { data } = await instance.get("/users/refresh-token");
          const newToken: string | undefined = data?.data?.access_token;

          flush(newToken ?? null);
          if (newToken) {
            original.headers = {
              ...(original.headers || {}),
              Authorization: `Bearer ${newToken}`,
            };
          }
          return instance(original);
        } finally {
          isRefreshing = false;
        }
      }

      throw error;
    }
  );

  return instance;
}
