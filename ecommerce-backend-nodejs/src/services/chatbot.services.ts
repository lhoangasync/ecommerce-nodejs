import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import geminiService from './gemini.services'

// Định nghĩa các skin concerns và keywords
const SKIN_CONCERNS = {
  acne: ['mụn', 'acne', 'trị mụn', 'mụn đầu đen', 'mụn ẩn', 'da mụn'],
  dry: ['khô', 'dry', 'da khô', 'thiếu ẩm', 'căng da'],
  oily: ['dầu', 'oily', 'da dầu', 'bóng dầu', 'nhờn'],
  sensitive: ['nhạy cảm', 'sensitive', 'kích ứng', 'đỏ da'],
  aging: ['lão hóa', 'aging', 'anti-aging', 'nếp nhăn', 'chống lão hóa', 'trẻ hóa'],
  dark_spots: ['thâm', 'nám', 'dark spots', 'tàn nhang', 'đốm đen', 'sạm da'],
  brightening: ['trắng da', 'brightening', 'sáng da', 'làm sáng', 'dưỡng trắng'],
  pores: ['lỗ chân lông', 'pores', 'se khít', 'thu nhỏ lỗ chân lông']
}

const PRODUCT_CATEGORIES_MAP = {
  cleanser: ['sữa rửa mặt', 'cleanser', 'tẩy trang', 'cleansing'],
  toner: ['toner', 'nước hoa hồng', 'nước cân bằng'],
  serum: ['serum', 'tinh chất'],
  moisturizer: ['kem dưỡng', 'moisturizer', 'dưỡng ẩm', 'cream'],
  sunscreen: ['kem chống nắng', 'sunscreen', 'spf'],
  mask: ['mặt nạ', 'mask'],
  eye_cream: ['kem mắt', 'eye cream', 'dưỡng mắt']
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ProductRecommendation {
  product: any
  score: number
  reason: string[]
}

class CosmeticChatbotService {
  // Phân tích tin nhắn của user để xác định nhu cầu (basic analysis)
  private analyzeUserMessageBasic(message: string): {
    skinConcerns: string[]
    skinType: string | null
    productType: string | null
    priceRange: { min?: number; max?: number } | null
  } {
    const lowerMessage = message.toLowerCase()
    const concerns: string[] = []
    let skinType: string | null = null
    let productType: string | null = null
    let priceRange: { min?: number; max?: number } | null = null

    // Detect skin concerns
    for (const [concern, keywords] of Object.entries(SKIN_CONCERNS)) {
      if (keywords.some((kw) => lowerMessage.includes(kw))) {
        concerns.push(concern)
      }
    }

    // Detect skin type
    if (lowerMessage.match(/da\s*(khô|dry)/i)) skinType = 'dry'
    else if (lowerMessage.match(/da\s*(dầu|oily)/i)) skinType = 'oily'
    else if (lowerMessage.match(/da\s*(hỗn hợp|combination)/i)) skinType = 'combination'
    else if (lowerMessage.match(/da\s*(nhạy cảm|sensitive)/i)) skinType = 'sensitive'
    else if (lowerMessage.match(/da\s*(thường|normal)/i)) skinType = 'normal'

    // Detect product type
    for (const [type, keywords] of Object.entries(PRODUCT_CATEGORIES_MAP)) {
      if (keywords.some((kw) => lowerMessage.includes(kw))) {
        productType = type
        break
      }
    }

    // Detect price range
    const priceMatch = lowerMessage.match(/(\d+)\s*k?\s*[-đến]+\s*(\d+)\s*k?/i)
    if (priceMatch) {
      const min = parseInt(priceMatch[1]) * (priceMatch[1].length <= 3 ? 1000 : 1)
      const max = parseInt(priceMatch[2]) * (priceMatch[2].length <= 3 ? 1000 : 1)
      priceRange = { min, max }
    } else {
      const underMatch = lowerMessage.match(/dưới\s*(\d+)\s*k?/i)
      if (underMatch) {
        priceRange = { max: parseInt(underMatch[1]) * 1000 }
      }
    }

    return { skinConcerns: concerns, skinType, productType, priceRange }
  }

  // Tính điểm phù hợp cho sản phẩm
  private calculateProductScore(
    product: any,
    analysis: {
      skinConcerns: string[]
      skinType: string | null
      productType: string | null
      priceRange: { min?: number; max?: number } | null
    }
  ): { score: number; reasons: string[] } {
    let score = 0
    const reasons: string[] = []

    // Check skin type match (20 points)
    if (analysis.skinType && product.skin_type?.includes(analysis.skinType)) {
      score += 20
      reasons.push(`Phù hợp với da ${analysis.skinType}`)
    }

    // Check skin concerns via tags/description (30 points)
    const productText = `${product.name} ${product.description} ${product.tags?.join(' ')}`.toLowerCase()
    let concernMatches = 0
    for (const concern of analysis.skinConcerns) {
      const keywords = SKIN_CONCERNS[concern as keyof typeof SKIN_CONCERNS]
      if (keywords.some((kw) => productText.includes(kw))) {
        concernMatches++
      }
    }
    if (concernMatches > 0) {
      const concernScore = Math.min(30, concernMatches * 15)
      score += concernScore
      reasons.push(`Giải quyết ${concernMatches} vấn đề về da`)
    }

    // Check category match (15 points)
    if (analysis.productType && product.category?.name) {
      const categoryKeywords = PRODUCT_CATEGORIES_MAP[analysis.productType as keyof typeof PRODUCT_CATEGORIES_MAP]
      if (categoryKeywords.some((kw) => product.category.name.toLowerCase().includes(kw))) {
        score += 15
        reasons.push('Đúng loại sản phẩm bạn tìm kiếm')
      }
    }

    // Check price range (10 points)
    const minPrice = Math.min(...product.variants.map((v: any) => v.price))
    if (analysis.priceRange) {
      if (
        (!analysis.priceRange.min || minPrice >= analysis.priceRange.min) &&
        (!analysis.priceRange.max || minPrice <= analysis.priceRange.max)
      ) {
        score += 10
        reasons.push('Trong tầm giá phù hợp')
      }
    }

    // Check rating (15 points)
    if (product.rating >= 4.5) {
      score += 15
      reasons.push(`Đánh giá cao (${product.rating}/5)`)
    } else if (product.rating >= 4.0) {
      score += 10
      reasons.push(`Đánh giá tốt (${product.rating}/5)`)
    }

    // Check availability (10 points)
    const hasStock = product.variants.some((v: any) => v.is_available && v.stock_quantity > 0)
    if (hasStock) {
      score += 10
      reasons.push('Còn hàng')
    }

    return { score, reasons }
  }

  // Đề xuất sản phẩm
  async recommendProducts(
    userMessage: string,
    geminiAnalysis?: any,
    limit: number = 5
  ): Promise<ProductRecommendation[]> {
    const basicAnalysis = this.analyzeUserMessageBasic(userMessage)

    // Merge với Gemini analysis nếu có
    const analysis = {
      ...basicAnalysis,
      skinType: geminiAnalysis?.skinType || basicAnalysis.skinType,
      skinConcerns: geminiAnalysis?.concerns?.length > 0 ? geminiAnalysis.concerns : basicAnalysis.skinConcerns
    }

    // Build query
    const matchConditions: any = {}

    if (analysis.skinType) {
      matchConditions.skin_type = { $in: [analysis.skinType] }
    }

    // Search in available products
    matchConditions['variants'] = {
      $elemMatch: {
        is_available: true,
        stock_quantity: { $gt: 0 }
      }
    }

    const pipeline: any[] = [
      { $match: matchConditions },
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
      { $limit: 50 }
    ]

    const products = await databaseService.products.aggregate(pipeline).toArray()

    // Score and sort products
    const recommendations: ProductRecommendation[] = products
      .map((product) => {
        const { score, reasons } = this.calculateProductScore(product, analysis)
        return {
          product,
          score,
          reason: reasons
        }
      })
      .filter((rec) => rec.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return recommendations
  }

  // Tạo response cho chatbot với Gemini AI
  async generateChatResponse(
    userMessage: string,
    chatHistory: ChatMessage[] = []
  ): Promise<{
    message: string
    recommendations: ProductRecommendation[]
    analysis: any
    geminiAnalysis?: any
  }> {
    try {
      // Bước 1: Phân tích với Gemini
      const geminiAnalysis = await geminiService.analyzeMessage(
        userMessage,
        chatHistory.map((msg) => ({ role: msg.role, content: msg.content }))
      )

      // Bước 2: Tìm sản phẩm phù hợp
      const recommendations = await this.recommendProducts(userMessage, geminiAnalysis, 5)

      // Bước 3: Tạo response tự nhiên với Gemini
      const message = await geminiService.generateResponse(
        userMessage,
        recommendations,
        chatHistory.map((msg) => ({ role: msg.role, content: msg.content }))
      )

      return {
        message,
        recommendations,
        analysis: this.analyzeUserMessageBasic(userMessage),
        geminiAnalysis
      }
    } catch (error) {
      console.error('Chat response generation error:', error)

      // Fallback về phương thức cơ bản nếu Gemini lỗi
      const basicAnalysis = this.analyzeUserMessageBasic(userMessage)
      const recommendations = await this.recommendProducts(userMessage, undefined, 5)

      let message = 'Xin chào! '

      if (basicAnalysis.skinType) {
        message += `Bạn có làn da ${basicAnalysis.skinType}. `
      }

      if (recommendations.length > 0) {
        message += `\n\nTôi đã tìm được ${recommendations.length} sản phẩm phù hợp:\n\n`

        recommendations.forEach((rec, index) => {
          const minPrice = Math.min(...rec.product.variants.map((v: any) => v.price))
          message += `${index + 1}. **${rec.product.name}** (${rec.product.brand.name})\n`
          message += `   💰 ${minPrice.toLocaleString()}đ | ⭐ ${rec.product.rating}/5\n`
          message += `   ${rec.reason[0]}\n\n`
        })

        message += 'Bạn muốn biết thêm chi tiết không? 😊'
      } else {
        message += 'Hiện tại tôi chưa tìm được sản phẩm phù hợp. Bạn có thể mô tả rõ hơn về nhu cầu của mình không?'
      }

      return {
        message,
        recommendations,
        analysis: basicAnalysis
      }
    }
  }

  // Giải thích thành phần sản phẩm
  async explainIngredients(productId: string): Promise<string> {
    const product = await databaseService.products.findOne({
      _id: new ObjectId(productId)
    })

    if (!product || !product.ingredients) {
      return 'Không tìm thấy thông tin thành phần của sản phẩm này.'
    }

    return await geminiService.explainIngredients(product.ingredients)
  }

  // Tạo routine chăm sóc da
  async createSkincareRoutine(userId: string): Promise<string> {
    // Lấy thông tin user (có thể có skin_type trong profile)
    const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })

    // Lấy lịch sử mua hàng để biết sản phẩm đã có
    const orders = await databaseService.orders
      .find({ user_id: new ObjectId(userId) })
      .limit(5)
      .toArray()

    const productIds = orders.flatMap((order: any) => order.items.map((item: any) => new ObjectId(item.product_id)))

    const ownedProducts = await databaseService.products.find({ _id: { $in: productIds } }).toArray()

    const skinType = 'combination' // Default hoặc lấy từ user profile
    const concerns = ['acne', 'oily'] // Có thể phân tích từ chat history

    return await geminiService.createSkincareRoutine(skinType, concerns, ownedProducts)
  }

  // So sánh sản phẩm
  async compareProducts(productIds: string[]): Promise<string> {
    const products = await databaseService.products
      .aggregate([
        {
          $match: {
            _id: { $in: productIds.map((id) => new ObjectId(id)) }
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
          $addFields: {
            brand: { $arrayElemAt: ['$brand', 0] }
          }
        }
      ])
      .toArray()

    if (products.length < 2) {
      return 'Cần ít nhất 2 sản phẩm để so sánh.'
    }

    return await geminiService.compareProducts(products)
  }

  // Save chat history
  async saveChatHistory(userId: string, messages: ChatMessage[]) {
    const result = await databaseService.chatHistory.insertOne({
      user_id: new ObjectId(userId),
      messages,
      created_at: new Date(),
      updated_at: new Date()
    })
    return result
  }

  // Get chat history
  async getChatHistory(userId: string, limit: number = 10) {
    return await databaseService.chatHistory
      .find({ user_id: new ObjectId(userId) })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray()
  }

  // Update chat history (append new messages)
  async updateChatHistory(userId: string, sessionId: string, newMessages: ChatMessage[]) {
    await databaseService.chatHistory.updateOne(
      { _id: new ObjectId(sessionId), user_id: new ObjectId(userId) },
      {
        $push: { messages: { $each: newMessages } },
        $set: { updated_at: new Date() }
      }
    )
  }
}

const cosmeticChatbotService = new CosmeticChatbotService()
export default cosmeticChatbotService
