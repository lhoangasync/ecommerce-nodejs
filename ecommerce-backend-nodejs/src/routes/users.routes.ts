import { Router } from 'express'
import {
  deleteUserController,
  forgotPasswordController,
  getMeController,
  getUsersController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerificationEmailController,
  resetPasswordController,
  updateUserController,
  verifyEmailController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  checkRoleValidator,
  emailVerifyTokenValidator,
  loginValidator,
  paginateValidator,
  refreshTokenCookieValidator,
  registerValidator,
  resendVerificationEmailValidator,
  updateUserValidator,
  userIdValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenMiddleware
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

usersRouter.post('/logout', accessTokenValidator, refreshTokenCookieValidator, wrapRequestHandler(logoutController))

usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post(
  '/resend-verification-email',
  resendVerificationEmailValidator,
  wrapRequestHandler(resendVerificationEmailController)
)
usersRouter.get('/refresh-token', refreshTokenCookieValidator, wrapRequestHandler(refreshTokenController))

usersRouter.post('/forgot-password', forgotPasswordController)

usersRouter.post('/reset-password', verifyForgotPasswordTokenMiddleware, resetPasswordController)

usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

usersRouter.get(
  '/get-all-user',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  paginateValidator,
  wrapRequestHandler(getUsersController)
)

usersRouter.patch(
  '/update/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  userIdValidator,
  updateUserValidator,
  wrapRequestHandler(updateUserController)
)

usersRouter.delete(
  '/delete/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  userIdValidator,
  wrapRequestHandler(deleteUserController)
)

export default usersRouter
