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
import {
  accessTokenValidator,
  verifiedUserValidator,
  optionalAccessTokenValidator // ✅ Import middleware mới
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const cartsRouter = Router()

// ✅ Thêm optionalAccessTokenValidator cho TẤT CẢ routes
cartsRouter.get(
  '/',
  optionalAccessTokenValidator, // ✅ Thêm dòng này
  sessionIdValidator,
  wrapRequestHandler(getCartController)
)

cartsRouter.post(
  '/',
  optionalAccessTokenValidator, // ✅ Thêm dòng này
  addToCartValidator,
  wrapRequestHandler(addToCartController)
)

cartsRouter.patch(
  '/:product_id/variants/:variant_id',
  optionalAccessTokenValidator, // ✅ Thêm dòng này
  updateCartItemValidator,
  wrapRequestHandler(updateCartItemController)
)

cartsRouter.delete(
  '/:product_id/variants/:variant_id',
  optionalAccessTokenValidator, // ✅ Thêm dòng này
  removeFromCartValidator,
  wrapRequestHandler(removeFromCartController)
)

cartsRouter.delete(
  '/',
  optionalAccessTokenValidator, // ✅ Thêm dòng này
  wrapRequestHandler(clearCartController)
)

// Migrate giữ nguyên (vẫn dùng accessTokenValidator bắt buộc)
cartsRouter.post(
  '/migrate',
  accessTokenValidator,
  verifiedUserValidator,
  sessionIdValidator,
  wrapRequestHandler(migrateCartController)
)

export default cartsRouter
