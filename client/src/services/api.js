import axios from 'axios'

export const registerCandidate = (data) =>
  axios.post('/api/candidates', data).then(r => r.data)

export const sendChatMessage = (message) =>
  axios.post('/api/chat', { message }).then(r => r.data)

export const submitEvaluation = (data) =>
  axios.post('/api/evaluate', data).then(r => r.data)

export const startInterview = (candidateId) =>
  axios.post('/api/interviews/start', { candidateId }).then(r => r.data)

export const saveTranscript = (interviewId, entries) =>
  axios.post(`/api/interviews/${interviewId}/transcript`, { entries }).then(r => r.data)

export const saveTeachingTranscript = (interviewId, entries) =>
  axios.post(`/api/interviews/${interviewId}/teaching-transcript`, { entries }).then(r => r.data)

export const completeInterview = (interviewId, duration) =>
  axios.post(`/api/interviews/${interviewId}/complete`, { duration }).then(r => r.data)

export const fetchInterviews = () =>
  axios.get('/api/interviews').then(r => r.data)
