import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCTS_MESSAGES } from '~/constants/messages'
import {
  AddProductReqBody,
  DeleteProductReqParams,
  GetProductByIdReqParams,
  UpdateProductReqBody,
  UpdateProductReqParams,
  VariantReqBody,
  AddVariantReqParams,
  UpdateVariantReqParams,
  GetVariantReqParams,
  DeleteVariantReqParams,
  UpdateVariantStockReqBody
} from '~/models/requests/Product.requests'
import productsService from '~/services/product.services'

// Product Controllers
export const addProductController = async (
  req: Request<ParamsDictionary, any, AddProductReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await productsService.add(req.body)

  return res.json({
    status: HTTP_STATUS.CREATED,
    message: PRODUCTS_MESSAGES.ADD_PRODUCT_SUCCESS,
    data: result
  })
}

export const getProductsController = async (req: Request, res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const name = req.query.name as string | undefined
  const brand_id = req.query.brand_id as string | undefined
  const category_id = req.query.category_id as string | undefined
  const min_price = req.query.min_price ? Number(req.query.min_price) : undefined
  const max_price = req.query.max_price ? Number(req.query.max_price) : undefined
  const is_available = req.query.is_available ? req.query.is_available === 'true' : undefined
  const skin_type = req.query.skin_type as string | undefined
  const origin = req.query.origin as string | undefined
  const sort_by = (req.query.sort_by as 'price' | 'rating' | 'created_at' | 'name') || 'created_at'
  const order = (req.query.order as 'asc' | 'desc') || 'desc'

  const products = await productsService.getProducts({
    page,
    limit,
    name,
    brand_id,
    category_id,
    min_price,
    max_price,
    is_available,
    skin_type,
    origin,
    sort_by,
    order
  })

  return res.json({
    status: HTTP_STATUS.OK,
    message: PRODUCTS_MESSAGES.GET_ALL_PRODUCTS_SUCCESS,
    data: {
      items: products.items,
      meta: {
        page,
        limit,
        totalItems: products.totalItems,
        totalPages: products.totalPages
      }
    }
  })
}

export const getProductByIdController = async (
  req: Request<GetProductByIdReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { product_id } = req.params
  const result = await productsService.getProductById(product_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: PRODUCTS_MESSAGES.GET_PRODUCT_SUCCESS,
    data: result
  })
}

export const updateProductController = async (
  req: Request<UpdateProductReqParams, any, UpdateProductReqBody>,
  res: Response
) => {
  const { product_id } = req.params
  const payload = req.body
  const updatedProduct = await productsService.updateProduct(product_id, payload)

  return res.json({
    status: HTTP_STATUS.OK,
    message: PRODUCTS_MESSAGES.UPDATE_PRODUCT_SUCCESS,
    data: updatedProduct
  })
}

export const deleteProductController = async (req: Request<DeleteProductReqParams>, res: Response) => {
  const { product_id } = req.params
  const result = await productsService.deleteProduct(product_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: result.message,
    data: null
  })
}

export const addVariantController = async (req: Request<AddVariantReqParams, any, VariantReqBody>, res: Response) => {
  const { product_id } = req.params
  const variantData = req.body

  const result = await productsService.addVariant(product_id, variantData)

  return res.json({
    status: HTTP_STATUS.CREATED,
    message: PRODUCTS_MESSAGES.ADD_VARIANT_SUCCESS,
    data: result
  })
}

export const getVariantController = async (req: Request<GetVariantReqParams>, res: Response) => {
  const { product_id, variant_id } = req.params

  const result = await productsService.getVariant(product_id, variant_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Get variant successfully',
    data: {
      product: result.product,
      variant: result.variant
    }
  })
}

export const updateVariantController = async (
  req: Request<UpdateVariantReqParams, any, Partial<VariantReqBody>>,
  res: Response
) => {
  const { product_id, variant_id } = req.params
  const variantData = req.body

  const result = await productsService.updateVariant(product_id, variant_id, variantData)

  return res.json({
    status: HTTP_STATUS.OK,
    message: PRODUCTS_MESSAGES.UPDATE_VARIANT_SUCCESS,
    data: result
  })
}

export const deleteVariantController = async (req: Request<DeleteVariantReqParams>, res: Response) => {
  const { product_id, variant_id } = req.params

  const result = await productsService.deleteVariant(product_id, variant_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: PRODUCTS_MESSAGES.DELETE_VARIANT_SUCCESS,
    data: result
  })
}

export const updateVariantStockController = async (
  req: Request<UpdateVariantReqParams, any, UpdateVariantStockReqBody>,
  res: Response
) => {
  const { product_id, variant_id } = req.params
  const { quantity } = req.body

  const result = await productsService.updateVariantStock(product_id, variant_id, quantity)

  return res.json({
    status: HTTP_STATUS.OK,
    message: PRODUCTS_MESSAGES.UPDATE_VARIANT_STOCK_SUCCESS,
    data: result
  })
}

export const getFeaturedProductsController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10
  const products = await productsService.getFeaturedProducts(limit)

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Get featured products successfully',
    data: products
  })
}

export const getProductsByBrandController = async (req: Request, res: Response) => {
  const { brand_id } = req.params
  const limit = Number(req.query.limit) || 10
  const products = await productsService.getProductsByBrand(brand_id, limit)

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Get products by brand successfully',
    data: products
  })
}

export const getProductsByCategoryController = async (req: Request, res: Response) => {
  const { category_id } = req.params
  const limit = Number(req.query.limit) || 10
  const products = await productsService.getProductsByCategory(category_id, limit)

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Get products by category successfully',
    data: products
  })
}

export const getProductPriceRangeController = async (req: Request, res: Response) => {
  const { product_id } = req.params
  const product = await productsService.getProductById(product_id)

  if ('message' in product) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      status: HTTP_STATUS.NOT_FOUND,
      message: product.message,
      data: null
    })
  }

  const prices = product.variants.map((v: any) => v.price)
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
    currency: 'VND' // or from config
  }

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Get product price range successfully',
    data: priceRange
  })
}

export const getProductAvailabilityController = async (req: Request, res: Response) => {
  const { product_id } = req.params
  const product = await productsService.getProductById(product_id)

  if ('message' in product) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      status: HTTP_STATUS.NOT_FOUND,
      message: product.message,
      data: null
    })
  }

  const availability = {
    total_stock: product.variants.reduce((sum: number, v: any) => sum + v.stock_quantity, 0),
    available_variants: product.variants.filter((v: any) => v.is_available && v.stock_quantity > 0).length,
    total_variants: product.variants.length,
    is_in_stock: product.variants.some((v: any) => v.is_available && v.stock_quantity > 0)
  }

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Get product availability successfully',
    data: availability
  })
}
