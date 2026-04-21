import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import Navbar from '../components/Navbar'
import { Camera, Mic, Volume2, Wifi, CheckCircle, XCircle, ChevronRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PreInterview() {
  const navigate = useNavigate()
  const { candidate } = useInterview()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)

  const [checks, setChecks] = useState({
    camera: 'pending',
    mic: 'pending',
    speaker: 'pending',
    internet: 'pending'
  })
  const [audioLevel, setAudioLevel] = useState(0)
  const [consent, setConsent] = useState(false)
  const [speakerTested, setSpeakerTested] = useState(false)

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setChecks(p => ({ ...p, camera: 'pass', mic: 'pass' }))
        startAudioAnalysis(stream)
      } catch {
        setChecks(p => ({ ...p, camera: 'fail', mic: 'fail' }))
      }
    }
    initCamera()
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (audioCtxRef.current) audioCtxRef.current.close()
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    setChecks(p => ({ ...p, internet: navigator.onLine ? 'pass' : 'fail' }))
  }, [])

  function startAudioAnalysis(stream) {
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const analyser = ctx.createAnalyser()
    analyserRef.current = analyser
    analyser.fftSize = 256
    const src = ctx.createMediaStreamSource(stream)
    src.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)

    function tick() {
      analyser.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length
      setAudioLevel(Math.min(100, avg * 2.5))
      animFrameRef.current = requestAnimationFrame(tick)
    }
    tick()
  }

  function playTestSound() {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 440
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start()
    osc.stop(ctx.currentTime + 0.8)
    setSpeakerTested(true)
    setChecks(p => ({ ...p, speaker: 'pass' }))
    toast.success('Speaker test passed!')
  }

  const allPassed = checks.camera === 'pass' && checks.mic === 'pass' &&
    checks.speaker === 'pass' && checks.internet === 'pass'
  const canStart = allPassed && consent

  function handleStart() {
    if (!candidate) {
      toast.error('Please register first')
      navigate('/')
      return
    }
    navigate('/interview/qa')
  }

  const statusIcon = (status) => {
    if (status === 'pass') return <CheckCircle size={18} className="text-green-500" />
    if (status === 'fail') return <XCircle size={18} className="text-red-500" />
    return <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-300 border-t-[#FFD000] animate-spin" />
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar breadcrumb="Pre-Interview Setup" />

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1A1A1A]">
            Welcome, {candidate?.name || 'Candidate'}! 👋
          </h1>
          <p className="text-gray-500 mt-2">Let's make sure everything is set up before we begin your interview.</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left col: Timeline + Tips */}
          <div className="col-span-1 flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-sm text-[#1A1A1A] mb-5 uppercase tracking-wide">Interview Flow</h3>
              <div className="flex flex-col gap-0">
                {[
                  { phase: '01', title: 'Q&A Round', time: '~4 min', desc: 'AI asks questions, camera on', color: 'bg-[#FFD000]' },
                  { phase: '02', title: 'Teaching Demo', time: '~6 min', desc: 'Whiteboard + AI student bot', color: 'bg-[#1A1A1A]' },
                  { phase: '03', title: 'Results', time: 'Instant', desc: 'AI generates full assessment', color: 'bg-green-500' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center shrink-0 z-10`}>
                        <span className={`text-xs font-bold ${item.color === 'bg-[#FFD000]' ? 'text-[#1A1A1A]' : 'text-white'}`}>{item.phase}</span>
                      </div>
                      {i < 2 && <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>}
                    </div>
                    <div className="pb-6">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[#1A1A1A]">{item.title}</p>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FFD000]/8 border border-[#FFD000]/30 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
                <AlertCircle size={15} /> Quick Tips
              </h3>
              {[
                'Find a quiet, well-lit room',
                'Look directly at the camera',
                'Speak clearly and at a steady pace',
                'Keep whiteboard supplies handy',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="text-[#FFD000] font-bold text-xs mt-0.5">›</span>
                  <p className="text-xs text-gray-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right col: Environment checks */}
          <div className="col-span-2 flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">Environment Check</h3>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="bg-[#1A1A1A] rounded-xl overflow-hidden aspect-video relative">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    {checks.camera !== 'pass' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera size={28} className="text-gray-600" />
                      </div>
                    )}
                    {checks.camera === 'pass' && (
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-medium">LIVE</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Camera size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">Camera</p>
                        <p className="text-xs text-gray-400">{checks.camera === 'pass' ? 'Detected' : checks.camera === 'fail' ? 'Not found' : 'Checking...'}</p>
                      </div>
                    </div>
                    {statusIcon(checks.camera)}
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Mic size={16} className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">Microphone</p>
                          <p className="text-xs text-gray-400">Speak to test</p>
                        </div>
                      </div>
                      {statusIcon(checks.mic)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-[#FFD000] rounded-full transition-all duration-100"
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Volume2 size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">Speaker</p>
                        <p className="text-xs text-gray-400">{speakerTested ? 'Test passed ✓' : 'Click to test'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={playTestSound}
                        className="text-xs bg-gray-200 hover:bg-[#FFD000] text-[#1A1A1A] font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Play
                      </button>
                      {statusIcon(checks.speaker)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Wifi size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">Internet</p>
                        <p className="text-xs text-gray-400">{checks.internet === 'pass' ? 'Connected' : 'No connection'}</p>
                      </div>
                    </div>
                    {statusIcon(checks.internet)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <label className="flex items-start gap-3 cursor-pointer mb-5">
                <input
                  id="consent-checkbox"
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#FFD000] cursor-pointer"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I consent to <strong>video and audio recording</strong> during this interview session for evaluation purposes.
                  Recordings are processed securely and used solely for candidate assessment.
                </span>
              </label>

              <button
                id="start-interview-ready-btn"
                onClick={handleStart}
                disabled={!canStart}
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${
                  canStart
                    ? 'bg-[#FFD000] text-[#1A1A1A] hover:bg-[#f0c400] active:scale-95 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canStart ? (
                  <>I'm Ready — Start Interview <ChevronRight size={16} /></>
                ) : (
                  `Complete all checks${!consent ? ' & give consent' : ''} to continue`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
