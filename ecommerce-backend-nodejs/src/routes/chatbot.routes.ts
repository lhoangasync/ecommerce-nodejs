import { Router } from 'express'
import {
  chatController,
  getChatHistoryController,
  getChatSessionController,
  getQuickSuggestionsController,
  explainIngredientsController,
  createRoutineController,
  compareProductsController
} from '~/controllers/chatbot.controllers'
import { chatMessageValidator, compareProductsValidator, productIdValidator } from '~/middlewares/chatbot.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const chatbotRouter = Router()

// Public routes
chatbotRouter.get('/suggestions', wrapRequestHandler(getQuickSuggestionsController))

// Protected routes - require authentication
chatbotRouter.post(
  '/chat',
  accessTokenValidator,
  verifiedUserValidator,
  chatMessageValidator,
  wrapRequestHandler(chatController)
)

chatbotRouter.get('/history', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(getChatHistoryController))

chatbotRouter.get(
  '/history/:session_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getChatSessionController)
)

chatbotRouter.get(
  '/ingredients/:product_id',
  accessTokenValidator,
  verifiedUserValidator,
  productIdValidator,
  wrapRequestHandler(explainIngredientsController)
)

chatbotRouter.get('/routine', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(createRoutineController))

chatbotRouter.post(
  '/compare',
  accessTokenValidator,
  verifiedUserValidator,
  compareProductsValidator,
  wrapRequestHandler(compareProductsController)
)

export default chatbotRouter
