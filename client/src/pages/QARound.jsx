import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import { Mic, MicOff, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const QUESTIONS = [
  "Tell me about yourself and your teaching experience.",
  "How do you explain a concept like fractions to a Grade 4 student who is struggling?",
  "Describe a time when a student didn't understand something despite your best efforts. What did you do?",
  "How do you keep students engaged during online sessions?",
  "What is your approach to handling a student who is losing confidence in mathematics?",
  "How do you personalize your teaching style for different types of learners?",
]

export default function QARound() {
  const navigate = useNavigate()
  const { candidate, addTranscript, setQuestionsAnswered, setDuration } = useInterview()
  const videoRef = useRef(null)
  const recognitionRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)
  const startTimeRef = useRef(Date.now())

  const [qIndex, setQIndex] = useState(0)
  const [status, setStatus] = useState('speaking') // speaking | listening | processing
  const [isRecording, setIsRecording] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [metrics] = useState({ confidence: 'Good', eyeContact: 'Yes', pace: 'Normal' })

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // Camera
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (videoRef.current) videoRef.current.srcObject = stream
    }).catch(() => {})
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // Speak question
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

  // Speech recognition
  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser')
      return
    }
    const rec = new SpeechRecognition()
    recognitionRef.current = rec
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-IN'

    rec.onresult = (e) => {
      const interim = Array.from(e.results).map(r => r[0].transcript).join(' ')
      setLiveTranscript(interim)
    }
    rec.onerror = () => setIsRecording(false)
    rec.start()
    setIsRecording(true)
    setStatus('listening')
    setLiveTranscript('')
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
    setStatus('processing')

    const answer = liveTranscript || '(No response recorded)'
    addTranscript('ai', QUESTIONS[qIndex])
    addTranscript('candidate', answer)
    setLiveTranscript('')

    setTimeout(() => {
      if (qIndex + 1 >= QUESTIONS.length) {
        setQuestionsAnswered(QUESTIONS.length)
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
        navigate('/interview/teaching')
      } else {
        const next = qIndex + 1
        setQIndex(next)
        speakQuestion(QUESTIONS[next])
        setQuestionsAnswered(next + 1)
      }
    }, 800)
  }

  function toggleMic() {
    if (isRecording) stopListening()
    else if (status === 'listening') startListening()
  }

  const progressPct = ((qIndex) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src="/cuemath-logo.png" alt="Cuemath" className="h-7 invert" onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }} />
          <div className="items-center gap-2 hidden"><div className="w-7 h-7 bg-[#FFD000] rounded-sm flex items-center justify-center"><span className="text-[#1A1A1A] font-black text-xs">C</span></div><span className="text-white font-black text-lg tracking-tight">CUEMATH</span></div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">Question</span>
          <span className="text-white font-bold text-sm">{qIndex + 1} <span className="text-gray-500">of</span> {QUESTIONS.length}</span>
          <div className="w-32 bg-white/10 rounded-full h-1.5">
            <div className="h-full bg-[#FFD000] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse-red"></div>
          <span className="text-white font-mono text-sm">{fmt(elapsed)}</span>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main area */}
        <div className="flex-1 flex flex-col items-center justify-center px-12 relative">
          {/* AI waveform */}
          <div className="mb-10">
            <div className={`flex items-end gap-1.5 h-20 ${status === 'speaking' ? 'opacity-100' : 'opacity-30'} transition-opacity`}>
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
            <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Question {qIndex + 1}</p>
            <p className="text-white text-2xl font-semibold leading-relaxed">
              {QUESTIONS[qIndex]}
            </p>
          </div>

          {/* Status */}
          <div className={`flex items-center gap-2 mb-12 px-5 py-2 rounded-full text-sm font-medium ${
            status === 'speaking' ? 'bg-[#FFD000]/20 text-[#FFD000]' :
            status === 'listening' ? 'bg-red-500/20 text-red-400' :
            'bg-white/10 text-gray-400'
          }`}>
            {status === 'speaking' && '🔊 AI is speaking...'}
            {status === 'listening' && (isRecording ? '🔴 Recording your answer...' : '🎙 Tap mic to respond')}
            {status === 'processing' && '⏳ Processing...'}
          </div>

          {/* Mic button */}
          <button
            id="mic-toggle-btn"
            onClick={toggleMic}
            disabled={status === 'speaking' || status === 'processing'}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-2xl ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : status === 'listening'
                  ? 'bg-[#FFD000] hover:bg-[#f0c400]'
                  : 'bg-white/10 cursor-not-allowed'
            }`}
          >
            {isRecording ? <MicOff size={28} className="text-white" /> : <Mic size={28} className="text-[#1A1A1A]" />}
          </button>

          {/* Live transcript */}
          {(liveTranscript || isRecording) && (
            <div className="mt-8 max-w-xl w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3">
              <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Live Transcript</p>
              <p className="text-white/90 text-sm leading-relaxed min-h-[1.5rem]">
                {liveTranscript || <span className="text-gray-500 italic">Listening...</span>}
              </p>
            </div>
          )}

          {/* Camera PiP */}
          <div className="absolute bottom-8 left-8">
            <div className="w-[200px] h-[150px] bg-[#111] rounded-xl overflow-hidden border-2 border-white/20 relative">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-white text-xs">LIVE</span>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              {[
                { label: 'Confidence', val: metrics.confidence, color: 'text-green-400' },
                { label: 'Eye Contact', val: metrics.eyeContact, color: 'text-green-400' },
                { label: 'Pace', val: metrics.pace, color: 'text-[#FFD000]' },
              ].map((m, i) => (
                <div key={i} className="bg-white/5 rounded-lg px-2 py-1 text-center">
                  <p className="text-[10px] text-gray-500">{m.label}</p>
                  <p className={`text-xs font-semibold ${m.color}`}>{m.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 border-l border-white/10 p-6 flex flex-col gap-4">
          <h3 className="text-white/60 text-xs uppercase tracking-wider font-semibold">Session Progress</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Q&A Round', active: true, done: false },
              { label: 'Teaching Demo', active: false, done: false },
              { label: 'Results', active: false, done: false },
            ].map((step, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
                step.active ? 'border-[#FFD000]/50 bg-[#FFD000]/10' : 'border-white/10 bg-white/5'
              }`}>
                <div className={`w-2 h-2 rounded-full ${step.active ? 'bg-[#FFD000]' : 'bg-white/20'}`}></div>
                <span className={`text-sm ${step.active ? 'text-white font-semibold' : 'text-gray-500'}`}>{step.label}</span>
                {step.active && <ChevronRight size={14} className="text-[#FFD000] ml-auto" />}
              </div>
            ))}
          </div>

          {/* Questions list */}
          <div className="mt-4">
            <h3 className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">Questions</h3>
            <div className="flex flex-col gap-2">
              {QUESTIONS.map((q, i) => (
                <div key={i} className={`text-xs p-2.5 rounded-lg border flex items-center gap-2 ${
                  i === qIndex ? 'border-[#FFD000]/50 bg-[#FFD000]/10 text-white'
                  : i < qIndex ? 'border-green-500/30 bg-green-500/10 text-green-400'
                  : 'border-white/10 text-gray-600'
                }`}>
                  <span className="font-bold shrink-0">{i + 1}.</span>
                  {i < qIndex
                    ? <span>Answered ✓</span>
                    : i === qIndex
                      ? <span className="truncate">{q.slice(0, 40)}…</span>
                      : <span className="italic opacity-40">Locked</span>
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
