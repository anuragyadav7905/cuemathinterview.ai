/**
 * @param {{ score: number, max?: number }} props
 */
export default function ScoreBar({ score, max = 5 }) {
  const pct = (score / max) * 100
  const color = pct >= 80 ? '#22C55E' : pct >= 60 ? '#FFD000' : '#EF4444'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-bold text-[#1A1A1A] w-8 text-right">{score.toFixed(1)}</span>
    </div>
  )
}
