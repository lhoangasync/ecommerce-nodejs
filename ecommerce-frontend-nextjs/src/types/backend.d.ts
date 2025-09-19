export type IBackEndResponse<T> = { status: number; message: string; data: T };
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export type LoginBody = { email: string; password: string };

export type RegisterBody = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  address: string;
};

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: number;
  address: string;
  username: string;
  avatar: string;
  phone: string;
  verify: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserReqBody {
  name?: string;
  username?: string;
  role?: number;
  verify?: number;
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  forgot_password_token: string;
  password: string;
  confirm_password: string;
}

export type Brand = {
  _id: string;
  name: string;
  slug: string;
  country?: string;
  desc?: string;
  img?: string;
  created_at: string;
  updated_at: string;
};

export type AddBrandReqBody = Omit<Brand, "_id" | "created_at" | "updated_at">;

export type UpdateBrandReqBody = Partial<
  Omit<Brand, "_id" | "created_at" | "updated_at">
>;
