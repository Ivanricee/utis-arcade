export interface SpawnBounds {
  x: [number, number]
  y: [number, number]
  z: [number, number]
}

export const LEFT_ZONE_BOUNDS: SpawnBounds = {
  x: [-0.58, -0.35],
  y: [1.501, 2.25],
  z: [0.75, 0.8604],
}
//centrea spawns
export const CENTRAL_ZONE_OCTO_BOUNDS = {
  x: [-0.4, -0.3] as [number, number],
  y: [1.4, 1.8] as [number, number],
  z: [-0.4, 0.4] as [number, number],
}
export const RIGHT_ZONE_BOUNDS: SpawnBounds = {
  x: [-0.58, -0.35],
  y: [1.5, 2.2],
  z: [-0.8, -0.75001],
}

export const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

export const randomPositionInBounds = (bounds: SpawnBounds): [number, number, number] => [
  randomBetween(...bounds.x),
  randomBetween(...bounds.y),
  randomBetween(...bounds.z),
]
