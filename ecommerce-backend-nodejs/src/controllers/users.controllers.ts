import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { access } from 'fs'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import {
  DeleteUserReqParams,
  LoginReqBody,
  RegisterReqBody,
  TokenPayload,
  UpdateUserReqBody,
  UpdateUserReqParams,
  VerifyEmailReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/user.services'
import { clearRefreshCookie, setRefreshCookie } from '~/utils/cookie'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)
  return res.json({
    status: HTTP_STATUS.CREATED,
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    data: result
  })
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify, role: user.role })

  setRefreshCookie(res, result.refresh_token)
  return res.json({
    status: HTTP_STATUS.OK,
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    data: { access_token: result.access_token }
  })
}

export const logoutController = async (req: Request, res: Response) => {
  const refresh_token = req.cookies?.refresh_token as string
  const result = await usersService.logout(refresh_token)

  // clear cookies
  clearRefreshCookie(res)
  return res.json({
    status: HTTP_STATUS.OK,
    message: USERS_MESSAGES.LOGOUT_SUCCESS,
    data: null
  })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  if (user.email_verify_token == '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const result = await usersService.verifyEmail(user_id, user.role)
  return res.json({
    status: HTTP_STATUS.OK,
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    data: result
  })
}

export const refreshTokenController = async (req: Request, res: Response) => {
  const payload = req.decoded_refresh_token as TokenPayload
  const result = await usersService.refreshToken(payload)
  return res.json({
    status: HTTP_STATUS.OK,
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    data: result
  })
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await usersService.getMe(user_id)
  return res.json({
    status: HTTP_STATUS.OK,
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    data: user
  })
}

export const getUsersController = async (req: Request, res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const users = await usersService.getUsers({ page, limit })
  return res.json({
    status: HTTP_STATUS.OK,
    message: USERS_MESSAGES.GET_ALL_USER_SUCCESS,
    data: {
      items: users.items,
      meta: {
        page,
        limit,
        totalItems: users.totalItems,
        totalPages: users.totalPages
      }
    }
  })
}

export const updateUserController = async (
  req: Request<UpdateUserReqParams, any, UpdateUserReqBody>,
  res: Response
) => {
  const { user_id } = req.params
  const payload = req.body
  console.log('>>backend req bod: ', payload)
  const updatedUser = await usersService.updateUser(user_id, payload)

  return res.json({
    status: HTTP_STATUS.OK,
    message: USERS_MESSAGES.UPDATE_USER_SUCCESS,
    data: updatedUser
  })
}

export const deleteUserController = async (req: Request<DeleteUserReqParams>, res: Response) => {
  const { user_id } = req.params
  const result = await usersService.deleteUser(user_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: result.message,
    data: null
  })
}
