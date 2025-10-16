import { Server as HTTPServer } from 'http'
import { Server, Socket } from 'socket.io'
import { ObjectId } from 'mongodb'
import { verifyToken } from '~/utils/jwt'
import reviewsService from '~/services/review.services'
import databaseService from '~/services/database.services'
import { UserRoles } from '~/constants/enums'

export interface SocketUser {
  user_id: string
  socket_id: string
}

class WebSocketService {
  private io: Server
  private users: Map<string, SocketUser[]> = new Map() // product_id -> users[]

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    })

    this.initializeHandlers()
  }

  private initializeHandlers() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token

        if (!token) {
          return next(new Error('Access token is required'))
        }

        // Verify access token using the same method as REST API
        const decoded_authorization = await verifyToken({
          token,
          secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
        })

        // Verify user exists in database
        const user = await databaseService.users.findOne({
          _id: new ObjectId(decoded_authorization.user_id)
        })

        if (!user) {
          return next(new Error('User not found'))
        }

        // Attach decoded token to socket
        socket.data.user = decoded_authorization

        next()
      } catch (error: any) {
        console.error('WebSocket authentication error:', error.message)
        next(new Error('Authentication failed'))
      }
    })

    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id)

      // Join product room để nhận updates của product cụ thể
      socket.on('join:product', (product_id: string) => {
        socket.join(`product:${product_id}`)

        // Track user
        const users = this.users.get(product_id) || []
        users.push({
          user_id: socket.data.user.user_id,
          socket_id: socket.id
        })
        this.users.set(product_id, users)

        console.log(`User ${socket.data.user.user_id} joined product:${product_id}`)

        // Emit active users count
        this.io.to(`product:${product_id}`).emit('users:count', users.length)
      })

      // Leave product room
      socket.on('leave:product', (product_id: string) => {
        socket.leave(`product:${product_id}`)
        this.removeUserFromProduct(product_id, socket.id)

        const users = this.users.get(product_id) || []
        this.io.to(`product:${product_id}`).emit('users:count', users.length)
      })

      // User is typing comment
      socket.on('typing:start', (product_id: string) => {
        socket.to(`product:${product_id}`).emit('user:typing', {
          user_id: socket.data.user.user_id,
          username: socket.data.user.username
        })
      })

      socket.on('typing:stop', (product_id: string) => {
        socket.to(`product:${product_id}`).emit('user:stop-typing', {
          user_id: socket.data.user.user_id
        })
      })

      // New review submitted (pending approval)
      socket.on('review:submit', async (data: any) => {
        try {
          const review = await reviewsService.createReview({
            ...data,
            user_id: socket.data.user.user_id
          })

          // Notify admins about pending review
          this.io.to('admin').emit('review:pending', {
            review_id: review._id,
            product_id: data.product_id,
            user_id: socket.data.user.user_id,
            rating: data.rating
          })

          // Notify user that review is pending
          socket.emit('review:submitted', {
            review_id: review._id,
            status: 'pending'
          })
        } catch (error: any) {
          socket.emit('review:error', { message: error.message })
        }
      })

      // Mark review as helpful
      socket.on('review:helpful', async (review_id: string) => {
        try {
          const review = await reviewsService.markHelpful(review_id)

          // Broadcast to all users in product room
          this.io.to(`product:${review.product_id.toString()}`).emit('review:updated', {
            review_id: review._id,
            helpful_count: review.helpful_count
          })
        } catch (error: any) {
          socket.emit('review:error', { message: error.message })
        }
      })

      // Report review
      socket.on('review:report', async (review_id: string) => {
        try {
          const review = await reviewsService.reportReview(review_id)

          // Notify admins
          this.io.to('admin').emit('review:reported', {
            review_id: review._id,
            reported_count: review.reported_count
          })
        } catch (error: any) {
          socket.emit('review:error', { message: error.message })
        }
      })

      // Admin approves review
      socket.on('review:approve', async (review_id: string) => {
        try {
          // Check if user is admin (role = 1)
          if (socket.data.user.role !== UserRoles.ADMIN) {
            throw new Error('Unauthorized: Admin permission required')
          }

          const review = await reviewsService.approveReview(review_id)

          // Broadcast new approved review to all users watching this product
          this.io.to(`product:${review.product_id.toString()}`).emit('review:new', review)

          // Update rating stats
          const stats = await reviewsService.updateProductRating(review.product_id.toString())
          this.io.to(`product:${review.product_id.toString()}`).emit('rating:updated', stats)
        } catch (error: any) {
          socket.emit('review:error', { message: error.message })
        }
      })

      // Admin rejects review
      socket.on('review:reject', async (review_id: string) => {
        try {
          // Check if user is admin
          if (socket.data.user.role !== UserRoles.ADMIN) {
            throw new Error('Unauthorized: Admin permission required')
          }

          await reviewsService.rejectReview(review_id)
          socket.emit('review:rejected', { review_id })
        } catch (error: any) {
          socket.emit('review:error', { message: error.message })
        }
      })

      // Seller responds to review
      socket.on('review:respond', async (data: { review_id: string; message: string }) => {
        try {
          const review = await reviewsService.addSellerResponse(data.review_id, socket.data.user.user_id, data.message)

          // Broadcast seller response
          this.io.to(`product:${review.product_id.toString()}`).emit('review:response', {
            review_id: review._id,
            response: review.seller_response
          })
        } catch (error: any) {
          socket.emit('review:error', { message: error.message })
        }
      })

      // Admin joins admin room
      socket.on('join:admin', () => {
        if (socket.data.user.role === UserRoles.ADMIN) {
          socket.join('admin')
          console.log(`Admin ${socket.data.user.user_id} joined admin room`)
        } else {
          socket.emit('error', { message: 'Unauthorized: Admin permission required' })
        }
      })

      // Disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)

        // Remove from all product rooms
        this.users.forEach((users, product_id) => {
          this.removeUserFromProduct(product_id, socket.id)
          const updatedUsers = this.users.get(product_id) || []
          this.io.to(`product:${product_id}`).emit('users:count', updatedUsers.length)
        })
      })
    })
  }

  private removeUserFromProduct(product_id: string, socket_id: string) {
    const users = this.users.get(product_id) || []
    const filteredUsers = users.filter((u) => u.socket_id !== socket_id)

    if (filteredUsers.length === 0) {
      this.users.delete(product_id)
    } else {
      this.users.set(product_id, filteredUsers)
    }
  }

  // Public method to emit events from REST API
  public emitReviewApproved(product_id: string, review: any) {
    this.io.to(`product:${product_id}`).emit('review:new', review)
  }

  public emitRatingUpdated(product_id: string, stats: any) {
    this.io.to(`product:${product_id}`).emit('rating:updated', stats)
  }

  public getIO() {
    return this.io
  }
}

export default WebSocketService
