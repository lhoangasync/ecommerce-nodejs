// ~/middlewares/reviews.middlewares.ts
import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { REVIEWS_MESSAGES } from '~/constants/messages'
import { ReviewStatus } from '~/models/schemas/Review.schema'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

const reviewIdSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: REVIEWS_MESSAGES.INVALID_REVIEW_ID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      const review = await databaseService.reviews.findOne({
        _id: new ObjectId(value)
      })

      if (!review) {
        throw new ErrorWithStatus({
          message: REVIEWS_MESSAGES.REVIEW_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      return true
    }
  }
}

const productIdSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: REVIEWS_MESSAGES.INVALID_PRODUCT_ID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      const product = await databaseService.products.findOne({
        _id: new ObjectId(value)
      })

      if (!product) {
        throw new ErrorWithStatus({
          message: REVIEWS_MESSAGES.PRODUCT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      return true
    }
  }
}

export const reviewIdValidator = validate(
  checkSchema(
    {
      review_id: reviewIdSchema
    },
    ['params']
  )
)

export const createReviewValidator = validate(
  checkSchema(
    {
      product_id: {
        ...productIdSchema,
        notEmpty: {
          errorMessage: REVIEWS_MESSAGES.PRODUCT_ID_REQUIRED
        }
      },
      variant_id: {
        optional: true,
        isString: {
          errorMessage: REVIEWS_MESSAGES.VARIANT_ID_MUST_BE_STRING
        },
        trim: true
      },
      rating: {
        notEmpty: {
          errorMessage: REVIEWS_MESSAGES.RATING_REQUIRED
        },
        isInt: {
          options: { min: 1, max: 5 },
          errorMessage: REVIEWS_MESSAGES.INVALID_RATING
        },
        toInt: true
      },
      comment: {
        optional: true,
        isString: {
          errorMessage: REVIEWS_MESSAGES.COMMENT_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 2000 },
          errorMessage: REVIEWS_MESSAGES.COMMENT_LENGTH
        }
      },
      images: {
        optional: true,
        isArray: {
          errorMessage: REVIEWS_MESSAGES.IMAGES_MUST_BE_ARRAY
        },
        custom: {
          options: (value: any[]) => {
            if (value && value.length > 5) {
              throw new Error(REVIEWS_MESSAGES.MAX_IMAGES)
            }
            if (value && !value.every((item) => typeof item === 'string')) {
              throw new Error(REVIEWS_MESSAGES.IMAGES_MUST_BE_STRINGS)
            }
            return true
          }
        }
      },
      is_verified_purchase: {
        optional: true,
        isBoolean: {
          errorMessage: REVIEWS_MESSAGES.IS_VERIFIED_MUST_BE_BOOLEAN
        },
        toBoolean: true
      },
      order_id: {
        optional: true,
        custom: {
          options: async (value: string) => {
            if (value && !ObjectId.isValid(value)) {
              throw new Error(REVIEWS_MESSAGES.INVALID_ORDER_ID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateReviewValidator = validate(
  checkSchema(
    {
      review_id: reviewIdSchema,
      rating: {
        optional: true,
        isInt: {
          options: { min: 1, max: 5 },
          errorMessage: REVIEWS_MESSAGES.INVALID_RATING
        },
        toInt: true
      },
      comment: {
        optional: true,
        isString: {
          errorMessage: REVIEWS_MESSAGES.COMMENT_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 2000 },
          errorMessage: REVIEWS_MESSAGES.COMMENT_LENGTH
        }
      },
      images: {
        optional: true,
        isArray: {
          errorMessage: REVIEWS_MESSAGES.IMAGES_MUST_BE_ARRAY
        },
        custom: {
          options: (value: any[]) => {
            if (value && value.length > 5) {
              throw new Error(REVIEWS_MESSAGES.MAX_IMAGES)
            }
            if (value && !value.every((item) => typeof item === 'string')) {
              throw new Error(REVIEWS_MESSAGES.IMAGES_MUST_BE_STRINGS)
            }
            return true
          }
        }
      },
      variant_id: {
        optional: true,
        isString: {
          errorMessage: REVIEWS_MESSAGES.VARIANT_ID_MUST_BE_STRING
        },
        trim: true
      }
    },
    ['params', 'body']
  )
)

export const getReviewsValidator = validate(
  checkSchema(
    {
      product_id: {
        optional: true,
        custom: {
          options: (value: string) => {
            if (value && !ObjectId.isValid(value)) {
              throw new Error(REVIEWS_MESSAGES.INVALID_PRODUCT_ID)
            }
            return true
          }
        }
      },
      user_id: {
        optional: true,
        custom: {
          options: (value: string) => {
            if (value && !ObjectId.isValid(value)) {
              throw new Error(REVIEWS_MESSAGES.INVALID_USER_ID)
            }
            return true
          }
        }
      },
      rating: {
        optional: true,
        isInt: {
          options: { min: 1, max: 5 },
          errorMessage: REVIEWS_MESSAGES.INVALID_RATING
        },
        toInt: true
      },
      status: {
        optional: true,
        isIn: {
          options: [[ReviewStatus.PENDING, ReviewStatus.APPROVED, ReviewStatus.REJECTED]],
          errorMessage: REVIEWS_MESSAGES.INVALID_STATUS
        }
      },
      is_verified_purchase: {
        optional: true,
        isBoolean: {
          errorMessage: REVIEWS_MESSAGES.IS_VERIFIED_MUST_BE_BOOLEAN
        },
        toBoolean: true
      },
      page: {
        optional: true,
        isInt: {
          options: { min: 1 },
          errorMessage: REVIEWS_MESSAGES.INVALID_PAGE
        },
        toInt: true
      },
      limit: {
        optional: true,
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: REVIEWS_MESSAGES.INVALID_LIMIT
        },
        toInt: true
      },
      sort_by: {
        optional: true,
        isIn: {
          options: [['created_at', 'rating', 'helpful_count']],
          errorMessage: REVIEWS_MESSAGES.INVALID_SORT_BY
        }
      },
      order: {
        optional: true,
        isIn: {
          options: [['asc', 'desc']],
          errorMessage: REVIEWS_MESSAGES.INVALID_ORDER
        }
      }
    },
    ['query']
  )
)

export const sellerResponseValidator = validate(
  checkSchema(
    {
      review_id: reviewIdSchema,
      message: {
        notEmpty: {
          errorMessage: REVIEWS_MESSAGES.MESSAGE_REQUIRED
        },
        isString: {
          errorMessage: REVIEWS_MESSAGES.MESSAGE_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 1000 },
          errorMessage: REVIEWS_MESSAGES.MESSAGE_LENGTH
        }
      }
    },
    ['params', 'body']
  )
)

export const productIdParamValidator = validate(
  checkSchema(
    {
      product_id: productIdSchema
    },
    ['params']
  )
)
