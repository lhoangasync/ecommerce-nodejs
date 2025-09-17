import { Router } from 'express'
import {
  deleteUserController,
  getMeController,
  getUsersController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerificationEmailController,
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
  verifiedUserValidator
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
