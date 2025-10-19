import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { AUTO_COUPON_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: AUTO_COUPON_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: AUTO_COUPON_MESSAGES.NAME_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: { min: 1, max: 100 },
    errorMessage: AUTO_COUPON_MESSAGES.NAME_LENGTH
  }
}

const triggerTypeSchema: ParamSchema = {
  notEmpty: true,
  isIn: {
    options: [['order_count', 'total_spent', 'first_order', 'birthday']],
    errorMessage: AUTO_COUPON_MESSAGES.TRIGGER_TYPE_INVALID
  }
}

const requiredOrderCountSchema: ParamSchema = {
  optional: true,
  isInt: {
    options: { min: 1 },
    errorMessage: AUTO_COUPON_MESSAGES.REQUIRED_ORDER_COUNT_INVALID
  }
}

const requiredTotalSpentSchema: ParamSchema = {
  optional: true,
  isFloat: {
    options: { min: 0 },
    errorMessage: AUTO_COUPON_MESSAGES.REQUIRED_TOTAL_SPENT_INVALID
  }
}

const couponConfigSchema: ParamSchema = {
  notEmpty: true,
  custom: {
    options: (value) => {
      if (typeof value !== 'object') {
        throw new Error('Coupon config must be an object')
      }

      // Validate code_prefix
      if (!value.code_prefix || typeof value.code_prefix !== 'string') {
        throw new Error(AUTO_COUPON_MESSAGES.CODE_PREFIX_REQUIRED)
      }
      if (value.code_prefix.length < 2 || value.code_prefix.length > 20) {
        throw new Error(AUTO_COUPON_MESSAGES.CODE_PREFIX_LENGTH)
      }

      // Validate discount_type
      if (!['percentage', 'fixed_amount'].includes(value.discount_type)) {
        throw new Error(AUTO_COUPON_MESSAGES.DISCOUNT_TYPE_INVALID)
      }

      // Validate discount_value
      if (!value.discount_value || value.discount_value <= 0) {
        throw new Error(AUTO_COUPON_MESSAGES.DISCOUNT_VALUE_INVALID)
      }

      // Validate valid_days
      if (!value.valid_days || value.valid_days < 1 || value.valid_days > 365) {
        throw new Error(AUTO_COUPON_MESSAGES.VALID_DAYS_INVALID)
      }

      // Validate usage_limit_per_user
      if (!value.usage_limit_per_user || value.usage_limit_per_user < 1) {
        throw new Error(AUTO_COUPON_MESSAGES.USAGE_LIMIT_PER_USER_INVALID)
      }

      return true
    }
  }
}

const ruleIdSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: AUTO_COUPON_MESSAGES.INVALID_RULE_ID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      const rule = await databaseService.auto_coupon_rules.findOne({
        _id: new ObjectId(value)
      })

      if (!rule) {
        throw new ErrorWithStatus({
          message: AUTO_COUPON_MESSAGES.RULE_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      return true
    }
  }
}

export const createAutoCouponRuleValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      description: {
        optional: true,
        isString: true,
        trim: true
      },
      trigger_type: triggerTypeSchema,
      required_order_count: requiredOrderCountSchema,
      required_total_spent: requiredTotalSpentSchema,
      order_status: {
        optional: true,
        isArray: true
      },
      coupon_config: couponConfigSchema,
      is_active: {
        optional: true,
        isBoolean: true
      },
      max_redemptions: {
        optional: true,
        isInt: {
          options: { min: 1 }
        }
      }
    },
    ['body']
  )
)

export const updateAutoCouponRuleValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      description: {
        optional: true,
        isString: true,
        trim: true
      },
      trigger_type: {
        ...triggerTypeSchema,
        optional: true
      },
      required_order_count: requiredOrderCountSchema,
      required_total_spent: requiredTotalSpentSchema,
      order_status: {
        optional: true,
        isArray: true
      },
      coupon_config: {
        ...couponConfigSchema,
        optional: true
      },
      is_active: {
        optional: true,
        isBoolean: true
      },
      max_redemptions: {
        optional: true,
        isInt: {
          options: { min: 1 }
        }
      }
    },
    ['body']
  )
)

export const ruleIdValidator = validate(
  checkSchema(
    {
      rule_id: ruleIdSchema
    },
    ['params']
  )
)
