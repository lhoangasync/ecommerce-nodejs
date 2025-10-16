import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Review, { ReviewStatus, IReview } from '~/models/schemas/Review.schema'
import productsService from './product.services'
import { REVIEWS_MESSAGES } from '~/constants/messages'

interface CreateReviewPayload {
  product_id: string
  variant_id?: string
  user_id: string
  rating: number
  comment?: string
  images?: string[]
  is_verified_purchase?: boolean
  order_id?: string
}

interface GetReviewsParams {
  product_id?: string
  user_id?: string
  rating?: number
  status?: ReviewStatus
  is_verified_purchase?: boolean
  page: number
  limit: number
  sort_by?: 'created_at' | 'rating' | 'helpful_count'
  order?: 'asc' | 'desc'
}

class ReviewsService {
  // Tạo review mới
  // Tạo review mới
  // Tạo review mới
  async createReview(payload: CreateReviewPayload) {
    // Validate rating
    if (payload.rating < 1 || payload.rating > 5) {
      throw new Error(REVIEWS_MESSAGES.INVALID_RATING)
    }

    // Check if user already reviewed this product
    const existingReview = await databaseService.reviews.findOne({
      product_id: new ObjectId(payload.product_id),
      user_id: new ObjectId(payload.user_id)
    })

    if (existingReview) {
      throw new Error(REVIEWS_MESSAGES.ALREADY_REVIEWED)
    }

    // Create review with all required fields
    const reviewData: IReview = {
      product_id: new ObjectId(payload.product_id),
      user_id: new ObjectId(payload.user_id),
      variant_id: payload.variant_id,
      rating: payload.rating,
      comment: payload.comment,
      images: payload.images,
      is_verified_purchase: payload.is_verified_purchase || false,
      order_id: payload.order_id ? new ObjectId(payload.order_id) : undefined,
      status: ReviewStatus.PENDING,
      helpful_count: 0,
      reported_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    }

    const review = new Review(reviewData)
    await databaseService.reviews.insertOne(review)

    return review
  }

  // Approve review và update product rating
  async approveReview(review_id: string) {
    const review = await databaseService.reviews.findOneAndUpdate(
      { _id: new ObjectId(review_id) },
      {
        $set: { status: ReviewStatus.APPROVED },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    if (!review) {
      throw new Error(REVIEWS_MESSAGES.REVIEW_NOT_FOUND)
    }

    // Recalculate product rating
    await this.updateProductRating(review.product_id.toString())

    return review
  }

  // Lấy danh sách reviews với filter và pagination
  async getReviews(params: GetReviewsParams) {
    const {
      product_id,
      user_id,
      rating,
      status,
      is_verified_purchase,
      page,
      limit,
      sort_by = 'created_at',
      order = 'desc'
    } = params

    const skip = (page - 1) * limit
    const pipeline: any[] = []

    // Match stage
    const matchConditions: any = {}

    if (product_id && ObjectId.isValid(product_id)) {
      matchConditions.product_id = new ObjectId(product_id)
    }

    if (user_id && ObjectId.isValid(user_id)) {
      matchConditions.user_id = new ObjectId(user_id)
    }

    if (rating) {
      matchConditions.rating = rating
    }

    if (status) {
      matchConditions.status = status
    }

    if (is_verified_purchase !== undefined) {
      matchConditions.is_verified_purchase = is_verified_purchase
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions })
    }

    // Lookup user info
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          'user.password': 0,
          'user.email_verify_token': 0,
          'user.forgot_password_token': 0
        }
      }
    )

    // Sort
    const sortDirection = order === 'asc' ? 1 : -1
    const sortStage: any = { [sort_by]: sortDirection }
    pipeline.push({ $sort: sortStage })

    // Facet for pagination
    pipeline.push({
      $facet: {
        items: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    })

    const result = await databaseService.reviews.aggregate(pipeline).toArray()

    const items = result[0]?.items || []
    const totalItems = result[0]?.totalCount[0]?.count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      items,
      totalItems,
      totalPages
    }
  }

  // Lấy review theo ID
  async getReviewById(review_id: string) {
    const review = await databaseService.reviews
      .aggregate([
        {
          $match: { _id: new ObjectId(review_id) }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            'user.password': 0,
            'user.email_verify_token': 0,
            'user.forgot_password_token': 0
          }
        }
      ])
      .toArray()

    if (review.length === 0) {
      throw new Error(REVIEWS_MESSAGES.REVIEW_NOT_FOUND)
    }

    return review[0]
  }

  // Update review
  async updateReview(review_id: string, user_id: string, payload: Partial<CreateReviewPayload>) {
    // Validate rating if provided
    if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
      throw new Error(REVIEWS_MESSAGES.INVALID_RATING)
    }

    // Transform payload to match Review schema
    const updateData: any = {
      status: ReviewStatus.PENDING // Reset về pending khi edit
    }

    // Only include fields that are actually provided
    if (payload.rating !== undefined) updateData.rating = payload.rating
    if (payload.comment !== undefined) updateData.comment = payload.comment
    if (payload.images !== undefined) updateData.images = payload.images
    if (payload.is_verified_purchase !== undefined) updateData.is_verified_purchase = payload.is_verified_purchase
    if (payload.variant_id !== undefined) updateData.variant_id = payload.variant_id

    // Convert string IDs to ObjectId if provided
    if (payload.product_id) updateData.product_id = new ObjectId(payload.product_id)
    if (payload.order_id) updateData.order_id = new ObjectId(payload.order_id)

    const review = await databaseService.reviews.findOneAndUpdate(
      {
        _id: new ObjectId(review_id),
        user_id: new ObjectId(user_id) // Chỉ chủ review mới được update
      },
      {
        $set: updateData,
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    if (!review) {
      throw new Error(REVIEWS_MESSAGES.REVIEW_NOT_FOUND_OR_UNAUTHORIZED)
    }

    return review
  }
  // Delete review
  async deleteReview(review_id: string, user_id: string) {
    const review = await databaseService.reviews.findOneAndDelete({
      _id: new ObjectId(review_id),
      user_id: new ObjectId(user_id)
    })

    if (!review) {
      throw new Error(REVIEWS_MESSAGES.REVIEW_NOT_FOUND_OR_UNAUTHORIZED)
    }

    // Recalculate product rating
    if (review.status === ReviewStatus.APPROVED) {
      await this.updateProductRating(review.product_id.toString())
    }

    return review
  }

  // Mark review as helpful
  async markHelpful(review_id: string) {
    const review = await databaseService.reviews.findOneAndUpdate(
      { _id: new ObjectId(review_id) },
      {
        $inc: { helpful_count: 1 },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    if (!review) {
      throw new Error(REVIEWS_MESSAGES.REVIEW_NOT_FOUND)
    }

    return review
  }

  // Report review
  async reportReview(review_id: string) {
    const review = await databaseService.reviews.findOneAndUpdate(
      { _id: new ObjectId(review_id) },
      {
        $inc: { reported_count: 1 },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    if (!review) {
      throw new Error(REVIEWS_MESSAGES.REVIEW_NOT_FOUND)
    }

    // Auto hide if too many reports
    if (review.reported_count >= 5) {
      await this.rejectReview(review_id)
    }

    return review
  }

  // Seller response to review
  async addSellerResponse(review_id: string, seller_id: string, message: string) {
    const review = await databaseService.reviews.findOneAndUpdate(
      { _id: new ObjectId(review_id) },
      {
        $set: {
          seller_response: {
            user_id: new ObjectId(seller_id),
            message,
            created_at: new Date()
          }
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    if (!review) {
      throw new Error(REVIEWS_MESSAGES.REVIEW_NOT_FOUND)
    }

    return review
  }

  // Reject review
  async rejectReview(review_id: string) {
    const review = await databaseService.reviews.findOneAndUpdate(
      { _id: new ObjectId(review_id) },
      {
        $set: { status: ReviewStatus.REJECTED },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    if (!review) {
      throw new Error(REVIEWS_MESSAGES.REVIEW_NOT_FOUND)
    }

    // Recalculate product rating
    await this.updateProductRating(review.product_id.toString())

    return review
  }

  // Calculate and update product rating
  async updateProductRating(product_id: string) {
    const stats = await databaseService.reviews
      .aggregate([
        {
          $match: {
            product_id: new ObjectId(product_id),
            status: ReviewStatus.APPROVED
          }
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const avgRating = stats[0]?.avgRating || 0
    const reviewCount = stats[0]?.count || 0

    await productsService.updateRating(
      product_id,
      Math.round(avgRating * 10) / 10, // Round to 1 decimal
      reviewCount
    )

    return { avgRating, reviewCount }
  }

  // Get rating statistics for a product
  async getRatingStats(product_id: string) {
    const stats = await databaseService.reviews
      .aggregate([
        {
          $match: {
            product_id: new ObjectId(product_id),
            status: ReviewStatus.APPROVED
          }
        },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: -1 }
        }
      ])
      .toArray()

    // Format: { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
    const ratingDistribution: any = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let totalReviews = 0

    stats.forEach((stat) => {
      ratingDistribution[stat._id] = stat.count
      totalReviews += stat.count
    })

    return {
      distribution: ratingDistribution,
      totalReviews,
      averageRating: await this.getAverageRating(product_id)
    }
  }

  private async getAverageRating(product_id: string) {
    const result = await databaseService.reviews
      .aggregate([
        {
          $match: {
            product_id: new ObjectId(product_id),
            status: ReviewStatus.APPROVED
          }
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' }
          }
        }
      ])
      .toArray()

    return result[0]?.avgRating || 0
  }
}

const reviewsService = new ReviewsService()
export default reviewsService
