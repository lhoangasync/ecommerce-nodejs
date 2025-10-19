import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

export interface CreateAutoCouponRuleReqBody {
  name: string
  description?: string
  trigger_type: 'order_count' | 'total_spent' | 'first_order' | 'birthday'
  required_order_count?: number
  order_status?: ('paid' | 'delivered')[]
  required_total_spent?: number
  coupon_config: {
    code_prefix: string
    discount_type: 'percentage' | 'fixed_amount'
    discount_value: number
    min_order_value?: number
    max_discount_amount?: number
    usage_limit_per_user: number
    valid_days: number
    applicable_products?: ObjectId[]
    applicable_categories?: ObjectId[]
    applicable_brands?: ObjectId[]
  }
  is_active?: boolean
  max_redemptions?: number
}

export interface UpdateAutoCouponRuleReqBody extends Partial<CreateAutoCouponRuleReqBody> {}

export interface RuleIdParams extends ParamsDictionary {
  rule_id: string
}

export interface GetAutoCouponRulesQuery {
  page?: string
  limit?: string
}
