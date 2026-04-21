import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import PreInterview from './pages/PreInterview'
import QARound from './pages/QARound'
import TeachingDemo from './pages/TeachingDemo'
import InterviewComplete from './pages/InterviewComplete'
import AdminDashboard from './pages/AdminDashboard'
import { InterviewProvider } from './context/InterviewContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <InterviewProvider>
          <BrowserRouter>
            <Toaster position="top-right" toastOptions={{
              style: { background: '#1A1A1A', color: '#fff', borderRadius: '8px' },
              success: { iconTheme: { primary: '#FFD000', secondary: '#1A1A1A' } }
            }} />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pre-interview" element={<ProtectedRoute><PreInterview /></ProtectedRoute>} />
              <Route path="/interview/qa" element={<ProtectedRoute><QARound /></ProtectedRoute>} />
              <Route path="/interview/teaching" element={<ProtectedRoute><TeachingDemo /></ProtectedRoute>} />
              <Route path="/complete" element={<ProtectedRoute><InterviewComplete /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </InterviewProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
