const mongoose = require('mongoose')
const Interview = require('../models/Interview')
const Assessment = require('../models/Assessment')
const Candidate = require('../models/Candidate')

async function startInterview(req, res) {
  const { candidateId } = req.body
  if (!candidateId) return res.status(400).json({ message: 'candidateId required' })

  if (mongoose.connection.readyState !== 1) {
    return res.json({ _id: `local_${Date.now()}`, candidateId, status: 'in-progress' })
  }

  try {
    const interview = new Interview({ candidateId, startTime: new Date() })
    await interview.save()
    res.status(201).json(interview)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

async function saveTranscript(req, res) {
  const { entries } = req.body
  if (req.params.id.startsWith('local_')) return res.json({ ok: true })
  try {
    const interview = await Interview.findById(req.params.id)
    if (!interview) return res.status(404).json({ message: 'Interview not found' })
    if (Array.isArray(entries)) interview.transcript.push(...entries)
    interview.phase = 'teaching'
    await interview.save()
    res.json(interview)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

async function saveTeachingTranscript(req, res) {
  const { entries } = req.body
  if (req.params.id.startsWith('local_')) return res.json({ ok: true })
  try {
    const interview = await Interview.findById(req.params.id)
    if (!interview) return res.status(404).json({ message: 'Interview not found' })
    if (Array.isArray(entries)) interview.teachingTranscript.push(...entries)
    await interview.save()
    res.json(interview)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

async function completeInterview(req, res) {
  const { duration } = req.body
  if (req.params.id.startsWith('local_')) return res.json({ ok: true })
  try {
    const interview = await Interview.findById(req.params.id)
    if (!interview) return res.status(404).json({ message: 'Interview not found' })
    interview.status = 'completed'
    interview.endTime = new Date()
    interview.duration = duration
    interview.phase = 'complete'
    await interview.save()
    await Candidate.findByIdAndUpdate(interview.candidateId, { status: 'completed' })
    res.json(interview)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

async function listInterviews(req, res) {
  try {
    const interviews = await Interview.find()
      .populate('candidateId')
      .sort({ startTime: -1 })

    const assessments = await Assessment.find({
      interviewId: { $in: interviews.map(iv => iv._id) }
    })
    const assessmentMap = {}
    assessments.forEach(a => { assessmentMap[a.interviewId.toString()] = a })

    const result = interviews.map(iv => ({
      ...iv.toObject(),
      assessment: assessmentMap[iv._id.toString()] || null,
    }))

    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { startInterview, saveTranscript, saveTeachingTranscript, completeInterview, listInterviews }
