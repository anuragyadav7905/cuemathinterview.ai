import { useEffect, useState } from 'react'
import axios from 'axios'
import { useInterview } from '../context/InterviewContext'
import { CheckCircle, ExternalLink, Clock, MessageSquare, Award, LayoutDashboard, Loader2, AlertTriangle } from 'lucide-react'

export default function InterviewComplete() {
  const { candidate, duration, questionsAnswered, transcript, teachingConvo, interviewId, evaluation, setEvaluation } = useInterview()
  const [evalStatus, setEvalStatus] = useState('loading') // loading | done | error
  const totalMin = Math.floor((duration || 0) / 60)
  const totalSec = (duration || 0) % 60

  useEffect(() => {
    async function runEval() {
      try {
        // 1. Persist transcripts and mark interview complete in MongoDB
        if (interviewId && !String(interviewId).startsWith('local_')) {
          await axios.post(`/api/interviews/${interviewId}/complete`, { duration }).catch(() => {})
        }

        // 2. Run Gemini evaluation (server saves Assessment to MongoDB automatically)
        const { data } = await axios.post('/api/evaluate', {
          candidate,
          qaTranscript: transcript,
          teachingConvo,
          interviewId,
          candidateId: candidate?._id,
        })
        setEvaluation(data)

        // 3. Also persist to localStorage as a fallback for admin dashboard
        const stored = JSON.parse(localStorage.getItem('cuemath_evaluations') || '[]')
        const entry = {
          id: Date.now().toString(),
          candidate,
          evaluation: data,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          duration: `${totalMin}m ${totalSec}s`,
          questionsAnswered: questionsAnswered || 6,
          transcript: transcript.map(t => ({ role: t.role === 'ai' ? 'AI' : 'Candidate', text: t.text })),
          teachingConvo: teachingConvo.map(t => ({ role: t.role, text: t.text })),
        }
        stored.unshift(entry)
        localStorage.setItem('cuemath_evaluations', JSON.stringify(stored.slice(0, 20)))
        setEvalStatus('done')
      } catch {
        setEvalStatus('error')
      }
    }
    runEval()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const scoreColor = s => s >= 4 ? 'text-green-600' : s >= 3 ? 'text-yellow-600' : 'text-red-500'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-10 py-4 flex items-center gap-3">
        <img src="/cuemath-logo.png" alt="Cuemath" className="h-7" onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }} />
        <div className="items-center gap-2 hidden"><div className="w-7 h-7 bg-[#FFD000] rounded-sm flex items-center justify-center"><span className="text-[#1A1A1A] font-black text-xs">C</span></div><span className="text-[#1A1A1A] font-black text-lg tracking-tight">CUEMATH</span></div>
      </nav>

      <div className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-lg w-full text-center px-8">
          {/* Success icon */}
          <div className="w-24 h-24 bg-[#FFD000] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#FFD000]/30">
            <CheckCircle size={44} className="text-[#1A1A1A]" strokeWidth={2.5} />
          </div>

          <h1 className="text-4xl font-black text-[#1A1A1A] mb-4">Interview Complete!</h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-10">
            Thank you, <strong>{candidate?.name || 'Candidate'}</strong>! Our team will review your
            interview and reach out within <strong>48 hours</strong>.
          </p>

          {/* Session summary */}
          <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-6 mb-6 text-left">
            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wide mb-4">Session Summary</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock size={16} className="text-[#FFD000]" />
                  <span className="text-sm">Duration</span>
                </div>
                <span className="text-sm font-bold text-[#1A1A1A]">
                  {totalMin}m {totalSec}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600">
                  <MessageSquare size={16} className="text-[#FFD000]" />
                  <span className="text-sm">Questions Answered</span>
                </div>
                <span className="text-sm font-bold text-[#1A1A1A]">{questionsAnswered || 6} / 6</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600">
                  <Award size={16} className="text-[#FFD000]" />
                  <span className="text-sm">AI Evaluation</span>
                </div>
                {evalStatus === 'loading' && (
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <Loader2 size={13} className="animate-spin" /> Analyzing…
                  </span>
                )}
                {evalStatus === 'done' && (
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Complete
                  </span>
                )}
                {evalStatus === 'error' && (
                  <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" /> Under Review
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Loading state */}
          {evalStatus === 'loading' && (
            <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-8 mb-6 flex flex-col items-center gap-4">
              <Loader2 size={36} className="animate-spin text-[#FFD000]" />
              <div>
                <p className="font-bold text-[#1A1A1A]">Generating your evaluation…</p>
                <p className="text-sm text-gray-400 mt-1">Gemini AI is analyzing your responses</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {evalStatus === 'error' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6 flex items-start gap-3 text-left">
              <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-yellow-800">Evaluation will be processed manually</p>
                <p className="text-xs text-yellow-600 mt-1">Our team will review your interview within 48 hours.</p>
              </div>
            </div>
          )}

          {/* Evaluation results */}
          {evalStatus === 'done' && evaluation && (
            <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl p-6 mb-6 text-left">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-1">Overall Score</p>
                  <p className={`text-5xl font-black ${scoreColor(evaluation.overall)}`}>
                    {evaluation.overall?.toFixed(1)}
                    <span className="text-lg text-gray-400 font-normal">/5</span>
                  </p>
                </div>
                <span className={`text-sm font-bold px-5 py-2 rounded-full ${
                  evaluation.recommendation === 'Advance' ? 'bg-green-100 text-green-700' :
                  evaluation.recommendation === 'Reject'  ? 'bg-red-100 text-red-600' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{evaluation.recommendation}</span>
              </div>

              {/* Dimension bars */}
              {evaluation.dimensions?.length > 0 && (
                <div className="flex flex-col gap-2.5 mb-5">
                  {evaluation.dimensions.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-32 shrink-0">{d.name}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(d.score / 5) * 100}%`,
                            backgroundColor: d.score >= 4 ? '#22C55E' : d.score >= 3 ? '#FFD000' : '#EF4444'
                          }}
                        />
                      </div>
                      <span className={`text-xs font-bold w-6 text-right ${scoreColor(d.score)}`}>{d.score?.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              )}

              {evaluation.strengths?.length > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-green-700 mb-2">Key Strengths</p>
                  {evaluation.strengths.map((s, i) => (
                    <p key={i} className="text-xs text-gray-700 mb-1">✓ {s}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* What happens next */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold text-sm text-white/60 uppercase tracking-wide mb-4">What happens next?</h3>
            {[
              { step: '1', text: 'AI analyzes your interview responses and teaching demo' },
              { step: '2', text: 'Our academic team reviews the AI assessment' },
              { step: '3', text: 'You receive an email with results within 48 hours' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3 mb-3">
                <div className="w-5 h-5 bg-[#FFD000] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-[#1A1A1A]">{s.step}</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://cuemath.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#FFD000] text-[#1A1A1A] font-bold px-8 py-4 rounded-xl hover:bg-[#f0c400] active:scale-95 transition-all text-sm"
            >
              Return to Cuemath.com <ExternalLink size={15} />
            </a>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 border-2 border-[#1A1A1A] text-[#1A1A1A] font-bold px-8 py-4 rounded-xl hover:bg-[#1A1A1A] hover:text-white active:scale-95 transition-all text-sm"
            >
              <LayoutDashboard size={15} /> View Admin Dashboard
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-400">
            Have questions? <a href="mailto:tutors@cuemath.com" className="text-[#1A1A1A] font-semibold hover:underline">tutors@cuemath.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
