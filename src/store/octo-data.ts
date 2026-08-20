export const OCTO_SPAWN_BOUNDS = {
  x: [-0.4, -0.3] as [number, number],
  y: [1.4, 1.8] as [number, number],
  z: [-0.4, 0.4] as [number, number],
  scaleRange: [0.37, 0.44] as [number, number],
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

export interface OctoInstanceData {
  id: number
  position: [number, number, number]
  scale: number
}

export const generateOctoInstances = (count: number): OctoInstanceData[] => {
  const { x, y, z, scaleRange } = OCTO_SPAWN_BOUNDS
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    position: [randomBetween(...x), randomBetween(...y), randomBetween(...z)],
    scale: randomBetween(...scaleRange),
  }))
}
