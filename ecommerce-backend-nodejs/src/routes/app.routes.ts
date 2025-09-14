import { Router } from 'express'
import usersRouter from './users.routes'

const apiRouter = Router()

apiRouter.use('/users', usersRouter)

export default apiRouter
