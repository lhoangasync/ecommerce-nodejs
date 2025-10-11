import express from 'express'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import apiRouter from './routes/app.routes'
import databaseService from './services/database.services'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { config } from 'dotenv'
import session from 'express-session'
import MongoStore from 'connect-mongo'
config()

databaseService.connect()

const app = express()
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
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cosmetic.mdo9nye.mongodb.net/`,
      dbName: process.env.DB_NAME as string,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  })
)

app.use(cookieParser())
app.use(express.json())
app.use('/api', apiRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
