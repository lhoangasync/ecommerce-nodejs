import {
  AddProductReqBody,
  GetProductsParams,
  UpdateProductReqBody,
  VariantReqBody
} from '~/models/requests/Product.requests'
import databaseService from './database.services'
import Product from '~/models/schemas/Product.schema'
import { ObjectId } from 'mongodb'
import { PRODUCTS_MESSAGES } from '~/constants/messages'
import { escapeRegExp } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

class ProductsService {
  async checkSlugExist(slug: string) {
    const product = await databaseService.products.findOne({ slug })
    return Boolean(product)
  }

  async add(payload: AddProductReqBody) {
    // Validate variants
    if (!payload.variants || payload.variants.length === 0) {
      throw new Error(PRODUCTS_MESSAGES.VARIANTS_REQUIRED)
    }

    // Ensure variant IDs are unique
    const variantIds = payload.variants.map((v) => v.id)
    const uniqueIds = new Set(variantIds)
    if (variantIds.length !== uniqueIds.size) {
      throw new Error(PRODUCTS_MESSAGES.VARIANT_IDS_MUST_BE_UNIQUE)
    }

    // Check SKU uniqueness within variants
    const skus = payload.variants.map((v) => v.sku)
    const uniqueSkus = new Set(skus)
    if (skus.length !== uniqueSkus.size) {
      throw new Error(PRODUCTS_MESSAGES.VARIANT_SKUS_MUST_BE_UNIQUE)
    }

    const productData = {
      ...payload,
      brand_id: new ObjectId(payload.brand_id),
      category_id: new ObjectId(payload.category_id)
    }

    const product = new Product(productData)
    await databaseService.products.insertOne(product)
    return product
  }

  async getProducts({
    page,
    limit,
    name,
    brand_id,
    category_id,
    min_price,
    max_price,
    is_available,
    skin_type,
    origin,
    sort_by = 'created_at',
    order = 'desc'
  }: GetProductsParams) {
    const skip = (page - 1) * limit
    const pipeline: any[] = []

    // Match stage
    const matchConditions: any = {}

    if (name) {
      const escapedName = escapeRegExp(name.trim())
      matchConditions.name = { $regex: escapedName, $options: 'i' }
    }

    if (brand_id && ObjectId.isValid(brand_id)) {
      matchConditions.brand_id = new ObjectId(brand_id)
    }

    if (category_id && ObjectId.isValid(category_id)) {
      matchConditions.category_id = new ObjectId(category_id)
    }

    if (skin_type) {
      matchConditions.skin_type = { $in: [skin_type] }
    }

    if (origin) {
      matchConditions.origin = { $regex: escapeRegExp(origin.trim()), $options: 'i' }
    }

    // Price filter - check variants
    if (min_price !== undefined || max_price !== undefined) {
      const priceConditions: any = {}
      if (min_price !== undefined) priceConditions.$gte = min_price
      if (max_price !== undefined) priceConditions.$lte = max_price

      matchConditions['variants.price'] = priceConditions
    }

    // Availability filter - check if any variant is available
    if (is_available !== undefined) {
      if (is_available) {
        matchConditions['variants'] = {
          $elemMatch: {
            is_available: true,
            stock_quantity: { $gt: 0 }
          }
        }
      } else {
        matchConditions['variants'] = {
          $not: {
            $elemMatch: {
              is_available: true,
              stock_quantity: { $gt: 0 }
            }
          }
        }
      }
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions })
    }

    // Add computed fields for sorting
    pipeline.push({
      $addFields: {
        min_price: { $min: '$variants.price' },
        max_price: { $max: '$variants.price' },
        total_stock: { $sum: '$variants.stock_quantity' },
        is_in_stock: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: '$variants',
                  cond: {
                    $and: [{ $eq: ['$$this.is_available', true] }, { $gt: ['$$this.stock_quantity', 0] }]
                  }
                }
              }
            },
            0
          ]
        }
      }
    })

    // Lookup stages for brand and category
    pipeline.push(
      {
        $lookup: {
          from: 'brands',
          localField: 'brand_id',
          foreignField: '_id',
          as: 'brand'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          brand: { $arrayElemAt: ['$brand', 0] },
          category: { $arrayElemAt: ['$category', 0] }
        }
      }
    )

    // Sort stage
    const sortDirection = order === 'asc' ? 1 : -1
    const sortStage: any = {}

    switch (sort_by) {
      case 'price':
        sortStage.min_price = sortDirection
        break
      case 'rating':
        sortStage.rating = sortDirection
        break
      case 'name':
        sortStage.name = sortDirection
        break
      default:
        sortStage.created_at = sortDirection
    }

    pipeline.push({ $sort: sortStage })

    // Facet stage for pagination
    pipeline.push({
      $facet: {
        items: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    })

    const result = await databaseService.products.aggregate(pipeline).toArray()

    const items = result[0]?.items || []
    const totalItems = result[0]?.totalCount[0]?.count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      items,
      totalItems,
      totalPages
    }
  }
  async getProductById(identifier: string) {
    // Kiểm tra xem identifier có phải là ObjectId hợp lệ không
    // ObjectId phải là chuỗi 24 ký tự hex VÀ phải valid theo MongoDB
    const isObjectId = ObjectId.isValid(identifier) && /^[0-9a-fA-F]{24}$/.test(identifier)

    const matchCondition = isObjectId ? { _id: new ObjectId(identifier) } : { slug: identifier }

    const product = await databaseService.products
      .aggregate([
        {
          $match: matchCondition
        },
        {
          $lookup: {
            from: 'brands',
            localField: 'brand_id',
            foreignField: '_id',
            as: 'brand'
          }
        },
        {
          $unwind: {
            path: '$brand',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray()

    if (product.length === 0) {
      return {
        message: PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND
      }
    }

    return product[0]
  }

  async updateProduct(product_id: string, payload: UpdateProductReqBody) {
    const updateData: any = { ...payload }

    // Convert string IDs to ObjectId if provided
    if (payload.brand_id) {
      updateData.brand_id = new ObjectId(payload.brand_id)
    }
    if (payload.category_id) {
      updateData.category_id = new ObjectId(payload.category_id)
    }

    // Validate variants if provided
    if (payload.variants) {
      // Ensure variant IDs are unique
      const variantIds = payload.variants.map((v) => v.id)
      const uniqueIds = new Set(variantIds)
      if (variantIds.length !== uniqueIds.size) {
        throw new Error(PRODUCTS_MESSAGES.VARIANT_IDS_MUST_BE_UNIQUE)
      }

      // Check SKU uniqueness within variants
      const skus = payload.variants.map((v) => v.sku)
      const uniqueSkus = new Set(skus)
      if (skus.length !== uniqueSkus.size) {
        throw new Error(PRODUCTS_MESSAGES.VARIANT_SKUS_MUST_BE_UNIQUE)
      }
    }

    const product = await databaseService.products.findOneAndUpdate(
      { _id: new ObjectId(product_id) },
      {
        $set: updateData,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return product as Product
  }

  async deleteProduct(product_id: string) {
    const deletedProduct = await databaseService.products.findOneAndDelete({
      _id: new ObjectId(product_id)
    })

    if (!deletedProduct) {
      return {
        message: PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND
      }
    }

    return {
      message: PRODUCTS_MESSAGES.DELETE_PRODUCT_SUCCESS
    }
  }

  // Variant-specific methods
  async addVariant(product_id: string, variantData: VariantReqBody) {
    // Check if variant ID already exists in this product
    const product = await databaseService.products.findOne({
      _id: new ObjectId(product_id),
      'variants.id': variantData.id
    })

    if (product) {
      throw new Error(PRODUCTS_MESSAGES.VARIANT_ID_ALREADY_EXISTS)
    }

    // Check if SKU already exists in this product
    const productWithSku = await databaseService.products.findOne({
      _id: new ObjectId(product_id),
      'variants.sku': variantData.sku
    })

    if (productWithSku) {
      throw new Error(PRODUCTS_MESSAGES.VARIANT_SKU_ALREADY_EXISTS)
    }

    const updatedProduct = await databaseService.products.findOneAndUpdate(
      { _id: new ObjectId(product_id) },
      {
        $push: { variants: variantData },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    return updatedProduct
  }

  async updateVariant(product_id: string, variant_id: string, variantData: Partial<VariantReqBody>) {
    const updateFields: any = {}

    // Build update fields with proper dot notation
    Object.keys(variantData).forEach((key) => {
      updateFields[`variants.$.${key}`] = variantData[key as keyof VariantReqBody]
    })

    const updatedProduct = await databaseService.products.findOneAndUpdate(
      {
        _id: new ObjectId(product_id),
        'variants.id': variant_id
      },
      {
        $set: updateFields,
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    if (!updatedProduct) {
      throw new Error(PRODUCTS_MESSAGES.VARIANT_NOT_FOUND)
    }

    return updatedProduct
  }

  async deleteVariant(product_id: string, variant_id: string) {
    const product = await databaseService.products.findOne({ _id: new ObjectId(product_id) })

    if (!product) {
      throw new Error(PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND)
    }

    // Check if this is the last variant
    if (product.variants.length <= 1) {
      throw new Error(PRODUCTS_MESSAGES.CANNOT_DELETE_LAST_VARIANT)
    }

    const updatedProduct = await databaseService.products.findOneAndUpdate(
      { _id: new ObjectId(product_id) },
      {
        $pull: { variants: { id: variant_id } },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    return updatedProduct
  }

  async updateVariantStock(product_id: string, variant_id: string, quantity: number) {
    const updatedProduct = await databaseService.products.findOneAndUpdate(
      {
        _id: new ObjectId(product_id),
        'variants.id': variant_id
      },
      {
        $inc: { 'variants.$.stock_quantity': quantity },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    if (!updatedProduct) {
      throw new Error(PRODUCTS_MESSAGES.VARIANT_NOT_FOUND)
    }

    return updatedProduct
  }

  async updateRating(product_id: string, rating: number, review_count: number) {
    const product = await databaseService.products.findOneAndUpdate(
      { _id: new ObjectId(product_id) },
      {
        $set: {
          rating,
          review_count
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )
    return product
  }

  async getProductsByBrand(brand_id: string, limit: number = 10) {
    const pipeline = [
      {
        $match: {
          brand_id: new ObjectId(brand_id),
          variants: {
            $elemMatch: {
              is_available: true,
              stock_quantity: { $gt: 0 }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand_id',
          foreignField: '_id',
          as: 'brand'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          brand: { $arrayElemAt: ['$brand', 0] },
          category: { $arrayElemAt: ['$category', 0] }
        }
      },
      { $sort: { created_at: -1 } },
      { $limit: limit }
    ]

    return await databaseService.products.aggregate(pipeline).toArray()
  }

  async getProductsByCategory(category_id: string, limit: number = 10) {
    const pipeline = [
      {
        $match: {
          category_id: new ObjectId(category_id),
          variants: {
            $elemMatch: {
              is_available: true,
              stock_quantity: { $gt: 0 }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand_id',
          foreignField: '_id',
          as: 'brand'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          brand: { $arrayElemAt: ['$brand', 0] },
          category: { $arrayElemAt: ['$category', 0] }
        }
      },
      { $sort: { created_at: -1 } },
      { $limit: limit }
    ]

    return await databaseService.products.aggregate(pipeline).toArray()
  }

  async getFeaturedProducts(limit: number = 10) {
    const pipeline = [
      {
        $match: {
          rating: { $gte: 4.0 },
          variants: {
            $elemMatch: {
              is_available: true,
              stock_quantity: { $gt: 0 }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand_id',
          foreignField: '_id',
          as: 'brand'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          brand: { $arrayElemAt: ['$brand', 0] },
          category: { $arrayElemAt: ['$category', 0] }
        }
      },
      { $sort: { rating: -1, review_count: -1 } },
      { $limit: limit }
    ]

    return await databaseService.products.aggregate(pipeline).toArray()
  }

  // Helper method to get variant by ID
  async getVariant(product_id: string, variant_id: string) {
    const product = await databaseService.products.findOne({
      _id: new ObjectId(product_id)
    })

    if (!product) {
      throw new Error(PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND)
    }

    const variant = product.variants.find((v) => v.id === variant_id)
    if (!variant) {
      throw new Error(PRODUCTS_MESSAGES.VARIANT_NOT_FOUND)
    }

    return { product, variant }
  }
}

const productsService = new ProductsService()
export default productsService
