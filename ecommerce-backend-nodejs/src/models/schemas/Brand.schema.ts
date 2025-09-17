import { ObjectId } from 'mongodb'

interface IBrand {
  _id?: ObjectId
  name: string
  slug: string
  country?: string
  desc?: string
  img?: string
  created_at?: Date
  updated_at?: Date
}

export default class Brand {
  _id?: ObjectId
  name: string
  slug: string
  country: string
  desc: string
  img: string
  created_at: Date
  updated_at: Date

  constructor(brand: IBrand) {
    const date = new Date()
    this._id = brand._id
    this.name = brand.name
    this.slug = brand.slug
    this.country = brand.country || ''
    this.desc = brand.desc || ''
    this.img = brand.img || ''
    this.created_at = brand.created_at || date
    this.updated_at = brand.updated_at || date
  }
}
