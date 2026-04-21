import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import { useAuth } from '../context/AuthContext'
import { signupCandidate, loginCandidate } from '../services/api'
import toast from 'react-hot-toast'
import { Clock, Mic, HelpCircle, ChevronRight, Star, Shield, Zap, Eye, EyeOff } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { Logo } from '../components/Navbar'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

const INPUT_BASE = 'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all'
const INPUT_OK   = 'border-gray-200 focus:border-[#FFD000] focus:ring-2 focus:ring-[#FFD000]/20'
const INPUT_ERR  = 'border-red-400 bg-red-50'

function FieldError({ msg }) {
  return msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { setCandidate } = useInterview()
  const { authLogin, isAuthenticated } = useAuth()

  const [tab, setTab] = useState('signup') // 'login' | 'signup' | 'google'
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [signup, setSignup] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [login, setLogin]   = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  if (isAuthenticated) return <Navigate to="/pre-interview" replace />

  function validateSignup() {
    const e = {}
    if (!signup.name.trim())                                    e.name     = 'Full name is required'
    if (!signup.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))    e.email    = 'Valid email required'
    if (!signup.phone.match(/^\+?[\d\s\-]{10,}$/))             e.phone    = 'Valid phone number required'
    if (signup.password.length < 6)                             e.password = 'Minimum 6 characters'
    if (signup.password !== signup.confirm)                     e.confirm  = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateLogin() {
    const e = {}
    if (!login.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))  e.email    = 'Valid email required'
    if (!login.password)                                      e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSignup(evt) {
    evt.preventDefault()
    if (!validateSignup()) return
    setLoading(true)
    try {
      const data = await signupCandidate({
        name: signup.name.trim(),
        email: signup.email.trim(),
        phone: signup.phone.trim(),
        password: signup.password,
      })
      authLogin(data.token, data.candidate)
      setCandidate(data.candidate)
      toast.success(`Welcome, ${data.candidate.name}!`)
      navigate('/pre-interview')
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.'
      if (msg.includes('already registered')) {
        setErrors({ email: msg })
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(evt) {
    evt.preventDefault()
    if (!validateLogin()) return
    setLoading(true)
    try {
      const data = await loginCandidate({ email: login.email.trim(), password: login.password })
      authLogin(data.token, data.candidate)
      setCandidate(data.candidate)
      toast.success(`Welcome back, ${data.candidate.name}!`)
      navigate('/pre-interview')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      setErrors({ password: msg })
    } finally {
      setLoading(false)
    }
  }

  const tabBtn = (id, label) => (
    <button
      key={id}
      type="button"
      onClick={() => { setTab(id); setErrors({}) }}
      className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
        tab === id
          ? 'bg-[#FFD000] text-[#1A1A1A] shadow-sm'
          : 'text-gray-500 hover:text-[#1A1A1A]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top banner */}
      <div className="bg-[#1A1A1A] py-2 text-center">
        <p className="text-xs text-gray-400 tracking-widest uppercase">AI-Powered Tutor Screening</p>
      </div>

      {/* Navbar */}
      <nav className="border-b border-gray-100 px-12 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Tutor Assessment Platform</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-12 py-20 flex gap-16 items-start">
          {/* Left: Hero text */}
          <div className="flex-1 pt-4">
            <div className="inline-flex items-center gap-2 bg-[#FFD000]/10 border border-[#FFD000]/30 rounded-full px-4 py-1.5 mb-8">
              <Zap size={13} className="text-[#FFD000] fill-[#FFD000]" />
              <span className="text-xs font-semibold text-[#1A1A1A] tracking-wide">AI Interview · 10 Minutes</span>
            </div>

            <h1 className="text-5xl font-black text-[#1A1A1A] leading-tight mb-6">
              Your AI Teaching<br />
              <span className="relative">
                Interview
                <span className="absolute -bottom-1 left-0 w-full h-3 bg-[#FFD000]/40 -z-10 skew-x-2"></span>
              </span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-md">
              Complete a 10-minute AI-powered voice interview to qualify as a Cuemath tutor.
              Our AI evaluates your teaching ability, communication, and confidence in real time.
            </p>

            <div className="flex flex-col gap-4 mb-10">
              {[
                { icon: '🎙', text: 'Voice-based AI questions — no typing required' },
                { icon: '📐', text: 'Live teaching demo on a digital whiteboard' },
                { icon: '⚡', text: 'Instant AI assessment & feedback after completion' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-gray-600">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              {[
                { icon: <Clock size={18} />, label: '~10 Minutes', sub: 'Total duration' },
                { icon: <Mic size={18} />, label: 'Voice Based', sub: 'No typing needed' },
                { icon: <HelpCircle size={18} />, label: '5–7 Questions', sub: 'AI curated' },
              ].map((card, i) => (
                <div key={i} className="flex-1 border border-gray-200 rounded-xl p-4 hover:border-[#FFD000] transition-colors">
                  <div className="text-[#FFD000] mb-2">{card.icon}</div>
                  <p className="font-bold text-sm text-[#1A1A1A]">{card.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Auth card */}
          <div className="w-[420px] shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
              {/* Tab switcher */}
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
                {tabBtn('login', 'Login')}
                {tabBtn('signup', 'Sign Up')}
                <button
                  type="button"
                  title="Coming soon"
                  onClick={() => { setTab('google'); setErrors({}) }}
                  className={`flex-1 py-2.5 flex items-center justify-center rounded-lg transition-all ${
                    tab === 'google'
                      ? 'bg-[#FFD000] shadow-sm'
                      : 'text-gray-500 hover:text-[#1A1A1A]'
                  }`}
                >
                  <GoogleIcon />
                </button>
              </div>

              {/* ── LOGIN ── */}
              {tab === 'login' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-[#1A1A1A]">Welcome back</h2>
                    <p className="text-sm text-gray-500 mt-1">Login to continue your interview</p>
                  </div>
                  <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        placeholder="priya@example.com"
                        value={login.email}
                        onChange={e => setLogin(p => ({ ...p, email: e.target.value }))}
                        className={`${INPUT_BASE} ${errors.email ? INPUT_ERR : INPUT_OK}`}
                      />
                      <FieldError msg={errors.email} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={login.password}
                          onChange={e => setLogin(p => ({ ...p, password: e.target.value }))}
                          className={`${INPUT_BASE} pr-11 ${errors.password ? INPUT_ERR : INPUT_OK}`}
                        />
                        <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <FieldError msg={errors.password} />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#FFD000] text-[#1A1A1A] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#f0c400] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide mt-2"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] rounded-full animate-spin" /> : <>Login <ChevronRight size={16} /></>}
                    </button>
                    <p className="text-center text-xs text-gray-400">
                      No account?{' '}
                      <button type="button" onClick={() => { setTab('signup'); setErrors({}) }} className="text-[#1A1A1A] font-semibold hover:underline">
                        Sign up
                      </button>
                    </p>
                  </form>
                </>
              )}

              {/* ── SIGNUP ── */}
              {tab === 'signup' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-[#1A1A1A]">Create your account</h2>
                    <p className="text-sm text-gray-500 mt-1">Fill in your details to begin</p>
                  </div>
                  <form onSubmit={handleSignup} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        value={signup.name}
                        onChange={e => setSignup(p => ({ ...p, name: e.target.value }))}
                        className={`${INPUT_BASE} ${errors.name ? INPUT_ERR : INPUT_OK}`}
                      />
                      <FieldError msg={errors.name} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        placeholder="priya@example.com"
                        value={signup.email}
                        onChange={e => setSignup(p => ({ ...p, email: e.target.value }))}
                        className={`${INPUT_BASE} ${errors.email ? INPUT_ERR : INPUT_OK}`}
                      />
                      <FieldError msg={errors.email} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={signup.phone}
                        onChange={e => setSignup(p => ({ ...p, phone: e.target.value }))}
                        className={`${INPUT_BASE} ${errors.phone ? INPUT_ERR : INPUT_OK}`}
                      />
                      <FieldError msg={errors.phone} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={signup.password}
                          onChange={e => setSignup(p => ({ ...p, password: e.target.value }))}
                          className={`${INPUT_BASE} pr-11 ${errors.password ? INPUT_ERR : INPUT_OK}`}
                        />
                        <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <FieldError msg={errors.password} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Re-enter your password"
                          value={signup.confirm}
                          onChange={e => setSignup(p => ({ ...p, confirm: e.target.value }))}
                          className={`${INPUT_BASE} pr-11 ${errors.confirm ? INPUT_ERR : INPUT_OK}`}
                        />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <FieldError msg={errors.confirm} />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#FFD000] text-[#1A1A1A] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#f0c400] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide mt-1"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] rounded-full animate-spin" /> : <>Create Account <ChevronRight size={16} /></>}
                    </button>
                    <p className="text-center text-xs text-gray-400">
                      Already have an account?{' '}
                      <button type="button" onClick={() => { setTab('login'); setErrors({}) }} className="text-[#1A1A1A] font-semibold hover:underline">
                        Login
                      </button>
                    </p>
                  </form>
                </>
              )}

              {/* ── GOOGLE ── */}
              {tab === 'google' && (
                <div className="flex flex-col items-center justify-center py-10 gap-5">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <GoogleIcon />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[#1A1A1A] text-sm">Continue with Google</p>
                    <p className="text-xs text-gray-400 mt-1">Google login coming soon</p>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-3 border border-gray-200 rounded-xl px-6 py-3 text-sm font-medium text-gray-400 cursor-not-allowed bg-gray-50 w-full justify-center"
                  >
                    <GoogleIcon />
                    Sign in with Google
                  </button>
                </div>
              )}

              {/* Privacy note (login + signup only) */}
              {tab !== 'google' && (
                <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3">
                  <Shield size={14} className="text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-400 leading-relaxed">Your data is encrypted and used only for assessment purposes. We do not share it with third parties.</p>
                </div>
              )}
            </div>

            {/* Social proof */}
            <div className="mt-4 flex items-center justify-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-[#FFD000] text-[#FFD000]" />)}
              <span className="text-xs text-gray-500 ml-1">Trusted by 200,000+ tutors</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-12 py-5 flex items-center justify-between">
        <p className="text-xs text-gray-400">© 2026 Cuemath. All rights reserved.</p>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Service', 'tutors@cuemath.com'].map(link => (
            <a key={link} href="#" className="text-xs text-gray-400 hover:text-[#1A1A1A] transition-colors">{link}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
