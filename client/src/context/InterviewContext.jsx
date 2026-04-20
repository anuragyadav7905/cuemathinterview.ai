import { createContext, useContext, useState } from 'react'

const InterviewContext = createContext(null)

export function InterviewProvider({ children }) {
  const [candidate, setCandidate] = useState(null)        // { name, email, phone, _id }
  const [interviewId, setInterviewId] = useState(null)
  const [transcript, setTranscript] = useState([])        // [{role, text, timestamp}]
  const [teachingConvo, setTeachingConvo] = useState([])  // [{role, text, timestamp}]
  const [duration, setDuration] = useState(0)             // seconds
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [evaluation, setEvaluation] = useState(null)

  function addTranscript(role, text) {
    setTranscript(prev => [...prev, { role, text, timestamp: new Date().toISOString() }])
  }

  function addTeachingMessage(role, text) {
    setTeachingConvo(prev => [...prev, { role, text, timestamp: new Date().toISOString() }])
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
    }}>
      {children}
    </InterviewContext.Provider>
  )
}

export function useInterview() {
  return useContext(InterviewContext)
}
