import { Router } from 'express'
import {
  addToCartController,
  clearCartController,
  getCartController,
  migrateCartController,
  removeFromCartController,
  updateCartItemController
} from '~/controllers/carts.controllers'
import {
  addToCartValidator,
  removeFromCartValidator,
  sessionIdValidator,
  updateCartItemValidator
} from '~/middlewares/carts.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const cartsRouter = Router()

// Get cart (works for both authenticated and guest users)
cartsRouter.get('/', sessionIdValidator, wrapRequestHandler(getCartController))

// Add item to cart
cartsRouter.post('/', addToCartValidator, wrapRequestHandler(addToCartController))

// Update cart item quantity
cartsRouter.patch(
  '/:product_id/variants/:variant_id',
  updateCartItemValidator,
  wrapRequestHandler(updateCartItemController)
)

// Remove item from cart
cartsRouter.delete(
  '/:product_id/variants/:variant_id',
  removeFromCartValidator,
  wrapRequestHandler(removeFromCartController)
)

// Clear cart
cartsRouter.delete('/', wrapRequestHandler(clearCartController))

// Migrate guest cart to user cart (after login)
cartsRouter.post(
  '/migrate',
  accessTokenValidator,
  verifiedUserValidator,
  sessionIdValidator,
  wrapRequestHandler(migrateCartController)
)

export default cartsRouter
