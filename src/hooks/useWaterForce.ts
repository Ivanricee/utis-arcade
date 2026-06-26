import type { RapierRigidBody } from '@react-three/rapier'
import type React from 'react'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { Vector3 } from 'three'
import { ARROW_DATA } from '../store/model-data'

//position: [-0.474, 1.03, -0],

//args: [0.62, 0.075, 0.32],
export const WATER_ZONE = {
  centerX: -0.47,
  centerZ: 0,
  radius: 1, //horizontal radius
  minY: 1, //min height
  maxY: 2.8, //max height
  maxStrength: 0.00028,
  decayRate: 1 / 2, // reach to 0 in 1.2s
}

//const MAGNET_RADIUS = 1.0 // ratio
const MAGNET_STRENGTH = 0.0001 // Fuerza de atracción lateral
const ACTIVATION_HEIGHT_MARGIN = 1

// stick visual offset

const STICK_POS = ARROW_DATA.stick.position
const STICK_SCALE = ARROW_DATA.stick.scale
const getTopY = (baseY: number) => baseY + STICK_SCALE[1]

export const POLE_CONFIGS = [
  {
    id: 0,
    basePosition: new Vector3(STICK_POS[0], STICK_POS[1], 0.325),
    topY: getTopY(STICK_POS[1]),
    radius: 0.22, // assist radius
    stickPosition: [STICK_POS[0], STICK_POS[1], STICK_POS[2] + 0.325] as [number, number, number],
    stickScale: STICK_SCALE as [number, number, number],
  },
  {
    id: 1,
    basePosition: new Vector3(STICK_POS[0], STICK_POS[1], 0),
    topY: getTopY(STICK_POS[1]),
    radius: 0.22,
    stickPosition: [STICK_POS[0], STICK_POS[1], STICK_POS[2]] as [number, number, number],
    stickScale: STICK_SCALE as [number, number, number],
  },
  {
    id: 2,
    basePosition: new Vector3(STICK_POS[0], STICK_POS[1], -0.313),
    topY: getTopY(STICK_POS[1]),
    radius: 0.27,
    stickPosition: [STICK_POS[0], STICK_POS[1], STICK_POS[2] - 0.313] as [number, number, number],
    stickScale: STICK_SCALE as [number, number, number],
  },
]

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
    if (waterActive) {
      // decay
      const newPressure = Math.max(0, waterPressureRef.current - WATER_ZONE.decayRate * delta)
      waterPressureRef.current = newPressure

      if (newPressure === 0) {
        setWaterActive(false)
      } else {
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
          const force =
            (WATER_ZONE.maxStrength / distanceFalloff) * newPressure * clampedHeighFactor
          const randomX = (Math.random() * 2 - 1) * force * -1
          const randomZ = (Math.random() * 2 - 1) * force * 0.5

          rigidBody.applyImpulse({ x: randomX, y: force, z: randomZ }, true)
        })
      }
    }
    //magnet assist
    rigidBodyRefs.current.forEach((rigidBody) => {
      if (!rigidBody) return
      const pos = rigidBody.translation()

      //Pole attraction assist
      const vel = rigidBody.linvel()
      // only apply if falling
      if (vel.y >= -0.01) return
      // seach closest pole
      let closestPole = null
      let minDistanceXZ = Infinity
      //find closest pole
      for (const pole of POLE_CONFIGS) {
        const { basePosition } = pole
        const dx = pos.x - basePosition.x
        const dz = pos.z - basePosition.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < minDistanceXZ) {
          minDistanceXZ = dist
          closestPole = pole
        }
        if (!closestPole) return
        // check if close enough
        const isWithinRadius = minDistanceXZ < closestPole.radius
        //must be above topy and not too close
        const isAboveTop = pos.y > closestPole.topY
        const isBelowCeiling = pos.y < closestPole.topY + ACTIVATION_HEIGHT_MARGIN
        //deadzone
        const isTooClose = minDistanceXZ < 0.15
        if (isWithinRadius && isAboveTop && isBelowCeiling && !isTooClose) {
          // Calculate vector to center of pole
          const dirX = closestPole.basePosition.x - pos.x
          const dirZ = closestPole.basePosition.z - pos.z

          const len = Math.sqrt(dirX * dirX + dirZ * dirZ)
          if (len === 0) return

          const normX = dirX / len
          const normZ = dirZ / len

          // Fuerza proporcional a la distancia (más fuerte al borde, suave al centro)
          const distanceFactor = 1 - minDistanceXZ / closestPole.radius
          const forceX = normX * MAGNET_STRENGTH * distanceFactor
          const forceZ = normZ * MAGNET_STRENGTH * distanceFactor

          rigidBody.applyImpulse({ x: forceX, y: 0, z: forceZ }, true)
        }
      }
    })
  })
}
