import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANDS_MESSAGES } from '~/constants/messages'
import { REGEX_SLUG } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { UpdateBrandReqParams } from '~/models/requests/Brand.requests'
import brandsService from '~/services/brand.services'
import databaseService from '~/services/database.services'

import { validate } from '~/utils/validation'

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: BRANDS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: BRANDS_MESSAGES.NAME_MUSE_BE_A_STRING
  },
  trim: true,

  isLength: {
    options: {
      min: 1,
      max: 50
    },
    errorMessage: BRANDS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_50
  }
}

const countrySchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: BRANDS_MESSAGES.COUNTRY_MUSE_BE_A_STRING
  },
  trim: true,

  isLength: {
    options: {
      min: 1,
      max: 50
    },
    errorMessage: BRANDS_MESSAGES.COUNTRY_LENGTH_MUST_BE_FROM_1_TO_50
  }
}

const descSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: BRANDS_MESSAGES.DESCRIPTION_MUSE_BE_A_STRING
  },
  trim: true

  // isLength: {
  //   options: {
  //     min: 0,
  //     max: 500
  //   },
  //   errorMessage: BRANDS_MESSAGES.DESCRIPTION_LENGTH_MUST_BE_FROM_1_TO_500
  // }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: BRANDS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 0,
      max: 400
    },
    errorMessage: BRANDS_MESSAGES.IMAGE_URL_LENGTH
  }
}

const brandIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: BRANDS_MESSAGES.INVALID_BRAND_ID,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const brand = await databaseService.brands.findOne({ _id: new ObjectId(value) })
      if (brand === null) {
        throw new ErrorWithStatus({
          message: BRANDS_MESSAGES.BRAND_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }
  }
}

const slugSchema: ParamSchema = {
  matches: {
    options: REGEX_SLUG,
    errorMessage: BRANDS_MESSAGES.SLUG_INVALID
  },
  trim: true,
  custom: {
    options: async (value) => {
      const isSlugExist = await brandsService.checkSlugExist(value)
      if (isSlugExist) {
        throw new ErrorWithStatus({
          message: BRANDS_MESSAGES.SLUG_IS_EXISTED,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      return true
    }
  }
}

export const addBrandValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      slug: slugSchema,
      country: countrySchema,
      desc: descSchema,
      img: imageSchema
    },
    ['body']
  )
)

export const brandIdValidator = validate(
  checkSchema(
    {
      brand_id: brandIdSchema
    },
    ['params']
  )
)

export const updateBrandValidator = validate(
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
            const { brand_id } = req.params as UpdateBrandReqParams
            // Tìm brand có slug này, NHƯNG không phải là brand đang được update
            const brandWithThisSlug = await databaseService.brands.findOne({
              slug: value,
              _id: { $ne: new ObjectId(brand_id) } // $ne = Not Equal
            })

            // Nếu tìm thấy, tức là slug này đã bị brand khác chiếm dụng
            if (brandWithThisSlug) {
              throw new ErrorWithStatus({
                message: BRANDS_MESSAGES.SLUG_IS_EXISTED,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      country: {
        ...countrySchema,
        optional: true
      },
      desc: {
        ...descSchema,
        optional: true
      },
      img: {
        ...imageSchema,
        optional: true
      }
    },
    ['body']
  )
)
