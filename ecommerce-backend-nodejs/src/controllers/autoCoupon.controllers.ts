import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { AUTO_COUPON_MESSAGES } from '~/constants/messages'
import { CreateAutoCouponRuleReqBody, RuleIdParams } from '~/models/requests/AutoCoupon.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import autoCouponService from '~/services/autocoupon.services'

export const createAutoCouponRuleController = async (
  req: Request<ParamsDictionary, any, CreateAutoCouponRuleReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await autoCouponService.createRule({
    ...req.body,
    created_by: user_id
  })

  return res.json({
    status: HTTP_STATUS.CREATED,
    message: AUTO_COUPON_MESSAGES.CREATE_RULE_SUCCESS,
    data: result
  })
}

export const getAutoCouponRulesController = async (req: Request, res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const result = await autoCouponService.getRules({ page, limit })

  return res.json({
    status: HTTP_STATUS.OK,
    message: AUTO_COUPON_MESSAGES.GET_RULES_SUCCESS,
    data: {
      items: result.items,
      meta: {
        page,
        limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      }
    }
  })
}

export const getAutoCouponRuleByIdController = async (
  req: Request<RuleIdParams>,
  res: Response,
  next: NextFunction
) => {
  const { rule_id } = req.params
  const result = await autoCouponService.getRuleById(rule_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: AUTO_COUPON_MESSAGES.GET_RULE_SUCCESS,
    data: result
  })
}

export const updateAutoCouponRuleController = async (
  req: Request<RuleIdParams, any, Partial<CreateAutoCouponRuleReqBody>>,
  res: Response,
  next: NextFunction
) => {
  const { rule_id } = req.params
  const result = await autoCouponService.updateRule(rule_id, req.body)

  return res.json({
    status: HTTP_STATUS.OK,
    message: AUTO_COUPON_MESSAGES.UPDATE_RULE_SUCCESS,
    data: result
  })
}

export const deleteAutoCouponRuleController = async (req: Request<RuleIdParams>, res: Response, next: NextFunction) => {
  const { rule_id } = req.params
  await autoCouponService.deleteRule(rule_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: AUTO_COUPON_MESSAGES.DELETE_RULE_SUCCESS,
    data: null
  })
}
// Trong autoCoupon.controllers.ts
export const getUserAutoCouponsController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  console.log('🔍 getUserAutoCoupons called for user_id:', user_id)

  const result = await autoCouponService.getUserAutoCoupons(user_id)

  console.log('📦 Result from service:', result)
  console.log('📊 Number of coupons:', result.length)

  return res.json({
    status: HTTP_STATUS.OK,
    message: AUTO_COUPON_MESSAGES.GET_USER_AUTO_COUPONS_SUCCESS,
    data: result
  })
}
