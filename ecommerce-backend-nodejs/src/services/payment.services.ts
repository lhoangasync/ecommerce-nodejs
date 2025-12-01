import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import axios from 'axios'
import databaseService from './database.services'
import orderService from './order.services'
import { Payment, IPayment } from '~/models/schemas/Payment.schema'
import { PAYMENT_MESSAGES } from '~/constants/messages'
class PaymentService {
  /**
   * Tạo payment record và URL thanh toán
   */
  async createPayment(
    userId: string,
    orderId: string,
    paymentMethod: 'momo' | 'vnpay' | 'bank_transfer',
    options?: {
      return_url?: string
      cancel_url?: string
      language?: 'vi' | 'en'
    }
  ) {
    const paymentsCollection = databaseService.payments

    // Lấy thông tin order
    const order = await orderService.getOrderById(orderId, userId)
    if (!order) {
      throw new Error('Order not found')
    }

    // Kiểm tra order đã có payment chưa
    const existingPayment = await paymentsCollection.findOne({
      order_id: new ObjectId(orderId),
      status: { $in: ['pending', 'processing', 'completed'] }
    })

    if (existingPayment) {
      if (existingPayment.status === 'completed') {
        throw new Error(PAYMENT_MESSAGES.PAYMENT_ALREADY_COMPLETED)
      }
      if (existingPayment.status === 'pending' && !existingPayment.isExpired()) {
        // Trả về payment cũ nếu chưa expired
        return this.getPaymentUrl(existingPayment)
      }
    }

    // Tạo payment record
    const paymentPayload: IPayment = {
      order_id: new ObjectId(orderId),
      order_code: order.order_code,
      user_id: new ObjectId(userId),
      payment_method: paymentMethod,
      amount: order.total_amount,
      currency: 'VND',
      status: 'pending'
    }

    const payment = new Payment(paymentPayload)
    payment.setExpiration(15) // 15 phút

    // Lưu payment vào DB
    const result = await paymentsCollection.insertOne(payment)
    payment._id = result.insertedId

    // Tạo payment URL theo method
    let paymentUrl = ''
    let metadata: any = {}

    switch (paymentMethod) {
      case 'momo':
        const momoResult = await this.createMomoPayment(payment, options)
        paymentUrl = momoResult.payUrl
        metadata = momoResult.metadata
        break

      case 'vnpay':
        const vnpayResult = await this.createVnpayPayment(payment, options)
        paymentUrl = vnpayResult.payUrl
        metadata = vnpayResult.metadata
        break

      case 'bank_transfer':
        // Bank transfer không cần redirect URL
        paymentUrl = ''
        metadata = {
          bank_name: 'Vietcombank',
          account_number: '1234567890',
          account_name: 'CONG TY ABC',
          transfer_content: `Thanh toan don hang ${order.order_code}`
        }
        break
    }

    // Update payment với metadata
    payment.updateMetadata(metadata)
    await paymentsCollection.updateOne({ _id: payment._id }, { $set: { metadata: payment.metadata } })

    return {
      payment_id: payment._id.toString(),
      payment_url: paymentUrl,
      qr_code_url: metadata.qrCodeUrl,
      deeplink: metadata.deeplink,
      expires_at: payment.expired_at?.toISOString()
    }
  }
  /**
   * Tạo MoMo payment - FIXED VERSION
   */
  private async createMomoPayment(payment: Payment, options?: any) {
    const accessKey = process.env.MOMO_ACCESS_KEY!
    const secretKey = process.env.MOMO_SECRET_KEY!
    const partnerCode = process.env.MOMO_PARTNER_CODE!

    // IMPORTANT: IPN URL must be your BACKEND URL, not CLIENT_URL
    const ipnUrl = `${process.env.BACKEND_URL}/api/payments/momo/callback`
    const redirectUrl = options?.return_url || `${process.env.CLIENT_URL}/payment/momo-return`

    const orderId = payment.order_code
    const requestId = `${orderId}_${Date.now()}`
    const amount = payment.amount.toString()
    const orderInfo = `Thanh toan don hang ${orderId}`
    const requestType = 'captureWallet'
    const extraData = payment._id.toString()

    // Tạo signature theo đúng thứ tự của MoMo
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`

    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')

    // Call MoMo API
    const requestBody = {
      partnerCode,
      partnerName: 'Test Shop',
      storeId: 'MomoTestStore',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: options?.language || 'vi',
      requestType,
      extraData,
      signature,
      autoCapture: true,
      orderExpireTime: 15 // 15 minutes
    }


    try {
      const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })


      const { resultCode, payUrl, qrCodeUrl, deeplink, message } = response.data

      if (resultCode !== 0) {
        throw new Error(`MoMo error [${resultCode}]: ${message}`)
      }

      return {
        payUrl,
        metadata: {
          partnerCode,
          orderId,
          requestId,
          qrCodeUrl,
          deeplink,
          payUrl
        }
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(`MoMo API error: ${JSON.stringify(error.response.data)}`)
      }
      throw new Error(`Failed to create MoMo payment: ${error.message}`)
    }
  }
  /**
   * Tạo VNPay payment
   */
  private async createVnpayPayment(payment: Payment, options?: any) {
    const tmnCode = process.env.VNPAY_TMN_CODE!
    const secretKey = process.env.VNPAY_HASH_SECRET!
    const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
    const returnUrl = options?.return_url || process.env.VNPAY_RETURN_URL!

    const createDate = this.formatDateTime(new Date())
    const orderId = payment.order_code
    const amount = payment.amount * 100 // VNPay yêu cầu nhân 100
    const orderInfo = `Thanh toan don hang ${orderId}`
    const orderType = 'other'
    const locale = options?.language === 'en' ? 'en' : 'vn'
    const currCode = 'VND'

    // Tạo vnp_Params
    const vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Amount: amount,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate
    }

    // Sort params
    const sortedParams = this.sortObject(vnpParams)

    // Tạo query string và signature
    const signData = new URLSearchParams(sortedParams).toString()
    const secureHash = crypto.createHmac('sha512', secretKey).update(signData).digest('hex')

    sortedParams.vnp_SecureHash = secureHash

    // Tạo payment URL
    const paymentUrl = `${vnpUrl}?${new URLSearchParams(sortedParams).toString()}`

    return {
      payUrl: paymentUrl,
      metadata: {
        vnp_TxnRef: orderId,
        payUrl: paymentUrl
      }
    }
  }

  /**
   * Xử lý MoMo IPN callback
   */
  async handleMomoCallback(callbackData: any) {
    const paymentsCollection = databaseService.payments

    const { orderId, requestId, resultCode, transId, message, signature, extraData } = callbackData

    // Verify signature
    const secretKey = process.env.MOMO_SECRET_KEY!
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${callbackData.amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${callbackData.orderInfo}&orderType=${callbackData.orderType}&partnerCode=${callbackData.partnerCode}&payType=${callbackData.payType}&requestId=${requestId}&responseTime=${callbackData.responseTime}&resultCode=${resultCode}&transId=${transId}`
    const validSignature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')

    if (signature !== validSignature) {
      throw new Error('Invalid MoMo signature')
    }

    // Tìm payment
    const payment = await paymentsCollection.findOne({
      order_code: orderId,
      'metadata.requestId': requestId
    })

    if (!payment) {
      throw new Error('Payment not found')
    }

    const paymentInstance = new Payment(payment)

    // Update payment status
    if (resultCode === 0) {
      // Success
      paymentInstance.markAsCompleted(transId.toString())
      await orderService.updatePaymentStatus(payment.order_id.toString(), 'paid')
    } else {
      // Failed
      paymentInstance.markAsFailed(resultCode.toString(), message)
      await orderService.updatePaymentStatus(payment.order_id.toString(), 'failed')
    }

    // Update gateway response
    paymentInstance.updateGatewayResponse(callbackData)

    // Save to DB
    await paymentsCollection.updateOne({ _id: payment._id }, { $set: paymentInstance })

    return paymentInstance
  }
  /**
   * Xử lý VNPay return
   */
  async handleVnpayReturn(queryParams: any) {
    const paymentsCollection = databaseService.payments

    const { vnp_SecureHash, ...restParams } = queryParams

    // Verify signature
    const secretKey = process.env.VNPAY_HASH_SECRET!

    // Sắp xếp tất cả params (trừ vnp_SecureHash)
    const sortedParams = this.sortObject(restParams)

    // Tạo sign data
    const signData = new URLSearchParams(sortedParams).toString()
    const validSignature = crypto.createHmac('sha512', secretKey).update(signData).digest('hex')

    if (vnp_SecureHash !== validSignature) {
      throw new Error('Invalid VNPay signature')
    }

    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo } = queryParams

    // Tìm payment
    const payment = await paymentsCollection.findOne({
      order_code: vnp_TxnRef
    })

    if (!payment) {
      throw new Error('Payment not found')
    }

    const paymentInstance = new Payment(payment)

    // Update payment status
    if (vnp_ResponseCode === '00') {
      // Success
      paymentInstance.markAsCompleted(vnp_TransactionNo)
      await orderService.updatePaymentStatus(payment.order_id.toString(), 'paid')
    } else {
      // Failed
      paymentInstance.markAsFailed(vnp_ResponseCode, 'Payment failed')
      await orderService.updatePaymentStatus(payment.order_id.toString(), 'failed')
    }

    // Update gateway response
    paymentInstance.updateGatewayResponse(queryParams)
    paymentInstance.updateMetadata({
      vnp_TransactionNo,
      vnp_BankCode: queryParams.vnp_BankCode,
      vnp_CardType: queryParams.vnp_CardType
    })

    // Save to DB
    await paymentsCollection.updateOne({ _id: payment._id }, { $set: paymentInstance })

    return paymentInstance
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentId: string) {
    const paymentsCollection = databaseService.payments

    const payment = await paymentsCollection.findOne({ _id: new ObjectId(paymentId) })

    if (!payment) {
      throw new Error('Payment not found')
    }

    return {
      payment_id: payment._id.toString(),
      order_id: payment.order_id.toString(),
      order_code: payment.order_code,
      status: payment.status,
      amount: payment.amount,
      payment_method: payment.payment_method,
      transaction_id: payment.transaction_id,
      created_at: payment.created_at.toISOString(),
      completed_at: payment.completed_at?.toISOString()
    }
  }

  /**
   * Get payment by order
   */
  async getPaymentByOrder(orderId: string) {
    const paymentsCollection = databaseService.payments

    const payment = await paymentsCollection.findOne({
      order_id: new ObjectId(orderId)
    })

    return payment
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    const paymentsCollection = databaseService.payments

    const payment = await paymentsCollection.findOne({ _id: new ObjectId(paymentId) })

    if (!payment) {
      throw new Error('Payment not found')
    }

    if (payment.status !== 'completed') {
      throw new Error('Can only refund completed payments')
    }

    const paymentInstance = new Payment(payment)

    // TODO: Call MoMo/VNPay refund API

    paymentInstance.refund()

    await paymentsCollection.updateOne({ _id: payment._id }, { $set: paymentInstance })

    // Update order payment status
    await orderService.updatePaymentStatus(payment.order_id.toString(), 'refunded')

    return paymentInstance
  }

  /**
   * Get payments with filters
   */
  async getPayments(query: any) {
    const paymentsCollection = databaseService.payments

    const page = parseInt(query.page || '1')
    const limit = parseInt(query.limit || '20')
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}

    if (query.order_id) {
      filter.order_id = new ObjectId(query.order_id)
    }

    if (query.status) {
      filter.status = query.status
    }

    if (query.payment_method) {
      filter.payment_method = query.payment_method
    }

    if (query.from_date || query.to_date) {
      filter.created_at = {}
      if (query.from_date) filter.created_at.$gte = new Date(query.from_date)
      if (query.to_date) filter.created_at.$lte = new Date(query.to_date)
    }

    const payments = await paymentsCollection.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).toArray()

    const total = await paymentsCollection.countDocuments(filter)

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  // ========== HELPER METHODS ==========

  private getPaymentUrl(payment: any) {
    return {
      payment_id: payment._id.toString(),
      payment_url: payment.metadata?.payUrl || '',
      qr_code_url: payment.metadata?.qrCodeUrl,
      deeplink: payment.metadata?.deeplink,
      expires_at: payment.expired_at?.toISOString()
    }
  }

  private formatDateTime(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}${month}${day}${hours}${minutes}${seconds}`
  }

  private sortObject(obj: any): any {
    const sorted: any = {}
    const keys = Object.keys(obj).sort()
    keys.forEach((key) => {
      sorted[key] = obj[key]
    })
    return sorted
  }
}

export default new PaymentService()
