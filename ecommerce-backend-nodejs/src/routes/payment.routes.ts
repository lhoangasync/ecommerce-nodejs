import { Router } from 'express'
import {
  createPaymentController,
  momoCallbackController,
  vnpayReturnController,
  vnpayCallbackController, // NEW
  verifyPaymentController,
  getPaymentByOrderController,
  refundPaymentController,
  getAllPaymentsController,
  momoReturnController,
  momoCallbackProcessController
} from '~/controllers/payments.controllers'
import {
  createPaymentValidator,
  paymentIdValidator,
  orderIdParamValidator,
  refundPaymentValidator,
  getPaymentsQueryValidator
} from '~/middlewares/payments.middlewares'
import { accessTokenValidator, checkRoleValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const paymentRouter = Router()

// ========== PUBLIC ROUTES (Payment Gateway Callbacks) ==========

/**
 * MoMo IPN Callback - từ MoMo server
 */
paymentRouter.post('/momo/callback', wrapRequestHandler(momoCallbackController))

/**
 * MoMo Return URL - redirect từ MoMo về frontend
 */
paymentRouter.get('/momo/return', wrapRequestHandler(momoReturnController))

/**
 * MoMo Callback Processing - frontend gọi để xử lý payment
 */
paymentRouter.get('/momo/callback', wrapRequestHandler(momoCallbackProcessController))

/**
 * Description: VNPay Return URL (Redirect to frontend)
 * Path: /payments/vnpay/return
 * Method: GET
 * Query: VNPay return params
 * Note: Redirect from VNPay, no authentication required
 */
paymentRouter.get('/vnpay/return', wrapRequestHandler(vnpayReturnController))

/**
 * Description: VNPay Callback Processing
 * Path: /payments/vnpay/callback
 * Method: GET
 * Query: VNPay return params
 * Note: Called by frontend after redirect to process payment
 */
paymentRouter.get('/vnpay/callback', wrapRequestHandler(vnpayCallbackController))

// ========== USER ROUTES ==========

/**
 * Description: Create payment
 * Path: /payments
 * Method: POST
 * Body: { order_id: string, payment_method: string, return_url?: string, cancel_url?: string, language?: string }
 * Header: { Authorization: Bearer <access_token> }
 */
paymentRouter.post('/', accessTokenValidator, createPaymentValidator, wrapRequestHandler(createPaymentController))

/**
 * Description: Get payment by order
 * Path: /payments/order/:order_id
 * Method: GET
 * Params: { order_id: string }
 * Header: { Authorization: Bearer <access_token> }
 */
paymentRouter.get(
  '/order/:order_id',
  accessTokenValidator,
  orderIdParamValidator,
  wrapRequestHandler(getPaymentByOrderController)
)

/**
 * Description: Verify payment status
 * Path: /payments/:payment_id/verify
 * Method: GET
 * Params: { payment_id: string }
 * Header: { Authorization: Bearer <access_token> }
 */
paymentRouter.get(
  '/:payment_id/verify',
  accessTokenValidator,
  paymentIdValidator,
  wrapRequestHandler(verifyPaymentController)
)

// ========== ADMIN ROUTES ==========

/**
 * Description: Get all payments (Admin)
 * Path: /payments/admin
 * Method: GET
 * Query: { page?, limit?, order_id?, status?, payment_method?, from_date?, to_date? }
 * Header: { Authorization: Bearer <access_token> }
 */
paymentRouter.get(
  '/admin',
  accessTokenValidator,
  checkRoleValidator,
  getPaymentsQueryValidator,
  wrapRequestHandler(getAllPaymentsController)
)

/**
 * Description: Refund payment (Admin)
 * Path: /payments/:payment_id/refund
 * Method: POST
 * Params: { payment_id: string }
 * Body: { amount?: number, reason?: string }
 * Header: { Authorization: Bearer <access_token> }
 */
paymentRouter.post(
  '/:payment_id/refund',
  accessTokenValidator,
  checkRoleValidator,
  refundPaymentValidator,
  wrapRequestHandler(refundPaymentController)
)

export default paymentRouter
