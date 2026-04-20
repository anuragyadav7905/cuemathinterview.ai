const mongoose = require('mongoose')

async function connectDB(uri) {
  if (!uri) {
    console.warn('⚠️  No MONGODB_URI — starting without DB')
    return false
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 })
    console.log('✅ MongoDB connected')
    return true
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    return false
  }
}

module.exports = connectDB
