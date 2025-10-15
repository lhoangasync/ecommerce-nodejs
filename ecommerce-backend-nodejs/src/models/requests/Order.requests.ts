export interface IShippingAddressInput {
  full_name: string
  phone_number: string
  address: string
  ward?: string
  district?: string
  city: string
  country?: string
}

export interface CreateOrderReqBody {
  // Shipping info
  shipping_address: IShippingAddressInput
  note?: string

  // Payment
  payment_method: 'cod' | 'momo' | 'vnpay' | 'bank_transfer'

  // Optional: nếu frontend tự tính
  shipping_fee?: number
  discount_code?: string // Voucher code
}

export interface UpdateOrderStatusReqBody {
  status: 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded'
  cancellation_reason?: string // Bắt buộc khi cancel
  tracking_number?: string // Số vận đơn khi shipping
}

export interface CancelOrderReqBody {
  reason: string // Lý do hủy đơn
}

export interface GetOrdersReqQuery {
  status?: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded'
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: 'cod' | 'momo' | 'vnpay' | 'bank_transfer'
  from_date?: string // ISO date
  to_date?: string // ISO date
  search?: string // Tìm theo order_code hoặc phone
  page?: string
  limit?: string
  sort?: 'created_at' | '-created_at' | 'total_amount' | '-total_amount'
}

export interface GetOrderDetailReqParams {
  order_id: string
}
