import { Router } from 'express'
import usersRouter from './users.routes'
import brandsRouter from './brand.routes'
import categoriesRouter from './category.routes'

const apiRouter = Router()

apiRouter.use('/users', usersRouter)
apiRouter.use('/brands', brandsRouter)
apiRouter.use('/categories', categoriesRouter)

export default apiRouter
