export interface CreatePaymentReqBody {
  order_id: string
  payment_method: 'momo' | 'vnpay' | 'bank_transfer'
  // COD không cần create payment, tự động tạo khi tạo order

  // URLs for redirect
  return_url?: string // Success URL
  cancel_url?: string // Cancel/Error URL

  // Optional
  language?: 'vi' | 'en'
}

export interface VerifyPaymentReqBody {
  order_id: string
  transaction_id?: string
  payment_method: 'momo' | 'vnpay'
}

export interface RefundPaymentReqBody {
  payment_id: string
  amount?: number // Nếu không truyền = refund toàn bộ
  reason?: string
}

export interface GetPaymentsReqQuery {
  order_id?: string
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  payment_method?: 'cod' | 'momo' | 'vnpay' | 'bank_transfer'
  from_date?: string
  to_date?: string
  page?: string
  limit?: string
}

// ==================== MOMO CALLBACK ====================

export interface MomoCallbackReqBody {
  partnerCode: string
  orderId: string // order_code từ hệ thống
  requestId: string
  amount: number
  orderInfo: string
  orderType: string
  transId: number // Transaction ID từ MoMo
  resultCode: number // 0 = success, khác 0 = failed
  message: string
  payType: string
  responseTime: number
  extraData: string
  signature: string
}

export interface MomoIpnResponse {
  partnerCode: string
  orderId: string
  requestId: string
  amount: number
  orderInfo: string
  orderType: string
  transId: number
  resultCode: number
  message: string
  payType: string
  responseTime: number
  extraData: string
  signature: string
}

// ==================== VNPAY RETURN ====================

export interface VnpayReturnReqQuery {
  vnp_Amount: string // Số tiền x100 (VD: 10000000 = 100,000 VND)
  vnp_BankCode: string
  vnp_BankTranNo?: string
  vnp_CardType?: string
  vnp_OrderInfo: string
  vnp_PayDate: string // Format: yyyyMMddHHmmss
  vnp_ResponseCode: string // 00 = success
  vnp_TmnCode: string
  vnp_TransactionNo: string
  vnp_TransactionStatus: string // 00 = success
  vnp_TxnRef: string // order_code
  vnp_SecureHash: string
  [key: string]: string | undefined
}

export interface VnpayIpnResponse {
  RspCode: string // 00 = success
  Message: string
}

// ==================== PAYMENT RESPONSE TYPES ====================

export interface PaymentUrlResponse {
  payment_id: string
  payment_url: string
  qr_code_url?: string
  deeplink?: string
  expires_at: string
}

export interface PaymentStatusResponse {
  payment_id: string
  order_id: string
  order_code: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  amount: number
  payment_method: string
  transaction_id?: string
  created_at: string
  completed_at?: string
}
