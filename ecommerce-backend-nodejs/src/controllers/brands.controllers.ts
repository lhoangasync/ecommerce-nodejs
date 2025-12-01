import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { BRANDS_MESSAGES } from '~/constants/messages'
import {
  AddBrandReqBody,
  DeleteBrandReqParams,
  GetBrandByIdReqParams,
  UpdateBrandReqBody,
  UpdateBrandReqParams
} from '~/models/requests/Brand.requests'
import brandsService from '~/services/brand.services'

export const addBrandController = async (
  req: Request<ParamsDictionary, any, AddBrandReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await brandsService.add(req.body)

  return res.json({
    status: HTTP_STATUS.CREATED,
    message: BRANDS_MESSAGES.ADD_BRAND_SUCCESS,
    data: result
  })
}

export const getBrandsController = async (req: Request, res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const name = req.query.name as string | undefined

  const brands = await brandsService.getBrands({ page, limit, name })

  return res.json({
    status: HTTP_STATUS.OK,
    message: BRANDS_MESSAGES.GET_ALL_BRANDS_SUCCESS,
    data: {
      items: brands.items,
      meta: {
        page,
        limit,
        totalItems: brands.totalItems,
        totalPages: brands.totalPages
      }
    }
  })
}

export const getBrandByIdController = async (
  req: Request<GetBrandByIdReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { brand_id } = req.params
  const result = await brandsService.getBrandById(brand_id)
  return res.json({
    status: HTTP_STATUS.OK,
    message: BRANDS_MESSAGES.GET_BRAND_SUCCESS,
    data: result
  })
}

export const updateBrandController = async (
  req: Request<UpdateBrandReqParams, any, UpdateBrandReqBody>,
  res: Response
) => {
  const { brand_id } = req.params
  const payload = req.body
  const updatedBrand = await brandsService.updateBrand(brand_id, payload)

  return res.json({
    status: HTTP_STATUS.OK,
    message: BRANDS_MESSAGES.UPDATE_BRAND_SUCCESS,
    data: updatedBrand
  })
}

export const deleteBrandController = async (req: Request<DeleteBrandReqParams>, res: Response) => {
  const { brand_id } = req.params
  const result = await brandsService.deleteBrand(brand_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: result.message,
    data: null
  })
}
