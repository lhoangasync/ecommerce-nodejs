import { Router } from 'express'
import {
  createAutoCouponRuleController,
  deleteAutoCouponRuleController,
  getAutoCouponRuleByIdController,
  getAutoCouponRulesController,
  getUserAutoCouponsController,
  updateAutoCouponRuleController
} from '~/controllers/autoCoupon.controllers'
import {
  createAutoCouponRuleValidator,
  ruleIdValidator,
  updateAutoCouponRuleValidator
} from '~/middlewares/autoCoupon.middlewares'
import {
  accessTokenValidator,
  checkRoleValidator,
  paginateValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const autoCouponRouter = Router()

// Admin routes
autoCouponRouter.post(
  '/rules',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator, // Admin only
  createAutoCouponRuleValidator,
  wrapRequestHandler(createAutoCouponRuleController)
)

autoCouponRouter.get(
  '/rules',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  paginateValidator,
  wrapRequestHandler(getAutoCouponRulesController)
)

autoCouponRouter.get(
  '/rules/:rule_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  ruleIdValidator,
  wrapRequestHandler(getAutoCouponRuleByIdController)
)

autoCouponRouter.patch(
  '/rules/:rule_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  ruleIdValidator,
  updateAutoCouponRuleValidator,
  wrapRequestHandler(updateAutoCouponRuleController)
)

autoCouponRouter.delete(
  '/rules/:rule_id',
  accessTokenValidator,
  verifiedUserValidator,
  checkRoleValidator,
  ruleIdValidator,
  wrapRequestHandler(deleteAutoCouponRuleController)
)

// User routes - Xem coupon tự động đã nhận
autoCouponRouter.get(
  '/my-coupons',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getUserAutoCouponsController)
)

export default autoCouponRouter
