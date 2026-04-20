const mongoose = require('mongoose')

const AssessmentSchema = new mongoose.Schema({
  interviewId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  candidateId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  overallScore:  { type: Number, min: 0, max: 5 },
  recommendation:{ type: String, enum: ['Advance', 'Maybe', 'Reject'] },
  dimensions:    [{
    name:     String,
    score:    Number,
    evidence: String,
  }],
  strengths:     [String],
  improvements:  [String],
  createdAt:     { type: Date, default: Date.now },
})

module.exports = mongoose.model('Assessment', AssessmentSchema)
