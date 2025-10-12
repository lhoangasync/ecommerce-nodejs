import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCTS_MESSAGES } from '~/constants/messages'
import { REGEX_SLUG } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { UpdateProductReqParams } from '~/models/requests/Product.requests'
import productsService from '~/services/product.services'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PRODUCTS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: PRODUCTS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: PRODUCTS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const slugSchema: ParamSchema = {
  matches: {
    options: REGEX_SLUG,
    errorMessage: PRODUCTS_MESSAGES.SLUG_INVALID
  },
  trim: true,
  custom: {
    options: async (value) => {
      const isSlugExist = await productsService.checkSlugExist(value)
      if (isSlugExist) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.SLUG_IS_EXISTED,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      return true
    }
  }
}

const descriptionSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: PRODUCTS_MESSAGES.DESCRIPTION_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      max: 1000
    },
    errorMessage: PRODUCTS_MESSAGES.DESCRIPTION_LENGTH_MAX_1000
  }
}

const brandIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PRODUCTS_MESSAGES.BRAND_ID_IS_REQUIRED
  },
  custom: {
    options: async (value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.BRAND_ID_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const brand = await databaseService.brands.findOne({ _id: new ObjectId(value) })
      if (!brand) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.BRAND_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      return true
    }
  }
}

const categoryIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PRODUCTS_MESSAGES.CATEGORY_ID_IS_REQUIRED
  },
  custom: {
    options: async (value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.CATEGORY_ID_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const category = await databaseService.categories.findOne({ _id: new ObjectId(value) })
      if (!category) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.CATEGORY_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      return true
    }
  }
}

const imagesSchema: ParamSchema = {
  optional: true,
  isArray: {
    errorMessage: PRODUCTS_MESSAGES.IMAGES_MUST_BE_ARRAY
  },
  custom: {
    options: (value: string[]) => {
      if (value && Array.isArray(value)) {
        for (const img of value) {
          if (typeof img !== 'string') {
            throw new Error(PRODUCTS_MESSAGES.IMAGE_URL_MUST_BE_STRING)
          }
          if (img.length > 500) {
            throw new Error(PRODUCTS_MESSAGES.IMAGE_URL_LENGTH_MAX_500)
          }
        }
      }
      return true
    }
  }
}

const howToUseSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: PRODUCTS_MESSAGES.HOW_TO_USE_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: {
      max: 2000
    },
    errorMessage: PRODUCTS_MESSAGES.HOW_TO_USE_LENGTH_MAX_2000
  }
}

const tagsSchema: ParamSchema = {
  optional: true,
  isArray: {
    errorMessage: PRODUCTS_MESSAGES.TAGS_MUST_BE_ARRAY
  },
  custom: {
    options: (value: string[]) => {
      if (value && Array.isArray(value)) {
        for (const tag of value) {
          if (typeof tag !== 'string') {
            throw new Error(PRODUCTS_MESSAGES.TAG_MUST_BE_STRING)
          }
        }
      }
      return true
    }
  }
}

// Cosmetics-specific schemas
const ingredientsSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: PRODUCTS_MESSAGES.INGREDIENTS_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: {
      max: 2000
    },
    errorMessage: PRODUCTS_MESSAGES.INGREDIENTS_LENGTH_MAX_2000
  }
}

const skinTypeSchema: ParamSchema = {
  optional: true,
  isArray: {
    errorMessage: PRODUCTS_MESSAGES.SKIN_TYPE_MUST_BE_ARRAY
  },
  custom: {
    options: (value: string[]) => {
      const validSkinTypes = ['dry', 'oily', 'combination', 'sensitive', 'normal']
      if (value && Array.isArray(value)) {
        for (const skinType of value) {
          if (!validSkinTypes.includes(skinType)) {
            throw new Error(PRODUCTS_MESSAGES.SKIN_TYPE_INVALID)
          }
        }
      }
      return true
    }
  }
}

const originSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: PRODUCTS_MESSAGES.ORIGIN_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: {
      max: 100
    },
    errorMessage: PRODUCTS_MESSAGES.ORIGIN_LENGTH_MAX_100
  }
}

// Variant schemas
const variantsSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PRODUCTS_MESSAGES.VARIANTS_REQUIRED
  },
  isArray: {
    errorMessage: PRODUCTS_MESSAGES.VARIANTS_MUST_BE_ARRAY
  },
  custom: {
    options: (value: any[]) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(PRODUCTS_MESSAGES.VARIANTS_REQUIRED)
      }

      const variantIds: string[] = []
      const skus: string[] = []

      for (const variant of value) {
        // Validate variant structure
        if (!variant.id || typeof variant.id !== 'string') {
          throw new Error(PRODUCTS_MESSAGES.VARIANT_ID_REQUIRED)
        }

        if (!variant.price || typeof variant.price !== 'number' || variant.price <= 0) {
          throw new Error(PRODUCTS_MESSAGES.VARIANT_PRICE_MUST_BE_POSITIVE)
        }

        // Validate original_price if provided
        if (variant.original_price !== undefined && variant.original_price !== null) {
          if (typeof variant.original_price !== 'number') {
            throw new Error(PRODUCTS_MESSAGES.VARIANT_ORIGINAL_PRICE_MUST_BE_NUMBER)
          }
          if (variant.original_price <= 0) {
            throw new Error(PRODUCTS_MESSAGES.VARIANT_ORIGINAL_PRICE_MUST_BE_POSITIVE)
          }
          if (variant.original_price < variant.price) {
            throw new Error(PRODUCTS_MESSAGES.VARIANT_ORIGINAL_PRICE_MUST_BE_GREATER_THAN_PRICE)
          }
        }

        if (!variant.sku || typeof variant.sku !== 'string') {
          throw new Error(PRODUCTS_MESSAGES.VARIANT_SKU_REQUIRED)
        }

        if (variant.sku.length > 100) {
          throw new Error(PRODUCTS_MESSAGES.VARIANT_SKU_LENGTH_MAX_100)
        }

        if (typeof variant.stock_quantity !== 'number' || variant.stock_quantity < 0) {
          throw new Error(PRODUCTS_MESSAGES.VARIANT_STOCK_QUANTITY_MUST_BE_NON_NEGATIVE)
        }

        if (typeof variant.is_available !== 'boolean') {
          throw new Error(PRODUCTS_MESSAGES.VARIANT_IS_AVAILABLE_MUST_BE_BOOLEAN)
        }

        // Optional fields validation
        if (variant.shade_color && (typeof variant.shade_color !== 'string' || variant.shade_color.length > 50)) {
          throw new Error(PRODUCTS_MESSAGES.VARIANT_SHADE_COLOR_LENGTH_MAX_50)
        }

        if (variant.volume_size && (typeof variant.volume_size !== 'string' || variant.volume_size.length > 50)) {
          throw new Error(PRODUCTS_MESSAGES.VARIANT_VOLUME_SIZE_LENGTH_MAX_50)
        }

        if (variant.images && Array.isArray(variant.images)) {
          for (const img of variant.images) {
            if (typeof img !== 'string' || img.length > 500) {
              throw new Error(PRODUCTS_MESSAGES.VARIANT_IMAGE_URL_LENGTH_MAX_500)
            }
          }
        }

        variantIds.push(variant.id)
        skus.push(variant.sku)
      }

      // Check for duplicate IDs
      const uniqueIds = new Set(variantIds)
      if (variantIds.length !== uniqueIds.size) {
        throw new Error(PRODUCTS_MESSAGES.VARIANT_IDS_MUST_BE_UNIQUE)
      }

      // Check for duplicate SKUs
      const uniqueSkus = new Set(skus)
      if (skus.length !== uniqueSkus.size) {
        throw new Error(PRODUCTS_MESSAGES.VARIANT_SKUS_MUST_BE_UNIQUE)
      }

      return true
    }
  }
}
const originalPriceSchema: ParamSchema = {
  optional: true,
  isNumeric: {
    errorMessage: PRODUCTS_MESSAGES.VARIANT_ORIGINAL_PRICE_MUST_BE_NUMBER
  },
  custom: {
    options: (value, { req }) => {
      if (value !== undefined && value !== null && value !== '') {
        const originalPrice = Number(value)

        // Kiểm tra giá gốc phải dương
        if (originalPrice <= 0) {
          throw new Error(PRODUCTS_MESSAGES.VARIANT_ORIGINAL_PRICE_MUST_BE_POSITIVE)
        }

        // Kiểm tra giá gốc phải >= giá hiện tại (nếu có price trong request)
        const price = req.body.price
        if (price !== undefined) {
          const currentPrice = Number(price)
          if (originalPrice < currentPrice) {
            throw new Error(PRODUCTS_MESSAGES.VARIANT_ORIGINAL_PRICE_MUST_BE_GREATER_THAN_PRICE)
          }
        }
      }
      return true
    }
  }
}
const productIdSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      // Kiểm tra xem có phải ObjectId không
      const isObjectId = ObjectId.isValid(value) && /^[0-9a-fA-F]{24}$/.test(value)

      if (isObjectId) {
        // Nếu là ObjectId, kiểm tra tồn tại bằng _id
        const product = await databaseService.products.findOne({ _id: new ObjectId(value) })
        if (!product) {
          throw new ErrorWithStatus({
            message: PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
      } else {
        // Nếu là slug, kiểm tra tồn tại bằng slug
        // Validate slug format
        if (!REGEX_SLUG.test(value)) {
          throw new ErrorWithStatus({
            message: PRODUCTS_MESSAGES.SLUG_INVALID,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }

        const product = await databaseService.products.findOne({ slug: value })
        if (!product) {
          throw new ErrorWithStatus({
            message: PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
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
  }
}

// Main validators
export const addProductValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      slug: slugSchema,
      description: descriptionSchema,
      brand_id: brandIdSchema,
      category_id: categoryIdSchema,
      ingredients: ingredientsSchema,
      skin_type: skinTypeSchema,
      origin: originSchema,
      how_to_use: howToUseSchema,
      variants: variantsSchema,
      images: imagesSchema,
      tags: tagsSchema
    },
    ['body']
  )
)

export const productIdValidator = validate(
  checkSchema(
    {
      product_id: productIdSchema
    },
    ['params']
  )
)

export const updateProductValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      slug: {
        ...slugSchema,
        optional: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) return true

            const { product_id } = req.params as UpdateProductReqParams
            const productWithThisSlug = await databaseService.products.findOne({
              slug: value,
              _id: { $ne: new ObjectId(product_id) }
            })

            if (productWithThisSlug) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.SLUG_IS_EXISTED,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      description: {
        ...descriptionSchema,
        optional: true
      },
      brand_id: {
        ...brandIdSchema,
        optional: true,
        notEmpty: undefined
      },
      category_id: {
        ...categoryIdSchema,
        optional: true,
        notEmpty: undefined
      },
      ingredients: {
        ...ingredientsSchema,
        optional: true
      },
      skin_type: {
        ...skinTypeSchema,
        optional: true
      },
      origin: {
        ...originSchema,
        optional: true
      },
      how_to_use: {
        ...howToUseSchema,
        optional: true
      },
      variants: {
        ...variantsSchema,
        optional: true,
        notEmpty: undefined
      },
      images: {
        ...imagesSchema,
        optional: true
      },
      tags: {
        ...tagsSchema,
        optional: true
      }
    },
    ['body']
  )
)

// Variant-specific validators
export const addVariantValidator = validate(
  checkSchema(
    {
      product_id: productIdSchema,
      id: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_ID_REQUIRED
        },
        isString: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_ID_MUST_BE_STRING
        }
      },
      shade_color: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_SHADE_COLOR_MUST_BE_STRING
        },
        isLength: {
          options: { max: 50 },
          errorMessage: PRODUCTS_MESSAGES.VARIANT_SHADE_COLOR_LENGTH_MAX_50
        }
      },
      volume_size: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_VOLUME_SIZE_MUST_BE_STRING
        },
        isLength: {
          options: { max: 50 },
          errorMessage: PRODUCTS_MESSAGES.VARIANT_VOLUME_SIZE_LENGTH_MAX_50
        }
      },
      price: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_PRICE_REQUIRED
        },
        isNumeric: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_PRICE_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            if (Number(value) <= 0) {
              throw new Error(PRODUCTS_MESSAGES.VARIANT_PRICE_MUST_BE_POSITIVE)
            }
            return true
          }
        }
      },
      original_price: originalPriceSchema,
      sku: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_SKU_REQUIRED
        },
        isString: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_SKU_MUST_BE_STRING
        },
        isLength: {
          options: { max: 100 },
          errorMessage: PRODUCTS_MESSAGES.VARIANT_SKU_LENGTH_MAX_100
        }
      },
      images: {
        optional: true,
        isArray: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_IMAGES_MUST_BE_ARRAY
        }
      },
      stock_quantity: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_STOCK_QUANTITY_REQUIRED
        },
        isNumeric: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_STOCK_QUANTITY_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            if (Number(value) < 0) {
              throw new Error(PRODUCTS_MESSAGES.VARIANT_STOCK_QUANTITY_MUST_BE_NON_NEGATIVE)
            }
            return true
          }
        }
      },
      is_available: {
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_IS_AVAILABLE_REQUIRED
        },
        isBoolean: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_IS_AVAILABLE_MUST_BE_BOOLEAN
        }
      }
    },
    ['params', 'body']
  )
)

export const variantIdValidator = validate(
  checkSchema(
    {
      product_id: productIdSchema,
      variant_id: variantIdSchema
    },
    ['params']
  )
)

export const updateVariantValidator = validate(
  checkSchema(
    {
      product_id: productIdSchema,
      variant_id: variantIdSchema,
      shade_color: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_SHADE_COLOR_MUST_BE_STRING
        },
        isLength: {
          options: { max: 50 },
          errorMessage: PRODUCTS_MESSAGES.VARIANT_SHADE_COLOR_LENGTH_MAX_50
        }
      },
      volume_size: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_VOLUME_SIZE_MUST_BE_STRING
        },
        isLength: {
          options: { max: 50 },
          errorMessage: PRODUCTS_MESSAGES.VARIANT_VOLUME_SIZE_LENGTH_MAX_50
        }
      },
      original_price: originalPriceSchema,
      price: {
        optional: true,
        isNumeric: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_PRICE_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            if (value && Number(value) <= 0) {
              throw new Error(PRODUCTS_MESSAGES.VARIANT_PRICE_MUST_BE_POSITIVE)
            }
            return true
          }
        }
      },
      sku: {
        optional: true,
        isString: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_SKU_MUST_BE_STRING
        },
        isLength: {
          options: { max: 100 },
          errorMessage: PRODUCTS_MESSAGES.VARIANT_SKU_LENGTH_MAX_100
        }
      },
      images: {
        optional: true,
        isArray: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_IMAGES_MUST_BE_ARRAY
        }
      },
      stock_quantity: {
        optional: true,
        isNumeric: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_STOCK_QUANTITY_MUST_BE_NUMBER
        },
        custom: {
          options: (value) => {
            if (value !== undefined && Number(value) < 0) {
              throw new Error(PRODUCTS_MESSAGES.VARIANT_STOCK_QUANTITY_MUST_BE_NON_NEGATIVE)
            }
            return true
          }
        }
      },
      is_available: {
        optional: true,
        isBoolean: {
          errorMessage: PRODUCTS_MESSAGES.VARIANT_IS_AVAILABLE_MUST_BE_BOOLEAN
        }
      }
    },
    ['params', 'body']
  )
)

export const updateVariantStockValidator = validate(
  checkSchema(
    {
      product_id: productIdSchema,
      variant_id: variantIdSchema,
      quantity: {
        notEmpty: {
          errorMessage: 'Quantity is required'
        },
        isNumeric: {
          errorMessage: 'Quantity must be a number'
        }
      }
    },
    ['params', 'body']
  )
)
