import { Router } from 'express'
import usersRouter from './users.routes'
import brandsRouter from './brand.routes'
import categoriesRouter from './category.routes'
import productsRouter from './product.routes'
import cartsRouter from './cart.routes'
import ordersRouter from './order.routes'
import paymentsRouter from './payment.routes'

const apiRouter = Router()

apiRouter.use('/users', usersRouter)
apiRouter.use('/brands', brandsRouter)
apiRouter.use('/categories', categoriesRouter)
apiRouter.use('/products', productsRouter)
apiRouter.use('/carts', cartsRouter)
apiRouter.use('/orders', ordersRouter)
apiRouter.use('/payments', paymentsRouter)

export default apiRouter
