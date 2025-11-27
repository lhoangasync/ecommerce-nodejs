import { Router } from 'express'
import usersRouter from './users.routes'
import brandsRouter from './brand.routes'
import categoriesRouter from './category.routes'
import productsRouter from './product.routes'
import cartsRouter from './cart.routes'
import ordersRouter from './order.routes'
import paymentsRouter from './payment.routes'
import reviewsRouter from './review.routes'
import autoCouponRouter from './autoCoupon.routes'
import { chat } from 'googleapis/build/src/apis/chat'
import chatbotRouter from './chatbot.routes'
import uploadRouter from './upload.routes'

const apiRouter = Router()

apiRouter.use('/users', usersRouter)
apiRouter.use('/brands', brandsRouter)
apiRouter.use('/categories', categoriesRouter)
apiRouter.use('/products', productsRouter)
apiRouter.use('/carts', cartsRouter)
apiRouter.use('/orders', ordersRouter)
apiRouter.use('/payments', paymentsRouter)
apiRouter.use('/reviews', reviewsRouter)
apiRouter.use('/auto-coupons', autoCouponRouter)
apiRouter.use('/chatbot', chatbotRouter)
apiRouter.use('/upload', uploadRouter)
export default apiRouter
