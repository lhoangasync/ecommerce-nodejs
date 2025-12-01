import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import cloudinary from '~/config/cloudinary.config'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file as Express.Multer.File & { path?: string }

    if (!file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'No file uploaded'
      })
    }

    // Cloudinary automatically uploads and returns the URL in file.path
    const imageUrl = file.path

    return res.json({
      status: HTTP_STATUS.OK,
      message: 'Upload image successfully',
      data: {
        url: imageUrl,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
      }
    })
  } catch (error) {
    // Kiểm tra xem lỗi có phải từ Cloudinary không (Cloudinary thường trả về lỗi có cấu trúc)
    const errorMessage = (error as any)?.message || 'Failed to upload image';

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      // Trả về thông báo lỗi chi tiết hơn (chỉ nên làm trong môi trường dev)
      message: `Upload failed: ${errorMessage}` 
    })
  }
}

export const uploadMultipleImagesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'No files uploaded'
      })
    }

    const uploadedImages = files.map((file: any) => ({
      url: file.path,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    }))

    return res.json({
      status: HTTP_STATUS.OK,
      message: 'Upload images successfully',
      data: {
        images: uploadedImages,
        count: uploadedImages.length
      }
    })
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'Failed to upload images'
    })
  }
}

export const deleteImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { public_id } = req.body

    if (!public_id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Public ID is required'
      })
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id)

    if (result.result !== 'ok') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Failed to delete image'
      })
    }

    return res.json({
      status: HTTP_STATUS.OK,
      message: 'Delete image successfully',
      data: result
    })
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'Failed to delete image'
    })
  }
}