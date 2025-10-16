export interface CreateReviewReqBody {
  product_id: string
  variant_id?: string
  rating: number
  comment?: string
  images?: string[]
  is_verified_purchase?: boolean
  order_id?: string
}

export interface UpdateReviewReqBody {
  rating?: number
  comment?: string
  images?: string[]
  variant_id?: string
}

export interface UpdateReviewReqParams {
  review_id: string
}

export interface GetReviewByIdReqParams {
  review_id: string
}

export interface DeleteReviewReqParams {
  review_id: string
}

export interface ApproveReviewReqParams {
  review_id: string
}

export interface RejectReviewReqParams {
  review_id: string
}

export interface MarkHelpfulReqParams {
  review_id: string
}

export interface ReportReviewReqParams {
  review_id: string
}

export interface AddSellerResponseReqParams {
  review_id: string
}

export interface SellerResponseReqBody {
  message: string
}

export interface GetRatingStatsReqParams {
  product_id: string
}

export interface GetReviewsQuery {
  product_id?: string
  user_id?: string
  rating?: string
  status?: string
  is_verified_purchase?: string
  page?: string
  limit?: string
  sort_by?: 'created_at' | 'rating' | 'helpful_count'
  order?: 'asc' | 'desc'
}
