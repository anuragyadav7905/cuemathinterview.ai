import { useState, useRef } from 'react'
import toast from 'react-hot-toast'

export function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState(false)
  const [liveText, setLiveText] = useState('')
  const liveTextRef = useRef('')
  const recognitionRef = useRef(null)

  function start() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      toast.error('Speech recognition not supported in this browser')
      return false
    }
    const rec = new SR()
    recognitionRef.current = rec
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-IN'
    rec.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ')
      liveTextRef.current = text
      setLiveText(text)
    }
    rec.onerror = () => setIsRecording(false)
    rec.start()
    liveTextRef.current = ''
    setLiveText('')
    setIsRecording(true)
    return true
  }

  function stop() {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsRecording(false)
    const text = liveTextRef.current.trim()
    liveTextRef.current = ''
    setLiveText('')
    return text
  }

  return { isRecording, liveText, start, stop }
}
