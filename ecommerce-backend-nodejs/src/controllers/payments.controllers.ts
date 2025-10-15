import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { PAYMENT_MESSAGES } from '~/constants/messages'
import paymentService from '~/services/payment.services'
import { TokenPayload } from '~/models/requests/User.requests'

/**
 * Controller: Tạo payment
 * Route: POST /payments
 * Access: Private
 */
export const createPaymentController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { order_id, payment_method, return_url, cancel_url, language } = req.body

  const result = await paymentService.createPayment(user_id, order_id, payment_method, {
    return_url,
    cancel_url,
    language
  })

  return res.status(201).json({
    status: 201,
    message: PAYMENT_MESSAGES.PAYMENT_CREATED_SUCCESS,
    data: result
  })
}
/**
 * Controller: MoMo Return URL (User redirect)
 * Route: GET /payments/momo/return
 * Access: Public (redirect from MoMo)
 */
export const momoReturnController = async (req: Request, res: Response) => {
  const queryParams = req.query
  const clientUrl = process.env.CLIENT_URL

  // Chỉ redirect về frontend với params
  const queryString = new URLSearchParams(queryParams as any).toString()
  return res.redirect(`${clientUrl}/payment/momo-return?${queryString}`)
}

/**
 * Controller: MoMo Callback Processing (from frontend)
 * Route: GET /payments/momo/callback
 * Access: Public (called by frontend after redirect)
 */
export const momoCallbackProcessController = async (req: Request, res: Response) => {
  const queryParams = req.query

  try {
    // Convert query params to callback format
    const callbackData = {
      partnerCode: queryParams.partnerCode,
      orderId: queryParams.orderId,
      requestId: queryParams.requestId,
      amount: parseInt(queryParams.amount as string),
      orderInfo: queryParams.orderInfo,
      orderType: queryParams.orderType,
      transId: parseInt(queryParams.transId as string),
      resultCode: parseInt(queryParams.resultCode as string),
      message: queryParams.message,
      payType: queryParams.payType,
      responseTime: parseInt(queryParams.responseTime as string),
      extraData: queryParams.extraData,
      signature: queryParams.signature
    }

    const result = await paymentService.handleMomoCallback(callbackData)

    return res.status(200).json({
      status: 200,
      message: PAYMENT_MESSAGES.PAYMENT_VERIFIED_SUCCESS || 'Payment verified successfully',
      data: {
        order_id: result.order_id.toString(),
        order_code: result.order_code,
        payment_status: result.status,
        amount: result.amount,
        transaction_id: result.transaction_id,
        completed_at: result.completed_at
      }
    })
  } catch (error: any) {
    console.error('MoMo callback processing error:', error)
    return res.status(400).json({
      status: 400,
      message: error.message || 'Payment verification failed',
      data: null
    })
  }
}
/**
 * Controller: MoMo IPN Callback
 * Route: POST /payments/momo/callback
 * Access: Public (MoMo server)
 */
export const momoCallbackController = async (req: Request, res: Response) => {
  const callbackData = req.body

  try {
    const result = await paymentService.handleMomoCallback(callbackData)

    return res.status(200).json({
      status: 200,
      message: 'Success',
      data: {
        resultCode: 0
      }
    })
  } catch (error: any) {
    console.error('MoMo callback error:', error)
    return res.status(200).json({
      status: 200,
      message: error.message,
      data: {
        resultCode: 1
      }
    })
  }
}

/**
 * Controller: VNPay Return URL (Redirect only)
 * Route: GET /payments/vnpay/return
 * Access: Public (redirect from VNPay)
 */
export const vnpayReturnController = async (req: Request, res: Response) => {
  const queryParams = req.query
  const clientUrl = process.env.CLIENT_URL

  // Chỉ redirect, KHÔNG xử lý gì
  const queryString = new URLSearchParams(queryParams as any).toString()
  return res.redirect(`${clientUrl}/payment/vnpay-return?${queryString}`)
}

/**
 * Controller: VNPay Callback Processing
 * Route: GET /payments/vnpay/callback
 * Access: Public (called by frontend after redirect)
 */
export const vnpayCallbackController = async (req: Request, res: Response) => {
  const queryParams = req.query

  try {
    // Process the VNPay return data
    const result = await paymentService.handleVnpayReturn(queryParams)

    return res.status(200).json({
      status: 200,
      message: PAYMENT_MESSAGES.PAYMENT_VERIFIED_SUCCESS || 'Payment verified successfully',
      data: {
        order_id: result.order_id.toString(),
        order_code: result.order_code,
        payment_status: result.status,
        amount: result.amount,
        transaction_id: result.transaction_id,
        completed_at: result.completed_at
      }
    })
  } catch (error: any) {
    console.error('VNPay callback error:', error)
    return res.status(400).json({
      status: 400,
      message: error.message || 'Payment verification failed',
      data: null
    })
  }
}

/**
 * Controller: Verify payment status
 * Route: GET /payments/:payment_id/verify
 * Access: Private
 */
export const verifyPaymentController = async (req: Request, res: Response) => {
  const { payment_id } = req.params

  const result = await paymentService.verifyPayment(payment_id)

  return res.status(200).json({
    status: 200,
    message: 'Payment verified successfully',
    data: result
  })
}

/**
 * Controller: Get payment by order
 * Route: GET /payments/order/:order_id
 * Access: Private
 */
export const getPaymentByOrderController = async (req: Request, res: Response) => {
  const { order_id } = req.params

  const result = await paymentService.getPaymentByOrder(order_id)

  if (!result) {
    return res.status(404).json({
      status: 404,
      message: PAYMENT_MESSAGES.PAYMENT_NOT_FOUND,
      data: null
    })
  }

  return res.status(200).json({
    status: 200,
    message: 'Get payment successfully',
    data: result
  })
}

/**
 * Controller: Refund payment (Admin)
 * Route: POST /payments/:payment_id/refund
 * Access: Admin
 */
export const refundPaymentController = async (req: Request, res: Response) => {
  const { payment_id } = req.params
  const { amount, reason } = req.body

  const result = await paymentService.refundPayment(payment_id, amount, reason)

  return res.status(200).json({
    status: 200,
    message: PAYMENT_MESSAGES.REFUND_SUCCESS,
    data: result
  })
}

/**
 * Controller: Get all payments (Admin)
 * Route: GET /payments
 * Access: Admin
 */
export const getAllPaymentsController = async (req: Request, res: Response) => {
  const query = req.query

  const result = await paymentService.getPayments(query)

  return res.status(200).json({
    status: 200,
    message: 'Get payments successfully',
    data: result
  })
}
