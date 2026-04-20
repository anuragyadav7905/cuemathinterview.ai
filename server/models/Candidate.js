const mongoose = require('mongoose')

const CandidateSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, trim: true, lowercase: true },
  phone:     { type: String, required: true, trim: true },
  status:    { type: String, enum: ['pending', 'completed', 'assessed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Candidate', CandidateSchema)
