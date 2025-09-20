import { config } from 'dotenv'
import databaseService from './database.services'
import { TokenType, UserRoles, UserVerifyStatus } from '~/constants/enums'
import { signToken } from '~/utils/jwt'
import { ObjectId } from 'mongodb'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { RegisterReqBody, TokenPayload, UpdateUserReqBody } from '~/models/requests/User.requests'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import emailService from './email.services'

config()

class UsersService {
  private async signAccessToken({
    user_id,
    verify,
    role
  }: {
    user_id: string
    verify: UserVerifyStatus
    role: UserRoles
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ACCESSTOKEN,
        verify,
        role
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
      }
    })
  }

  private async signRefreshToken({
    user_id,
    verify,
    role
  }: {
    user_id: string
    verify: UserVerifyStatus
    role: UserRoles
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.REFRESHTOKEN,
        verify,
        role
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN)
      }
    })
  }

  private signEmailVerifyToken({
    user_id,
    verify,
    role
  }: {
    user_id: string
    verify: UserVerifyStatus
    role: UserRoles
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EMAILVERIFYTOKEN,
        verify,
        role
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: Number(process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN)
      }
    })
  }

  private signForgotPasswordToken({
    user_id,
    verify,
    role
  }: {
    user_id: string
    verify: UserVerifyStatus
    role: UserRoles
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.FORGOTPASSWORDTOKEN,
        verify,
        role
      },
      privateKey: process.env.JWT_SECRECT_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: Number(process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN)
      }
    })
  }

  private signAccessAndRefreshToken({
    user_id,
    verify,
    role
  }: {
    user_id: string
    verify: UserVerifyStatus
    role: UserRoles
  }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify, role }),
      this.signRefreshToken({ user_id, verify, role })
    ])
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
  async forgotPassword(email: string) {
    const user = await databaseService.users.findOne({ email })

    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const forgot_password_token = await this.signForgotPasswordToken({
      user_id: user._id.toString(),
      verify: user.verify,
      role: user.role
    })

    await databaseService.users.updateOne(
      { _id: user._id },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    try {
      await emailService.sendForgotPasswordEmail(email, forgot_password_token, user.name)
      return {
        message: 'Password reset email sent successfully'
      }
    } catch (error) {
      console.error('Failed to send forgot password email:', error)
      throw new ErrorWithStatus({
        message: 'Failed to send password reset email',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
  }

  async resetPassword(user_id: string, new_password: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (user.forgot_password_token === '') {
      throw new ErrorWithStatus({
        message: 'Invalid or expired reset token',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(new_password),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    // Invalidate all refresh tokens for security
    await databaseService.refreshTokens.deleteMany({ user_id: new ObjectId(user_id) })

    try {
      await emailService.sendPasswordResetSuccessEmail(user.email, user.name)
      console.log('Password reset success email sent to:', user.email)
    } catch (error) {
      console.error('Failed to send password reset success email:', error)
      // Continue even if email fails
    }

    return {
      message: 'Password reset successfully'
    }
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.UNVERIFIED,
      role: UserRoles.USER
    })

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user${user_id.toString()}`,
        email_verify_token,
        password: hashPassword(payload.password),
        role: UserRoles.USER
      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.UNVERIFIED,
      role: UserRoles.USER
    })

    await databaseService.refreshTokens.insertOne(new RefreshToken({ user_id, token: refresh_token }))
    try {
      await emailService.sendVerificationEmail(payload.email, email_verify_token)
      console.log('Verification email sent successfully to:', payload.email)
    } catch (error) {
      console.error('Failed to send verification email:', error)
    }

    return {
      access_token,
      refresh_token
    }
  }

  async login({ user_id, verify, role }: { user_id: string; verify: UserVerifyStatus; role: UserRoles }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify,
      role
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(user_id: string, role: UserRoles) {
    // Get user info before verification
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.VERIFIED, role }),
      databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        [
          {
            $set: {
              email_verify_token: '',
              verify: UserVerifyStatus.VERIFIED,
              updated_at: '$$NOW'
            }
          }
        ]
      )
    ])

    const [access_token, refresh_token] = token
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    // Send welcome email after successful verification
    if (user) {
      try {
        await emailService.sendWelcomeEmail(user.email, user.name)
        console.log('Welcome email sent successfully to:', user.email)
      } catch (error) {
        console.error('Failed to send welcome email:', error)
        // Continue with verification even if welcome email fails
      }
    }

    return { access_token, refresh_token }
  }
  async refreshToken(decoded_refresh_token: TokenPayload) {
    const { user_id, verify, role } = decoded_refresh_token

    const access_token = await this.signAccessToken({ user_id, verify, role })
    return {
      access_token,
      message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async getUsers({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit

    const result = await databaseService.users
      .aggregate([
        {
          $project: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0
          }
        },
        {
          $sort: { created_at: -1 }
        },
        {
          $facet: {
            items: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }]
          }
        }
      ])
      .toArray()

    const items = result[0]?.items || []
    const totalItems = result[0]?.totalCount[0]?.count || 0

    const totalPages = Math.ceil(totalItems / limit)

    return {
      items,
      totalItems,
      totalPages
    }
  }

  async updateUser(user_id: string, payload: UpdateUserReqBody) {
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...payload
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user as User
  }

  async deleteUser(user_id: string) {
    const deletedUser = await databaseService.users.findOneAndDelete({
      _id: new ObjectId(user_id)
    })

    if (!deletedUser) {
      return {
        message: USERS_MESSAGES.USER_NOT_FOUND
      }
    }

    return {
      message: USERS_MESSAGES.DELETE_USER_SUCCESS
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await databaseService.users.findOne({ email })

    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (user.verify === UserVerifyStatus.VERIFIED) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user._id.toString(),
      verify: user.verify,
      role: user.role
    })

    await databaseService.users.updateOne(
      { _id: user._id },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    try {
      await emailService.sendVerificationEmail(email, email_verify_token)
      return {
        message: 'Verification email sent successfully'
      }
    } catch (error) {
      console.error('Failed to resend verification email:', error)
      throw new ErrorWithStatus({
        message: 'Failed to send verification email',
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      })
    }
  }
}

const usersService = new UsersService()
export default usersService
