import { ObjectId } from 'mongodb'
import { CART_MESSAGES, PRODUCTS_MESSAGES } from '~/constants/messages'
import { Cart, ICartItem } from '~/models/schemas/Cart.schema'
import databaseService from './database.services'

class CartService {
  async addToCart(user_id: string | undefined, session_id: string | undefined, item: ICartItem) {
    // Validate product and variant
    const product = await databaseService.products.findOne({
      _id: new ObjectId(item.product_id)
    })

    if (!product) {
      throw new Error(PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND)
    }

    const variant = product.variants.find((v) => v.id === item.variant_id)
    if (!variant) {
      throw new Error(PRODUCTS_MESSAGES.VARIANT_NOT_FOUND)
    }

    if (!variant.is_available || variant.stock_quantity < item.quantity) {
      throw new Error('Variant is not available or insufficient stock')
    }

    // Find existing cart
    const query: any = user_id ? { user_id: new ObjectId(user_id) } : { session_id }

    let cart = await databaseService.carts.findOne(query)

    if (!cart) {
      // Create new cart
      const newCart = new Cart({
        user_id: user_id ? new ObjectId(user_id) : undefined,
        session_id: user_id ? undefined : session_id,
        items: [
          {
            ...item,
            price: variant.price,
            added_at: new Date()
          }
        ]
      })
      await databaseService.carts.insertOne(newCart)
      return newCart
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
    )

    if (existingItemIndex !== -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + item.quantity

      if (newQuantity > variant.stock_quantity) {
        throw new Error(`Only ${variant.stock_quantity} items available in stock`)
      }

      cart.items[existingItemIndex].quantity = newQuantity
    } else {
      // Add new item
      cart.items.push({
        ...item,
        price: variant.price,
        added_at: new Date()
      })
    }

    // Update cart
    const updatedCart = await databaseService.carts.findOneAndUpdate(
      { _id: cart._id },
      {
        $set: {
          items: cart.items,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    return updatedCart
  }

  async getCart(user_id: string | undefined, session_id: string | undefined) {
    const query: any = user_id ? { user_id: new ObjectId(user_id) } : { session_id }

    const cart = await databaseService.carts.findOne(query)

    if (!cart || cart.items.length === 0) {
      return {
        items: [],
        total: 0,
        totalItems: 0
      }
    }

    // Populate cart items with product details
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await databaseService.products.findOne({
          _id: new ObjectId(item.product_id)
        })

        if (!product) return null

        const variant = product.variants.find((v) => v.id === item.variant_id)
        if (!variant) return null

        return {
          ...item,
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            images: product.images
          },
          variant: {
            id: variant.id,
            shade_color: variant.shade_color,
            volume_size: variant.volume_size,
            price: variant.price,
            original_price: variant.original_price,
            images: variant.images,
            stock_quantity: variant.stock_quantity,
            is_available: variant.is_available
          },
          subtotal: variant.price * item.quantity
        }
      })
    )

    const validItems = populatedItems.filter((item) => item !== null)
    const total = validItems.reduce((sum, item) => sum + item!.subtotal, 0)

    return {
      items: validItems,
      total,
      totalItems: validItems.length
    }
  }

  async updateCartItem(
    user_id: string | undefined,
    session_id: string | undefined,
    product_id: string,
    variant_id: string,
    quantity: number
  ) {
    // Validate stock
    const product = await databaseService.products.findOne({
      _id: new ObjectId(product_id)
    })

    if (!product) {
      throw new Error(PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND)
    }

    const variant = product.variants.find((v) => v.id === variant_id)
    if (!variant) {
      throw new Error(PRODUCTS_MESSAGES.VARIANT_NOT_FOUND)
    }

    if (quantity > variant.stock_quantity) {
      throw new Error(`Only ${variant.stock_quantity} items available in stock`)
    }

    const query: any = user_id ? { user_id: new ObjectId(user_id) } : { session_id }

    const cart = await databaseService.carts.findOne(query)

    if (!cart) {
      throw new Error(CART_MESSAGES.CART_EMPTY)
    }

    const itemIndex = cart.items.findIndex((i) => i.product_id === product_id && i.variant_id === variant_id)

    if (itemIndex === -1) {
      throw new Error(CART_MESSAGES.PRODUCT_NOT_IN_CART)
    }

    cart.items[itemIndex].quantity = quantity
    cart.items[itemIndex].price = variant.price

    const updatedCart = await databaseService.carts.findOneAndUpdate(
      { _id: cart._id },
      {
        $set: {
          items: cart.items,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    return updatedCart
  }

  async removeFromCart(
    user_id: string | undefined,
    session_id: string | undefined,
    product_id: string,
    variant_id: string
  ) {
    const query: any = user_id ? { user_id: new ObjectId(user_id) } : { session_id }

    const cart = await databaseService.carts.findOne(query)

    if (!cart) {
      throw new Error(CART_MESSAGES.CART_EMPTY)
    }

    const updatedItems = cart.items.filter((i) => !(i.product_id === product_id && i.variant_id === variant_id))

    const updatedCart = await databaseService.carts.findOneAndUpdate(
      { _id: cart._id },
      {
        $set: {
          items: updatedItems,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    return updatedCart
  }

  async clearCart(user_id: string | undefined, session_id: string | undefined) {
    const query: any = user_id ? { user_id: new ObjectId(user_id) } : { session_id }

    const cart = await databaseService.carts.findOne(query)

    if (!cart) {
      throw new Error(CART_MESSAGES.CART_EMPTY)
    }

    await databaseService.carts.findOneAndUpdate(
      { _id: cart._id },
      {
        $set: {
          items: [],
          updated_at: new Date()
        }
      }
    )

    return { message: CART_MESSAGES.CLEAR_CART_SUCCESS }
  }

  async migrateGuestCart(user_id: string, session_id: string) {
    const guestCart = await databaseService.carts.findOne({ session_id })

    if (!guestCart || guestCart.items.length === 0) {
      return { message: 'No guest cart to migrate' }
    }

    let userCart = await databaseService.carts.findOne({
      user_id: new ObjectId(user_id)
    })

    if (!userCart) {
      // Create user cart from guest cart
      const newCart = new Cart({
        user_id: new ObjectId(user_id),
        items: guestCart.items
      })
      await databaseService.carts.insertOne(newCart)

      // Delete guest cart
      await databaseService.carts.deleteOne({ _id: guestCart._id })

      return { message: CART_MESSAGES.CART_MIGRATED_SUCCESS }
    }

    // Merge carts
    for (const guestItem of guestCart.items) {
      const existingItemIndex = userCart.items.findIndex(
        (i) => i.product_id === guestItem.product_id && i.variant_id === guestItem.variant_id
      )

      if (existingItemIndex !== -1) {
        // Update quantity (take the maximum)
        userCart.items[existingItemIndex].quantity = Math.max(
          userCart.items[existingItemIndex].quantity,
          guestItem.quantity
        )
      } else {
        userCart.items.push(guestItem)
      }
    }

    await databaseService.carts.findOneAndUpdate(
      { _id: userCart._id },
      {
        $set: {
          items: userCart.items,
          updated_at: new Date()
        }
      }
    )

    // Delete guest cart
    await databaseService.carts.deleteOne({ _id: guestCart._id })

    return { message: CART_MESSAGES.CART_MIGRATED_SUCCESS }
  }
}

const cartService = new CartService()
export default cartService
