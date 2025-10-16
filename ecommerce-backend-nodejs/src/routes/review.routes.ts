import { Router } from 'express'
import {
  createReviewController,
  getReviewsController,
  getReviewByIdController,
  updateReviewController,
  deleteReviewController,
  approveReviewController,
  rejectReviewController,
  markHelpfulController,
  reportReviewController,
  addSellerResponseController,
  getRatingStatsController
} from '~/controllers/reviews.controllers'
import {
  reviewIdValidator,
  createReviewValidator,
  updateReviewValidator,
  getReviewsValidator,
  sellerResponseValidator,
  productIdParamValidator
} from '~/middlewares/reviews.middlewares'
import { accessTokenValidator, checkRoleValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const reviewsRouter = Router()

// Public routes - no authentication required
reviewsRouter.get('/', getReviewsValidator, wrapRequestHandler(getReviewsController))

reviewsRouter.get('/:review_id', reviewIdValidator, wrapRequestHandler(getReviewByIdController))

reviewsRouter.get('/products/:product_id/stats', productIdParamValidator, wrapRequestHandler(getRatingStatsController))

// Protected routes - authentication required
reviewsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createReviewValidator,
  wrapRequestHandler(createReviewController)
)

reviewsRouter.patch(
  '/:review_id',
  accessTokenValidator,
  verifiedUserValidator,
  updateReviewValidator,
  wrapRequestHandler(updateReviewController)
)

reviewsRouter.delete(
  '/:review_id',
  accessTokenValidator,
  verifiedUserValidator,
  reviewIdValidator,
  wrapRequestHandler(deleteReviewController)
)

reviewsRouter.post(
  '/:review_id/helpful',
  accessTokenValidator,
  verifiedUserValidator,
  reviewIdValidator,
  wrapRequestHandler(markHelpfulController)
)

reviewsRouter.post(
  '/:review_id/report',
  accessTokenValidator,
  verifiedUserValidator,
  reviewIdValidator,
  wrapRequestHandler(reportReviewController)
)

// Seller response route
reviewsRouter.post(
  '/:review_id/response',
  accessTokenValidator,
  verifiedUserValidator,
  sellerResponseValidator,
  wrapRequestHandler(addSellerResponseController)
)

// Admin only routes
reviewsRouter.patch(
  '/:review_id/approve',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  reviewIdValidator,
  wrapRequestHandler(approveReviewController)
)

reviewsRouter.patch(
  '/:review_id/reject',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  reviewIdValidator,
  wrapRequestHandler(rejectReviewController)
)

export default reviewsRouter
