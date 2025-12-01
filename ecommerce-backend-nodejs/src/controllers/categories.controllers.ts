import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { CATEGORIES_MESSAGES } from '~/constants/messages'
import {
  AddCategoryReqBody,
  DeleteCategoryReqParams,
  GetCategoryByIdReqParams,
  UpdateCategoryReqBody,
  UpdateCategoryReqParams
} from '~/models/requests/Category.requests'
import categoriesService from '~/services/category.services'

export const getCategoriesController = async (req: Request, res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const name = req.query.name as string | undefined

  const categories = await categoriesService.getCategories({ page, limit, name })

  return res.json({
    status: HTTP_STATUS.OK,
    message: CATEGORIES_MESSAGES.GET_ALL_CATEGORIES_SUCCESS,
    data: {
      items: categories.items,
      meta: {
        page,
        limit,
        totalItems: categories.totalItems,
        totalPages: categories.totalPages
      }
    }
  })
}

export const getCategoryByIdController = async (
  req: Request<GetCategoryByIdReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { category_id } = req.params
  const result = await categoriesService.getCategoryById(category_id)
  return res.json({
    status: HTTP_STATUS.OK,
    message: CATEGORIES_MESSAGES.GET_CATEGORY_SUCCESS,
    data: result
  })
}

export const addCategoryController = async (
  req: Request<ParamsDictionary, any, AddCategoryReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await categoriesService.add(req.body)

  return res.json({
    status: HTTP_STATUS.CREATED,
    message: CATEGORIES_MESSAGES.ADD_CATEGORY_SUCCESS,
    data: result
  })
}

export const deleteCategoryController = async (req: Request<DeleteCategoryReqParams>, res: Response) => {
  const { category_id } = req.params
  const result = await categoriesService.deleteCategory(category_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: result.message,
    data: null
  })
}

export const updateCategoryController = async (
  req: Request<UpdateCategoryReqParams, any, UpdateCategoryReqBody>,
  res: Response
) => {
  const { category_id } = req.params
  const payload = req.body
  const updatedCategory = await categoriesService.updateCategory(category_id, payload)

  return res.json({
    status: HTTP_STATUS.OK,
    message: CATEGORIES_MESSAGES.UPDATE_BRAND_SUCCESS,
    data: updatedCategory
  })
}
