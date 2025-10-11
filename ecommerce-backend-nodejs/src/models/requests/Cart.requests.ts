import { ParamsDictionary } from 'express-serve-static-core'

export interface AddToCartReqBody {
  product_id: string
  variant_id: string
  quantity: number
}

export interface UpdateCartItemReqBody {
  quantity: number
}

export interface UpdateCartItemReqParams extends ParamsDictionary {
  product_id: string
  variant_id: string
}

export interface RemoveFromCartReqParams extends ParamsDictionary {
  product_id: string
  variant_id: string
}

export interface GetCartReqQuery {
  session_id?: string
}

export interface MigrateCartReqBody {
  session_id: string
}
