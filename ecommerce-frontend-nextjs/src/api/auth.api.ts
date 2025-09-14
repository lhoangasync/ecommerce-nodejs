import { api, setAccessToken } from "@/lib/axios";
import {
  IBackEndResponse,
  LoginBody,
  RegisterBody,
  UserProfile,
} from "@/types/backend";

export const AuthAPI = {
  async login(body: LoginBody) {
    const { data } = await api.post<IBackEndResponse<{ access_token: string }>>(
      "/users/login",
      body
    );
    setAccessToken(data.data.access_token);
    return data;
  },

  async logout() {
    const { data } = await api.post<IBackEndResponse<null>>(
      "/users/logout",
      {}
    );
    setAccessToken(null);
    return data;
  },

  async register(body: RegisterBody) {
    const { data } = await api.post<
      IBackEndResponse<{ access_token: string; refresh_token: string }>
    >("/users/register", body);
    return data;
  },

  async refreshToken() {
    const { data } = await api.get<IBackEndResponse<{ access_token: string }>>(
      "/users/refresh-token"
    );
    setAccessToken(data.data.access_token);
    return data;
  },

  async me() {
    const { data } = await api.get<IBackEndResponse<UserProfile>>("/users/me");
    return data;
  },
};
