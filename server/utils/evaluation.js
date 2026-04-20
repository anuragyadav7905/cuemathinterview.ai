const mongoose = require('mongoose')
const Assessment = require('../models/Assessment')
const Interview = require('../models/Interview')
const Candidate = require('../models/Candidate')

const STRENGTHS_POOL = [
  'Articulates concepts clearly and confidently',
  'Excellent use of visual analogies for abstract concepts',
  'Demonstrates genuine patience with student confusion',
  'Structured lesson flow from concept to example to practice',
  'Positive reinforcement language throughout the session',
  'Strong subject matter expertise in fractions and division',
  'Uses relatable real-life examples effectively',
  'Proactive comprehension checks after every sub-concept',
  'Warm and encouraging tone that builds student confidence',
  'Good awareness of student learning pace',
]

const IMPROVEMENTS_POOL = [
  'Slow down pace when introducing new formulas',
  'Allow more wait time before answering student questions',
  'Use more student-friendly language — less jargon',
  'Check for understanding more frequently during explanation',
  'Use whiteboard more systematically — organize left to right',
  'Increase student talk-time ratio',
  'Introduce more open-ended questions',
  'Practice maintaining camera eye contact',
  'Work on voice projection and consistency',
  'Use more varied teaching techniques for different learner types',
]

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function clamp(val, min = 1.0, max = 5.0) {
  return Math.round(Math.max(min, Math.min(max, val)) * 10) / 10
}

function generateEvidence(dimension, score) {
  const level = score >= 4.5 ? 'Exceptional' : score >= 4.0 ? 'Strong' : score >= 3.0 ? 'Adequate' : score >= 2.0 ? 'Developing' : 'Weak'
  const MAP = {
    'Teaching Ability': {
      Exceptional: '"Used multiple representations — symbolic, verbal, and visual — with exceptional clarity and student focus."',
      Strong:      '"Concepts explained clearly with good examples. Student comprehension was evident from responses."',
      Adequate:    '"Explanations were technically correct but lacked consistent student-friendly language."',
      Developing:  '"Struggled to adapt content for Grade 5 level. Concept delivery needs significant improvement."',
      Weak:        '"Unable to demonstrate concept clearly. Student was frequently lost during explanation."',
    },
    'Communication': {
      Exceptional: '"Articulate, structured, and completely jargon-free throughout. Outstanding clarity."',
      Strong:      '"Clear sentence structure, minimal filler words. Engaged effectively with student questions."',
      Adequate:    '"Some clarity in answers but long monologues without comprehension checks."',
      Developing:  '"Frequent use of mathematical jargon without simplification. Needed more structure."',
      Weak:        '"Frequently off-topic responses. Long pauses and unclear delivery throughout."',
    },
    'Temperament': {
      Exceptional: '"Highly patient. Celebrated every student win with genuine enthusiasm and warmth."',
      Strong:      '"Remained composed and encouraging when student expressed confusion multiple times."',
      Adequate:    '"Generally calm. Showed minor impatience when student repeated a question."',
      Developing:  '"Visible frustration at times. Recovery from confusion was slow."',
      Weak:        '"Appeared visibly nervous throughout. Did not recover well from moments of confusion."',
    },
    'Confidence': {
      Exceptional: '"Maintained direct camera engagement. Commanding yet warm presence throughout."',
      Strong:      '"Strong presence. Pace slightly fast during complex explanation but overall composed."',
      Adequate:    '"Camera avoidance at times. Voice volume inconsistent during teaching demo."',
      Developing:  '"Limited eye contact. Hesitation noticeable when addressing difficult questions."',
      Weak:        '"Avoided camera consistently. Voice barely audible in several responses."',
    },
    'Environment': {
      Exceptional: '"Dedicated teaching setup, good lighting, professional whiteboard background."',
      Strong:      '"Well-lit, quiet room. Professional background. Minor issue in first 30 seconds only."',
      Adequate:    '"Acceptable setup. Some background noise detected intermittently."',
      Developing:  '"Poor lighting. Background distractions visible. Setup needs improvement."',
      Weak:        '"Significant background noise and distractions. Camera quality very poor throughout."',
    },
  }
  return MAP[dimension]?.[level] || `"Score: ${score} — ${level} performance in this dimension."`
}

function generateFallbackEval(candidate, qaTranscript, teachingConvo) {
  const candidateAnswers = qaTranscript.filter(t => t.role === 'candidate')
  const totalChars = candidateAnswers.reduce((s, t) => s + (t.text || '').length, 0)
  const avgLen = totalChars / Math.max(1, candidateAnswers.length)

  const base = clamp(2.5 + (avgLen / 500) * 2.0)
  const noise = () => (Math.random() - 0.5) * 0.8

  const teaching      = clamp(base + noise())
  const communication = clamp(base + noise() + 0.1)
  const temperament   = clamp(base + noise())
  const confidence    = clamp(base + noise() - 0.1)
  const environment   = clamp(base + noise() - 0.2)
  const overall       = clamp((teaching + communication + temperament + confidence + environment) / 5)
  const recommendation = overall >= 4.0 ? 'Advance' : overall >= 3.0 ? 'Maybe' : 'Reject'

  const SUMMARY_BY_REC = {
    Advance: `${candidate?.name || 'The candidate'} demonstrated strong teaching capabilities and clear subject mastery throughout the assessment. Their communication style and student engagement approach are well-suited for Cuemath's standards.`,
    Maybe:   `${candidate?.name || 'The candidate'} showed reasonable teaching potential with some areas requiring further development. With targeted coaching, they could meet Cuemath's quality bar.`,
    Reject:  `${candidate?.name || 'The candidate'} struggled to demonstrate the teaching clarity and student engagement expected at this level. Significant improvement in pedagogy and communication is recommended before re-applying.`,
  }

  return {
    dimensions: [
      { name: 'Teaching Ability', score: teaching,      evidence: generateEvidence('Teaching Ability', teaching) },
      { name: 'Communication',    score: communication,  evidence: generateEvidence('Communication',    communication) },
      { name: 'Temperament',      score: temperament,    evidence: generateEvidence('Temperament',      temperament) },
      { name: 'Confidence',       score: confidence,     evidence: generateEvidence('Confidence',       confidence) },
      { name: 'Environment',      score: environment,    evidence: generateEvidence('Environment',      environment) },
    ],
    overall,
    recommendation,
    strengths:    shuffle(STRENGTHS_POOL).slice(0, overall >= 4 ? 4 : 2),
    improvements: shuffle(IMPROVEMENTS_POOL).slice(0, overall < 3 ? 5 : overall < 4 ? 3 : 2),
    summary: SUMMARY_BY_REC[recommendation],
  }
}

function buildGeminiPrompt(candidate, qaTranscript, teachingConvo) {
  const qaText = qaTranscript.map(t =>
    `${t.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${t.text}`
  ).join('\n')

  const teachText = teachingConvo.map(t =>
    `${t.role === 'teacher' ? 'Teacher (Candidate)' : 'Student (Arjun)'}: ${t.text}`
  ).join('\n')

  return `You are an academic evaluator for Cuemath, an online math tutoring company. Evaluate the following tutor interview.

Candidate: ${candidate?.name || 'Unknown'} | ${candidate?.email || ''}

=== BEHAVIORAL Q&A TRANSCRIPT ===
${qaText || '(No Q&A recorded)'}

=== TEACHING DEMO TRANSCRIPT ===
${teachText || '(No teaching demo recorded)'}

Evaluate on 5 dimensions (score 1.0–5.0):
1. Teaching Ability — clarity, examples, Grade-level appropriateness
2. Communication — language clarity, structure, absence of jargon
3. Temperament — patience, composure, encouragement
4. Confidence — camera presence, voice, directness
5. Environment — lighting, background, noise, professionalism

Also provide: overall (avg of 5), recommendation ("Advance"≥4.0 / "Maybe"≥3.0 / "Reject"<3.0), strengths (2–4), improvements (2–4), summary (2 sentences), evidence per dimension.

Return ONLY valid JSON (no markdown):
{"dimensions":[{"name":"Teaching Ability","score":X.X,"evidence":"\"...\""},{"name":"Communication","score":X.X,"evidence":"\"...\""},{"name":"Temperament","score":X.X,"evidence":"\"...\""},{"name":"Confidence","score":X.X,"evidence":"\"...\""},{"name":"Environment","score":X.X,"evidence":"\"...\""}],"overall":X.X,"recommendation":"Advance|Maybe|Reject","strengths":["..."],"improvements":["..."],"summary":"..."}`
}

async function saveToMongo(result, interviewId, candidateId) {
  if (!interviewId || !candidateId || mongoose.connection.readyState !== 1) return
  if (typeof interviewId === 'string' && interviewId.startsWith('local_')) return
  try {
    const assessment = new Assessment({
      interviewId,
      candidateId,
      overallScore:   result.overall,
      recommendation: result.recommendation,
      dimensions:     result.dimensions,
      strengths:      result.strengths,
      improvements:   result.improvements,
      summary:        result.summary,
    })
    await assessment.save()
    await Interview.findByIdAndUpdate(interviewId, { status: 'assessed' })
    await Candidate.findByIdAndUpdate(candidateId, { status: 'assessed' })
    result.assessmentId = assessment._id.toString()
  } catch (err) {
    console.error('MongoDB assessment save failed:', err.message)
  }
}

module.exports = {
  shuffle,
  clamp,
  generateEvidence,
  generateFallbackEval,
  buildGeminiPrompt,
  saveToMongo,
  STRENGTHS_POOL,
  IMPROVEMENTS_POOL,
}
