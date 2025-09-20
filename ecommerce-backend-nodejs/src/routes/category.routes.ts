import { Router } from 'express'
import {
  addCategoryController,
  deleteCategoryController,
  getCategoriesController,
  getCategoryByIdController
} from '~/controllers/categories.controllers'
import { addCategoryValidator, categoryIdValidator } from '~/middlewares/categories.middlewares'
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

export default categoriesRouter
