import { useGameStore } from '../store/gameStore'

export default function ScoreRings() {
  const score = useGameStore((state) => state.score)
  return <div>ScoreRings: {score}</div>
}
