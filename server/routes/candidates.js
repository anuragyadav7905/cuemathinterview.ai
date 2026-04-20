const express = require('express')
const router = express.Router()
const { registerCandidate, listCandidates, getCandidate } = require('../controllers/candidateController')
const { validateCandidate } = require('../middleware/validateRequest')

router.post('/', validateCandidate, registerCandidate)
router.get('/', listCandidates)
router.get('/:id', getCandidate)

module.exports = router
