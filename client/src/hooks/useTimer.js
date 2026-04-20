import { useState, useEffect, useRef } from 'react'

export function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    const iv = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const getDuration = () => Math.floor((Date.now() - startTimeRef.current) / 1000)

  return { elapsed, fmt, getDuration }
}
