import { ObjectId } from 'mongodb'

interface IVariant {
  id: string // unique variant identifier
  shade_color?: string // màu sắc: đỏ, cam, nude,...
  volume_size?: string // dung tích: 10ml, 30ml, 100ml,...
  price: number // giá hiện tại (sau giảm giá)
  original_price?: number // giá gốc trước khi giảm (optional)
  sku: string // mã hàng tồn kho riêng cho biến thể
  images?: string[] // hình ảnh variant
  stock_quantity: number // số lượng tồn kho
  is_available: boolean // có sẵn hay không
}

interface IProduct {
  _id?: ObjectId
  name: string
  slug: string
  description?: string
  brand_id: ObjectId
  category_id: ObjectId

  // Thông tin mỹ phẩm
  ingredients?: string // thành phần
  skin_type?: string[] // loại da phù hợp: dầu, khô, nhạy cảm,...
  origin?: string // xuất xứ: Hàn, Nhật, Mỹ,...
  how_to_use?: string

  // Variants - một sản phẩm có nhiều biến thể
  variants: IVariant[]

  // Media & Info
  images?: string[] // hình ảnh chung của sản phẩm
  tags?: string[]

  // Business fields
  rating?: number
  review_count?: number
  created_at?: Date
  updated_at?: Date
}

export default class Product {
  _id?: ObjectId
  name: string
  slug: string
  description: string
  brand_id: ObjectId
  category_id: ObjectId

  // Thông tin mỹ phẩm
  ingredients: string
  skin_type: string[]
  origin: string
  how_to_use: string

  // Variants
  variants: IVariant[]

  // Media & Info
  images: string[]
  tags: string[]

  // Business fields
  rating: number
  review_count: number
  created_at: Date
  updated_at: Date

  constructor(product: IProduct) {
    const date = new Date()
    this._id = product._id
    this.name = product.name
    this.slug = product.slug
    this.description = product.description || ''
    this.brand_id = product.brand_id
    this.category_id = product.category_id

    // Thông tin mỹ phẩm
    this.ingredients = product.ingredients || ''
    this.skin_type = product.skin_type || []
    this.origin = product.origin || ''
    this.how_to_use = product.how_to_use || ''

    // Variants - bắt buộc phải có ít nhất 1 variant
    this.variants = product.variants || []

    // Media & Info
    this.images = product.images || []
    this.tags = product.tags || []

    // Business fields
    this.rating = product.rating || 0
    this.review_count = product.review_count || 0
    this.created_at = product.created_at || date
    this.updated_at = product.updated_at || date
  }

  getMinPrice(): number {
    if (this.variants.length === 0) return 0
    return Math.min(...this.variants.map((v) => v.price))
  }

  getMaxPrice(): number {
    if (this.variants.length === 0) return 0
    return Math.max(...this.variants.map((v) => v.price))
  }

  getMinOriginalPrice(): number {
    if (this.variants.length === 0) return 0
    const originalPrices = this.variants.map((v) => v.original_price || v.price).filter((p) => p > 0)
    return originalPrices.length > 0 ? Math.min(...originalPrices) : 0
  }

  getMaxOriginalPrice(): number {
    if (this.variants.length === 0) return 0
    const originalPrices = this.variants.map((v) => v.original_price || v.price).filter((p) => p > 0)
    return originalPrices.length > 0 ? Math.max(...originalPrices) : 0
  }

  getMaxDiscount(): number {
    if (this.variants.length === 0) return 0
    const discounts = this.variants
      .filter((v) => v.original_price && v.original_price > v.price)
      .map((v) => ((v.original_price! - v.price) / v.original_price!) * 100)
    return discounts.length > 0 ? Math.max(...discounts) : 0
  }

  getTotalStock(): number {
    return this.variants.reduce((total, variant) => total + variant.stock_quantity, 0)
  }

  isInStock(): boolean {
    return this.variants.some((variant) => variant.stock_quantity > 0 && variant.is_available)
  }

  hasDiscount(): boolean {
    return this.variants.some((v) => v.original_price && v.original_price > v.price)
  }
}

export { IVariant, IProduct }
