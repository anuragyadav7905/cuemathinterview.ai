import { createContext, useContext, useState } from 'react'

const InterviewContext = createContext(null)

export function InterviewProvider({ children }) {
  const [candidate, setCandidate] = useState(null)
  const [interviewId, setInterviewId] = useState(null)
  const [transcript, setTranscript] = useState([])
  const [teachingConvo, setTeachingConvo] = useState([])
  const [duration, setDuration] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [evaluation, setEvaluation] = useState(null)

  function addTranscript(role, text) {
    setTranscript(prev => [...prev, { role, text, timestamp: new Date().toISOString() }])
  }

  function addTeachingMessage(role, text) {
    setTeachingConvo(prev => [...prev, { role, text, timestamp: new Date().toISOString() }])
  }

  function resetInterview() {
    setCandidate(null)
    setInterviewId(null)
    setTranscript([])
    setTeachingConvo([])
    setDuration(0)
    setQuestionsAnswered(0)
    setEvaluation(null)
  }

  return (
    <InterviewContext.Provider value={{
      candidate, setCandidate,
      interviewId, setInterviewId,
      transcript, addTranscript,
      teachingConvo, addTeachingMessage,
      duration, setDuration,
      questionsAnswered, setQuestionsAnswered,
      evaluation, setEvaluation,
      resetInterview,
    }}>
      {children}
    </InterviewContext.Provider>
  )
}

export function useInterview() {
  return useContext(InterviewContext)
}
