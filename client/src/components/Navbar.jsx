/**
 * @param {{ darkMode?: boolean, breadcrumb?: string, rightContent?: import('react').ReactNode, centerContent?: import('react').ReactNode, className?: string }} props
 */
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
  const base = darkMode
    ? 'border-b border-white/10 px-8 py-4'
    : 'bg-white border-b border-gray-200 px-10 py-4'
  const layout = (rightContent || centerContent)
    ? 'flex items-center justify-between'
    : 'flex items-center gap-3'

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
      {rightContent && <div className="flex items-center gap-3">{rightContent}</div>}
    </nav>
  )
}
