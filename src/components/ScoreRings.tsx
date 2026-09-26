import { useGameStore } from '../store/gameStore'
import { useWinCondition } from '../hooks/useWinCondition'
import RingIndicator from './RingIndicator'

export default function ScoreRings() {
  const totalRings = useGameStore((state) => state.rings.length)
  const score = useGameStore((state) => state.score)
  const hasWon = useWinCondition()
  const ringsLeft = Math.max(0, totalRings - score)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={
        hasWon
          ? `You win! All ${totalRings} rings scored`
          : `${ringsLeft} rings left; ${score} of ${totalRings} rings scored`
      }
      className={`flex max-w-[min(90vw,18rem)] flex-col items-center gap-0.5 rounded-lg border border-cyan-200/45 bg-[#05224d]/85 px-2 py-2 shadow-lg shadow-cyan-950/25 backdrop-blur-sm ${hasWon ? 'win-celebration' : ''}`}
    >
      <span aria-hidden="true" className="text-xs font-semibold text-cyan-100">
        {hasWon ? 'YOU WIN!' : 'RINGS LEFT'}
      </span>
      <span
        aria-hidden="true"
        className={`flex max-w-full gap-0.5 overflow-x-auto ${hasWon ? 'win-rings' : ''}`}
      >
        {Array.from({ length: totalRings }, (_, index) => (
          <RingIndicator key={index} filled={index < score} />
        ))}
      </span>
    </div>
  )
}
