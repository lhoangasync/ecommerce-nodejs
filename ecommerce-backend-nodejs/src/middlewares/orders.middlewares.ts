import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { validate } from '~/utils/validation'

// Middleware: Validate tạo đơn hàng
export const createOrderValidator = validate(
  checkSchema(
    {
      shipping_address: {
        isObject: {
          errorMessage: 'Shipping address must be an object'
        }
      },
      'shipping_address.full_name': {
        isString: {
          errorMessage: 'Full name must be a string'
        },
        notEmpty: {
          errorMessage: 'Full name is required'
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: 'Full name length must be from 1 to 100'
        }
      },
      'shipping_address.phone_number': {
        isString: {
          errorMessage: 'Phone number must be a string'
        },
        notEmpty: {
          errorMessage: 'Phone number is required'
        },
        matches: {
          options: /^[0-9]{10,11}$/,
          errorMessage: 'Phone number must be 10-11 digits'
        }
      },
      'shipping_address.address': {
        isString: {
          errorMessage: 'Address must be a string'
        },
        notEmpty: {
          errorMessage: 'Address is required'
        },
        isLength: {
          options: { min: 10, max: 200 },
          errorMessage: 'Address length must be from 10 to 200'
        }
      },
      'shipping_address.ward': {
        optional: true,
        isString: {
          errorMessage: 'Ward must be a string'
        }
      },
      'shipping_address.district': {
        optional: true,
        isString: {
          errorMessage: 'District must be a string'
        }
      },
      'shipping_address.city': {
        isString: {
          errorMessage: 'City must be a string'
        },
        notEmpty: {
          errorMessage: 'City is required'
        }
      },
      'shipping_address.country': {
        optional: true,
        isString: {
          errorMessage: 'Country must be a string'
        }
      },
      note: {
        optional: true,
        isString: {
          errorMessage: 'Note must be a string'
        },
        isLength: {
          options: { max: 500 },
          errorMessage: 'Note length must not exceed 500 characters'
        }
      },
      payment_method: {
        isIn: {
          options: [['cod', 'momo', 'vnpay', 'bank_transfer']],
          errorMessage: 'Invalid payment method. Must be: cod, momo, vnpay, or bank_transfer'
        }
      },
      shipping_fee: {
        optional: true,
        isInt: {
          options: { min: 0 },
          errorMessage: 'Shipping fee must be a positive integer'
        }
      }
    },
    ['body']
  )
)

// Middleware: Validate order ID param
export const orderIdValidator = validate(
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

// Middleware: Validate update order status
export const updateOrderStatusValidator = validate(
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
      },
      status: {
        isIn: {
          options: [['confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded']],
          errorMessage: 'Invalid status'
        }
      },
      cancellation_reason: {
        optional: true,
        isString: {
          errorMessage: 'Cancellation reason must be a string'
        },
        isLength: {
          options: { max: 500 },
          errorMessage: 'Cancellation reason must not exceed 500 characters'
        }
      },
      tracking_number: {
        optional: true,
        isString: {
          errorMessage: 'Tracking number must be a string'
        }
      }
    },
    ['params', 'body']
  )
)

// Middleware: Validate cancel order
export const cancelOrderValidator = validate(
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
      },
      reason: {
        isString: {
          errorMessage: 'Reason must be a string'
        },
        notEmpty: {
          errorMessage: 'Cancellation reason is required'
        },
        isLength: {
          options: { min: 10, max: 500 },
          errorMessage: 'Reason length must be from 10 to 500 characters'
        }
      }
    },
    ['params', 'body']
  )
)

// Middleware: Validate get orders query
export const getOrdersQueryValidator = validate(
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
      status: {
        optional: true,
        isIn: {
          options: [['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded']],
          errorMessage: 'Invalid status'
        }
      },
      payment_status: {
        optional: true,
        isIn: {
          options: [['pending', 'paid', 'failed', 'refunded']],
          errorMessage: 'Invalid payment status'
        }
      },
      payment_method: {
        optional: true,
        isIn: {
          options: [['cod', 'momo', 'vnpay', 'bank_transfer']],
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
      },
      search: {
        optional: true,
        isString: {
          errorMessage: 'Search must be a string'
        }
      },
      sort: {
        optional: true,
        isString: {
          errorMessage: 'Sort must be a string'
        }
      }
    },
    ['query']
  )
)
