const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config')

// Bypass auth in dev/offline mode when no real secret is configured
const DEV_SECRETS = [undefined, null, '', 'your_jwt_secret_here', 'cuemath_dev_secret_change_in_production']

function requireAuth(req, res, next) {
  if (DEV_SECRETS.includes(jwtSecret)) return next()

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authenticated' })

  try {
    req.user = jwt.verify(header.slice(7), jwtSecret)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = requireAuth
