const mongoose = require('mongoose')

const InterviewSchema = new mongoose.Schema({
  candidateId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  startTime:    { type: Date, default: Date.now },
  endTime:      { type: Date },
  duration:     { type: Number },           // seconds
  phase:        { type: String, enum: ['qa', 'teaching', 'complete'], default: 'qa' },
  transcript:   [{
    role:      { type: String, enum: ['ai', 'candidate', 'student', 'teacher'] },
    text:      String,
    timestamp: { type: Date, default: Date.now }
  }],
  status:       { type: String, enum: ['in-progress', 'completed', 'assessed'], default: 'in-progress' },
})

module.exports = mongoose.model('Interview', InterviewSchema)
