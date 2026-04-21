import axios from 'axios'
import API_BASE from '../config'

export const signupCandidate = (data) =>
  axios.post(`${API_BASE}/api/auth/signup`, data).then(r => r.data)

export const loginCandidate = (data) =>
  axios.post(`${API_BASE}/api/auth/login`, data).then(r => r.data)

export const registerCandidate = (data) =>
  axios.post(`${API_BASE}/api/candidates`, data).then(r => r.data)

export const sendChatMessage = (message) =>
  axios.post(`${API_BASE}/api/chat`, { message }).then(r => r.data)

export const submitEvaluation = (data) =>
  axios.post(`${API_BASE}/api/evaluate`, data).then(r => r.data)

export const startInterview = (candidateId) =>
  axios.post(`${API_BASE}/api/interviews/start`, { candidateId }).then(r => r.data)

export const saveTranscript = (interviewId, entries) =>
  axios.post(`${API_BASE}/api/interviews/${interviewId}/transcript`, { entries }).then(r => r.data)

export const saveTeachingTranscript = (interviewId, entries) =>
  axios.post(`${API_BASE}/api/interviews/${interviewId}/teaching-transcript`, { entries }).then(r => r.data)

export const completeInterview = (interviewId, duration) =>
  axios.post(`${API_BASE}/api/interviews/${interviewId}/complete`, { duration }).then(r => r.data)

export const fetchInterviews = () =>
  axios.get(`${API_BASE}/api/interviews`).then(r => r.data)
