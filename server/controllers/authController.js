const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Candidate = require('../models/Candidate')
const { jwtSecret } = require('../config')

function makeToken(candidate) {
  return jwt.sign({ id: candidate._id, email: candidate.email }, jwtSecret, { expiresIn: '7d' })
}

function safeCandidate(c) {
  return { _id: c._id, name: c.name, email: c.email, phone: c.phone, status: c.status }
}

async function signup(req, res) {
  const { name, email, phone, password } = req.body
  if (!name || !email || !phone || !password)
    return res.status(400).json({ message: 'All fields are required' })
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' })

  if (mongoose.connection.readyState !== 1) {
    const local = { _id: `local_${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), status: 'pending' }
    const token = jwt.sign({ id: local._id, email: local.email }, jwtSecret, { expiresIn: '7d' })
    return res.status(201).json({ token, candidate: local })
  }

  try {
    const existing = await Candidate.findOne({ email: email.toLowerCase().trim() })
    if (existing) return res.status(409).json({ message: 'Email already registered. Please log in.' })

    const passwordHash = await bcrypt.hash(password, 10)
    const candidate = await new Candidate({ name, email, phone, passwordHash }).save()
    res.status(201).json({ token: makeToken(candidate), candidate: safeCandidate(candidate) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

  if (mongoose.connection.readyState !== 1) {
    const local = { _id: `local_${Date.now()}`, name: 'Demo User', email: email.trim().toLowerCase(), phone: '', status: 'pending' }
    const token = jwt.sign({ id: local._id, email: local.email }, jwtSecret, { expiresIn: '7d' })
    return res.json({ token, candidate: local })
  }

  try {
    const candidate = await Candidate.findOne({ email: email.toLowerCase().trim() })
    if (!candidate || !candidate.passwordHash)
      return res.status(401).json({ message: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, candidate.passwordHash)
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

    res.json({ token: makeToken(candidate), candidate: safeCandidate(candidate) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { signup, login }
