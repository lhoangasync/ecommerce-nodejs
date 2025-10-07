import { ParamsDictionary } from 'express-serve-static-core'

export interface VariantReqBody {
  id: string
  shade_color?: string
  volume_size?: string
  price: number
  original_price?: number // Giá gốc trước khi giảm (optional)
  sku: string
  images?: string[]
  stock_quantity: number
  is_available: boolean
}

export interface GetProductsParams {
  page: number
  limit: number
  name?: string
  brand_id?: string
  category_id?: string
  min_price?: number
  max_price?: number
  is_available?: boolean
  skin_type?: string
  origin?: string
  sort_by?: 'price' | 'rating' | 'created_at' | 'name'
  order?: 'asc' | 'desc'
}

export interface GetProductByIdReqParams extends ParamsDictionary {
  product_id: string
}

export interface AddProductReqBody {
  name: string
  slug: string
  description?: string
  brand_id: string
  category_id: string

  ingredients?: string
  skin_type?: string[]
  origin?: string
  how_to_use?: string

  variants: VariantReqBody[]

  images?: string[]
  tags?: string[]
}

export interface DeleteProductReqParams extends ParamsDictionary {
  product_id: string
}

export interface UpdateProductReqParams extends ParamsDictionary {
  product_id: string
}

export interface UpdateProductReqBody {
  name?: string
  slug?: string
  description?: string
  brand_id?: string
  category_id?: string

  ingredients?: string
  skin_type?: string[]
  origin?: string
  how_to_use?: string

  variants?: VariantReqBody[]

  images?: string[]
  tags?: string[]
}

export interface GetVariantReqParams extends ParamsDictionary {
  product_id: string
  variant_id: string
}

export interface AddVariantReqParams extends ParamsDictionary {
  product_id: string
}

export interface UpdateVariantReqParams extends ParamsDictionary {
  product_id: string
  variant_id: string
}

export interface DeleteVariantReqParams extends ParamsDictionary {
  product_id: string
  variant_id: string
}

export interface UpdateVariantStockReqBody {
  quantity: number
}
