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

/* BRAND */
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

/* CATEGORY */
export type Category = {
  _id: string;
  name: string;
  slug: string;
  img?: string;
  created_at: string;
  updated_at: string;
};

export type AddCategoryReqBody = Omit<
  Category,
  "_id" | "created_at" | "updated_at"
>;

export type UpdateCategoryReqBody = Partial<
  Omit<Category, "_id" | "created_at" | "updated_at">
>;

/* VARIANT */
export interface Variant {
  id: string;
  shade_color?: string;
  volume_size?: string;
  price: number;
  original_price?: number;
  sku: string;
  images?: string[];
  stock_quantity: number;
  is_available: boolean;
}

export type VariantReqBody = Variant;

export type UpdateVariantStockReqBody = {
  quantity: number;
};

/* PRODUCT */
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  brand_id: string;
  category_id: string;
  images?: string[];
  how_to_use?: string;
  tags?: string[];
  // Cosmetics-specific fields
  ingredients?: string;
  skin_type?: ("dry" | "oily" | "combination" | "sensitive" | "normal")[];
  origin?: string;
  // Variants array - this is the main difference
  variants: Variant[];
  // Computed fields
  rating?: number;
  review_count?: number;
  is_available: boolean; // computed from variants
  created_at: string;
  updated_at: string;
  // Populated fields from backend lookups
  brand?: Brand;
  category?: Category;
}

export type AddProductReqBody = {
  name: string;
  slug: string;
  description?: string;
  brand_id: string;
  category_id: string;
  images?: string[];
  how_to_use?: string;
  tags?: string[];
  ingredients?: string;
  skin_type?: ("dry" | "oily" | "combination" | "sensitive" | "normal")[];
  origin?: string;
  variants: Variant[];
};

export type UpdateProductReqBody = Partial<{
  name: string;
  slug: string;
  description: string;
  brand_id: string;
  category_id: string;
  images: string[];
  how_to_use: string;
  tags: string[];
  ingredients: string;
  skin_type: ("dry" | "oily" | "combination" | "sensitive" | "normal")[];
  origin: string;
  variants: Variant[];
}>;

export interface GetProductsQuery {
  page?: number;
  limit?: number;
  name?: string;
  brand_id?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  is_available?: boolean;
  skin_type?: string;
  origin?: string;
  sort_by?: "price" | "rating" | "created_at" | "name";
  order?: "asc" | "desc";
}

/* HELPER TYPES */
export interface ProductPriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface ProductAvailability {
  total_stock: number;
  available_variants: number;
  total_variants: number;
  is_in_stock: boolean;
}

// Request param types
export interface GetProductByIdReqParams {
  product_id: string;
}

export interface UpdateProductReqParams {
  product_id: string;
}

export interface DeleteProductReqParams {
  product_id: string;
}

export interface AddVariantReqParams {
  product_id: string;
}

export interface GetVariantReqParams {
  product_id: string;
  variant_id: string;
}

export interface UpdateVariantReqParams {
  product_id: string;
  variant_id: string;
}

export interface DeleteVariantReqParams {
  product_id: string;
  variant_id: string;
}

// Response types for variant operations
export interface GetVariantResponse {
  product: Product;
  variant: Variant;
}
