import { api, setAccessToken } from "@/lib/axios";
import {
  ForgotPasswordRequest,
  IBackEndResponse,
  LoginBody,
  RegisterBody,
  ResetPasswordRequest,
  UserProfile,
} from "@/types/backend";
export type ForgotPasswordBody = { email: string };
export type ResetPasswordBody = {
  forgot_password_token: string;
  password: string;
  confirm_password: string;
};
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

  async verifyEmail(email_verify_token: string) {
    const { data } = await api.post<IBackEndResponse<null>>(
      "/users/verify-email",
      { email_verify_token }
    );
    return data;
  },

  async resendVerificationEmail(email: string) {
    const { data } = await api.post<IBackEndResponse<null>>(
      "/users/resend-verify-email",
      { email }
    );
    return data;
  },

  async me() {
    const { data } = await api.get<IBackEndResponse<UserProfile>>("/users/me");
    return data;
  },
  async forgotPassword(
    body: ForgotPasswordRequest
  ): Promise<IBackEndResponse<null>> {
    const { data } = await api.post<IBackEndResponse<null>>(
      "/users/forgot-password",
      body
    );
    return data;
  },
  async getGoogleAuthURL() {
    const { data } = await api.get<IBackEndResponse<{ authURL: string }>>(
      "/users/auth/google"
    );
    return data;
  },

  async googleLogin(code: string) {
    const { data } = await api.post<IBackEndResponse<{ access_token: string }>>(
      "/users/google/callback",
      { code }
    );
    setAccessToken(data.data.access_token);
    return data;
  },

  async facebookLogin(accessToken: string) {
    const { data } = await api.post<IBackEndResponse<{ access_token: string }>>(
      "/users/auth/facebook",
      { accessToken }
    );
    setAccessToken(data.data.access_token);
    return data;
  },
  async resetPassword(
    body: ResetPasswordRequest
  ): Promise<IBackEndResponse<null>> {
    const { data } = await api.post<IBackEndResponse<null>>(
      "/users/reset-password",
      body
    );
    return data;
  },
};
