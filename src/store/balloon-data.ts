import {
  LEFT_ZONE_BOUNDS,
  randomBetween,
  randomPositionInBounds,
  RIGHT_ZONE_BOUNDS,
} from './spawnBounds'

const BALLOON_SCALE_RANGE: [number, number] = [0.8, 1.1]

export interface BalloonInstanceData {
  id: number
  basePosition: [number, number, number]
  scale: number
  phase: number
}

const generateBalloonsInZone = (
  bounds: typeof LEFT_ZONE_BOUNDS,
  count: number,
  startId: number
): BalloonInstanceData[] =>
  Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    basePosition: randomPositionInBounds(bounds),
    scale: randomBetween(...BALLOON_SCALE_RANGE),
    phase: Math.random() * Math.PI * 2,
  }))

interface BalloonZoneCounts {
  left: number
  central: number
  right: number
}
export const generateBalloonInstances = (counts: BalloonZoneCounts): BalloonInstanceData[] => {
  const all = [
    ...generateBalloonsInZone(LEFT_ZONE_BOUNDS, counts.left, 0),
    ...generateBalloonsInZone(RIGHT_ZONE_BOUNDS, counts.right, 0),
  ]
  return all.map((instance, i) => ({ ...instance, id: i }))
}
