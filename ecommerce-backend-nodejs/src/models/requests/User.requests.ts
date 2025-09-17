import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'
import { ParamsDictionary } from 'express-serve-static-core'

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  role: number
}

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface ResendVerificationEmailReqBody {
  email: string
}

export interface UpdateUserReqBody {
  name?: string
  username?: string
  role?: number
  verify?: number
  phone?: string
  address?: string
  avatar?: string
}

export interface UpdateUserReqParams extends ParamsDictionary {
  user_id: string
}

export interface DeleteUserReqParams extends ParamsDictionary {
  user_id: string
}

export interface ForgetPasswordReqBody {
  email: string
}

export interface ResetPasswordReqBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}
