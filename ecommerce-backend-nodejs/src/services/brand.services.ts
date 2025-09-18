import { AddBrandReqBody, GetBrandsParams, UpdateBrandReqBody } from '~/models/requests/Brand.requests'
import databaseService from './database.services'
import Brand from '~/models/schemas/Brand.schema'
import { ObjectId } from 'mongodb'
import { BRANDS_MESSAGES } from '~/constants/messages'
import { escapeRegExp } from 'lodash'

class BrandsService {
  async checkSlugExist(slug: string) {
    const user = await databaseService.brands.findOne({ slug })
    return Boolean(user)
  }

  async add(payload: AddBrandReqBody) {
    const brand = new Brand(payload)
    await databaseService.brands.insertOne(brand)
    return brand
  }

  async getBrands({ page, limit, name }: GetBrandsParams) {
    const skip = (page - 1) * limit

    const pipeline: any[] = []

    if (name) {
      const escapedName = escapeRegExp(name.trim())
      pipeline.push({
        $match: {
          name: { $regex: escapedName, $options: 'i' }
        }
      })
    }

    pipeline.push(
      {
        $sort: { created_at: -1 }
      },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }]
        }
      }
    )

    const result = await databaseService.brands.aggregate(pipeline).toArray()

    const items = result[0]?.items || []
    const totalItems = result[0]?.totalCount[0]?.count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      items,
      totalItems,
      totalPages
    }
  }

  async getBrandById(brand_id: string) {
    const res = await databaseService.brands.findOne({ _id: new ObjectId(brand_id) })
    if (!res) {
      return {
        message: BRANDS_MESSAGES.BRAND_NOT_FOUND
      }
    }
    return res
  }

  async deleteBrand(brand_id: string) {
    const deletedUser = await databaseService.brands.findOneAndDelete({
      _id: new ObjectId(brand_id)
    })

    if (!deletedUser) {
      return {
        message: BRANDS_MESSAGES.BRAND_NOT_FOUND
      }
    }

    return {
      message: BRANDS_MESSAGES.DELETE_BRAND_SUCCESS
    }
  }

  async updateBrand(brand_id: string, payload: UpdateBrandReqBody) {
    const brand = await databaseService.brands.findOneAndUpdate(
      {
        _id: new ObjectId(brand_id)
      },
      {
        $set: {
          ...payload
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return brand as Brand
  }
}

const brandsService = new BrandsService()
export default brandsService
