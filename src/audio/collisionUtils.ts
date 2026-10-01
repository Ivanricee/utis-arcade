type Vec3 = { x: number; y: number; z: number }

const ZERO: Vec3 = { x: 0, y: 0, z: 0 }

export const getRelativeSpeed = (a: Vec3, b: Vec3 = ZERO) =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)

export const speedToIntensity = (speed: number, min: number, max: number) =>
  Math.min(Math.max((speed - min) / (max - min), 0), 1)
