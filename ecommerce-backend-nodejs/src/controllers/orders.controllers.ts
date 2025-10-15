import { Request, Response } from 'express'
import { ORDER_MESSAGES } from '~/constants/messages'
import orderService from '~/services/order.services'
import { TokenPayload } from '~/models/requests/User.requests'
import paymentService from '~/services/payment.services'

/**
 * Controller: Tạo đơn hàng mới
 * Route: POST /orders
 * Access: Private
 */
export const createOrderController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const orderData = req.body

  const order = await orderService.createOrder(user_id, orderData)

  let payment_url: string | undefined

  if (orderData.payment_method === 'momo' || orderData.payment_method === 'vnpay') {
    try {
      const paymentResult = await paymentService.createPayment(
        user_id,
        order._id.toString(),
        orderData.payment_method,
        {
          return_url: `${process.env.CLIENT_URL}/payment/result`,
          cancel_url: `${process.env.CLIENT_URL}/cart`,
          language: 'vi'
        }
      )
      payment_url = paymentResult.payment_url
    } catch (error: any) {
      console.error('Error creating payment:', error)
    }
  }

  return res.json({
    status: 201,
    message: ORDER_MESSAGES.ORDER_CREATED_SUCCESS,
    data: { order, payment_url }
  })
}

/**
 * Controller: Lấy chi tiết đơn hàng
 * Route: GET /orders/:order_id
 * Access: Private
 */
export const getOrderByIdController = async (req: Request, res: Response) => {
  const { order_id } = req.params
  const { user_id, role } = req.decoded_authorization as TokenPayload

  const userId = role === 0 ? user_id : undefined
  const order = await orderService.getOrderById(order_id, userId)

  return res.json({
    status: 200,
    message: 'Get order successfully',
    data: order
  })
}

/**
 * Controller: Lấy danh sách đơn hàng của user
 * Route: GET /orders/me
 * Access: Private
 */
export const getMyOrdersController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const query = req.query

  const result = await orderService.getOrdersByUser(user_id, query)

  return res.json({
    status: 200,
    message: 'Get orders successfully',
    data: result
  })
}

/**
 * Controller: Lấy tất cả đơn hàng (Admin)
 * Route: GET /orders
 * Access: Admin
 */
export const getAllOrdersController = async (req: Request, res: Response) => {
  const query = req.query
  const result = await orderService.getAllOrders(query)

  return res.json({
    status: 200,
    message: 'Get all orders successfully',
    data: result
  })
}

/**
 * Controller: Cập nhật trạng thái đơn hàng (Admin)
 * Route: PATCH /orders/:order_id/status
 * Access: Admin
 */
export const updateOrderStatusController = async (req: Request, res: Response) => {
  const { order_id } = req.params
  const { status, cancellation_reason, tracking_number } = req.body

  const result = await orderService.updateOrderStatus(order_id, status, {
    cancellation_reason,
    tracking_number
  })

  return res.json({
    status: 200,
    message: ORDER_MESSAGES.ORDER_STATUS_UPDATED,
    data: result
  })
}

/**
 * Controller: Hủy đơn hàng (User)
 * Route: POST /orders/:order_id/cancel
 * Access: Private
 */
export const cancelOrderController = async (req: Request, res: Response) => {
  const { order_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const { reason } = req.body

  const result = await orderService.cancelOrder(order_id, user_id, reason)

  return res.json({
    status: 200,
    message: 'Order cancelled successfully',
    data: result
  })
}

/**
 * Controller: Lấy thống kê đơn hàng
 * Route: GET /orders/statistics
 * Access: Admin hoặc User (user chỉ xem thống kê của mình)
 */
export const getOrderStatisticsController = async (req: Request, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const userId = role === 0 ? user_id : undefined

  const result = await orderService.getOrderStatistics(userId)

  return res.json({
    status: 200,
    message: 'Get order statistics successfully',
    data: result
  })
}
