import { ObjectId } from 'mongodb'

export interface IOrderItem {
  product_id: ObjectId
  product_name: string
  product_slug: string
  product_image?: string // Lưu ảnh sản phẩm để hiển thị sau này

  variant_id: string
  variant_shade_color?: string
  variant_volume_size?: string
  variant_sku: string
  variant_image?: string // Ảnh của variant (nếu có, nếu không thì dùng product_image)

  quantity: number
  unit_price: number // Giá 1 đơn vị tại thời điểm đặt
  original_price?: number // Giá gốc (nếu có giảm giá)
  subtotal: number // unit_price * quantity
}

export interface IShippingAddress {
  full_name: string
  phone_number: string
  address: string // Địa chỉ chi tiết
  ward?: string // Phường/Xã
  district?: string // Quận/Huyện
  city: string // Tỉnh/Thành phố
  country?: string
}

export interface IOrder {
  _id?: ObjectId
  user_id: ObjectId
  order_code: string

  // Items
  items: IOrderItem[]

  // Pricing
  subtotal: number // Tổng tiền hàng
  shipping_fee: number // Phí ship
  discount_amount?: number // Số tiền giảm giá (voucher/promotion)
  total_amount: number // Tổng cộng

  // Shipping
  shipping_address: IShippingAddress
  note?: string

  // Status
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded'

  // Payment
  payment_method: 'cod' | 'momo' | 'vnpay' | 'bank_transfer'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  paid_at?: Date // Thời điểm thanh toán

  // Tracking
  confirmed_at?: Date
  shipping_at?: Date
  delivered_at?: Date
  cancelled_at?: Date
  cancellation_reason?: string

  // Metadata
  created_at?: Date
  updated_at?: Date
}

export class Order {
  _id: ObjectId
  user_id: ObjectId
  order_code: string

  items: IOrderItem[]

  subtotal: number
  shipping_fee: number
  discount_amount: number
  total_amount: number

  shipping_address: IShippingAddress
  note?: string

  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded'

  payment_method: 'cod' | 'momo' | 'vnpay' | 'bank_transfer'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  paid_at?: Date

  confirmed_at?: Date
  shipping_at?: Date
  delivered_at?: Date
  cancelled_at?: Date
  cancellation_reason?: string

  created_at: Date
  updated_at: Date

  constructor(order: IOrder) {
    const date = new Date()
    this._id = order._id || new ObjectId()
    this.user_id = order.user_id
    this.order_code = order.order_code || this.generateOrderCode()

    this.items = order.items

    this.subtotal = order.subtotal
    this.shipping_fee = order.shipping_fee || 0
    this.discount_amount = order.discount_amount || 0
    this.total_amount = order.total_amount

    this.shipping_address = order.shipping_address
    this.note = order.note

    this.status = order.status || 'pending'

    this.payment_method = order.payment_method
    this.payment_status = order.payment_status || 'pending'
    this.paid_at = order.paid_at

    this.confirmed_at = order.confirmed_at
    this.shipping_at = order.shipping_at
    this.delivered_at = order.delivered_at
    this.cancelled_at = order.cancelled_at
    this.cancellation_reason = order.cancellation_reason

    this.created_at = order.created_at || date
    this.updated_at = order.updated_at || date
  }

  generateOrderCode(): string {
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `ORD${timestamp}${random}`
  }

  calculateTotal(): number {
    return this.subtotal + this.shipping_fee - this.discount_amount
  }

  canCancel(): boolean {
    return ['pending', 'confirmed'].includes(this.status)
  }

  canConfirm(): boolean {
    return this.status === 'pending'
  }

  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0)
  }

  // Helper methods cho status transitions
  confirm(): void {
    if (this.canConfirm()) {
      this.status = 'confirmed'
      this.confirmed_at = new Date()
      this.updated_at = new Date()
    }
  }

  startShipping(): void {
    if (this.status === 'confirmed' || this.status === 'processing') {
      this.status = 'shipping'
      this.shipping_at = new Date()
      this.updated_at = new Date()
    }
  }

  deliver(): void {
    if (this.status === 'shipping') {
      this.status = 'delivered'
      this.delivered_at = new Date()
      this.updated_at = new Date()

      // Nếu COD thì cập nhật payment_status
      if (this.payment_method === 'cod') {
        this.payment_status = 'paid'
        this.paid_at = new Date()
      }
    }
  }

  cancel(reason?: string): void {
    if (this.canCancel()) {
      this.status = 'cancelled'
      this.cancelled_at = new Date()
      this.cancellation_reason = reason
      this.updated_at = new Date()
    }
  }
}
