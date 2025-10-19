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

/* CART */
export interface CartItem {
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  added_at?: string;
  // Populated fields (optional, from backend)
  product?: Product;
  variant?: Variant;
}

export interface Cart {
  _id: string;
  user_id?: string;
  items: CartItem[];
  session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AddToCartReqBody {
  product_id: string;
  variant_id: string;
  quantity: number;
}

export interface UpdateCartItemReqBody {
  quantity: number;
}

export interface UpdateCartItemReqParams {
  product_id: string;
  variant_id: string;
}

export interface RemoveFromCartReqParams {
  product_id: string;
  variant_id: string;
}

export interface GetCartReqQuery {
  session_id?: string;
}

export interface MigrateCartReqBody {
  session_id: string;
}

// Cart helper types
export interface CartSummary {
  total_items: number;
  subtotal: number;
  total: number;
  currency: string;
}

/* ORDER */
export interface OrderItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image?: string;
  variant_id: string;
  variant_shade_color?: string;
  variant_volume_size?: string;
  variant_sku: string;
  variant_image?: string;
  quantity: number;
  unit_price: number;
  original_price?: number;
  subtotal: number;
}

export interface ShippingAddress {
  full_name: string;
  phone_number: string;
  address: string;
  ward?: string;
  district?: string;
  city: string;
  country?: string;
}

export interface Order {
  _id: string;
  user_id: string;
  order_code: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount_amount?: number;
  total_amount: number;
  shipping_address: ShippingAddress;
  note?: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "refunded";
  payment_method: "cod" | "momo" | "vnpay" | "bank_transfer";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  paid_at?: string;
  confirmed_at?: string;
  shipping_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderReqBody {
  shipping_address: ShippingAddress;
  note?: string;
  payment_method: "cod" | "momo" | "vnpay" | "bank_transfer";
  shipping_fee?: number;
  discount_code?: string;
}

export interface UpdateOrderStatusReqBody {
  status:
    | "confirmed"
    | "processing"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "refunded";
  cancellation_reason?: string;
  tracking_number?: string;
}

export interface CancelOrderReqBody {
  reason: string;
}

export interface GetOrdersReqQuery {
  status?:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "refunded";
  payment_status?: "pending" | "paid" | "failed" | "refunded";
  payment_method?: "cod" | "momo" | "vnpay" | "bank_transfer";
  from_date?: string;
  to_date?: string;
  search?: string;
  page?: string;
  limit?: string;
  sort?: "created_at" | "-created_at" | "total_amount" | "-total_amount";
}

export interface GetOrderDetailReqParams {
  order_id: string;
}

/* PAYMENT */
export interface PaymentMetadata {
  partnerCode?: string;
  orderId?: string;
  requestId?: string;
  vnp_TxnRef?: string;
  vnp_TransactionNo?: string;
  vnp_BankCode?: string;
  vnp_CardType?: string;
  payUrl?: string;
  qrCodeUrl?: string;
  deeplink?: string;
}

export interface Payment {
  _id: string;
  order_id: string;
  order_code: string;
  user_id: string;
  payment_method: "cod" | "momo" | "vnpay" | "bank_transfer";
  amount: number;
  currency: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  transaction_id?: string;
  payment_gateway_response?: any;
  metadata?: PaymentMetadata;
  error_code?: string;
  error_message?: string;
  initiated_at?: string;
  completed_at?: string;
  failed_at?: string;
  expired_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentReqBody {
  order_id: string;
  payment_method: "momo" | "vnpay" | "bank_transfer";
  return_url?: string;
  cancel_url?: string;
  language?: "vi" | "en";
}

export interface VerifyPaymentReqBody {
  order_id: string;
  transaction_id?: string;
  payment_method: "momo" | "vnpay";
}

export interface RefundPaymentReqBody {
  payment_id: string;
  amount?: number;
  reason?: string;
}

export interface GetPaymentsReqQuery {
  order_id?: string;
  status?:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  payment_method?: "cod" | "momo" | "vnpay" | "bank_transfer";
  from_date?: string;
  to_date?: string;
  page?: string;
  limit?: string;
}

/* MOMO CALLBACK */
export interface MomoCallbackReqBody {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

export interface MomoIpnResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

/* MOMO RETURN (for frontend processing) */
export interface MomoReturnReqQuery {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: string;
  orderInfo: string;
  orderType: string;
  transId: string;
  resultCode: string;
  message: string;
  payType: string;
  responseTime: string;
  extraData: string;
  signature: string;
}

/* VNPAY RETURN */
export interface VnpayReturnReqQuery {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  [key: string]: string | undefined;
}

export interface VnpayIpnResponse {
  RspCode: string;
  Message: string;
}

/* PAYMENT RESPONSE TYPES */
export interface PaymentUrlResponse {
  payment_id: string;
  payment_url: string;
  qr_code_url?: string;
  deeplink?: string;
  expires_at: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  order_id: string;
  order_code: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  amount: number;
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  completed_at?: string;
}

/* REVIEW */
export enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface SellerResponse {
  user_id: string;
  message: string;
  created_at: string;
}

export interface Review {
  _id: string;
  product_id: string;
  variant_id?: string;
  user_id: string;
  rating: number;
  comment?: string;
  images?: string[];
  is_verified_purchase: boolean;
  order_id?: string;
  status: ReviewStatus;
  helpful_count: number;
  reported_count: number;
  seller_response?: SellerResponse;
  created_at: string;
  updated_at: string;
  // Populated fields
  user?: UserProfile;
  product?: Product;
  variant?: Variant;
}

export interface CreateReviewReqBody {
  product_id: string;
  variant_id?: string;
  rating: number;
  comment?: string;
  images?: string[];
  is_verified_purchase?: boolean;
  order_id?: string;
}

export interface UpdateReviewReqBody {
  rating?: number;
  comment?: string;
  images?: string[];
  variant_id?: string;
}

export interface UpdateReviewReqParams {
  review_id: string;
}

export interface GetReviewByIdReqParams {
  review_id: string;
}

export interface DeleteReviewReqParams {
  review_id: string;
}

export interface ApproveReviewReqParams {
  review_id: string;
}

export interface RejectReviewReqParams {
  review_id: string;
}

export interface MarkHelpfulReqParams {
  review_id: string;
}

export interface ReportReviewReqParams {
  review_id: string;
}

export interface AddSellerResponseReqParams {
  review_id: string;
}

export interface SellerResponseReqBody {
  message: string;
}

export interface GetRatingStatsReqParams {
  product_id: string;
}

export interface GetReviewsQuery {
  product_id?: string;
  user_id?: string;
  rating?: string;
  status?: string;
  is_verified_purchase?: string;
  page?: string;
  limit?: string;
  sort_by?: "created_at" | "rating" | "helpful_count";
  order?: "asc" | "desc";
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  distribution?: {
    // Changed from rating_distribution, made optional
    [key: number]: number;
  };
  verifiedPurchaseCount?: number;
}
/* COUPON */
export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  min_order_value?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  usage_limit_per_user?: number;
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
  applicable_users?: string[];
  excluded_users?: string[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCouponUsage {
  _id: string;
  user_id: string;
  coupon_id: string;
  order_id: string;
  discount_amount: number;
  used_at: string;
}

/* AUTO COUPON RULE */
export interface AutoCouponRuleConfig {
  code_prefix: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  min_order_value?: number;
  max_discount_amount?: number;
  usage_limit_per_user: number;
  valid_days: number;
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
}

export interface AutoCouponRule {
  _id: string;
  name: string;
  description?: string;
  trigger_type: "order_count" | "total_spent" | "first_order" | "birthday";
  required_order_count?: number;
  order_status?: ("paid" | "delivered")[];
  required_total_spent?: number;
  coupon_config: AutoCouponRuleConfig;
  is_active: boolean;
  max_redemptions?: number;
  redemption_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCouponRedemption {
  _id: string;
  user_id: string;
  rule_id: string;
  coupon_id: string;
  triggered_at: string;
  trigger_type: "order_count" | "total_spent" | "first_order" | "birthday";
  trigger_value?: number;
}

export interface CreateCouponReqBody {
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  min_order_value?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_user?: number;
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
  applicable_users?: string[];
  excluded_users?: string[];
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export interface UpdateCouponReqBody {
  description?: string;
  discount_type?: "percentage" | "fixed_amount";
  discount_value?: number;
  min_order_value?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_user?: number;
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
  applicable_users?: string[];
  excluded_users?: string[];
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface ValidateCouponReqBody {
  code: string;
  order_value: number;
  product_ids?: string[];
  category_ids?: string[];
  brand_ids?: string[];
}

export interface ValidateCouponResponse {
  is_valid: boolean;
  coupon?: Coupon;
  discount_amount?: number;
  error_message?: string;
}

export interface CreateAutoCouponRuleReqBody {
  name: string;
  description?: string;
  trigger_type: "order_count" | "total_spent" | "first_order" | "birthday";
  required_order_count?: number;
  order_status?: ("paid" | "delivered")[];
  required_total_spent?: number;
  coupon_config: AutoCouponRuleConfig;
  is_active?: boolean;
  max_redemptions?: number;
}

export interface UpdateAutoCouponRuleReqBody {
  name?: string;
  description?: string;
  required_order_count?: number;
  order_status?: ("paid" | "delivered")[];
  required_total_spent?: number;
  coupon_config?: AutoCouponRuleConfig;
  is_active?: boolean;
  max_redemptions?: number;
}

export interface GetCouponsReqQuery {
  code?: string;
  discount_type?: "percentage" | "fixed_amount";
  is_active?: string;
  page?: string;
  limit?: string;
}

export interface GetAutoCouponRulesReqQuery {
  trigger_type?: "order_count" | "total_spent" | "first_order" | "birthday";
  is_active?: string;
  page?: string;
  limit?: string;
}
