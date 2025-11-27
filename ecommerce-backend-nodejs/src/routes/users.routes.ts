import { Router } from 'express'
import {
  deleteUserController,
  facebookOAuthController,
  forgotPasswordController,
  getGoogleAuthURLController,
  getMeController,
  getUsersController,
  googleOAuthController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerificationEmailController,
  resetPasswordController,
  updateMeController,
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
usersRouter.get('/auth/google', getGoogleAuthURLController)
usersRouter.post('/google/callback', googleOAuthController)
usersRouter.post('/auth/facebook', facebookOAuthController)
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

usersRouter.patch(
  '/update-me',
  accessTokenValidator,
  verifiedUserValidator,
  updateUserValidator,
  wrapRequestHandler(updateMeController)
)


export default usersRouter
