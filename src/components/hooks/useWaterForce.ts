import type { RapierRigidBody } from '@react-three/rapier'
import type React from 'react'
import { useGameStore } from '../../store/gameStore'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

//position: [-0.474, 1.03, -0],

//args: [0.62, 0.075, 0.32],
export const WATER_ZONE = {
  centerX: -0.47,
  centerZ: 0,
  radius: 1, //horizontal radius
  minY: 1, //min height
  maxY: 2.5, //max height
  maxStrength: 0.00028,
  decayRate: 1 / 2, // reach to 0 in 1.2s
}

export function useWaterForce(rigidBodyRefs: React.RefObject<RapierRigidBody[]>) {
  const waterActive = useGameStore((state) => state.waterActive)
  const waterPressureRef = useRef(1)
  const impulseApplied = useRef(false)
  const setWaterActive = useGameStore((state) => state.setWaterActive)

  // Dentro de useWaterForce
  useEffect(() => {
    if (waterActive) {
      waterPressureRef.current = 1 // resetea presión al activarse
      impulseApplied.current = false
    }
  }, [waterActive])

  useFrame((_, delta) => {
    if (!waterActive) return
    // decay
    const newPressure = Math.max(0, waterPressureRef.current - WATER_ZONE.decayRate * delta)
    waterPressureRef.current = newPressure

    if (newPressure === 0) {
      setWaterActive(false)
      return
    }

    rigidBodyRefs.current.forEach((rigidBody) => {
      if (!rigidBody) return
      const pos = rigidBody.translation()
      const dx = pos.x - WATER_ZONE.centerX
      const dz = pos.z - WATER_ZONE.centerZ
      const horizontalDist = Math.sqrt(dx * dx + dz * dz)
      const inZone =
        horizontalDist < WATER_ZONE.radius && pos.y > WATER_ZONE.minY && pos.y < WATER_ZONE.maxY
      if (!inZone) return

      const distanceFalloff = Math.max(0, 1 - horizontalDist / WATER_ZONE.radius)
      //reduce force by distance falloff
      const heighFactor = 1 - (pos.y - WATER_ZONE.minY) / (WATER_ZONE.maxY - WATER_ZONE.minY)
      const clampedHeighFactor = Math.max(0, Math.min(1, heighFactor))
      const force = (WATER_ZONE.maxStrength / distanceFalloff) * newPressure * clampedHeighFactor
      const randomX = (Math.random() * 2 - 1) * force * -1
      const randomZ = (Math.random() * 2 - 1) * force * 0.5

      rigidBody.applyImpulse({ x: randomX, y: force, z: randomZ }, true)
    })
  })
}
