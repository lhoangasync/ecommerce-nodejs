import { ParamsDictionary } from 'express-serve-static-core'

export interface AddBrandReqBody {
  name: string
  slug: string
  country?: string
  desc?: string
  img?: string
}

export interface DeleteBrandReqParams extends ParamsDictionary {
  brand_id: string
}

export interface GetBrandByIdReqParams extends ParamsDictionary {
  brand_id: string
}

export interface UpdateBrandReqBody {
  name?: string
  slug?: string
  desc?: string
  img?: string
}

export interface UpdateBrandReqParams extends ParamsDictionary {
  brand_id: string
}
