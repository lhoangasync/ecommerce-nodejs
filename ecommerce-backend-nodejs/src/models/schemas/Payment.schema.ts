import { ObjectId } from 'mongodb'

export interface IPaymentMetadata {
  // Momo specific
  partnerCode?: string
  orderId?: string
  requestId?: string

  // VNPay specific
  vnp_TxnRef?: string
  vnp_TransactionNo?: string
  vnp_BankCode?: string
  vnp_CardType?: string

  // Common
  payUrl?: string // URL thanh toán (cho momo/vnpay)
  qrCodeUrl?: string // QR code (nếu có)
  deeplink?: string // Deeplink cho mobile app
}

export interface IPayment {
  _id?: ObjectId
  order_id: ObjectId
  order_code: string // Lưu order code để dễ tra cứu
  user_id: ObjectId

  // Payment info
  payment_method: 'cod' | 'momo' | 'vnpay' | 'bank_transfer'
  amount: number
  currency?: string // VND, USD,...

  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'

  // Transaction details
  transaction_id?: string // ID từ payment gateway
  payment_gateway_response?: any // Raw response từ gateway
  metadata?: IPaymentMetadata // Thông tin bổ sung

  // Error handling
  error_code?: string
  error_message?: string

  // Timestamps
  initiated_at?: Date // Thời điểm khởi tạo
  completed_at?: Date // Thời điểm hoàn thành
  failed_at?: Date // Thời điểm thất bại
  expired_at?: Date // Thời điểm hết hạn (cho pending payments)

  created_at?: Date
  updated_at?: Date
}

export class Payment {
  _id: ObjectId
  order_id: ObjectId
  order_code: string
  user_id: ObjectId

  payment_method: 'cod' | 'momo' | 'vnpay' | 'bank_transfer'
  amount: number
  currency: string

  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'

  transaction_id?: string
  payment_gateway_response?: any
  metadata?: IPaymentMetadata

  error_code?: string
  error_message?: string

  initiated_at?: Date
  completed_at?: Date
  failed_at?: Date
  expired_at?: Date

  created_at: Date
  updated_at: Date

  constructor(payment: IPayment) {
    const date = new Date()
    this._id = payment._id || new ObjectId()
    this.order_id = payment.order_id
    this.order_code = payment.order_code
    this.user_id = payment.user_id

    this.payment_method = payment.payment_method
    this.amount = payment.amount
    this.currency = payment.currency || 'VND'

    this.status = payment.status || 'pending'

    this.transaction_id = payment.transaction_id
    this.payment_gateway_response = payment.payment_gateway_response
    this.metadata = payment.metadata

    this.error_code = payment.error_code
    this.error_message = payment.error_message

    this.initiated_at = payment.initiated_at || date
    this.completed_at = payment.completed_at
    this.failed_at = payment.failed_at
    this.expired_at = payment.expired_at

    this.created_at = payment.created_at || date
    this.updated_at = payment.updated_at || date
  }

  // Helper methods
  isPending(): boolean {
    return this.status === 'pending' || this.status === 'processing'
  }

  isCompleted(): boolean {
    return this.status === 'completed'
  }

  isFailed(): boolean {
    return this.status === 'failed' || this.status === 'cancelled'
  }

  isExpired(): boolean {
    if (!this.expired_at) return false
    return new Date() > this.expired_at
  }

  canRetry(): boolean {
    return this.isFailed() && this.payment_method !== 'cod'
  }

  // State transitions
  markAsProcessing(): void {
    if (this.status === 'pending') {
      this.status = 'processing'
      this.updated_at = new Date()
    }
  }

  markAsCompleted(transactionId?: string): void {
    if (this.isPending()) {
      this.status = 'completed'
      this.completed_at = new Date()
      this.updated_at = new Date()
      if (transactionId) {
        this.transaction_id = transactionId
      }
    }
  }

  markAsFailed(errorCode?: string, errorMessage?: string): void {
    if (this.isPending()) {
      this.status = 'failed'
      this.failed_at = new Date()
      this.updated_at = new Date()
      this.error_code = errorCode
      this.error_message = errorMessage
    }
  }

  cancel(): void {
    if (this.isPending()) {
      this.status = 'cancelled'
      this.updated_at = new Date()
    }
  }

  refund(): void {
    if (this.status === 'completed') {
      this.status = 'refunded'
      this.updated_at = new Date()
    }
  }

  // Set expiration (thường là 15 phút cho online payment)
  setExpiration(minutes: number = 15): void {
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + minutes)
    this.expired_at = expiry
  }

  // Update gateway response
  updateGatewayResponse(response: any): void {
    this.payment_gateway_response = response
    this.updated_at = new Date()
  }

  // Update metadata
  updateMetadata(metadata: Partial<IPaymentMetadata>): void {
    this.metadata = { ...this.metadata, ...metadata }
    this.updated_at = new Date()
  }
}
