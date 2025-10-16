// ~/models/schemas/Review.schema.ts
import { ObjectId } from 'mongodb'

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IReview {
  _id?: ObjectId
  product_id: ObjectId
  variant_id?: string
  user_id: ObjectId
  rating: number
  comment?: string
  images?: string[]
  is_verified_purchase?: boolean
  order_id?: ObjectId
  status: ReviewStatus
  helpful_count: number
  reported_count: number
  seller_response?: {
    user_id: ObjectId
    message: string
    created_at: Date
  }
  created_at: Date
  updated_at: Date
}

export default class Review {
  _id?: ObjectId
  product_id: ObjectId
  variant_id?: string
  user_id: ObjectId
  rating: number
  comment?: string
  images?: string[]
  is_verified_purchase: boolean
  order_id?: ObjectId
  status: ReviewStatus
  helpful_count: number
  reported_count: number
  seller_response?: {
    user_id: ObjectId
    message: string
    created_at: Date
  }
  created_at: Date
  updated_at: Date

  constructor(review: IReview) {
    this._id = review._id
    this.product_id = review.product_id
    this.variant_id = review.variant_id
    this.user_id = review.user_id
    this.rating = review.rating
    this.comment = review.comment
    this.images = review.images || []
    this.is_verified_purchase = review.is_verified_purchase || false
    this.order_id = review.order_id
    this.status = review.status || ReviewStatus.PENDING
    this.helpful_count = review.helpful_count || 0
    this.reported_count = review.reported_count || 0
    this.seller_response = review.seller_response
    this.created_at = review.created_at || new Date()
    this.updated_at = review.updated_at || new Date()
  }
}
