import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { ORDER_MESSAGES } from '~/constants/messages'
import { Order, IOrder, IOrderItem } from '~/models/schemas/Order.schema'
import { CreateOrderReqBody, GetOrdersReqQuery } from '~/models/requests/Order.requests'
import autoCouponService from './autoCoupon.services'

class OrderService {
  /**
   * Tạo đơn hàng mới từ giỏ hàng
   */
  async createOrder(userId: string, orderData: CreateOrderReqBody) {
    const cartCollection = databaseService.carts
    const ordersCollection = databaseService.orders
    const productsCollection = databaseService.products
    const couponsCollection = databaseService.coupons

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
      const product = await productsCollection.findOne({
        _id: new ObjectId(cartItem.product_id)
      })

      if (!product) {
        throw new Error(`Product ${cartItem.product_id} not found`)
      }

      const variant = product.variants.find((v: any) => v.id === cartItem.variant_id)

      if (!variant) {
        throw new Error(`Variant ${cartItem.variant_id} not found in product ${product.name}`)
      }

      if (variant.stock_quantity < cartItem.quantity) {
        throw new Error(`Not enough stock for ${product.name}`)
      }

      const unitPrice = variant.price
      const originalPrice = variant.original_price || variant.price
      const itemSubtotal = unitPrice * cartItem.quantity

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

    // 3. Áp dụng coupon nếu có
    let discountAmount = 0
    let appliedCoupon = null

    if (orderData.coupon_code) {
      const now = new Date()

      // Tìm coupon theo code
      const coupon = await couponsCollection.findOne({
        code: orderData.coupon_code.toUpperCase(),
        is_active: true,
        start_date: { $lte: now },
        end_date: { $gte: now }
      })

      if (!coupon) {
        throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn')
      }

      // 1. Kiểm tra usage limit tổng
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        throw new Error('Mã giảm giá đã hết lượt sử dụng')
      }

      // 2. Kiểm tra usage per user
      if (coupon.usage_limit_per_user) {
        const userUsageCount = await databaseService.user_coupon_usages.countDocuments({
          user_id: new ObjectId(userId),
          coupon_id: coupon._id
        })

        if (userUsageCount >= coupon.usage_limit_per_user) {
          throw new Error('Bạn đã hết lượt sử dụng mã giảm giá này')
        }
      }

      // 3. Kiểm tra applicable_users (nếu có giới hạn user cụ thể)
      if (coupon.applicable_users && coupon.applicable_users.length > 0) {
        const isApplicable = coupon.applicable_users.some((id: ObjectId) => id.toString() === userId)
        if (!isApplicable) {
          throw new Error('Mã giảm giá này không dành cho bạn')
        }
      }

      // 4. Kiểm tra excluded_users
      if (coupon.excluded_users && coupon.excluded_users.length > 0) {
        const isExcluded = coupon.excluded_users.some((id: ObjectId) => id.toString() === userId)
        if (isExcluded) {
          throw new Error('Bạn không được sử dụng mã giảm giá này')
        }
      }

      // 5. Kiểm tra giá trị đơn hàng tối thiểu
      if (coupon.min_order_value && subtotal < coupon.min_order_value) {
        throw new Error(`Đơn hàng tối thiểu ${coupon.min_order_value.toLocaleString('vi-VN')}₫ để áp dụng mã này`)
      }

      // 6. Kiểm tra sản phẩm (nếu có giới hạn)
      if (coupon.applicable_products && coupon.applicable_products.length > 0) {
        const hasApplicableProduct = orderItems.some((item) =>
          coupon.applicable_products!.some((id: ObjectId) => id.toString() === item.product_id.toString())
        )
        if (!hasApplicableProduct) {
          throw new Error('Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng')
        }
      }

      // 7. Kiểm tra categories (nếu có giới hạn)
      if (coupon.applicable_categories && coupon.applicable_categories.length > 0) {
        const productIds = orderItems.map((item) => item.product_id)
        const products = await productsCollection
          .find({
            _id: { $in: productIds }
          })
          .toArray()

        const hasApplicableCategory = products.some((product) =>
          coupon.applicable_categories!.some((id: ObjectId) => id.toString() === product.category_id.toString())
        )
        if (!hasApplicableCategory) {
          throw new Error('Mã giảm giá không áp dụng cho danh mục sản phẩm này')
        }
      }

      // 8. Kiểm tra brands (nếu có giới hạn)
      if (coupon.applicable_brands && coupon.applicable_brands.length > 0) {
        const productIds = orderItems.map((item) => item.product_id)
        const products = await productsCollection
          .find({
            _id: { $in: productIds }
          })
          .toArray()

        const hasApplicableBrand = products.some((product) =>
          coupon.applicable_brands!.some((id: ObjectId) => id.toString() === product.brand_id.toString())
        )
        if (!hasApplicableBrand) {
          throw new Error('Mã giảm giá không áp dụng cho thương hiệu này')
        }
      }

      // 9. Tính discount
      if (coupon.discount_type === 'percentage') {
        discountAmount = (subtotal * coupon.discount_value) / 100
        if (coupon.max_discount_amount) {
          discountAmount = Math.min(discountAmount, coupon.max_discount_amount)
        }
      } else {
        // fixed_amount
        discountAmount = Math.min(coupon.discount_value, subtotal)
      }

      appliedCoupon = coupon
    }

    // 4. Tính toán tổng tiền
    const shippingFee = orderData.shipping_fee || 30000
    const totalAmount = subtotal + shippingFee - discountAmount

    // 5. Tạo order
    const orderPayload: IOrder = {
      user_id: new ObjectId(userId),
      order_code: '',
      items: orderItems,
      subtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      shipping_address: orderData.shipping_address,
      note: orderData.note,
      status: 'pending',
      payment_method: orderData.payment_method,
      payment_status: orderData.payment_method === 'cod' ? 'pending' : 'pending',
      // Lưu thông tin coupon đã dùng (nếu cần)
      ...(appliedCoupon && {
        coupon_code: appliedCoupon.code,
        coupon_id: appliedCoupon._id
      })
    }

    const order = new Order(orderPayload)

    // 6. Lưu order vào DB
    const result = await ordersCollection.insertOne(order)

    // 7. Tăng usage_count và lưu tracking
    if (appliedCoupon) {
      // Tăng usage_count
      await couponsCollection.updateOne(
        { _id: appliedCoupon._id },
        {
          $inc: { usage_count: 1 },
          $set: { updated_at: new Date() }
        }
      )

      // Lưu vào UserCouponUsage để tracking per user
      await databaseService.user_coupon_usages.insertOne({
        _id: new ObjectId(),
        user_id: new ObjectId(userId),
        coupon_id: appliedCoupon._id,
        order_id: result.insertedId,
        discount_amount: discountAmount,
        used_at: new Date()
      })
    }

    // 8. Giảm stock của các variants
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

    // 9. Xóa giỏ hàng
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
   * Lấy tất cả đơn hàng (Admin)
   */
  async getAllOrders(query: GetOrdersReqQuery) {
    const ordersCollection = databaseService.orders

    const page = parseInt(query.page || '1')
    const limit = parseInt(query.limit || '500')
    const skip = (page - 1) * limit

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
   * Cập nhật updateOrderStatus để tự động check coupon khi delivered (cho COD)
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

    const orderInstance = new Order(order)

    if (status === 'confirmed' && !orderInstance.canConfirm()) {
      throw new Error('Cannot confirm this order')
    }

    switch (status) {
      case 'confirmed':
        orderInstance.confirm()
        break

      case 'processing':
        if (orderInstance.status !== 'confirmed') {
          throw new Error('Order must be confirmed before processing')
        }
        orderInstance.status = 'processing'
        orderInstance.updated_at = new Date()
        break

      case 'shipping':
        orderInstance.startShipping()
        if (options?.tracking_number) {
          ;(orderInstance as any).tracking_number = options.tracking_number
        }
        break

      case 'delivered':
        orderInstance.deliver()
        if (orderInstance.payment_method === 'cod') {
          await this.checkAndGenerateAutoCoupon(orderId)
        }
        break

      case 'cancelled':
        if (!orderInstance.canCancel()) {
          throw new Error('Cannot cancel this order')
        }
        orderInstance.cancel(options?.cancellation_reason)
        await this.restoreStock(orderId)
        // Hoàn lại coupon nếu đã dùng
        await this.restoreCoupon(orderId)
        break

      case 'refunded':
        if (!['cancelled', 'delivered'].includes(orderInstance.status)) {
          throw new Error('Order must be cancelled or delivered before refund')
        }
        orderInstance.status = 'refunded'
        orderInstance.payment_status = 'refunded'
        orderInstance.updated_at = new Date()
        break
    }

    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: orderInstance },
      { returnDocument: 'after' }
    )

    return result
  }

  /**
   * Hook: Tự động kiểm tra và tạo coupon sau khi order được thanh toán
   */
  async checkAndGenerateAutoCoupon(orderId: string) {
    try {
      const order = await databaseService.orders.findOne({
        _id: new ObjectId(orderId)
      })

      if (!order) return

      if (order.payment_status === 'paid') {
        await autoCouponService.checkAndCreateCoupon(order.user_id)
      }
    } catch (error) {
      console.error('Error checking auto coupon:', error)
    }
  }

  /**
   * Cập nhật updatePaymentStatus để tự động check coupon
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

    if (paymentStatus === 'paid') {
      await this.checkAndGenerateAutoCoupon(orderId)
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

    orderInstance.cancel(reason)

    await this.restoreStock(orderId)
    await this.restoreCoupon(orderId)

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
   * Hoàn lại coupon khi hủy đơn
   */
  private async restoreCoupon(orderId: string) {
    const order = await databaseService.orders.findOne({
      _id: new ObjectId(orderId)
    })

    if (!order || !order.coupon_id) return

    // Giảm usage_count
    await databaseService.coupons.updateOne(
      { _id: new ObjectId(order.coupon_id) },
      {
        $inc: { usage_count: -1 },
        $set: { updated_at: new Date() }
      }
    )

    // Xóa record tracking
    await databaseService.user_coupon_usages.deleteOne({
      order_id: new ObjectId(orderId)
    })
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
