import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import { Logo } from '../components/Navbar'
import CameraPiP from '../components/CameraPiP'
import { useCamera } from '../hooks/useCamera'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useTimer } from '../hooks/useTimer'
import { sendChatMessage, saveTeachingTranscript } from '../services/api'
import { TOOLS, COLORS, TOPIC, GRADE } from '../lib/constants'
import { Mic, MicOff, Camera, Undo2, Redo2, Trash2 } from 'lucide-react'

export default function TeachingDemo() {
  const navigate = useNavigate()
  const { addTeachingMessage, setDuration, interviewId, teachingConvo } = useInterview()

  const videoRef = useCamera()
  const { isRecording, liveText, start: startMic, stop: stopMicRaw } = useSpeechRecognition()
  const { elapsed, fmt, getDuration } = useTimer()

  // Canvas refs
  const canvasRef    = useRef(null)
  const historyRef   = useRef([])
  const redoRef      = useRef([])
  const isDrawingRef = useRef(false)
  const startPosRef  = useRef({ x: 0, y: 0 })
  const snapRef      = useRef(null)

  const chatBottomRef = useRef(null)

  const [tool, setTool]           = useState('pen')
  const [color, setColor]         = useState('#1A1A1A')
  const [lineWidth, setLineWidth] = useState(3)
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages]   = useState([
    { role: 'student', text: "Hi! I'm Arjun 👋 I'm ready to learn!", ts: new Date() }
  ])
  const [metrics] = useState({ confidence: 87, clarity: 76, pace: 91 })

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // ── Whiteboard helpers ──────────────────────────────────────────────────────

  const saveHistory = () => {
    const canvas = canvasRef.current
    historyRef.current.push(canvas.toDataURL())
    if (historyRef.current.length > 40) historyRef.current.shift()
    redoRef.current = []
  }

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width  / rect.width
    const scaleY = canvasRef.current.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    }
  }

  const applyStrokeStyle = (ctx) => {
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = color
    ctx.lineWidth   = tool === 'eraser' ? lineWidth * 5 : lineWidth
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
  }

  const drawShape = (ctx, start, end) => {
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = color
    ctx.lineWidth   = lineWidth
    ctx.lineCap     = 'round'
    if (tool === 'rect') {
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y)
    } else if (tool === 'line') {
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    } else if (tool === 'circle') {
      const rx = Math.abs(end.x - start.x) / 2
      const ry = Math.abs(end.y - start.y) / 2
      const cx = Math.min(end.x, start.x) + rx
      const cy = Math.min(end.y, start.y) + ry
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  const onMouseDown = (e) => {
    if (tool === 'select') return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    saveHistory()
    isDrawingRef.current = true
    startPosRef.current  = pos
    if (tool === 'pen' || tool === 'eraser') {
      applyStrokeStyle(ctx)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    } else {
      snapRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }
  }

  const onMouseMove = (e) => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const pos    = getPos(e)
    if (tool === 'pen' || tool === 'eraser') {
      applyStrokeStyle(ctx)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (tool === 'rect' || tool === 'circle' || tool === 'line') {
      ctx.putImageData(snapRef.current, 0, 0)
      drawShape(ctx, startPosRef.current, pos)
    }
  }

  const onMouseUp = (e) => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    if (tool === 'rect' || tool === 'circle' || tool === 'line') {
      ctx.putImageData(snapRef.current, 0, 0)
      drawShape(ctx, startPosRef.current, pos)
      snapRef.current = null
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  const handleCanvasClick = (e) => {
    if (tool !== 'text') return
    const pos  = getPos(e)
    const text = prompt('Enter text:')
    if (!text) return
    saveHistory()
    const ctx = canvasRef.current.getContext('2d')
    ctx.globalCompositeOperation = 'source-over'
    ctx.font      = `bold ${lineWidth * 5 + 12}px Inter, sans-serif`
    ctx.fillStyle = color
    ctx.fillText(text, pos.x, pos.y)
  }

  const undo = () => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    if (!historyRef.current.length) return
    redoRef.current.push(canvas.toDataURL())
    const prev = historyRef.current.pop()
    const img  = new Image()
    img.src    = prev
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0) }
  }

  const redo = () => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    if (!redoRef.current.length) return
    historyRef.current.push(canvas.toDataURL())
    const next = redoRef.current.pop()
    const img  = new Image()
    img.src    = next
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0) }
  }

  const clearCanvas = () => {
    saveHistory()
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  }

  // ── Mic & AI chat ───────────────────────────────────────────────────────────

  async function stopMic() {
    const spoken = stopMicRaw()
    if (!spoken) return

    const teacherMsg = { role: 'teacher', text: spoken, ts: new Date() }
    setMessages(p => [...p, teacherMsg])
    addTeachingMessage('teacher', spoken)
    setIsThinking(true)

    try {
      const data = await sendChatMessage(spoken)
      setMessages(p => [...p, { role: 'student', text: data.text, ts: new Date() }])
      addTeachingMessage('student', data.text)
    } catch (err) {
      console.error('Chat message failed:', err.message)
      const fallback = "Can you explain that again? 🤔"
      setMessages(p => [...p, { role: 'student', text: fallback, ts: new Date() }])
    } finally {
      setIsThinking(false)
    }
  }

  function handleMicToggle() {
    if (isRecording) stopMic()
    else startMic()
  }

  function endSession() {
    setDuration(getDuration())
    if (interviewId && !String(interviewId).startsWith('local_')) {
      saveTeachingTranscript(interviewId, teachingConvo.map(t => ({ role: t.role, text: t.text }))).catch(() => {})
    }
    navigate('/complete')
  }

  const fmtTime = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Logo />
        <div className="text-center">
          <p className="text-sm font-bold text-[#1A1A1A]">Teaching Session — {TOPIC}</p>
          <p className="text-xs text-gray-400">Grade {GRADE} · Live Demo</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono text-gray-700">{fmt(elapsed)}</span>
          </div>
          <button
            id="end-session-btn"
            onClick={endSession}
            className="bg-red-500 text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-red-600 active:scale-95 transition-all"
          >
            End Session
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Whiteboard */}
        <div className="flex-[7] flex flex-col bg-white relative border-r border-gray-200">
          {/* Toolbar */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex-wrap">
            {TOOLS.map(t => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                title={t.label}
                className={`p-2 rounded-lg transition-all text-sm font-medium ${
                  tool === t.id ? 'bg-[#FFD000] text-[#1A1A1A] shadow' : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                {t.icon}
              </button>
            ))}

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                title={c}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? 'scale-125 border-gray-700' : 'border-gray-300 hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <select
              value={lineWidth}
              onChange={e => setLineWidth(Number(e.target.value))}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
            >
              {[1, 2, 3, 5, 8, 12].map(w => <option key={w} value={w}>{w}px</option>)}
            </select>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <button onClick={undo}        title="Undo"  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200"><Undo2  size={16} /></button>
            <button onClick={redo}        title="Redo"  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200"><Redo2  size={16} /></button>
            <button onClick={clearCanvas} title="Clear" className="p-2 rounded-lg text-gray-500 hover:bg-red-100 hover:text-red-500"><Trash2 size={16} /></button>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={1200}
              height={700}
              className="w-full h-full bg-white"
              style={{
                cursor: tool === 'select' ? 'default'
                      : tool === 'text'   ? 'text'
                      : tool === 'eraser' ? 'cell'
                      : 'crosshair'
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={() => {
                if (isDrawingRef.current && snapRef.current) {
                  canvasRef.current.getContext('2d').putImageData(snapRef.current, 0, 0)
                }
                isDrawingRef.current = false
              }}
              onClick={handleCanvasClick}
            />

            {/* Camera PiP */}
            <CameraPiP
              videoRef={videoRef}
              size="sm"
              className="absolute bottom-4 left-4"
            />

            {/* Active tool hint */}
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
              {TOOLS.find(t => t.id === tool)?.label}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-200 px-5 py-3 flex items-center gap-6 bg-gray-50">
            {[
              { label: 'Confidence', val: metrics.confidence, color: '#22C55E' },
              { label: 'Clarity',    val: metrics.clarity,    color: '#FFD000' },
              { label: 'Pace',       val: metrics.pace,       color: '#3B82F6' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{m.label}</span>
                <div className="w-24 bg-gray-200 rounded-full h-1.5">
                  <div className="h-full rounded-full" style={{ width: `${m.val}%`, backgroundColor: m.color }} />
                </div>
                <span className="text-xs font-bold text-[#1A1A1A]">{m.val}%</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleMicToggle}
                title={isRecording ? 'Stop & send' : 'Start speaking'}
                className={`p-3 rounded-full transition-all shadow ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#FFD000] text-[#1A1A1A] hover:bg-[#f0c400]'
                }`}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button className="p-3 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
                <Camera size={18} />
              </button>
            </div>
          </div>

          {/* Live transcript strip */}
          {(isRecording || liveText) && (
            <div className="px-4 py-2 bg-[#FFD000]/10 border-t border-[#FFD000]/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0"></div>
              <p className="text-sm text-[#1A1A1A] truncate">
                {liveText || <span className="text-gray-400 italic">Listening…</span>}
              </p>
            </div>
          )}
        </div>

        {/* Right: AI Student panel */}
        <div className="flex-[3] flex flex-col bg-white min-w-[260px] max-w-[360px]">
          <div className="p-5 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-xl shrink-0">
                🧒
              </div>
              <div>
                <p className="font-bold text-[#1A1A1A]">Arjun</p>
                <p className="text-xs text-gray-400">Grade {GRADE} Student</p>
              </div>
              <div className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                isRecording ? 'bg-green-100 text-green-600'
                : isThinking ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-500'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  isRecording ? 'bg-green-500 animate-pulse'
                  : isThinking  ? 'bg-blue-500 animate-pulse'
                  : 'bg-gray-400'
                }`}></div>
                {isRecording ? 'LISTENING' : isThinking ? 'THINKING' : 'WAITING'}
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'teacher' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'teacher'
                    ? 'bg-[#FFD000] text-[#1A1A1A] rounded-tr-sm'
                    : 'bg-gray-100 text-[#1A1A1A] rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 px-1">{fmtTime(msg.ts)}</p>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
                  {[0, 150, 300].map(d => (
                    <div
                      key={d}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* AI Recommendations */}
          <div className="border-t border-gray-200 p-4 shrink-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">AI Tips</p>
            {[
              '💡 Use pizza/pie visuals for fractions',
              '✅ Ask Arjun to repeat the concept back',
              '🎯 Give a practice problem to confirm understanding',
            ].map((tip, i) => (
              <p key={i} className="text-xs text-gray-600 mb-2 leading-relaxed">{tip}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
