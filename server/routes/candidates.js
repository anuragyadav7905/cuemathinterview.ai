const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Candidate = require('../models/Candidate')

// POST /api/candidates — register new candidate
router.post('/', async (req, res) => {
  const { name, email, phone } = req.body
  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Name, email, and phone are required' })
  }

  // If DB is not connected, return a local object so frontend can proceed
  if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({
      _id: `local_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
  }

  try {
    // Check for duplicate email
    const existing = await Candidate.findOne({ email: email.toLowerCase().trim() })
    if (existing) return res.status(200).json(existing)

    const candidate = new Candidate({ name, email, phone })
    await candidate.save()
    res.status(201).json(candidate)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/candidates — list all candidates (admin)
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 })
    res.json(candidates)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/candidates/:id — single candidate
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' })
    res.json(candidate)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
