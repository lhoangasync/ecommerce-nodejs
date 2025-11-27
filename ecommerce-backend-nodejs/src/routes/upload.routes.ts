import { Router } from 'express'
import {
  uploadSingleImageController,
  uploadMultipleImagesController,
  deleteImageController
} from '~/controllers/upload.controllers'
import { uploadSingleImage, uploadMultipleImages, handleMulterError } from '~/middlewares/upload.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const uploadRouter = Router()

// Upload single image (for avatar)
uploadRouter.post(
  '/single',
  accessTokenValidator,
  uploadSingleImage,
  handleMulterError,
  wrapRequestHandler(uploadSingleImageController)
)

// Upload multiple images (for products)
uploadRouter.post(
  '/multiple',
  accessTokenValidator,
  uploadMultipleImages,
  handleMulterError,
  wrapRequestHandler(uploadMultipleImagesController)
)

// Delete image
uploadRouter.delete('/delete', accessTokenValidator, wrapRequestHandler(deleteImageController))

export default uploadRouter