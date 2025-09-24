import { Router } from 'express'
import {
  addCategoryController,
  deleteCategoryController,
  getCategoriesController,
  getCategoryByIdController,
  updateCategoryController
} from '~/controllers/categories.controllers'
import {
  addCategoryValidator,
  categoryIdValidator,
  updateCategoryValidator
} from '~/middlewares/categories.middlewares'
import {
  accessTokenValidator,
  checkRoleValidator,
  paginateValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const categoriesRouter = Router()

categoriesRouter.post(
  '/add',
  accessTokenValidator,
  checkRoleValidator,
  addCategoryValidator,
  wrapRequestHandler(addCategoryController)
)

categoriesRouter.get('/all', paginateValidator, wrapRequestHandler(getCategoriesController))

categoriesRouter.get('/category/:category_id', categoryIdValidator, wrapRequestHandler(getCategoryByIdController))

categoriesRouter.delete(
  '/delete/:category_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  categoryIdValidator,
  wrapRequestHandler(deleteCategoryController)
)

categoriesRouter.patch(
  '/update/:category_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  categoryIdValidator,
  updateCategoryValidator,
  wrapRequestHandler(updateCategoryController)
)

export default categoriesRouter
