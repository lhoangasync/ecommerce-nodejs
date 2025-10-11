import { config } from 'dotenv'
import { Collection, Db, MongoClient } from 'mongodb'
import Brand from '~/models/schemas/Brand.schema'
import { Cart } from '~/models/schemas/Cart.schema'
import Category from '~/models/schemas/Category.schema'
import Product from '~/models/schemas/Product.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/User.schema'
config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cosmetic.mdo9nye.mongodb.net/`
class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection<User>(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection<RefreshToken>(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get brands(): Collection<Brand> {
    return this.db.collection<Brand>(process.env.DB_BRANDS_COLLECTION as string)
  }
  get carts(): Collection<Cart> {
    return this.db.collection<Cart>(process.env.DB_CARTS_COLLECTION as string)
  }
  get categories(): Collection<Category> {
    return this.db.collection<Category>(process.env.DB_CATEGORIES_COLLECTION as string)
  }
  get products(): Collection<Product> {
    return this.db.collection<Product>(process.env.DB_PRODUCTS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
