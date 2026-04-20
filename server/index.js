require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')
const { port } = require('./config')
const errorHandler = require('./middleware/errorHandler')

const candidateRoutes = require('./routes/candidates')
const interviewRoutes = require('./routes/interviews')
const chatRoutes = require('./routes/chat')
const evaluateRoutes = require('./routes/evaluate')

const app = express()

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/candidates', candidateRoutes)
app.use('/api/interviews', interviewRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/evaluate', evaluateRoutes)

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose')
  res.json({
    status: 'ok',
    service: 'CueMath AI Interview API',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

app.use(express.static(path.join(__dirname, '../client/dist')))
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Route not found' })
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})

app.use(errorHandler)

connectDB(process.env.MONGODB_URI).then((connected) => {
  if (!connected) console.log('⚠️  Starting server without DB (frontend-only mode)')
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`)
    console.log(`📋 API: http://localhost:${port}/api/health`)
  })
})
