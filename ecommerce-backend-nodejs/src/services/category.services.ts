import { escapeRegExp } from 'lodash'
import { AddCategoryReqBody, GetCategoriesParams, UpdateCategoryReqBody } from '~/models/requests/Category.requests'
import databaseService from './database.services'
import { CATEGORIES_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import Category from '~/models/schemas/Category.schema'

class CategoriesService {
  async checkSlugExist(slug: string) {
    const category = await databaseService.categories.findOne({ slug })
    return Boolean(category)
  }
  async getCategories({ page, limit, name }: GetCategoriesParams) {
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

    const result = await databaseService.categories.aggregate(pipeline).toArray()

    const items = result[0]?.items || []
    const totalItems = result[0]?.totalCount[0]?.count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      items,
      totalItems,
      totalPages
    }
  }

  async getCategoryById(category_id: string) {
    const res = await databaseService.categories.findOne({ _id: new ObjectId(category_id) })
    if (!res) {
      return {
        message: CATEGORIES_MESSAGES.CATEGORY_NOT_FOUND
      }
    }
    return res
  }

  async add(payload: AddCategoryReqBody) {
    const category = new Category(payload)
    await databaseService.categories.insertOne(category)
    return category
  }

  async deleteCategory(brand_id: string) {
    const deletedCategory = await databaseService.categories.findOneAndDelete({
      _id: new ObjectId(brand_id)
    })

    if (!deletedCategory) {
      return {
        message: CATEGORIES_MESSAGES.CATEGORY_NOT_FOUND
      }
    }

    return {
      message: CATEGORIES_MESSAGES.DELETE_CATEGORY_SUCCESS
    }
  }

  async updateCategory(category_id: string, payload: UpdateCategoryReqBody) {
    const category = await databaseService.categories.findOneAndUpdate(
      {
        _id: new ObjectId(category_id)
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
    return category as Category
  }
}

const categoriesService = new CategoriesService()
export default categoriesService
