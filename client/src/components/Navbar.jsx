import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useInterview } from '../context/InterviewContext'

export function Logo({ darkMode = false }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/cuemath-logo.png"
        alt="Cuemath"
        className={`h-7 ${darkMode ? 'invert' : ''}`}
        onError={e => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextSibling.style.display = 'flex'
        }}
      />
      <div className="items-center gap-2 hidden">
        <div className="w-7 h-7 bg-[#FFD000] rounded-sm flex items-center justify-center">
          <span className="text-[#1A1A1A] font-black text-xs">C</span>
        </div>
        <span className={`${darkMode ? 'text-white' : 'text-[#1A1A1A]'} font-black text-lg tracking-tight`}>
          CUEMATH
        </span>
      </div>
    </div>
  )
}

export default function Navbar({ darkMode = false, breadcrumb, rightContent, centerContent, className = '' }) {
  const { isAuthenticated, authLogout, user } = useAuth()
  const { resetInterview } = useInterview()
  const navigate = useNavigate()

  function handleLogout() {
    authLogout()
    resetInterview()
    navigate('/', { replace: true })
  }

  const base = darkMode
    ? 'border-b border-white/10 px-8 py-4'
    : 'bg-white border-b border-gray-200 px-10 py-4'

  const hasRight = rightContent || centerContent || isAuthenticated
  const layout = hasRight ? 'flex items-center justify-between' : 'flex items-center gap-3'

  return (
    <nav className={`${base} ${layout} ${className}`}>
      <div className="flex items-center gap-2">
        <Logo darkMode={darkMode} />
        {breadcrumb && (
          <>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-sm text-gray-500">{breadcrumb}</span>
          </>
        )}
      </div>
      {centerContent && <div className="text-center">{centerContent}</div>}
      <div className="flex items-center gap-3">
        {rightContent}
        {isAuthenticated && (
          <div className="flex items-center gap-3">
            {user?.name && (
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {user.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-white/10'
                  : 'text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-100'
              }`}
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
