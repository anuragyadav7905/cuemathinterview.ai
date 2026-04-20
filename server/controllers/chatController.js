const { SYSTEM_PROMPT, FALLBACKS } = require('../utils/chatPrompts')
const { geminiApiKey } = require('../config')

let fallbackIdx = 0

async function handleChat(req, res) {
  const { message } = req.body
  if (!message) return res.json({ text: FALLBACKS[fallbackIdx++ % FALLBACKS.length] })

  if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
    return res.json({ text: FALLBACKS[fallbackIdx++ % FALLBACKS.length] })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${SYSTEM_PROMPT}\n\nTeacher just said: "${message}"\n\nArjun responds:` }]
          }],
          generationConfig: { maxOutputTokens: 80, temperature: 0.9 }
        })
      }
    )
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    res.json({ text: text || FALLBACKS[fallbackIdx++ % FALLBACKS.length] })
  } catch (err) {
    console.error('Chat API error:', err.message)
    res.json({ text: FALLBACKS[fallbackIdx++ % FALLBACKS.length] })
  }
}

module.exports = { handleChat }
