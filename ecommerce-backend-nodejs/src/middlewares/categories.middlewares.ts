import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { CATEGORIES_MESSAGES } from '~/constants/messages'
import { REGEX_SLUG } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import categoriesService from '~/services/category.services'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

const categoryIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: CATEGORIES_MESSAGES.INVALID_CATEGORY_ID,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const category = await databaseService.categories.findOne({ _id: new ObjectId(value) })
      if (category === null) {
        throw new ErrorWithStatus({
          message: CATEGORIES_MESSAGES.CATEGORY_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: CATEGORIES_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: CATEGORIES_MESSAGES.NAME_MUSE_BE_A_STRING
  },
  trim: true,

  isLength: {
    options: {
      min: 1,
      max: 50
    },
    errorMessage: CATEGORIES_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_50
  }
}

const descSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_MUSE_BE_A_STRING
  },
  trim: true
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: CATEGORIES_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 0,
      max: 400
    },
    errorMessage: CATEGORIES_MESSAGES.IMAGE_URL_LENGTH
  }
}

const slugSchema: ParamSchema = {
  matches: {
    options: REGEX_SLUG,
    errorMessage: CATEGORIES_MESSAGES.SLUG_INVALID
  },
  trim: true,
  custom: {
    options: async (value) => {
      const isSlugExist = await categoriesService.checkSlugExist(value)
      if (isSlugExist) {
        throw new ErrorWithStatus({
          message: CATEGORIES_MESSAGES.SLUG_IS_EXISTED,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      return true
    }
  }
}

export const addCategoryValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      slug: slugSchema,
      desc: descSchema,
      img: imageSchema
    },
    ['body']
  )
)

export const categoryIdValidator = validate(
  checkSchema(
    {
      category_id: categoryIdSchema
    },
    ['params']
  )
)
