/**
 * @param {{ videoRef: import('react').RefObject<HTMLVideoElement>, metrics?: Array<{label: string, val: string, color: string}>, className?: string, size?: 'sm'|'md' }} props
 */
export default function CameraPiP({ videoRef, metrics, className = '', size = 'md' }) {
  const dimensions = size === 'sm'
    ? 'w-[180px] h-[135px]'
    : 'w-[200px] h-[150px]'

  return (
    <div className={className}>
      <div className={`${dimensions} bg-[#1A1A1A] rounded-xl overflow-hidden border-2 border-white/20 relative`}>
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded-full">
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          <span className="text-white text-[10px]">LIVE</span>
        </div>
      </div>
      {metrics && (
        <div className="mt-2 flex gap-2">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white/5 rounded-lg px-2 py-1 text-center">
              <p className="text-[10px] text-gray-500">{m.label}</p>
              <p className={`text-xs font-semibold ${m.color}`}>{m.val}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
