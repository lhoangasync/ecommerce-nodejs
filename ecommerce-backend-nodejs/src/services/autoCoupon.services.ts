import { ObjectId } from 'mongodb'
import { AutoCouponRule, UserCouponRedemption } from '~/models/schemas/AutoCoupon.schema'
import { Coupon } from '~/models/schemas/Coupon.schema'
import databaseService from './database.services'

class AutoCouponService {
  // Tạo mã coupon unique cho user
  private generateCouponCode(prefix: string): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const timestamp = Date.now().toString().slice(-4)
    return `${prefix}-${random}${timestamp}`
  }

  // Kiểm tra và tự động tạo coupon khi user đạt milestone
  async checkAndCreateCoupon(user_id: ObjectId) {
    // Lấy tất cả rules đang active
    const activeRules = await databaseService.auto_coupon_rules.find({ is_active: true }).toArray()

    for (const rule of activeRules) {
      // Kiểm tra xem user đã nhận coupon từ rule này chưa
      const existingRedemption = await databaseService.user_coupon_redemptions.findOne({
        user_id,
        rule_id: rule._id
      })

      if (existingRedemption) {
        continue // User đã nhận coupon từ rule này rồi
      }

      // Kiểm tra điều kiện trigger
      let shouldTrigger = false
      let triggerValue: number | undefined

      if (rule.trigger_type === 'order_count') {
        const orderCount = await this.getUserPaidOrderCount(user_id, rule.order_status!)
        triggerValue = orderCount
        shouldTrigger = orderCount >= (rule.required_order_count || 0)
      } else if (rule.trigger_type === 'total_spent') {
        const totalSpent = await this.getUserTotalSpent(user_id)
        triggerValue = totalSpent
        shouldTrigger = totalSpent >= (rule.required_total_spent || 0)
      } else if (rule.trigger_type === 'first_order') {
        const orderCount = await this.getUserPaidOrderCount(user_id, ['paid', 'delivered'])
        shouldTrigger = orderCount === 1
      }

      if (shouldTrigger) {
        // Kiểm tra max_redemptions
        if (rule.max_redemptions && rule.redemption_count >= rule.max_redemptions) {
          continue // Rule đã đạt giới hạn
        }

        // Tạo coupon cho user
        const coupon = await this.createCouponForUser(user_id, rule)

        // Lưu redemption record
        const redemption = new UserCouponRedemption({
          user_id,
          rule_id: rule._id!,
          coupon_id: coupon._id!,
          trigger_type: rule.trigger_type,
          trigger_value: triggerValue,
          triggered_at: new Date()
        })
        await databaseService.user_coupon_redemptions.insertOne(redemption)

        // Tăng redemption_count của rule
        await databaseService.auto_coupon_rules.updateOne(
          { _id: rule._id },
          {
            $inc: { redemption_count: 1 },
            $set: { updated_at: new Date() }
          }
        )
      }
    }
  }

  // Tạo coupon từ rule config
  private async createCouponForUser(user_id: ObjectId, rule: AutoCouponRule) {
    const config = rule.coupon_config
    const code = this.generateCouponCode(config.code_prefix)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + config.valid_days)

    const coupon = new Coupon({
      code,
      description: `Phần thưởng: ${rule.name}`,
      discount_type: config.discount_type,
      discount_value: config.discount_value,
      min_order_value: config.min_order_value,
      max_discount_amount: config.max_discount_amount,
      usage_limit: config.usage_limit_per_user,
      usage_count: 0,
      usage_limit_per_user: config.usage_limit_per_user,
      applicable_products: config.applicable_products,
      applicable_categories: config.applicable_categories,
      applicable_brands: config.applicable_brands,
      applicable_users: [user_id], // Chỉ user này được dùng
      start_date: startDate,
      end_date: endDate,
      is_active: true
    })

    await databaseService.coupons.insertOne(coupon)
    return coupon
  }

  private async getUserPaidOrderCount(user_id: ObjectId, statuses: string[]) {
    const query = {
      user_id,
      $or: [
        { payment_status: 'paid' as const },
        {
          status: 'delivered' as const,
          payment_method: 'cod' as const
        }
      ]
    }

    const count = await databaseService.orders.countDocuments(query)
    return count
  }

  // Tính tổng tiền user đã chi tiêu
  private async getUserTotalSpent(user_id: ObjectId) {
    const result = await databaseService.orders
      .aggregate([
        {
          $match: {
            user_id,
            payment_status: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total_amount' }
          }
        }
      ])
      .toArray()

    return result[0]?.total || 0
  }

  // API Methods
  async createRule(payload: any) {
    const rule = new AutoCouponRule(payload)
    await databaseService.auto_coupon_rules.insertOne(rule)
    return rule
  }

  async getRules({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit

    const [items, totalItems] = await Promise.all([
      databaseService.auto_coupon_rules.find().sort({ created_at: -1 }).skip(skip).limit(limit).toArray(),
      databaseService.auto_coupon_rules.countDocuments()
    ])

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    }
  }

  async getRuleById(rule_id: string) {
    return await databaseService.auto_coupon_rules.findOne({
      _id: new ObjectId(rule_id)
    })
  }

  async updateRule(rule_id: string, payload: any) {
    const rule = await databaseService.auto_coupon_rules.findOneAndUpdate(
      { _id: new ObjectId(rule_id) },
      {
        $set: { ...payload },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )
    return rule
  }

  async deleteRule(rule_id: string) {
    const result = await databaseService.auto_coupon_rules.deleteOne({
      _id: new ObjectId(rule_id)
    })
    return result.deletedCount > 0
  }

  // Lấy danh sách coupon user đã nhận tự động
  // TỰ ĐỘNG KIỂM TRA VÀ TẠO COUPON MỚI NẾU ĐỦ ĐIỀU KIỆN
  async getUserAutoCoupons(user_id: string) {
    const userObjectId = new ObjectId(user_id)

    // Tự động kiểm tra và tạo coupon mới nếu đủ điều kiện
    await this.checkAndCreateCoupon(userObjectId)

    // Sau đó mới lấy danh sách
    return await databaseService.user_coupon_redemptions
      .aggregate([
        {
          $match: { user_id: userObjectId }
        },
        {
          $lookup: {
            from: 'coupons',
            localField: 'coupon_id',
            foreignField: '_id',
            as: 'coupon'
          }
        },
        {
          $lookup: {
            from: 'auto_coupon_rules',
            localField: 'rule_id',
            foreignField: '_id',
            as: 'rule'
          }
        },
        {
          $unwind: '$coupon'
        },
        {
          $unwind: '$rule'
        },
        {
          $sort: { triggered_at: -1 }
        }
      ])
      .toArray()
  }
}

const autoCouponService = new AutoCouponService()
export default autoCouponService
