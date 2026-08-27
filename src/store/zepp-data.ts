import {
  CENTRAL_ZONE_ZEPP_BOUNDS,
  LEFT_ZONE_BOUNDS,
  randomBetween,
  randomPositionInBounds,
  RIGHT_ZONE_BOUNDS,
  type SpawnBounds,
} from './spawnBounds'

export const LEFT_FLOAT_CENTER: [number, number, number] = [-0.474, 2.63, 0.825]

export const CENTER_FLOAT_CENTER: [number, number, number] = [-0.65, 2.63, 0.15]
export const RIGHT_FLOAT_CENTER: [number, number, number] = [-0.4738, 2.63, -0.825]
const ZEPP_SCALE_RANGE: [number, number] = [0.95, 1]

const FLOAT_SPREAD_RADIUS = 0.1 //offset from float center for each zepp
export interface ZeppInstanceData {
  id: number
  basePosition: [number, number, number]
  floatCenter: [number, number, number]
  scale: number
  phase: number
}

const generateZeppsInZone = (
  bounds: SpawnBounds,
  floatCenter: [number, number, number],
  count: number
): Omit<ZeppInstanceData, 'id'>[] =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    return {
      basePosition: randomPositionInBounds(bounds),
      scale: randomBetween(...ZEPP_SCALE_RANGE),
      phase: Math.random() * Math.PI * 2,
      floatCenter: [
        floatCenter[0] + Math.cos(angle) * FLOAT_SPREAD_RADIUS,
        floatCenter[1],
        floatCenter[2] + Math.sin(angle) * FLOAT_SPREAD_RADIUS,
      ] as [number, number, number],
    }
  })

export const generateZeppInstances = (counts: {
  left: number
  central: number
  right: number
}): ZeppInstanceData[] => {
  //console.log({ CENTRAL_ZONE_ZEPP_BOUNDS, CENTER_FLOAT_CENTER })
  const all = [
    ...generateZeppsInZone(LEFT_ZONE_BOUNDS, LEFT_FLOAT_CENTER, counts.left),
    ...generateZeppsInZone(CENTRAL_ZONE_ZEPP_BOUNDS, CENTER_FLOAT_CENTER, counts.central),
    ...generateZeppsInZone(RIGHT_ZONE_BOUNDS, RIGHT_FLOAT_CENTER, counts.right),
  ]
  //console.log({ all })
  return all.map((instance, i) => ({ ...instance, id: i }))
}
