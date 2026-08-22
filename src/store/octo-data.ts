import {
  CENTRAL_ZONE_OCTO_BOUNDS,
  LEFT_ZONE_BOUNDS,
  randomBetween,
  randomPositionInBounds,
  RIGHT_ZONE_BOUNDS,
} from './spawnBounds'
//centrea spawns
export const OCTO_SPAWN_BOUNDS = {
  x: [-0.4, -0.3] as [number, number],
  y: [1.4, 1.8] as [number, number],
  z: [-0.4, 0.4] as [number, number],
  scaleRange: [0.37, 0.44] as [number, number],
}
const OCTO_SCALE_RANGE: [number, number] = [0.37, 0.44]
export interface OctoInstanceData {
  id: number
  position: [number, number, number]
  scale: number
}

const generateOctosInZone = (
  bounds: typeof LEFT_ZONE_BOUNDS,
  count: number,
  startId: number
): OctoInstanceData[] =>
  Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    position: randomPositionInBounds(bounds),
    scale: randomBetween(...OCTO_SCALE_RANGE),
  }))
interface OctoZoneCounts {
  left: number
  central: number
  right: number
}
export const generateOctoInstances = (counts: OctoZoneCounts): OctoInstanceData[] => {
  const all = [
    ...generateOctosInZone(LEFT_ZONE_BOUNDS, counts.left, 0),
    ...generateOctosInZone(CENTRAL_ZONE_OCTO_BOUNDS, counts.central, 0),
    ...generateOctosInZone(RIGHT_ZONE_BOUNDS, counts.right, 0),
  ]
  return all.map((instance, i) => ({ ...instance, id: i }))
}
