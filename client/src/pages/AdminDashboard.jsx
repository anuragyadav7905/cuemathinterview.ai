import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Download, ChevronRight, Star, TrendingUp, MessageSquare,
  User, BadgeCheck, Users, BarChart2, ClipboardList, ArrowUpRight,
  Filter, Eye, LogOut, Info
} from 'lucide-react'
import { Logo } from '../components/Navbar'
import ScoreBar from '../components/ui/ScoreBar'
import { fetchInterviews } from '../services/api'
import { MOCK_CANDIDATES, BADGE_STYLES, BADGE_ICON } from '../lib/constants'
import { useAuth } from '../context/AuthContext'
import { useInterview } from '../context/InterviewContext'

// ── Dashboard tab ────────────────────────────────────────────────────────────
function DashboardTab({ candidates, onViewCandidate }) {
  const total    = candidates.length
  const advanced = candidates.filter(c => c.recommendation === 'Advance').length
  const maybe    = candidates.filter(c => c.recommendation === 'Maybe').length
  const rejected = candidates.filter(c => c.recommendation === 'Reject').length
  const avgScore = (candidates.reduce((s, c) => s + c.score, 0) / total).toFixed(1)

  const scoreColor = s => s >= 4 ? 'text-green-600' : s >= 3 ? 'text-yellow-600' : 'text-red-500'

  const STATS = [
    { label: 'Total Screened',  value: total,           icon: <Users size={20} />,      color: 'bg-blue-50 text-blue-600',    delta: '+2 this week' },
    { label: 'Advance',         value: advanced,        icon: BADGE_ICON.Advance,        color: 'bg-green-50 text-green-600',  delta: `${Math.round(advanced/total*100)}% rate` },
    { label: 'Under Review',    value: maybe,           icon: BADGE_ICON.Maybe,          color: 'bg-yellow-50 text-yellow-600', delta: 'Needs decision' },
    { label: 'Avg Score',       value: `${avgScore}/5`, icon: <Star size={20} />,        color: 'bg-purple-50 text-purple-600', delta: 'All candidates' },
  ]

  const SCORE_RANGES = [
    { label: '4.0 – 5.0 ✦ Advance', count: candidates.filter(c => c.score >= 4).length,                  color: '#22C55E' },
    { label: '2.5 – 3.9  Maybe',     count: candidates.filter(c => c.score >= 2.5 && c.score < 4).length, color: '#FFD000' },
    { label: '0 – 2.4    Reject',    count: candidates.filter(c => c.score < 2.5).length,                 color: '#EF4444' },
  ]
  const maxCount = Math.max(...SCORE_RANGES.map(r => r.count), 1)

  return (
    <div className="flex-1 overflow-y-auto w-full p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#1A1A1A]">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Tutor screening summary — April 2026</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <p className="text-3xl font-black text-[#1A1A1A]">{s.value}</p>
              <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">{s.delta}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-5">Score Distribution</h3>
            <div className="flex flex-col gap-4">
              {SCORE_RANGES.map((r, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-600">{r.label}</span>
                    <span className="text-xs font-bold text-[#1A1A1A]">{r.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(r.count / maxCount) * 100}%`, backgroundColor: r.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-around text-center">
              {[
                { label: 'Advance', val: advanced, color: 'text-green-600' },
                { label: 'Maybe',   val: maybe,    color: 'text-yellow-600' },
                { label: 'Reject',  val: rejected, color: 'text-red-500' },
              ].map((item, i) => (
                <div key={i}>
                  <p className={`text-2xl font-black ${item.color}`}>{item.val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Top Performers</h3>
            <div className="flex flex-col gap-3">
              {[...candidates].sort((a, b) => b.score - a.score).slice(0, 3).map((c, i) => (
                <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-[#FFD000]/5 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                    i === 0 ? 'bg-[#FFD000] text-[#1A1A1A]' : i === 1 ? 'bg-gray-200 text-gray-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1A1A1A]">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.date} · {c.duration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-black ${scoreColor(c.score)}`}>{c.score}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${BADGE_STYLES[c.recommendation]}`}>
                      {BADGE_ICON[c.recommendation]} {c.recommendation}
                    </span>
                  </div>
                  <button
                    onClick={() => onViewCandidate(c)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">All Interviews</h3>
            <span className="text-xs text-gray-400">{total} total</span>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Candidate</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Result</th>
                <th className="px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...candidates].sort((a, b) => new Date(b.date) - new Date(a.date)).map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FFD000] to-orange-300 rounded-lg flex items-center justify-center text-sm font-black text-[#1A1A1A]">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1A1A1A]">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{c.date}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{c.duration}</td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-black ${scoreColor(c.score)}`}>{c.score}</span>
                    <span className="text-xs text-gray-300">/5</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${BADGE_STYLES[c.recommendation]}`}>
                      {BADGE_ICON[c.recommendation]} {c.recommendation}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onViewCandidate(c)}
                      className="text-xs text-[#1A1A1A] font-semibold hover:underline flex items-center gap-1"
                    >
                      View <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Candidates tab ───────────────────────────────────────────────────────────
function CandidatesTab({ candidates, initialSelected }) {
  const [selected, setSelected] = useState(initialSelected || candidates[0])
  const [search, setSearch]     = useState('')

  useEffect(() => {
    if (initialSelected) setSelected(initialSelected)
  }, [initialSelected])

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const scoreColor = s => s >= 4 ? 'text-green-600' : s >= 3 ? 'text-yellow-600' : 'text-red-500'

  function nextCandidate() {
    const idx = candidates.findIndex(c => c.id === selected.id)
    setSelected(candidates[(idx + 1) % candidates.length])
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#FFD000]"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{filtered.length} candidates</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full text-left px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selected?.id === c.id ? 'bg-[#FFD000]/8 border-l-4 border-l-[#FFD000]' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#1A1A1A] truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{c.date}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${BADGE_STYLES[c.recommendation]}`}>
                  {c.recommendation}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <Star size={10} className="fill-[#FFD000] text-[#FFD000]" />
                <span className={`text-xs font-bold ${scoreColor(c.score)}`}>{c.score}</span>
                <span className="text-xs text-gray-300">/5</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {selected && (
          <div className="p-8 max-w-4xl">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FFD000] to-orange-300 rounded-xl flex items-center justify-center text-2xl font-black text-[#1A1A1A]">
                    {selected.name[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#1A1A1A]">{selected.name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{selected.email} · {selected.phone}</p>
                    <p className="text-xs text-gray-400 mt-1">Interviewed {selected.date} · Duration {selected.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-black ${scoreColor(selected.score)}`}>{selected.score}</div>
                  <div className="text-xs text-gray-400">out of 5.0</div>
                  <div className={`mt-2 inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full ${BADGE_STYLES[selected.recommendation]}`}>
                    <BadgeCheck size={14} /> {selected.recommendation}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Assessment Dimensions</h3>
              <div className="flex flex-col gap-3">
                {selected.dimensions.map((dim, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-bold text-[#1A1A1A] w-36 shrink-0">{dim.name}</span>
                      <div className="flex-1"><ScoreBar score={dim.score} /></div>
                    </div>
                    <p className="text-xs text-gray-400 italic ml-40 leading-relaxed">{dim.evidence}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-6">
              <div className="bg-white border border-green-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <TrendingUp size={15} /> Key Strengths
                </h3>
                <ul className="flex flex-col gap-2">
                  {selected.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-orange-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <MessageSquare size={15} /> Areas to Improve
                </h3>
                <ul className="flex flex-col gap-2">
                  {selected.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-orange-400 font-bold mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Interview Transcript</h3>
              <div className="flex flex-col gap-3">
                {selected.transcript.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'Candidate' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      msg.role === 'AI' ? 'bg-[#1A1A1A] text-white' : 'bg-[#FFD000] text-[#1A1A1A]'
                    }`}>
                      {msg.role === 'AI' ? 'AI' : 'T'}
                    </div>
                    <div className={`max-w-xl px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'AI' ? 'bg-gray-100 text-[#1A1A1A]' : 'bg-[#FFD000]/15 text-[#1A1A1A]'
                    }`}>
                      <p className="text-[10px] font-bold text-gray-400 mb-1">{msg.role}</p>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 border border-gray-200 bg-white text-[#1A1A1A] text-sm font-bold px-6 py-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all">
                <Download size={16} /> Export PDF
              </button>
              <button
                onClick={nextCandidate}
                className="flex items-center gap-2 bg-[#FFD000] text-[#1A1A1A] text-sm font-bold px-6 py-3 rounded-xl hover:bg-[#f0c400] active:scale-95 transition-all"
              >
                Next Candidate <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Assessments tab ──────────────────────────────────────────────────────────
function AssessmentsTab({ candidates }) {
  const [sortBy, setSortBy]   = useState('score')
  const [filterBy, setFilterBy] = useState('All')
  const [expanded, setExpanded] = useState(null)

  const scoreColor = s => s >= 4 ? 'text-green-600' : s >= 3 ? 'text-yellow-600' : 'text-red-500'
  const DIM_NAMES = ['Teaching Ability', 'Communication', 'Temperament', 'Confidence', 'Environment']

  const sorted = [...candidates]
    .filter(c => filterBy === 'All' || c.recommendation === filterBy)
    .sort((a, b) => sortBy === 'score' ? b.score - a.score : sortBy === 'name' ? a.name.localeCompare(b.name) : new Date(b.date) - new Date(a.date))

  const avgDim = (dimName) => {
    const vals = candidates.map(c => c.dimensions.find(d => d.name === dimName)?.score || 0)
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  }

  return (
    <div className="flex-1 overflow-y-auto w-full p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1A1A1A]">Assessments</h1>
            <p className="text-sm text-gray-500 mt-1">Dimension-by-dimension comparison across all candidates</p>
          </div>
          <button className="flex items-center gap-2 border border-gray-200 bg-white text-[#1A1A1A] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all">
            <Download size={15} /> Export All
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-5">Cohort Average — All Dimensions</h3>
          <div className="grid grid-cols-5 gap-4">
            {DIM_NAMES.map(dim => {
              const avg  = parseFloat(avgDim(dim))
              const pct  = (avg / 5) * 100
              const color = pct >= 80 ? '#22C55E' : pct >= 60 ? '#FFD000' : '#EF4444'
              return (
                <div key={dim} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="4"
                        strokeDasharray={`${pct * 0.88} 88`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-[#1A1A1A]">{avg}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-tight">{dim}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {['All', 'Advance', 'Maybe', 'Reject'].map(f => (
              <button
                key={f}
                onClick={() => setFilterBy(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterBy === f ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Filter size={13} />
            <span>Sort by:</span>
            {['score', 'name', 'date'].map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize ${
                  sortBy === s ? 'bg-[#FFD000] text-[#1A1A1A]' : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-gray-400">{sorted.length} candidates</span>
        </div>

        <div className="flex flex-col gap-3">
          {sorted.map(c => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFD000] to-orange-300 rounded-xl flex items-center justify-center text-lg font-black text-[#1A1A1A] shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A1A1A]">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.email} · {c.date}</p>
                </div>

                <div className="hidden lg:flex items-center gap-3">
                  {c.dimensions.map((d, i) => {
                    const pct   = (d.score / 5) * 100
                    const color = pct >= 80 ? '#22C55E' : pct >= 60 ? '#FFD000' : '#EF4444'
                    return (
                      <div key={i} className="flex flex-col items-center gap-1" title={d.name}>
                        <div className="w-1.5 h-12 bg-gray-100 rounded-full overflow-hidden flex flex-col justify-end">
                          <div className="w-full rounded-full" style={{ height: `${pct}%`, backgroundColor: color }} />
                        </div>
                        <span className="text-[9px] text-gray-400">{d.score}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-2xl font-black ${scoreColor(c.score)}`}>{c.score}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${BADGE_STYLES[c.recommendation]}`}>
                    {BADGE_ICON[c.recommendation]} {c.recommendation}
                  </span>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${expanded === c.id ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {expanded === c.id && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4 bg-gray-50">
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {c.dimensions.map((d, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-gray-500 mb-2">{d.name}</p>
                        <ScoreBar score={d.score} />
                        <p className="text-[10px] text-gray-400 italic mt-2 leading-relaxed line-clamp-3">{d.evidence}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl border border-green-200 p-3">
                      <p className="text-xs font-bold text-green-700 mb-2">Strengths</p>
                      {c.strengths.map((s, i) => <p key={i} className="text-xs text-gray-600 mb-1">✓ {s}</p>)}
                    </div>
                    <div className="bg-white rounded-xl border border-orange-200 p-3">
                      <p className="text-xs font-bold text-orange-600 mb-2">Improvements</p>
                      {c.improvements.map((s, i) => <p key={i} className="text-xs text-gray-600 mb-1">→ {s}</p>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function mapInterviewToCandidate(iv) {
  const c = iv.candidateId || {}
  const a = iv.assessment
  const durationSec = iv.duration || 0
  return {
    id: iv._id,
    name: c.name || 'Unknown Candidate',
    email: c.email || '',
    phone: c.phone || '',
    date: new Date(iv.startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    duration: durationSec ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s` : '—',
    score: a?.overallScore ?? 0,
    recommendation: a?.recommendation || 'Under Review',
    dimensions: a?.dimensions || [],
    strengths: a?.strengths || [],
    improvements: a?.improvements || [],
    transcript: (iv.transcript || []).map(t => ({ role: t.role === 'ai' ? 'AI' : 'Candidate', text: t.text })),
    teachingTranscript: (iv.teachingTranscript || []).map(t => ({ role: t.role === 'teacher' ? 'Candidate' : 'Student', text: t.text })),
    summary: a?.summary || '',
  }
}

function loadFromLocalStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem('cuemath_evaluations') || '[]')
    return stored.map((entry, i) => ({
      id: `local-${entry.id || i}`,
      name: entry.candidate?.name || 'Unknown Candidate',
      email: entry.candidate?.email || '',
      phone: entry.candidate?.phone || '',
      date: entry.date || 'Recently',
      duration: entry.duration || '—',
      score: entry.evaluation?.overall ?? 0,
      recommendation: entry.evaluation?.recommendation || 'Under Review',
      dimensions: entry.evaluation?.dimensions || [],
      strengths: entry.evaluation?.strengths || [],
      improvements: entry.evaluation?.improvements || [],
      transcript: entry.transcript || [],
      teachingTranscript: (entry.teachingConvo || []).map(t => ({ role: t.role === 'teacher' ? 'Candidate' : 'Student', text: t.text })),
      summary: entry.evaluation?.summary || '',
    }))
  } catch (err) {
    console.error('localStorage parse failed:', err.message)
    return []
  }
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab]           = useState('Dashboard')
  const [jumpCandidate, setJumpCandidate]   = useState(null)
  const [realCandidates, setRealCandidates] = useState([])
  const { authLogout, user } = useAuth()
  const { resetInterview } = useInterview()
  const navigate = useNavigate()

  useEffect(() => {
    fetchInterviews()
      .then(data => {
        const mapped = data
          .filter(iv => iv.candidateId && iv.assessment)
          .map(mapInterviewToCandidate)
        setRealCandidates(mapped.length > 0 ? mapped : loadFromLocalStorage())
      })
      .catch(() => setRealCandidates(loadFromLocalStorage()))
  }, [])

  const TABS = [
    { id: 'Dashboard',   icon: <BarChart2 size={15} /> },
    { id: 'Candidates',  icon: <Users size={15} /> },
    { id: 'Assessments', icon: <ClipboardList size={15} /> },
  ]

  function handleViewCandidate(c) {
    setJumpCandidate(c)
    setActiveTab('Candidates')
  }

  function handleLogout() {
    authLogout()
    resetInterview()
    navigate('/', { replace: true })
  }

  const allCandidates = [...realCandidates, ...MOCK_CANDIDATES]

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="flex gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === t.id
                    ? 'bg-[#FFD000]/15 text-[#1A1A1A] font-semibold'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t.icon} {t.id}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user?.name && <span className="text-xs text-gray-500">{user.name}</span>}
          <div className="bg-[#1A1A1A] text-white text-xs font-bold px-3 py-1.5 rounded-lg">Admin</div>
          <div className="w-8 h-8 bg-gradient-to-br from-[#FFD000] to-orange-400 rounded-full flex items-center justify-center">
            <User size={14} className="text-[#1A1A1A]" />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#1A1A1A] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </nav>

      {/* Admin auth banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-8 py-2 flex items-center gap-2">
        <Info size={13} className="text-blue-500 shrink-0" />
        <p className="text-xs text-blue-600">Admin authentication coming soon — role-based access control will be added in a future release.</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'Dashboard'   && <DashboardTab   candidates={allCandidates} onViewCandidate={handleViewCandidate} />}
        {activeTab === 'Candidates'  && <CandidatesTab  candidates={allCandidates} initialSelected={jumpCandidate} />}
        {activeTab === 'Assessments' && <AssessmentsTab candidates={allCandidates} />}
      </div>
    </div>
  )
}
