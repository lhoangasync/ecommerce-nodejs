import express from 'express'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import apiRouter from './routes/app.routes'
import databaseService from './services/database.services'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createServer } from 'http'

import { config } from 'dotenv'
import WebSocketService from './services/websocket.services'
config()

databaseService.connect()

const app = express()
const httpServer = createServer(app)

const port = 4000

app.set('trust proxy', 1)

const allowedOrigins = [process.env.FRONT_END_URL, 'http://localhost:3000'].filter(Boolean) as string[]

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      return cb(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
  })
)

app.use(cookieParser())
app.use(express.json())
app.use('/api', apiRouter)
app.use(defaultErrorHandler)

// Initialize WebSocket service
const wsService = new WebSocketService(httpServer)
export { wsService }

// Single listen call on httpServer (handles both HTTP and WebSocket)
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`)
  console.log(`WebSocket server ready`)
})
