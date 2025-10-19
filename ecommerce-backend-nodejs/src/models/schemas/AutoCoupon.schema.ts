import { ObjectId } from 'mongodb'
export interface IAutoCouponRule {
  _id?: ObjectId
  name: string // Tên rule (VD: "Tặng coupon cho khách hàng trung thành")
  description?: string

  // Điều kiện kích hoạt
  trigger_type: 'order_count' | 'total_spent' | 'first_order' | 'birthday'

  // Cho trigger_type = 'order_count'
  required_order_count?: number // Số đơn hàng cần có (VD: 10)
  order_status?: ('paid' | 'delivered')[] // Trạng thái đơn hàng được tính

  // Cho trigger_type = 'total_spent'
  required_total_spent?: number // Tổng tiền đã chi tiêu

  // Coupon sẽ được tạo
  coupon_config: {
    code_prefix: string // Tiền tố mã coupon (VD: "VIP10" -> "VIP10-ABC123")
    discount_type: 'percentage' | 'fixed_amount'
    discount_value: number
    min_order_value?: number
    max_discount_amount?: number
    usage_limit_per_user: number // Số lần user này có thể dùng coupon
    valid_days: number // Số ngày có hiệu lực kể từ khi tạo
    applicable_products?: ObjectId[]
    applicable_categories?: ObjectId[]
    applicable_brands?: ObjectId[]
  }

  // Cài đặt
  is_active: boolean
  max_redemptions?: number // Tổng số lần rule này có thể kích hoạt
  redemption_count: number // Số lần đã kích hoạt

  // Metadata
  created_by?: ObjectId
  created_at?: Date
  updated_at?: Date
}

export class AutoCouponRule {
  _id: ObjectId
  name: string
  description?: string
  trigger_type: 'order_count' | 'total_spent' | 'first_order' | 'birthday'
  required_order_count?: number
  order_status?: ('paid' | 'delivered')[]
  required_total_spent?: number
  coupon_config: IAutoCouponRule['coupon_config']
  is_active: boolean
  max_redemptions?: number
  redemption_count: number
  created_by?: ObjectId
  created_at: Date
  updated_at: Date

  constructor(rule: IAutoCouponRule) {
    const date = new Date()
    this._id = rule._id || new ObjectId()
    this.name = rule.name
    this.description = rule.description
    this.trigger_type = rule.trigger_type
    this.required_order_count = rule.required_order_count
    this.order_status = rule.order_status || ['paid', 'delivered']
    this.required_total_spent = rule.required_total_spent
    this.coupon_config = rule.coupon_config
    this.is_active = rule.is_active !== undefined ? rule.is_active : true
    this.max_redemptions = rule.max_redemptions
    this.redemption_count = rule.redemption_count || 0
    this.created_by = rule.created_by
    this.created_at = rule.created_at || date
    this.updated_at = rule.updated_at || date
  }
}

// Schema tracking việc user đã nhận coupon từ rule nào
export interface IUserCouponRedemption {
  _id?: ObjectId
  user_id: ObjectId
  rule_id: ObjectId
  coupon_id: ObjectId // Coupon được tạo cho user này
  triggered_at: Date
  trigger_type: 'order_count' | 'total_spent' | 'first_order' | 'birthday'
  trigger_value?: number // VD: 10 orders, 1000000 VNĐ
}

export class UserCouponRedemption {
  _id: ObjectId
  user_id: ObjectId
  rule_id: ObjectId
  coupon_id: ObjectId
  triggered_at: Date
  trigger_type: 'order_count' | 'total_spent' | 'first_order' | 'birthday'
  trigger_value?: number

  constructor(redemption: IUserCouponRedemption) {
    this._id = redemption._id || new ObjectId()
    this.user_id = redemption.user_id
    this.rule_id = redemption.rule_id
    this.coupon_id = redemption.coupon_id
    this.triggered_at = redemption.triggered_at || new Date()
    this.trigger_type = redemption.trigger_type
    this.trigger_value = redemption.trigger_value
  }
}
