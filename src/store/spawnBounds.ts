export interface SpawnBounds {
  x: [number, number]
  y: [number, number]
  z: [number, number]
}
//spawns
export const LEFT_ZONE_BOUNDS: SpawnBounds = {
  //x: [-0.52, -0.45],
  x: [-0.52, -0.45],
  y: [1.38, 1.39],
  z: [0.75, 0.8604],
}
export const RIGHT_ZONE_BOUNDS: SpawnBounds = {
  x: [-0.52, -0.45],
  y: [1.38, 1.39],
  z: [-0.85, -0.84],
}
//centrea spawns
export const CENTRAL_ZONE_OCTO_BOUNDS = {
  x: [-0.4, -0.3] as [number, number],
  y: [1.4, 1.8] as [number, number],
  z: [-0.4, 0.4] as [number, number],
}

/*export const CENTRAL_ZONE_ZEPP_BOUNDS = {
  x: [-0.65, -0.64] as [number, number],
  y: [2.737, 2.79] as [number, number],
  z: [0.1, 0.15] as [number, number],
}*/
export const CENTRAL_ZONE_ZEPP_BOUNDS = {
  x: [-0.65, -0.64] as [number, number],
  y: [2.5, 2.53] as [number, number],
  z: [0.1, 0.15] as [number, number],
}

export const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

export const randomPositionInBounds = (bounds: SpawnBounds): [number, number, number] => [
  randomBetween(...bounds.x),
  randomBetween(...bounds.y),
  randomBetween(...bounds.z),
]
