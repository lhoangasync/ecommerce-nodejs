import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { CART_MESSAGES } from '~/constants/messages'
import {
  AddToCartReqBody,
  GetCartReqQuery,
  MigrateCartReqBody,
  RemoveFromCartReqParams,
  UpdateCartItemReqBody,
  UpdateCartItemReqParams
} from '~/models/requests/Cart.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import cartService from '~/services/cart.services'

export const addToCartController = async (
  req: Request<any, any, AddToCartReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { product_id, variant_id, quantity } = req.body
  const user_id = (req.decoded_authorization as TokenPayload)?.user_id
  const session_id = req.headers['x-session-id'] as string

  const cart = await cartService.addToCart(user_id, session_id, {
    product_id,
    variant_id,
    quantity,
    price: 0 // Will be set by service
  })

  return res.json({
    status: HTTP_STATUS.OK,
    message: CART_MESSAGES.ADD_TO_CART_SUCCESS,
    data: cart
  })
}

export const getCartController = async (
  req: Request<any, any, any, GetCartReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const user_id = (req.decoded_authorization as TokenPayload)?.user_id
  const session_id = (req.query.session_id as string) || (req.headers['x-session-id'] as string)

  const cart = await cartService.getCart(user_id, session_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: CART_MESSAGES.GET_CART_SUCCESS,
    data: cart
  })
}

export const updateCartItemController = async (
  req: Request<UpdateCartItemReqParams, any, UpdateCartItemReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { product_id, variant_id } = req.params
  const { quantity } = req.body
  const user_id = (req.decoded_authorization as TokenPayload)?.user_id
  const session_id = req.headers['x-session-id'] as string

  const cart = await cartService.updateCartItem(user_id, session_id, product_id, variant_id, quantity)

  return res.json({
    status: HTTP_STATUS.OK,
    message: CART_MESSAGES.UPDATE_CART_SUCCESS,
    data: cart
  })
}

export const removeFromCartController = async (
  req: Request<RemoveFromCartReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { product_id, variant_id } = req.params
  const user_id = (req.decoded_authorization as TokenPayload)?.user_id
  const session_id = req.headers['x-session-id'] as string

  const cart = await cartService.removeFromCart(user_id, session_id, product_id, variant_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: CART_MESSAGES.REMOVE_FROM_CART_SUCCESS,
    data: cart
  })
}

export const clearCartController = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = (req.decoded_authorization as TokenPayload)?.user_id
  const session_id = req.headers['x-session-id'] as string

  const result = await cartService.clearCart(user_id, session_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: result.message,
    data: null
  })
}

export const migrateCartController = async (
  req: Request<any, any, MigrateCartReqBody>,
  res: Response,
  next: NextFunction
) => {
  const user_id = (req.decoded_authorization as TokenPayload)?.user_id
  const { session_id } = req.body

  if (!user_id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: 'User must be logged in to migrate cart',
      data: null
    })
  }

  const result = await cartService.migrateGuestCart(user_id, session_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: result.message,
    data: null
  })
}
