import { Router } from 'express'
import {
  addBrandController,
  deleteBrandController,
  getBrandByIdController,
  getBrandsController,
  updateBrandController
} from '~/controllers/brands.controllers'
import { addBrandValidator, brandIdValidator, updateBrandValidator } from '~/middlewares/brands.middlewares'
import {
  accessTokenValidator,
  checkRoleValidator,
  paginateValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const brandsRouter = Router()

brandsRouter.post(
  '/add',
  accessTokenValidator,
  checkRoleValidator,
  addBrandValidator,
  wrapRequestHandler(addBrandController)
)

brandsRouter.get('/all', paginateValidator, wrapRequestHandler(getBrandsController))

brandsRouter.get('/brand/:brand_id', brandIdValidator, wrapRequestHandler(getBrandByIdController))

brandsRouter.patch(
  '/update/:brand_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  brandIdValidator,
  updateBrandValidator,
  wrapRequestHandler(updateBrandController)
)

brandsRouter.delete(
  '/:brand_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  brandIdValidator,
  wrapRequestHandler(deleteBrandController)
)
export default brandsRouter
