import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Clock, Mic, HelpCircle, ChevronRight, Star, Shield, Zap } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { setCandidate } = useInterview()
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (!form.phone.match(/^\+?[\d\s\-]{10,}$/)) e.phone = 'Valid phone number required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(evt) {
    evt.preventDefault()
    if (!validate()) return
    setLoading(true)

    const candidateData = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    }

    try {
      const { data } = await axios.post('/api/candidates', candidateData)
      setCandidate(data)
      toast.success(`Welcome, ${data.name}!`)
      navigate('/pre-interview')
    } catch {
      // Backend unavailable — proceed with local data
      setCandidate({ ...candidateData, _id: `local_${Date.now()}` })
      toast.success(`Welcome, ${candidateData.name}!`)
      navigate('/pre-interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top banner */}
      <div className="bg-[#1A1A1A] py-2 text-center">
        <p className="text-xs text-gray-400 tracking-widest uppercase">AI-Powered Tutor Screening</p>
      </div>

      {/* Navbar */}
      <nav className="border-b border-gray-100 px-12 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2">
          <img
            src="/cuemath-logo.png"
            alt="Cuemath"
            className="h-8"
            onError={e => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextSibling.style.display = 'flex'
            }}
          />
          <div className="items-center gap-2 hidden" id="logo-fallback">
            <div className="w-8 h-8 bg-[#FFD000] rounded-sm flex items-center justify-center">
              <span className="text-[#1A1A1A] font-black text-sm">C</span>
            </div>
            <span className="text-[#1A1A1A] font-black text-xl tracking-tight">CUEMATH</span>
          </div>
        </div>
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

            {/* Info cards */}
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

          {/* Right: Form card */}
          <div className="w-[420px] shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <h2 className="text-xl font-black text-[#1A1A1A]">Start Your Interview</h2>
                <p className="text-sm text-gray-500 mt-1">Fill in your details to begin</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                      errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#FFD000] focus:ring-2 focus:ring-[#FFD000]/20'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="priya@example.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#FFD000] focus:ring-2 focus:ring-[#FFD000]/20'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                      errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#FFD000] focus:ring-2 focus:ring-[#FFD000]/20'
                    }`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <button
                  id="start-interview-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FFD000] text-[#1A1A1A] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#f0c400] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[#1A1A1A]/30 border-t-[#1A1A1A] rounded-full animate-spin" />
                  ) : (
                    <>Start Interview <ChevronRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
                <Shield size={14} className="text-gray-400 shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">Your data is encrypted and used only for assessment purposes. We do not share it with third parties.</p>
              </div>
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
