import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

const productIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PRODUCTS_MESSAGES.INVALID_PRODUCT_ID
  },
  custom: {
    options: async (value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.INVALID_PRODUCT_ID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const product = await databaseService.products.findOne({ _id: new ObjectId(value) })
      if (!product) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      return true
    }
  }
}

const variantIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PRODUCTS_MESSAGES.VARIANT_ID_REQUIRED
  },
  isString: {
    errorMessage: PRODUCTS_MESSAGES.VARIANT_ID_MUST_BE_STRING
  },
  custom: {
    options: async (value: string, { req }) => {
      const product_id = req.body?.product_id || req.params?.product_id
      if (!product_id) return true

      const product = await databaseService.products.findOne({
        _id: new ObjectId(product_id)
      })

      if (!product) return true

      const variant = product.variants.find((v) => v.id === value)
      if (!variant) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.VARIANT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      if (!variant.is_available || variant.stock_quantity <= 0) {
        throw new ErrorWithStatus({
          message: 'Variant is not available or out of stock',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      return true
    }
  }
}

const quantitySchema: ParamSchema = {
  notEmpty: {
    errorMessage: 'Quantity is required'
  },
  isInt: {
    options: { min: 1 },
    errorMessage: 'Quantity must be a positive integer'
  },
  custom: {
    options: async (value: number, { req }) => {
      const product_id = req.body?.product_id || req.params?.product_id
      const variant_id = req.body?.variant_id || req.params?.variant_id

      if (!product_id || !variant_id) return true

      const product = await databaseService.products.findOne({
        _id: new ObjectId(product_id)
      })

      if (!product) return true

      const variant = product.variants.find((v) => v.id === variant_id)
      if (!variant) return true

      if (value > variant.stock_quantity) {
        throw new ErrorWithStatus({
          message: `Only ${variant.stock_quantity} items available in stock`,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      return true
    }
  }
}

export const addToCartValidator = validate(
  checkSchema(
    {
      product_id: productIdSchema,
      variant_id: variantIdSchema,
      quantity: quantitySchema
    },
    ['body']
  )
)

export const updateCartItemValidator = validate(
  checkSchema(
    {
      product_id: {
        ...productIdSchema,
        in: ['params']
      },
      variant_id: {
        ...variantIdSchema,
        in: ['params']
      },
      quantity: quantitySchema
    },
    ['params', 'body']
  )
)

export const removeFromCartValidator = validate(
  checkSchema(
    {
      product_id: {
        ...productIdSchema,
        in: ['params']
      },
      variant_id: {
        ...variantIdSchema,
        in: ['params'],
        custom: undefined // Remove stock check for removal
      }
    },
    ['params']
  )
)

export const sessionIdValidator = validate(
  checkSchema(
    {
      session_id: {
        optional: true,
        isString: {
          errorMessage: 'Session ID must be a string'
        },
        trim: true
      }
    },
    ['query', 'body']
  )
)
