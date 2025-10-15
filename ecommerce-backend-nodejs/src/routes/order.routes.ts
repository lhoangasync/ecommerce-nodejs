import { Router } from 'express'
import {
  createOrderController,
  getOrderByIdController,
  getMyOrdersController,
  getAllOrdersController,
  updateOrderStatusController,
  cancelOrderController,
  getOrderStatisticsController
} from '~/controllers/orders.controllers'
import {
  createOrderValidator,
  orderIdValidator,
  updateOrderStatusValidator,
  cancelOrderValidator,
  getOrdersQueryValidator
} from '~/middlewares/orders.middlewares'
import { accessTokenValidator, checkRoleValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const orderRouter = Router()
// ========== ADMIN ROUTES ==========

/**
 * Description: Get all orders (Admin)
 * Path: /orders/admin
 * Method: GET
 * Query: GetOrdersReqQuery
 * Header: { Authorization: Bearer <access_token> }
 */
orderRouter.get(
  '/admin',
  accessTokenValidator,
  checkRoleValidator,
  getOrdersQueryValidator,
  wrapRequestHandler(getAllOrdersController)
)

/**
 * Description: Update order status (Admin)
 * Path: /orders/:order_id/status
 * Method: PATCH
 * Params: { order_id: string }
 * Body: { status: string, cancellation_reason?: string, tracking_number?: string }
 * Header: { Authorization: Bearer <access_token> }
 */
orderRouter.patch(
  '/:order_id/status',
  accessTokenValidator,
  checkRoleValidator,
  updateOrderStatusValidator,
  wrapRequestHandler(updateOrderStatusController)
)

// ========== USER ROUTES ==========

/**
 * Description: Create new order from cart
 * Path: /orders
 * Method: POST
 * Body: CreateOrderReqBody
 * Header: { Authorization: Bearer <access_token> }
 */
orderRouter.post('/', accessTokenValidator, createOrderValidator, wrapRequestHandler(createOrderController))

/**
 * Description: Get my orders
 * Path: /orders/me
 * Method: GET
 * Query: GetOrdersReqQuery
 * Header: { Authorization: Bearer <access_token> }
 */
orderRouter.get('/me', accessTokenValidator, getOrdersQueryValidator, wrapRequestHandler(getMyOrdersController))

/**
 * Description: Get order statistics
 * Path: /orders/statistics
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
orderRouter.get('/statistics', accessTokenValidator, wrapRequestHandler(getOrderStatisticsController))

/**
 * Description: Get order by ID
 * Path: /orders/:order_id
 * Method: GET
 * Params: { order_id: string }
 * Header: { Authorization: Bearer <access_token> }
 */
orderRouter.get('/:order_id', accessTokenValidator, orderIdValidator, wrapRequestHandler(getOrderByIdController))

/**
 * Description: Cancel order (User)
 * Path: /orders/:order_id/cancel
 * Method: POST
 * Params: { order_id: string }
 * Body: { reason: string }
 * Header: { Authorization: Bearer <access_token> }
 */
orderRouter.post(
  '/:order_id/cancel',
  accessTokenValidator,
  cancelOrderValidator,
  wrapRequestHandler(cancelOrderController)
)

export default orderRouter
