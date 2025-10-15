import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { validate } from '~/utils/validation'

export const createPaymentValidator = validate(
  checkSchema(
    {
      order_id: {
        isString: {
          errorMessage: 'Order ID must be a string'
        },
        notEmpty: {
          errorMessage: 'Order ID is required'
        },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error('Invalid order ID')
            }
            return true
          }
        }
      },
      payment_method: {
        isIn: {
          options: [['momo', 'vnpay', 'bank_transfer']],
          errorMessage: 'Invalid payment method. Must be: momo, vnpay, or bank_transfer'
        }
      },
      return_url: {
        optional: true,
        isString: {
          errorMessage: 'Return URL must be a string'
        },
        isURL: {
          errorMessage: 'Return URL must be a valid URL'
        }
      },
      cancel_url: {
        optional: true,
        isString: {
          errorMessage: 'Cancel URL must be a string'
        },
        isURL: {
          errorMessage: 'Cancel URL must be a valid URL'
        }
      },
      language: {
        optional: true,
        isIn: {
          options: [['vi', 'en']],
          errorMessage: 'Language must be vi or en'
        }
      }
    },
    ['body']
  )
)

// Middleware: Validate payment ID param
export const paymentIdValidator = validate(
  checkSchema(
    {
      payment_id: {
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error('Invalid payment ID')
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

// Middleware: Validate order ID param
export const orderIdParamValidator = validate(
  checkSchema(
    {
      order_id: {
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error('Invalid order ID')
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

// Middleware: Validate refund payment
export const refundPaymentValidator = validate(
  checkSchema(
    {
      payment_id: {
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error('Invalid payment ID')
            }
            return true
          }
        }
      },
      amount: {
        optional: true,
        isInt: {
          options: { min: 1 },
          errorMessage: 'Amount must be a positive integer'
        }
      },
      reason: {
        optional: true,
        isString: {
          errorMessage: 'Reason must be a string'
        },
        isLength: {
          options: { max: 500 },
          errorMessage: 'Reason must not exceed 500 characters'
        }
      }
    },
    ['params', 'body']
  )
)

// Middleware: Validate get payments query
export const getPaymentsQueryValidator = validate(
  checkSchema(
    {
      page: {
        optional: true,
        isInt: {
          options: { min: 1 },
          errorMessage: 'Page must be a positive integer'
        }
      },
      limit: {
        optional: true,
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: 'Limit must be between 1 and 100'
        }
      },
      order_id: {
        optional: true,
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error('Invalid order ID')
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        isIn: {
          options: [['pending', 'processing', 'completed', 'failed', 'expired', 'refunded']],
          errorMessage: 'Invalid status'
        }
      },
      payment_method: {
        optional: true,
        isIn: {
          options: [['momo', 'vnpay', 'bank_transfer']],
          errorMessage: 'Invalid payment method'
        }
      },
      from_date: {
        optional: true,
        isISO8601: {
          errorMessage: 'Invalid from_date format. Use ISO 8601 format'
        }
      },
      to_date: {
        optional: true,
        isISO8601: {
          errorMessage: 'Invalid to_date format. Use ISO 8601 format'
        }
      }
    },
    ['query']
  )
)
