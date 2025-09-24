import { Router } from 'express'
import {
  addProductController,
  deleteProductController,
  getFeaturedProductsController,
  getProductByIdController,
  getProductsByCategoryController,
  getProductsByBrandController,
  getProductsController,
  updateProductController,
  addVariantController,
  getVariantController,
  updateVariantController,
  deleteVariantController,
  updateVariantStockController,
  getProductPriceRangeController,
  getProductAvailabilityController
} from '~/controllers/products.controllers'
import {
  addProductValidator,
  productIdValidator,
  updateProductValidator,
  addVariantValidator,
  variantIdValidator,
  updateVariantValidator,
  updateVariantStockValidator
} from '~/middlewares/products.middlewares'
import {
  accessTokenValidator,
  checkRoleValidator,
  paginateValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const productsRouter = Router()

productsRouter.get('/all', paginateValidator, wrapRequestHandler(getProductsController))

productsRouter.get('/featured', wrapRequestHandler(getFeaturedProductsController))

productsRouter.get('/brand/:brand_id', wrapRequestHandler(getProductsByBrandController))

productsRouter.get('/category/:category_id', wrapRequestHandler(getProductsByCategoryController))

productsRouter.get('/:product_id/price-range', productIdValidator, wrapRequestHandler(getProductPriceRangeController))

productsRouter.get(
  '/:product_id/availability',
  productIdValidator,
  wrapRequestHandler(getProductAvailabilityController)
)

productsRouter.get('/:product_id/variants/:variant_id', variantIdValidator, wrapRequestHandler(getVariantController))

productsRouter.get('/:product_id', productIdValidator, wrapRequestHandler(getProductByIdController))

productsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  addProductValidator,
  wrapRequestHandler(addProductController)
)

productsRouter.post(
  '/:product_id/variants',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  addVariantValidator,
  wrapRequestHandler(addVariantController)
)

productsRouter.patch(
  '/:product_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  productIdValidator,
  updateProductValidator,
  wrapRequestHandler(updateProductController)
)

productsRouter.patch(
  '/:product_id/variants/:variant_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  updateVariantValidator,
  wrapRequestHandler(updateVariantController)
)

productsRouter.patch(
  '/:product_id/variants/:variant_id/stock',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  updateVariantStockValidator,
  wrapRequestHandler(updateVariantStockController)
)

productsRouter.delete(
  '/:product_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  productIdValidator,
  wrapRequestHandler(deleteProductController)
)

productsRouter.delete(
  '/:product_id/variants/:variant_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  variantIdValidator,
  wrapRequestHandler(deleteVariantController)
)

export default productsRouter
