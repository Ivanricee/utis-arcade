export interface SpawnBounds {
  x: [number, number]
  y: [number, number]
  z: [number, number]
}

export const LEFT_ZONE_BOUNDS: SpawnBounds = {
  x: [-1.2, -0.8],
  y: [1.0, 1.6],
  z: [-0.6, 0.6],
}
//centrea spawns
export const CENTRAL_ZONE_OCTO_BOUNDS = {
  x: [-0.4, -0.3] as [number, number],
  y: [1.4, 1.8] as [number, number],
  z: [-0.4, 0.4] as [number, number],
}
export const RIGHT_ZONE_BOUNDS: SpawnBounds = {
  x: [0.8, 1.2],
  y: [1.0, 1.6],
  z: [-0.6, 0.6],
}

export const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

export const randomPositionInBounds = (bounds: SpawnBounds): [number, number, number] => [
  randomBetween(...bounds.x),
  randomBetween(...bounds.y),
  randomBetween(...bounds.z),
]
