import express from 'express'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import apiRouter from './routes/app.routes'
import databaseService from './services/database.services'
import cookieParser from 'cookie-parser'
import cors from 'cors'

databaseService.connect()

const app = express()
const port = 4000

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use(cookieParser())
app.use(express.json())
app.use('/api', apiRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
