const mongoose = require('mongoose')

const CandidateSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, trim: true, lowercase: true, unique: true },
  phone:        { type: String, required: true, trim: true },
  passwordHash: { type: String, default: null },
  status:       { type: String, enum: ['pending', 'completed', 'assessed'], default: 'pending' },
  createdAt:    { type: Date, default: Date.now },
})

// Never expose passwordHash in any JSON response
CandidateSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash
    return ret
  },
})

module.exports = mongoose.model('Candidate', CandidateSchema)
