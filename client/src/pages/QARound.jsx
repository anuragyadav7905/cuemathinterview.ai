import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import { Logo } from '../components/Navbar'
import CameraPiP from '../components/CameraPiP'
import { useCamera } from '../hooks/useCamera'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useTimer } from '../hooks/useTimer'
import { startInterview, saveTranscript } from '../services/api'
import { QUESTIONS } from '../lib/constants'
import { Mic, MicOff, ChevronRight } from 'lucide-react'

export default function QARound() {
  const navigate = useNavigate()
  const { candidate, addTranscript, setQuestionsAnswered, setDuration, interviewId, setInterviewId } = useInterview()

  const { videoRef, stopCamera } = useCamera()
  const { isRecording, liveText, start: startListening, stop: stopListening } = useSpeechRecognition()
  const { elapsed, fmt, getDuration } = useTimer()
  const synthRef = useRef(window.speechSynthesis)
  const localTranscriptRef = useRef([])

  const candidateId = candidate?._id

  useEffect(() => {
    if (candidateId && !interviewId) {
      startInterview(candidateId)
        .then(data => setInterviewId(data._id))
        .catch(() => setInterviewId(`local_${Date.now()}`))
    }
  }, [candidateId, interviewId, setInterviewId])

  const [qIndex, setQIndex] = useState(0)
  const [status, setStatus] = useState('speaking')

  const metrics = { confidence: 'Good', eyeContact: 'Yes', pace: 'Normal' }

  const speakQuestion = useCallback((text) => {
    synthRef.current.cancel()
    setStatus('speaking')
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.92
    utt.pitch = 1.05
    utt.voice = synthRef.current.getVoices().find(v => v.lang.startsWith('en')) || null
    utt.onend = () => setStatus('listening')
    synthRef.current.speak(utt)
  }, [])

  useEffect(() => {
    const loadVoices = () => speakQuestion(QUESTIONS[0])
    if (synthRef.current.getVoices().length) {
      loadVoices()
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    return () => synthRef.current.cancel()
  }, [speakQuestion])

  function advanceToTeaching() {
    stopCamera()
    if (interviewId && !String(interviewId).startsWith('local_')) {
      saveTranscript(interviewId, localTranscriptRef.current).catch(() => {})
    }
    navigate('/interview/teaching')
  }

  function handleStopListening() {
    const answer = stopListening() || '(No response recorded)'
    setStatus('processing')
    addTranscript('ai', QUESTIONS[qIndex])
    addTranscript('candidate', answer)
    localTranscriptRef.current.push({ role: 'ai', text: QUESTIONS[qIndex] })
    localTranscriptRef.current.push({ role: 'candidate', text: answer })

    setTimeout(() => {
      if (qIndex + 1 >= QUESTIONS.length) {
        setQuestionsAnswered(QUESTIONS.length)
        setDuration(getDuration())
        advanceToTeaching()
      } else {
        const next = qIndex + 1
        setQIndex(next)
        speakQuestion(QUESTIONS[next])
        setQuestionsAnswered(next + 1)
      }
    }, 800)
  }

  function toggleMic() {
    if (isRecording) handleStopListening()
    else if (status === 'listening') startListening()
  }

  const progressPct = (qIndex / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 flex items-center justify-between px-8 py-4">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">Question</span>
          <span className="text-[#1A1A1A] font-bold text-sm">
            {qIndex + 1} <span className="text-gray-400">of</span> {QUESTIONS.length}
          </span>
          <div className="w-32 bg-gray-200 rounded-full h-1.5">
            <div className="h-full bg-[#FFD000] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[#1A1A1A] font-mono text-sm">{fmt(elapsed)}</span>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main area */}
        <div className="flex-1 flex flex-col items-center justify-center px-12 relative">

          {/* AI waveform */}
          <div className="mb-10">
            <div className={`flex items-end gap-1.5 h-20 transition-opacity ${status === 'speaking' ? 'opacity-100' : 'opacity-20'}`}>
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 bg-[#FFD000] rounded-full animate-wave-${(i % 7) + 1}`}
                  style={{ height: '100%' }}
                />
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="max-w-2xl text-center mb-8">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Question {qIndex + 1}</p>
            <p className="text-[#1A1A1A] text-2xl font-semibold leading-relaxed">
              {QUESTIONS[qIndex]}
            </p>
          </div>

          {/* Status pill */}
          <div className={`flex items-center gap-2 mb-12 px-5 py-2 rounded-full text-sm font-medium ${
            status === 'speaking'   ? 'bg-[#FFD000]/15 text-[#a08000]' :
            status === 'listening'  ? 'bg-red-50 text-red-500 border border-red-100' :
            'bg-gray-100 text-gray-400'
          }`}>
            {status === 'speaking'  && '🔊 AI is speaking...'}
            {status === 'listening' && (isRecording ? '🔴 Recording your answer...' : '🎙 Tap mic to respond')}
            {status === 'processing' && '⏳ Processing...'}
          </div>

          {/* Mic button */}
          <button
            id="mic-toggle-btn"
            onClick={toggleMic}
            disabled={status === 'speaking' || status === 'processing'}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : status === 'listening'
                  ? 'bg-[#FFD000] hover:bg-[#f0c400]'
                  : 'bg-gray-200 cursor-not-allowed'
            }`}
          >
            {isRecording
              ? <MicOff size={28} className="text-white" />
              : <Mic size={28} className={status === 'listening' ? 'text-[#1A1A1A]' : 'text-gray-400'} />
            }
          </button>

          {/* Live transcript */}
          {(liveText || isRecording) && (
            <div className="mt-8 max-w-xl w-full bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Live Transcript</p>
              <p className="text-[#1A1A1A] text-sm leading-relaxed min-h-[1.5rem]">
                {liveText || <span className="text-gray-400 italic">Listening...</span>}
              </p>
            </div>
          )}

          {/* Camera PiP */}
          <CameraPiP
            videoRef={videoRef}
            size="md"
            className="absolute bottom-8 left-8"
            metrics={[
              { label: 'Confidence', val: metrics.confidence, color: 'text-green-600' },
              { label: 'Eye Contact', val: metrics.eyeContact, color: 'text-green-600' },
              { label: 'Pace',        val: metrics.pace,       color: 'text-[#a08000]' },
            ]}
          />
        </div>

        {/* Right sidebar */}
        <div className="w-72 border-l border-gray-200 bg-white p-6 flex flex-col gap-4">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Session Progress</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Q&A Round',     active: true,  done: false },
              { label: 'Teaching Demo', active: false, done: false },
              { label: 'Results',       active: false, done: false },
            ].map((step, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
                step.active ? 'border-[#FFD000]/50 bg-[#FFD000]/10' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${step.active ? 'bg-[#FFD000]' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${step.active ? 'text-[#1A1A1A] font-semibold' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {step.active && <ChevronRight size={14} className="text-[#FFD000] ml-auto" />}
              </div>
            ))}
          </div>

          {/* Questions list */}
          <div className="mt-4">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">Questions</h3>
            <div className="flex flex-col gap-2">
              {QUESTIONS.map((q, i) => (
                <div key={i} className={`text-xs p-2.5 rounded-lg border flex items-center gap-2 ${
                  i === qIndex ? 'border-[#FFD000]/50 bg-[#FFD000]/10 text-[#1A1A1A]'
                  : i < qIndex ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-gray-50 text-gray-400'
                }`}>
                  <span className="font-bold shrink-0">{i + 1}.</span>
                  {i < qIndex
                    ? <span>Answered ✓</span>
                    : i === qIndex
                      ? <span className="truncate">{q.slice(0, 40)}…</span>
                      : <span className="italic">Locked</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
