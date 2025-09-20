import { ParamsDictionary } from 'express-serve-static-core'

export interface GetCategoriesParams {
  page: number
  limit: number
  name?: string
}
export interface GetCategoryByIdReqParams extends ParamsDictionary {
  category_id: string
}

export interface AddCategoryReqBody {
  name: string
  slug: string
  desc?: string
  img?: string
}

export interface DeleteCategoryReqParams extends ParamsDictionary {
  category_id: string
}
