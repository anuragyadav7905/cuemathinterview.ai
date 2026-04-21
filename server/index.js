require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const { port } = require('./config')
const errorHandler = require('./middleware/errorHandler')

const requireAuth = require('./middleware/auth')
const authRoutes = require('./routes/auth')
const candidateRoutes = require('./routes/candidates')
const interviewRoutes = require('./routes/interviews')
const chatRoutes = require('./routes/chat')
const evaluateRoutes = require('./routes/evaluate')

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/candidates', candidateRoutes)
app.use('/api/interviews', requireAuth, interviewRoutes)
app.use('/api/chat', requireAuth, chatRoutes)
app.use('/api/evaluate', requireAuth, evaluateRoutes)

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose')
  res.json({
    status: 'ok',
    service: 'CueMath AI Interview API',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

app.use(errorHandler)

connectDB(process.env.MONGODB_URI).then((connected) => {
  if (!connected) console.log('⚠️  Starting server without DB (frontend-only mode)')
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`)
    console.log(`📋 API: http://localhost:${port}/api/health`)
  })
})
