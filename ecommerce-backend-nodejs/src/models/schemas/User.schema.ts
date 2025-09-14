import { ObjectId } from 'mongodb'
import { UserRoles, UserVerifyStatus } from '~/constants/enums'

interface IUser {
  _id?: ObjectId
  name: string
  email: string
  password: string
  role: UserRoles

  address?: string
  username?: string
  avatar?: string
  phone?: string

  forgot_password_token?: string
  email_verify_token?: string
  verify?: UserVerifyStatus

  created_at?: Date
  updated_at?: Date
}

export default class User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  role: UserRoles

  address: string
  username: string
  avatar: string
  phone: string

  forgot_password_token: string // jwt or ''
  email_verify_token: string // jwt or ''
  verify: UserVerifyStatus

  created_at: Date
  updated_at: Date

  constructor(user: IUser) {
    const date = new Date()
    this._id = user._id
    this.name = user.name
    this.email = user.email
    this.password = user.password
    this.role = user.role || UserRoles.USER

    this.address = user.address || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.phone = user.phone || ''

    this.forgot_password_token = user.forgot_password_token || ''
    this.email_verify_token = user.email_verify_token || ''
    this.verify = user.verify || UserVerifyStatus.UNVERIFIED

    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
  }
}
