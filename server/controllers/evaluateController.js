const { geminiApiKey } = require('../config')
const { generateFallbackEval, buildGeminiPrompt, saveToMongo } = require('../utils/evaluation')

async function handleEvaluate(req, res) {
  const { candidate, qaTranscript = [], teachingConvo = [], interviewId, candidateId } = req.body

  if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
    const result = generateFallbackEval(candidate, qaTranscript, teachingConvo)
    await saveToMongo(result, interviewId, candidateId)
    return res.json(result)
  }

  try {
    const prompt = buildGeminiPrompt(candidate, qaTranscript, teachingConvo)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.3 }
        })
      }
    )
    const data = await response.json()
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!raw) throw new Error('Empty Gemini response')

    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!parsed.dimensions || !parsed.overall || !parsed.recommendation) throw new Error('Invalid shape')

    await saveToMongo(parsed, interviewId, candidateId)
    res.json(parsed)
  } catch (err) {
    console.error('Gemini eval failed, using fallback:', err.message)
    const result = generateFallbackEval(candidate, qaTranscript, teachingConvo)
    await saveToMongo(result, interviewId, candidateId)
    res.json(result)
  }
}

module.exports = { handleEvaluate }
