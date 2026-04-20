import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import PreInterview from './pages/PreInterview'
import QARound from './pages/QARound'
import TeachingDemo from './pages/TeachingDemo'
import InterviewComplete from './pages/InterviewComplete'
import AdminDashboard from './pages/AdminDashboard'
import { InterviewProvider } from './context/InterviewContext'
import './index.css'

export default function App() {
  return (
    <InterviewProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1A1A1A', color: '#fff', borderRadius: '8px' },
          success: { iconTheme: { primary: '#FFD000', secondary: '#1A1A1A' } }
        }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pre-interview" element={<PreInterview />} />
          <Route path="/interview/qa" element={<QARound />} />
          <Route path="/interview/teaching" element={<TeachingDemo />} />
          <Route path="/complete" element={<InterviewComplete />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </InterviewProvider>
  )
}
