const express = require('express')
const router = express.Router()
const {
  startInterview,
  saveTranscript,
  saveTeachingTranscript,
  completeInterview,
  listInterviews,
} = require('../controllers/interviewController')

router.post('/start', startInterview)
router.post('/:id/transcript', saveTranscript)
router.post('/:id/teaching-transcript', saveTeachingTranscript)
router.post('/:id/complete', completeInterview)
router.get('/', listInterviews)

module.exports = router
