import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { REVIEWS_MESSAGES } from '~/constants/messages'
import {
  CreateReviewReqBody,
  GetReviewsQuery,
  SellerResponseReqBody,
  UpdateReviewReqBody
} from '~/models/requests/Review.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import reviewsService from '~/services/review.services'
import { wsService } from '~/index' // Import wsService

// Create new review
export const createReviewController = async (
  req: Request<ParamsDictionary, any, CreateReviewReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const payload = {
    ...req.body,
    user_id
  }

  const result = await reviewsService.createReview(payload)

  // Emit to admins about new pending review
  wsService.getIO().to('admin').emit('review:pending', {
    review_id: result._id,
    product_id: result.product_id,
    user_id: result.user_id,
    rating: result.rating
  })

  return res.status(HTTP_STATUS.CREATED).json({
    status: HTTP_STATUS.CREATED,
    message: REVIEWS_MESSAGES.CREATE_REVIEW_SUCCESS,
    data: result
  })
}

// Get reviews with filters and pagination
export const getReviewsController = async (
  req: Request<ParamsDictionary, any, any, GetReviewsQuery>,
  res: Response
) => {
  const {
    product_id,
    user_id,
    rating,
    status,
    is_verified_purchase,
    page = '1',
    limit = '10',
    sort_by = 'created_at',
    order = 'desc'
  } = req.query

  const params = {
    product_id,
    user_id,
    rating: rating ? Number(rating) : undefined,
    status: status as any,
    is_verified_purchase: is_verified_purchase === 'true' ? true : is_verified_purchase === 'false' ? false : undefined,
    page: Number(page),
    limit: Number(limit),
    sort_by,
    order
  }

  const result = await reviewsService.getReviews(params)

  return res.json({
    status: HTTP_STATUS.OK,
    message: REVIEWS_MESSAGES.GET_REVIEWS_SUCCESS,
    data: {
      items: result.items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        totalItems: result.totalItems,
        totalPages: result.totalPages
      }
    }
  })
}
// Get review by ID
export const getReviewByIdController = async (req: Request, res: Response) => {
  const { review_id } = req.params
  const result = await reviewsService.getReviewById(review_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: REVIEWS_MESSAGES.GET_REVIEW_SUCCESS,
    data: result
  })
}

// Update review
export const updateReviewController = async (
  req: Request<ParamsDictionary, any, UpdateReviewReqBody>,
  res: Response
) => {
  const { review_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await reviewsService.updateReview(review_id, user_id, req.body)

  // Emit review updated to product room
  wsService.getIO().to(`product:${result.product_id.toString()}`).emit('review:updated', result)

  return res.json({
    status: HTTP_STATUS.OK,
    message: REVIEWS_MESSAGES.UPDATE_REVIEW_SUCCESS,
    data: result
  })
}

// Delete review
export const deleteReviewController = async (req: Request, res: Response) => {
  const { review_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload

  const deletedReview = await reviewsService.deleteReview(review_id, user_id)

  // Emit review deleted to product room
  wsService.getIO().to(`product:${deletedReview.product_id.toString()}`).emit('review:deleted', {
    review_id: deletedReview._id
  })

  // Update rating stats after deletion
  const stats = await reviewsService.getRatingStats(deletedReview.product_id.toString())
  wsService.emitRatingUpdated(deletedReview.product_id.toString(), stats)

  return res.json({
    status: HTTP_STATUS.OK,
    message: REVIEWS_MESSAGES.DELETE_REVIEW_SUCCESS,
    data: null
  })
}

// Approve review (Admin only)
export const approveReviewController = async (req: Request, res: Response) => {
  const { review_id } = req.params
  const result = await reviewsService.approveReview(review_id)

  // Emit new approved review to all users in product room
  wsService.emitReviewApproved(result.product_id.toString(), result)

  // Update rating stats
  const stats = await reviewsService.getRatingStats(result.product_id.toString())
  wsService.emitRatingUpdated(result.product_id.toString(), stats)

  return res.json({
    status: HTTP_STATUS.OK,
    message: REVIEWS_MESSAGES.APPROVE_REVIEW_SUCCESS,
    data: result
  })
}

// Reject review (Admin only)
export const rejectReviewController = async (req: Request, res: Response) => {
  const { review_id } = req.params
  const result = await reviewsService.rejectReview(review_id)

  // Notify about rejection
  wsService.getIO().emit('review:rejected', {
    review_id: result._id
  })

  return res.json({
    status: HTTP_STATUS.OK,
    message: REVIEWS_MESSAGES.REJECT_REVIEW_SUCCESS,
    data: result
  })
}

// Mark review as helpful
export const markHelpfulController = async (req: Request, res: Response) => {
  const { review_id } = req.params
  const result = await reviewsService.markHelpful(review_id)

  // Broadcast to all users in product room
  wsService.getIO().to(`product:${result.product_id.toString()}`).emit('review:updated', {
    review_id: result._id,
    helpful_count: result.helpful_count
  })

  return res.json({
    status: HTTP_STATUS.OK,
    message: REVIEWS_MESSAGES.MARK_HELPFUL_SUCCESS,
    data: result
  })
}

// Report review
export const reportReviewController = async (req: Request, res: Response) => {
  const { review_id } = req.params
  const result = await reviewsService.reportReview(review_id)

  // Notify admins
  wsService.getIO().to('admin').emit('review:reported', {
    review_id: result._id,
    reported_count: result.reported_count
  })

  return res.json({
    status: HTTP_STATUS.OK,
    message: REVIEWS_MESSAGES.REPORT_REVIEW_SUCCESS,
    data: result
  })
}

// Add seller response
export const addSellerResponseController = async (
  req: Request<ParamsDictionary, any, SellerResponseReqBody>,
  res: Response
) => {
  const { review_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const { message } = req.body

  const result = await reviewsService.addSellerResponse(review_id, user_id, message)

  // Broadcast seller response to product room
  wsService.getIO().to(`product:${result.product_id.toString()}`).emit('review:response', {
    review_id: result._id,
    response: result.seller_response
  })

  return res.json({
    status: HTTP_STATUS.OK,
    message: REVIEWS_MESSAGES.ADD_SELLER_RESPONSE_SUCCESS,
    data: result
  })
}

// Get rating statistics for a product
export const getRatingStatsController = async (req: Request, res: Response) => {
  const { product_id } = req.params
  const result = await reviewsService.getRatingStats(product_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: REVIEWS_MESSAGES.GET_RATING_STATS_SUCCESS,
    data: result
  })
}
