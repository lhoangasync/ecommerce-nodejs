import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { ORDER_MESSAGES } from '~/constants/messages'
import { Order, IOrder, IOrderItem } from '~/models/schemas/Order.schema'
import { CreateOrderReqBody, GetOrdersReqQuery } from '~/models/requests/Order.requests'

class OrderService {
  /**
   * Tạo đơn hàng mới từ giỏ hàng
   */
  async createOrder(userId: string, orderData: CreateOrderReqBody) {
    const cartCollection = databaseService.carts
    const ordersCollection = databaseService.orders
    const productsCollection = databaseService.products

    // 1. Lấy giỏ hàng của user
    const userCart = await cartCollection.findOne({
      user_id: new ObjectId(userId)
    })

    if (!userCart || userCart.items.length === 0) {
      throw new Error(ORDER_MESSAGES.CART_EMPTY)
    }

    // 2. Xử lý từng item trong giỏ hàng
    const orderItems: IOrderItem[] = []
    let subtotal = 0

    for (const cartItem of userCart.items) {
      // Lấy thông tin product
      const product = await productsCollection.findOne({
        _id: new ObjectId(cartItem.product_id)
      })

      if (!product) {
        throw new Error(`Product ${cartItem.product_id} not found`)
      }

      // Tìm variant
      const variant = product.variants.find((v: any) => v.id === cartItem.variant_id)

      if (!variant) {
        throw new Error(`Variant ${cartItem.variant_id} not found in product ${product.name}`)
      }

      // Kiểm tra stock
      if (variant.stock_quantity < cartItem.quantity) {
        throw new Error(`Not enough stock for ${product.name}`)
      }

      // Tính toán giá
      const unitPrice = variant.price
      const originalPrice = variant.original_price || variant.price
      const itemSubtotal = unitPrice * cartItem.quantity

      // Tạo order item
      const orderItem: IOrderItem = {
        product_id: new ObjectId(cartItem.product_id),
        product_name: product.name,
        product_slug: product.slug,
        product_image: product.images?.[0],

        variant_id: cartItem.variant_id,
        variant_shade_color: variant.shade_color,
        variant_volume_size: variant.volume_size,
        variant_sku: variant.sku,
        variant_image: variant.images?.[0] || product.images?.[0],
        quantity: cartItem.quantity,
        unit_price: unitPrice,
        original_price: originalPrice,
        subtotal: itemSubtotal
      }

      orderItems.push(orderItem)
      subtotal += itemSubtotal
    }

    if (orderItems.length === 0) {
      throw new Error(ORDER_MESSAGES.CART_EMPTY)
    }

    // 3. Tính toán tổng tiền
    const shippingFee = orderData.shipping_fee || 30000 // Default 30k
    const discountAmount = 0 // TODO: Apply discount code logic
    const totalAmount = subtotal + shippingFee - discountAmount

    // 4. Tạo order
    const orderPayload: IOrder = {
      user_id: new ObjectId(userId),
      order_code: '', // Will be generated in constructor
      items: orderItems,

      subtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      total_amount: totalAmount,

      shipping_address: orderData.shipping_address,
      note: orderData.note,

      status: 'pending',

      payment_method: orderData.payment_method,
      payment_status: orderData.payment_method === 'cod' ? 'pending' : 'pending'
    }

    const order = new Order(orderPayload)

    // 5. Lưu order vào DB
    const result = await ordersCollection.insertOne(order)

    // 6. Giảm stock của các variants
    for (const item of orderItems) {
      await productsCollection.updateOne(
        {
          _id: item.product_id,
          'variants.id': item.variant_id
        },
        {
          $inc: {
            'variants.$.stock_quantity': -item.quantity
          }
        }
      )
    }

    // 7. Xóa giỏ hàng
    await cartCollection.updateOne({ user_id: new ObjectId(userId) }, { $set: { items: [] } })

    return { ...order, _id: result.insertedId }
  }

  /**
   * Lấy thông tin chi tiết đơn hàng
   */
  async getOrderById(orderId: string, userId?: string) {
    const ordersCollection = databaseService.orders

    const filter: any = { _id: new ObjectId(orderId) }
    if (userId) {
      filter.user_id = new ObjectId(userId)
    }

    const order = await ordersCollection.findOne(filter)

    if (!order) {
      throw new Error(ORDER_MESSAGES.ORDER_NOT_FOUND)
    }

    return order
  }

  /**
   * Lấy danh sách đơn hàng của user với filter và pagination
   */
  async getOrdersByUser(userId: string, query: GetOrdersReqQuery) {
    const ordersCollection = databaseService.orders

    const page = parseInt(query.page || '1')
    const limit = parseInt(query.limit || '10')
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = { user_id: new ObjectId(userId) }

    if (query.status) {
      filter.status = query.status
    }

    if (query.payment_status) {
      filter.payment_status = query.payment_status
    }

    if (query.payment_method) {
      filter.payment_method = query.payment_method
    }

    if (query.from_date || query.to_date) {
      filter.created_at = {}
      if (query.from_date) {
        filter.created_at.$gte = new Date(query.from_date)
      }
      if (query.to_date) {
        filter.created_at.$lte = new Date(query.to_date)
      }
    }

    if (query.search) {
      filter.$or = [
        { order_code: { $regex: query.search, $options: 'i' } },
        { 'shipping_address.phone_number': { $regex: query.search, $options: 'i' } }
      ]
    }

    // Build sort
    let sort: any = { created_at: -1 }
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.slice(1) : query.sort
      const sortOrder = query.sort.startsWith('-') ? -1 : 1
      sort = { [sortField]: sortOrder }
    }

    // Execute query
    const orders = await ordersCollection.find(filter).sort(sort).skip(skip).limit(limit).toArray()

    const total = await ordersCollection.countDocuments(filter)

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Lấy tất cả đơn hàng (Admin)
   */
  async getAllOrders(query: GetOrdersReqQuery) {
    const ordersCollection = databaseService.orders

    const page = parseInt(query.page || '1')
    const limit = parseInt(query.limit || '20')
    const skip = (page - 1) * limit

    // Build filter (same as getOrdersByUser but without user_id)
    const filter: any = {}

    if (query.status) filter.status = query.status
    if (query.payment_status) filter.payment_status = query.payment_status
    if (query.payment_method) filter.payment_method = query.payment_method

    if (query.from_date || query.to_date) {
      filter.created_at = {}
      if (query.from_date) filter.created_at.$gte = new Date(query.from_date)
      if (query.to_date) filter.created_at.$lte = new Date(query.to_date)
    }

    if (query.search) {
      filter.$or = [
        { order_code: { $regex: query.search, $options: 'i' } },
        { 'shipping_address.phone_number': { $regex: query.search, $options: 'i' } },
        { 'shipping_address.full_name': { $regex: query.search, $options: 'i' } }
      ]
    }

    let sort: any = { created_at: -1 }
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.slice(1) : query.sort
      const sortOrder = query.sort.startsWith('-') ? -1 : 1
      sort = { [sortField]: sortOrder }
    }

    const orders = await ordersCollection.find(filter).sort(sort).skip(skip).limit(limit).toArray()

    const total = await ordersCollection.countDocuments(filter)

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng (Admin)
   */
  /**
   * Cập nhật trạng thái đơn hàng (Admin)
   */
  async updateOrderStatus(
    orderId: string,
    status: 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded',
    options?: {
      cancellation_reason?: string
      tracking_number?: string
    }
  ) {
    const ordersCollection = databaseService.orders

    const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) })
    if (!order) {
      throw new Error(ORDER_MESSAGES.ORDER_NOT_FOUND)
    }

    // Tạo Order instance để dùng helper methods
    const orderInstance = new Order(order)

    // Validate status transition
    if (status === 'confirmed' && !orderInstance.canConfirm()) {
      throw new Error('Cannot confirm this order')
    }

    // Update using helper methods
    switch (status) {
      case 'confirmed':
        orderInstance.confirm()
        break

      case 'processing':
        // Chỉ cho phép từ confirmed
        if (orderInstance.status !== 'confirmed') {
          throw new Error('Order must be confirmed before processing')
        }
        orderInstance.status = 'processing'
        orderInstance.updated_at = new Date()
        break

      case 'shipping':
        orderInstance.startShipping()
        // Lưu tracking number nếu có
        if (options?.tracking_number) {
          ;(orderInstance as any).tracking_number = options.tracking_number
        }
        break

      case 'delivered':
        orderInstance.deliver()
        break

      case 'cancelled':
        if (!orderInstance.canCancel()) {
          throw new Error('Cannot cancel this order')
        }
        orderInstance.cancel(options?.cancellation_reason)
        // Hoàn lại stock
        await this.restoreStock(orderId)
        break

      case 'refunded':
        // Chỉ cho phép refund từ cancelled hoặc delivered
        if (!['cancelled', 'delivered'].includes(orderInstance.status)) {
          throw new Error('Order must be cancelled or delivered before refund')
        }
        orderInstance.status = 'refunded'
        orderInstance.payment_status = 'refunded'
        orderInstance.updated_at = new Date()
        break
    }

    // Save to DB
    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: orderInstance },
      { returnDocument: 'after' }
    )

    return result
  }
  /**
   * Cập nhật trạng thái thanh toán
   */
  async updatePaymentStatus(orderId: string, paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded') {
    const ordersCollection = databaseService.orders

    const updateData: any = {
      payment_status: paymentStatus,
      updated_at: new Date()
    }

    if (paymentStatus === 'paid') {
      updateData.paid_at = new Date()
    }

    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      throw new Error(ORDER_MESSAGES.ORDER_NOT_FOUND)
    }

    return result
  }

  /**
   * Hủy đơn hàng (User)
   */
  async cancelOrder(orderId: string, userId: string, reason: string) {
    const ordersCollection = databaseService.orders

    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
      user_id: new ObjectId(userId)
    })

    if (!order) {
      throw new Error(ORDER_MESSAGES.ORDER_NOT_FOUND)
    }

    const orderInstance = new Order(order)

    if (!orderInstance.canCancel()) {
      throw new Error(ORDER_MESSAGES.CANNOT_CANCEL_ORDER)
    }

    // Cancel order
    orderInstance.cancel(reason)

    // Hoàn lại stock
    await this.restoreStock(orderId)

    // Save to DB
    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: orderInstance },
      { returnDocument: 'after' }
    )

    return result
  }

  /**
   * Hoàn lại stock khi hủy đơn
   */
  private async restoreStock(orderId: string) {
    const ordersCollection = databaseService.orders
    const productsCollection = databaseService.products

    const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) })
    if (!order) return

    for (const item of order.items) {
      await productsCollection.updateOne(
        {
          _id: item.product_id,
          'variants.id': item.variant_id
        },
        {
          $inc: {
            'variants.$.stock_quantity': item.quantity
          }
        }
      )
    }
  }

  /**
   * Lấy thống kê đơn hàng (Admin)
   */
  async getOrderStatistics(userId?: string) {
    const ordersCollection = databaseService.orders

    const matchStage: any = userId ? { user_id: new ObjectId(userId) } : {}

    const stats = await ordersCollection
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total_orders: { $sum: 1 },
            total_revenue: { $sum: '$total_amount' },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            confirmed: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
            },
            shipping: {
              $sum: { $cond: [{ $eq: ['$status', 'shipping'] }, 1, 0] }
            },
            delivered: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            }
          }
        }
      ])
      .toArray()

    return (
      stats[0] || {
        total_orders: 0,
        total_revenue: 0,
        pending: 0,
        confirmed: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0
      }
    )
  }
}

export default new OrderService()
