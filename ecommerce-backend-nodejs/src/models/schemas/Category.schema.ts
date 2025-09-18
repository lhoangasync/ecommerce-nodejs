import { ObjectId } from 'mongodb'

interface ICategory {
  _id?: ObjectId
  name: string
  slug: string
  img?: string
  created_at?: Date
  updated_at?: Date
}

export default class Category {
  _id?: ObjectId
  name: string
  slug: string
  img: string
  created_at: Date
  updated_at: Date

  constructor(brand: ICategory) {
    const date = new Date()
    this._id = brand._id
    this.name = brand.name
    this.slug = brand.slug
    this.img = brand.img || ''
    this.created_at = brand.created_at || date
    this.updated_at = brand.updated_at || date
  }
}
