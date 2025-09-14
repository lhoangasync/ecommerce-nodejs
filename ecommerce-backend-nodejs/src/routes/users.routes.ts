import { Router } from 'express'
import {
  deleteUserController,
  getMeController,
  getUsersController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  updateUserController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  checkRoleValidator,
  loginValidator,
  paginateValidator,
  refreshTokenCookieValidator,
  registerValidator,
  updateUserValidator,
  userIdValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

usersRouter.post('/logout', accessTokenValidator, refreshTokenCookieValidator, wrapRequestHandler(logoutController))

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
