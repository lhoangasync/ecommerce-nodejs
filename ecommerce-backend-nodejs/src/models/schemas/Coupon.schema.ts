// models/schemas/Coupon.schema.ts
import { ObjectId } from 'mongodb'

export interface ICoupon {
  _id?: ObjectId
  code: string // Mã coupon (VD: SUMMER2024)
  description?: string

  // Loại giảm giá
  discount_type: 'percentage' | 'fixed_amount' // Phần trăm hoặc số tiền cố định
  discount_value: number // Giá trị giảm (VD: 10 = 10% hoặc 10000 VNĐ)

  // Điều kiện áp dụng
  min_order_value?: number // Giá trị đơn hàng tối thiểu
  max_discount_amount?: number // Số tiền giảm tối đa (cho percentage)

  // Giới hạn sử dụng
  usage_limit?: number // Tổng số lần có thể dùng (null = không giới hạn)
  usage_count: number // Số lần đã dùng
  usage_limit_per_user?: number // Số lần 1 user có thể dùng

  // Áp dụng cho
  applicable_products?: ObjectId[] // Danh sách sản phẩm (null = tất cả)
  applicable_categories?: ObjectId[] // Danh sách danh mục (null = tất cả)
  applicable_brands?: ObjectId[] // Danh sách thương hiệu (null = tất cả)

  // User có thể dùng
  applicable_users?: ObjectId[] // Danh sách user (null = tất cả)
  excluded_users?: ObjectId[] // Danh sách user không được dùng

  // Thời gian
  start_date: Date // Ngày bắt đầu
  end_date: Date // Ngày kết thúc

  // Trạng thái
  is_active: boolean // Kích hoạt hay không

  // Metadata
  created_by?: ObjectId // Admin tạo coupon
  created_at?: Date
  updated_at?: Date
}

export class Coupon {
  _id: ObjectId
  code: string
  description?: string

  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number

  min_order_value?: number
  max_discount_amount?: number

  usage_limit?: number
  usage_count: number
  usage_limit_per_user?: number

  applicable_products?: ObjectId[]
  applicable_categories?: ObjectId[]
  applicable_brands?: ObjectId[]

  applicable_users?: ObjectId[]
  excluded_users?: ObjectId[]

  start_date: Date
  end_date: Date

  is_active: boolean

  created_by?: ObjectId
  created_at: Date
  updated_at: Date

  constructor(coupon: ICoupon) {
    const date = new Date()
    this._id = coupon._id || new ObjectId()
    this.code = coupon.code.toUpperCase()
    this.description = coupon.description

    this.discount_type = coupon.discount_type
    this.discount_value = coupon.discount_value

    this.min_order_value = coupon.min_order_value
    this.max_discount_amount = coupon.max_discount_amount

    this.usage_limit = coupon.usage_limit
    this.usage_count = coupon.usage_count || 0
    this.usage_limit_per_user = coupon.usage_limit_per_user

    this.applicable_products = coupon.applicable_products
    this.applicable_categories = coupon.applicable_categories
    this.applicable_brands = coupon.applicable_brands

    this.applicable_users = coupon.applicable_users
    this.excluded_users = coupon.excluded_users

    this.start_date = coupon.start_date
    this.end_date = coupon.end_date

    this.is_active = coupon.is_active !== undefined ? coupon.is_active : true

    this.created_by = coupon.created_by
    this.created_at = coupon.created_at || date
    this.updated_at = coupon.updated_at || date
  }

  // Tính số tiền giảm giá
  calculateDiscount(orderValue: number): number {
    if (this.discount_type === 'percentage') {
      const discount = (orderValue * this.discount_value) / 100
      return this.max_discount_amount ? Math.min(discount, this.max_discount_amount) : discount
    }
    return this.discount_value
  }

  // Kiểm tra coupon có còn hiệu lực không
  isValid(): boolean {
    const now = new Date()
    return (
      this.is_active &&
      now >= this.start_date &&
      now <= this.end_date &&
      (this.usage_limit === undefined || this.usage_count < this.usage_limit)
    )
  }

  // Kiểm tra đơn hàng có đủ điều kiện không
  canApplyToOrder(orderValue: number): boolean {
    if (!this.min_order_value) return true
    return orderValue >= this.min_order_value
  }

  // Tăng số lần sử dụng
  incrementUsage(): void {
    this.usage_count++
    this.updated_at = new Date()
  }
}

// User Coupon Usage Tracking
export interface IUserCouponUsage {
  _id?: ObjectId
  user_id: ObjectId
  coupon_id: ObjectId
  order_id: ObjectId
  discount_amount: number
  used_at: Date
}

export class UserCouponUsage {
  _id: ObjectId
  user_id: ObjectId
  coupon_id: ObjectId
  order_id: ObjectId
  discount_amount: number
  used_at: Date

  constructor(usage: IUserCouponUsage) {
    this._id = usage._id || new ObjectId()
    this.user_id = usage.user_id
    this.coupon_id = usage.coupon_id
    this.order_id = usage.order_id
    this.discount_amount = usage.discount_amount
    this.used_at = usage.used_at || new Date()
  }
}
