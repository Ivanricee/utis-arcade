import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

export const WATER_ZONE = {
  centerX: -0.47,
  centerZ: 0,
  radius: 1,
  minY: 1,
  maxY: 2.8,
  maxStrength: 0.0003, //main water pressure
  decayRate: 1 / 2,
}

const REDUCED_FORCE_STRENGTH = 0.25

interface FloatingBodyUserData {
  isInsidePost?: boolean
  impulseScale?: number
}

export function useWaterForce() {
  const waterActive = useGameStore((state) => state.waterActive)
  const setWaterActive = useGameStore((state) => state.setWaterActive)
  const waterPressureRef = useRef(1)

  useEffect(() => {
    if (waterActive) {
      waterPressureRef.current = 1
    }
  }, [waterActive])

  useFrame((_, delta) => {
    if (!waterActive) return

    const bodies = useGameStore.getState().floatingBodies
    if (!bodies?.length) return

    //pressure decay once per frame
    const nextPressure = Math.max(0, waterPressureRef.current - WATER_ZONE.decayRate * delta)
    waterPressureRef.current = nextPressure
    if (nextPressure === 0) setWaterActive(false)
    if (nextPressure <= 0) return

    bodies.forEach((rigidBody) => {
      if (!rigidBody) return

      const pos = rigidBody.translation()
      const dx = pos.x - WATER_ZONE.centerX
      const dz = pos.z - WATER_ZONE.centerZ
      const hDist = Math.sqrt(dx * dx + dz * dz)
      const inZone = hDist < WATER_ZONE.radius && pos.y > WATER_ZONE.minY && pos.y < WATER_ZONE.maxY
      if (!inZone) return
      // get data from userData props
      const isInsidePost = (rigidBody.userData as FloatingBodyUserData | undefined)?.isInsidePost
      const impulseScale = (rigidBody.userData as FloatingBodyUserData)?.impulseScale ?? 1
      const forceMultiplier = isInsidePost ? REDUCED_FORCE_STRENGTH : 1.0

      const distFalloff = Math.max(0, 1 - hDist / WATER_ZONE.radius)
      const heightFactor = Math.max(
        0,
        1 - (pos.y - WATER_ZONE.minY) / (WATER_ZONE.maxY - WATER_ZONE.minY)
      )
      const force = WATER_ZONE.maxStrength * distFalloff * nextPressure * heightFactor

      rigidBody.applyImpulse(
        {
          x: (Math.random() * 2 - 1) * force * -0.5 * forceMultiplier * impulseScale,
          y: force * forceMultiplier * impulseScale,
          z: (Math.random() * 2 - 1) * force * 0.5 * forceMultiplier * impulseScale,
        },
        true
      )
    })
  })
}
