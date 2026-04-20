const express = require('express')
const router = express.Router()
const { handleEvaluate } = require('../controllers/evaluateController')

router.post('/', handleEvaluate)

module.exports = router
