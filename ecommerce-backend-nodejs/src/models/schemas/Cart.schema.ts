import { ObjectId } from 'mongodb'

export interface ICartItem {
  product_id: string
  variant_id: string
  quantity: number
  price: number
  added_at?: Date
}

export interface ICart {
  _id?: ObjectId
  user_id?: ObjectId
  items: ICartItem[]
  session_id?: string // For guest carts
  created_at?: Date
  updated_at?: Date
}

export class Cart {
  _id: ObjectId
  user_id?: ObjectId
  items: ICartItem[]
  session_id?: string
  created_at: Date
  updated_at: Date

  constructor(cart: ICart) {
    const date = new Date()
    this._id = cart._id || new ObjectId()
    this.user_id = cart.user_id
    this.items = cart.items || []
    this.session_id = cart.session_id
    this.created_at = cart.created_at || date
    this.updated_at = cart.updated_at || date
  }
}
