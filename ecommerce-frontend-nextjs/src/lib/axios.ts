import { IBackEndResponse } from "@/types/backend";
import axios, { AxiosError, AxiosInstance } from "axios";

let accessToken: string | null = null;
let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

export function setAccessToken(token: string | null) {
  // console.log("Setting access token to:", token);
  accessToken = token;
}
function flushQueue(token: string | null) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

function createAxios(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    // console.log("Interceptor: Current access token is:", accessToken);
    if (accessToken && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as any;

      // Không can thiệp nếu request là refresh-token để tránh vòng lặp ngoài ý muốn
      if (original?.url?.includes("/users/refresh-token")) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !original?._retry) {
        original._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            queue.push((token) => {
              if (token)
                original.headers = {
                  ...(original.headers || {}),
                  Authorization: `Bearer ${token}`,
                };
              instance(original).then(resolve).catch(reject);
            });
          });
        }

        isRefreshing = true;
        try {
          const { data } = await instance.get<
            IBackEndResponse<{ access_token: string }>
          >(`${baseURL.replace(/\/$/, "")}/users/refresh-token`, {
            withCredentials: true,
          });
          const newToken = data.data.access_token;
          setAccessToken(newToken);
          flushQueue(newToken);
          if (newToken) {
            original.headers = {
              ...(original.headers || {}),
              Authorization: `Bearer ${newToken}`,
            };
          }
          return instance(original);
        } catch (e) {
          flushQueue(null);
          setAccessToken(null);
          // optional: điều hướng sign-in ở đây nếu muốn
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
export const getAccessToken = () => accessToken;

export const api = createAxios(
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api"
);
