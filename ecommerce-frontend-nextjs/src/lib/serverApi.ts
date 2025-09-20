// lib/serverApi.ts
import axios from "axios";
import { cookies } from "next/headers";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export async function createServerApi() {
  const jar = new CookieJar();
  const cookieStore = cookies();
  const allCookies = (await cookieStore).getAll();

  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

  await Promise.all(
    allCookies.map((cookie) => {
      const cookieString = `${cookie.name}=${cookie.value}`;
      return jar.setCookie(cookieString, apiUrl);
    })
  );

  const instance = wrapper(
    axios.create({
      baseURL: apiUrl,
      jar: jar,
    })
  );

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
