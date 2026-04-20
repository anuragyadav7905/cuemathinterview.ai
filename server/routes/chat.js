const express = require('express')
const router = express.Router()

const SYSTEM_PROMPT = `You are Arjun, a curious Grade 5 student (age 10) learning about Fractions & Division from your teacher right now.
Respond ONLY as Arjun the student — short 1-2 sentence replies like a real 10-year-old.
Show genuine curiosity, occasional confusion, and excitement when you understand something.
Ask follow-up questions naturally. Use simple words. Occasionally use emojis like 😊 🤔 💡 🍕.
React directly to what the teacher just said.`

const FALLBACKS = [
  "Hmm, can you explain that again? I got a little confused 🤔",
  "Oh okay! So... what should I do if I get a question like this in a test?",
  "Can you show me an example on the board? I learn better when I see it 😊",
  "Wait, does this work the same way for all numbers, or only small ones?",
  "I think I almost understand — can we try one together step by step? 💡",
  "What happens if the bottom number is bigger than the top number?",
  "Is there a shortcut for this? My older brother says there's always a trick 😄",
  "So is this related to what we learned about multiplication last week?",
  "Can you give me a real-life example? Like with food or something? 🍕",
  "Ohh! I never thought about it that way. Can I ask — why does that happen?",
  "What if someone gets the wrong answer — how do we check if we're right?",
  "I think I get it! Can I try solving the next one by myself? 🎉",
]
let fallbackIdx = 0

router.post('/', async (req, res) => {
  const { message } = req.body
  if (!message) return res.json({ text: FALLBACKS[fallbackIdx++ % FALLBACKS.length] })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.json({ text: FALLBACKS[fallbackIdx++ % FALLBACKS.length] })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
  } catch {
    res.json({ text: FALLBACKS[fallbackIdx++ % FALLBACKS.length] })
  }
})

module.exports = router
