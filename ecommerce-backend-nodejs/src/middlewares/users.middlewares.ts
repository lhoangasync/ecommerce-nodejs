import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserRoles, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { REGEX_USERNAME } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import usersService from '~/services/user.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  trim: true,

  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const passwordSchema: ParamSchema = {
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },

  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH
  }
}

const confirmPasswordSchema = (passwordField: string): ParamSchema => {
  return {
    isString: {
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
    },
    notEmpty: {
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
    },

    isLength: {
      options: {
        min: 6,
        max: 50
      },

      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
    },
    isStrongPassword: {
      options: {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1
      },
      errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
    },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body[passwordField]) {
          throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
        }
        return true
      }
    }
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.INVALID_USER_ID,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const user = await databaseService.users.findOne({ _id: new ObjectId(value) })
      if (user === null) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }
  }
}
export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_MUST_BE_A_VALID_EMAIL
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await usersService.checkEmailExist(value)
            if (isExistEmail) {
              throw Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema('password')
    },
    ['body']
  )
)
export const resendVerificationEmailValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: 'Email is invalid'
        },
        trim: true,
        normalizeEmail: true
      }
    },
    ['body']
  )
)
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user

            return true
          }
        }
      },
      password: {
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },

        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

// export const refreshTokenValidator = validate(
//   checkSchema(
//     {
//       refresh_token: {
//         custom: {
//           options: async (_: string, { req }) => {
//             const token = (req as Request).cookies?.refresh_token

//             if (!token) {
//               throw new ErrorWithStatus({
//                 message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
//                 status: HTTP_STATUS.UNAUTHORIZED
//               })
//             }

//             try {
//               const [decoded_refresh_token, tokenInDb] = await Promise.all([
//                 verifyToken({
//                   token,
//                   secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
//                 }),
//                 databaseService.refreshTokens.findOne({ token })
//               ])

//               if (!tokenInDb) {
//                 throw new ErrorWithStatus({
//                   message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
//                   status: HTTP_STATUS.UNAUTHORIZED
//                 })
//               }

//               ;(req as Request).decoded_refresh_token = decoded_refresh_token
//             } catch (error) {
//               if (error instanceof JsonWebTokenError) {
//                 throw new ErrorWithStatus({
//                   message: capitalize(error.message),
//                   status: HTTP_STATUS.UNAUTHORIZED
//                 })
//               }
//               throw error
//             }

//             return true
//           }
//         }
//       }
//     },
//     ['cookies']
//   )
// )

export const refreshTokenCookieValidator = validate(
  checkSchema(
    {
      refresh_token: {
        custom: {
          options: async (_, { req }) => {
            const token = req.cookies?.refresh_token
            if (!token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({
                  token,
                  secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
                }),
                databaseService.refreshTokens.findOne({ token })
              ])

              if (!refresh_token) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }

              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['cookies']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })

              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.VERIFIED) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const checkRoleValidator = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.decoded_authorization as TokenPayload

  if (role !== UserRoles.ADMIN) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_PERRMISSION,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const paginateValidator = validate(
  checkSchema(
    {
      page: {
        optional: true,
        isInt: {
          options: { min: 1 },
          errorMessage: 'Page must be an integer greater than 0'
        },
        toInt: true
      },
      limit: {
        optional: true,
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage: 'Limit must be an integer between 1 and 100'
        },
        toInt: true
      }
    },
    ['query']
  )
)

export const updateUserValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw Error(USERS_MESSAGES.USERNAME_INVALID)
            }

            const user = await databaseService.users.findOne({ username: value })
            if (user) {
              if (req.params && user._id.toString() !== req.params.user_id) {
                throw new Error(USERS_MESSAGES.USERNAME_EXISTED)
              }
            }
          }
        }
      },
      avatar: imageSchema,
      address: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.ADDRESS_MUST_BE_STRING
        },

        isLength: {
          options: {
            min: 5,
            max: 200
          },
          errorMessage: USERS_MESSAGES.ADDRESS_LENGTH
        }
      },
      role: {
        optional: true,
        isNumeric: {
          errorMessage: USERS_MESSAGES.ROLE_MUST_BE_A_NUMBER
        },
        custom: {
          options: (value) => {
            if (!Object.values(UserRoles).includes(Number(value))) {
              throw Error(`Role must be one of: ${Object.values(UserRoles).join(', ')}`)
            }
            return true
          }
        },
        toInt: true
      },
      verify: {
        optional: true,
        isNumeric: {
          errorMessage: USERS_MESSAGES.VERIFY_MUST_BE_A_NUMBER
        },
        custom: {
          options: (value) => {
            if (!Object.values(UserVerifyStatus).includes(Number(value))) {
              throw Error(`Verify status must be one of: ${Object.values(UserVerifyStatus).join(', ')}`)
            }
            return true
          }
        },
        toInt: true
      },
      phone: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.PHONE_MUST_BE_A_STRING
        },
        trim: true,
        isNumeric: {
          errorMessage: USERS_MESSAGES.PHONE_MUST_CONTAIN_ONLY_DIGITS
        },
        isLength: {
          options: {
            min: 10,
            max: 11
          },
          errorMessage: USERS_MESSAGES.PHONE_LENGTH
        }
      }
    },
    ['body']
  )
)

export const userIdValidator = validate(
  checkSchema(
    {
      user_id: userIdSchema
    },
    ['params']
  )
)
