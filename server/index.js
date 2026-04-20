require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

const candidateRoutes = require('./routes/candidates')
const interviewRoutes = require('./routes/interviews')
const chatRoutes = require('./routes/chat')
const evaluateRoutes = require('./routes/evaluate')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/candidates', candidateRoutes)
app.use('/api/interviews', interviewRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/evaluate', evaluateRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'CueMath AI Interview API',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Serve client build in production
app.use(express.static(path.join(__dirname, '../client/dist')))
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Route not found' })
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

// Connect to MongoDB then start
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    console.log('✅ MongoDB connected:', process.env.MONGODB_URI)
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log(`📋 API: http://localhost:${PORT}/api/health`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message)
    console.log('⚠️  Starting server without DB (frontend-only mode)')
    app.listen(PORT, () => console.log(`🚀 Server running (no DB) on port ${PORT}`))
  })
