import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import cosmeticChatbotService from '~/services/chatbot.services'
import { TokenPayload } from '~/models/requests/User.requests'

// Chat với bot (sử dụng Gemini AI)
export const chatController = async (req: Request, res: Response) => {
  const { message, session_id } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload

  // Lấy lịch sử chat từ session hiện tại
  let chatHistory: any[] = []
  if (session_id) {
    const session = await cosmeticChatbotService.getChatHistory(user_id, 1)
    if (session.length > 0 && session[0]._id.toString() === session_id) {
      chatHistory = session[0].messages || []
    }
  }

  // Generate response với Gemini
  const response = await cosmeticChatbotService.generateChatResponse(message, chatHistory)

  // Save/Update chat history
  const newMessages = [
    {
      role: 'user' as const,
      content: message,
      timestamp: new Date()
    },
    {
      role: 'assistant' as const,
      content: response.message,
      timestamp: new Date()
    }
  ]

  let finalSessionId = session_id
  if (session_id) {
    await cosmeticChatbotService.updateChatHistory(user_id, session_id, newMessages)
  } else {
    const savedHistory = await cosmeticChatbotService.saveChatHistory(user_id, newMessages)
    finalSessionId = savedHistory.insertedId.toString()
  }

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Chat response generated successfully',
    data: {
      session_id: finalSessionId,
      bot_message: response.message,
      recommendations: response.recommendations.map((rec) => ({
        product: {
          _id: rec.product._id,
          name: rec.product.name,
          slug: rec.product.slug,
          brand: rec.product.brand,
          category: rec.product.category,
          images: rec.product.images,
          rating: rec.product.rating,
          review_count: rec.product.review_count,
          variants: rec.product.variants,
          description: rec.product.description
        },
        score: rec.score,
        reasons: rec.reason
      })),
      analysis: response.analysis,
      gemini_analysis: response.geminiAnalysis
    }
  })
}

// Lấy lịch sử chat
export const getChatHistoryController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const limit = Number(req.query.limit) || 10

  const history = await cosmeticChatbotService.getChatHistory(user_id, limit)

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Get chat history successfully',
    data: history
  })
}

// Get specific chat session
export const getChatSessionController = async (req: Request, res: Response) => {
  const { session_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload

  const session = await cosmeticChatbotService.getChatHistory(user_id, 100)
  const specificSession = session.find((s: any) => s._id.toString() === session_id)

  if (!specificSession) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      status: HTTP_STATUS.NOT_FOUND,
      message: 'Chat session not found',
      data: null
    })
  }

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Get chat session successfully',
    data: specificSession
  })
}

// Quick suggestions (gợi ý nhanh)
export const getQuickSuggestionsController = async (req: Request, res: Response) => {
  const suggestions = [
    {
      id: '1',
      text: 'Tôi muốn tìm serum trị mụn cho da dầu',
      icon: '💧',
      keywords: ['serum', 'mụn', 'da dầu']
    },
    {
      id: '2',
      text: 'Gợi ý kem dưỡng cho da khô và nhạy cảm',
      icon: '🧴',
      keywords: ['kem dưỡng', 'da khô', 'nhạy cảm']
    },
    {
      id: '3',
      text: 'Tìm sản phẩm chống lão hóa giá dưới 500k',
      icon: '✨',
      keywords: ['chống lão hóa', 'giá', 'dưới 500k']
    },
    {
      id: '4',
      text: 'Sữa rửa mặt cho da hỗn hợp mụn',
      icon: '🧼',
      keywords: ['sữa rửa mặt', 'da hỗn hợp', 'mụn']
    },
    {
      id: '5',
      text: 'Toner làm sáng da, trị thâm nám',
      icon: '🌟',
      keywords: ['toner', 'làm sáng', 'thâm nám']
    },
    {
      id: '6',
      text: 'Kem chống nắng cho da nhạy cảm',
      icon: '☀️',
      keywords: ['kem chống nắng', 'da nhạy cảm']
    }
  ]

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Get quick suggestions successfully',
    data: suggestions
  })
}

// Giải thích thành phần sản phẩm
export const explainIngredientsController = async (req: Request, res: Response) => {
  const { product_id } = req.params

  const explanation = await cosmeticChatbotService.explainIngredients(product_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Ingredients explained successfully',
    data: {
      explanation
    }
  })
}

// Tạo routine chăm sóc da
export const createRoutineController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const routine = await cosmeticChatbotService.createSkincareRoutine(user_id)

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Skincare routine created successfully',
    data: {
      routine
    }
  })
}

// So sánh sản phẩm
export const compareProductsController = async (req: Request, res: Response) => {
  const { product_ids } = req.body

  if (!Array.isArray(product_ids) || product_ids.length < 2) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: HTTP_STATUS.BAD_REQUEST,
      message: 'Please provide at least 2 product IDs to compare',
      data: null
    })
  }

  const comparison = await cosmeticChatbotService.compareProducts(product_ids)

  return res.json({
    status: HTTP_STATUS.OK,
    message: 'Products compared successfully',
    data: {
      comparison
    }
  })
}
