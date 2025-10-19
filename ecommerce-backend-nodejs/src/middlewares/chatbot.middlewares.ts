import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { validate } from '~/utils/validation'

export const chatMessageValidator = validate(
  checkSchema(
    {
      message: {
        notEmpty: {
          errorMessage: 'Message is required'
        },
        isString: {
          errorMessage: 'Message must be a string'
        },
        isLength: {
          options: { min: 1, max: 1000 },
          errorMessage: 'Message must be between 1 and 1000 characters'
        },
        trim: true
      },
      session_id: {
        optional: true,
        isString: {
          errorMessage: 'Session ID must be a string'
        },
        custom: {
          options: (value: string) => {
            if (value && !ObjectId.isValid(value)) {
              throw new Error('Invalid session ID')
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const productIdValidator = validate(
  checkSchema(
    {
      product_id: {
        notEmpty: {
          errorMessage: 'Product ID is required'
        },
        isString: {
          errorMessage: 'Product ID must be a string'
        },
        custom: {
          options: (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new Error('Invalid product ID')
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const compareProductsValidator = validate(
  checkSchema(
    {
      product_ids: {
        notEmpty: {
          errorMessage: 'Product IDs are required'
        },
        isArray: {
          errorMessage: 'Product IDs must be an array'
        },
        custom: {
          options: (value: string[]) => {
            if (!Array.isArray(value) || value.length < 2) {
              throw new Error('At least 2 product IDs are required')
            }
            if (value.length > 5) {
              throw new Error('Maximum 5 products can be compared')
            }
            for (const id of value) {
              if (!ObjectId.isValid(id)) {
                throw new Error(`Invalid product ID: ${id}`)
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
