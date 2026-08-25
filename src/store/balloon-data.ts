import {
  LEFT_ZONE_BOUNDS,
  randomBetween,
  randomPositionInBounds,
  RIGHT_ZONE_BOUNDS,
  type SpawnBounds,
} from './spawnBounds'

export const LEFT_FLOAT_CENTER: [number, number, number] = [-0.474, 1.4, 0.825]
export const RIGHT_FLOAT_CENTER: [number, number, number] = [-0.4738, 1.4, -0.825]
export const CENTER_FLOAT_CENTER: [number, number, number] = [1.0, 0, 0]
const BALLOON_SCALE_RANGE: [number, number] = [0.8, 1.1]

const FLOAT_SPREAD_RADIUS = 0.15 //offset from float center for each balloon
export interface BalloonInstanceData {
  id: number
  basePosition: [number, number, number]
  floatCenter: [number, number, number]
  scale: number
  phase: number
}

const generateBalloonsInZone = (
  bounds: SpawnBounds,
  floatCenter: [number, number, number],
  count: number
): Omit<BalloonInstanceData, 'id'>[] =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    return {
      basePosition: randomPositionInBounds(bounds),
      scale: randomBetween(...BALLOON_SCALE_RANGE),
      phase: Math.random() * Math.PI * 2,
      floatCenter: [
        floatCenter[0] + Math.cos(angle) * FLOAT_SPREAD_RADIUS,
        floatCenter[1],
        floatCenter[2] + Math.sin(angle) * FLOAT_SPREAD_RADIUS,
      ] as [number, number, number],
    }
  })

export const generateBalloonInstances = (counts: {
  left: number
  central: number //unused
  right: number
}): BalloonInstanceData[] => {
  const all = [
    ...generateBalloonsInZone(LEFT_ZONE_BOUNDS, LEFT_FLOAT_CENTER, counts.left),
    ...generateBalloonsInZone(RIGHT_ZONE_BOUNDS, RIGHT_FLOAT_CENTER, counts.right),
  ]
  return all.map((instance, i) => ({ ...instance, id: i }))
}
