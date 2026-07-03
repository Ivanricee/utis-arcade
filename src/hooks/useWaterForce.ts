import type { RapierRigidBody } from '@react-three/rapier'
import type React from 'react'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { Quaternion, Vector3 } from 'three'
import { ARROW_DATA } from '../store/model-data'

export const WATER_ZONE = {
  centerX: -0.47,
  centerZ: 0,
  radius: 1,
  minY: 1,
  maxY: 2.8,
  maxStrength: 0.0003, //main water pressure
  decayRate: 1 / 2,
}

const MAGNET_STRENGTH = 0.000006
const ACTIVATION_HEIGHT_MARGIN = 1
// assistance impulse strength
const ROTATION_IMPULSE_STRENGTH = 0.0000018
const RING_IN_POST_STRENGTH = 0.25
const STICK_POS = ARROW_DATA.stick.position
const STICK_SCALE = ARROW_DATA.stick.scale
const getTopY = (baseY: number) => baseY + STICK_SCALE[1]

interface RigidBodyUserData {
  isInsidePost?: boolean
}

export const POLE_CONFIGS = [
  {
    id: 0,
    basePosition: new Vector3(STICK_POS[0], STICK_POS[1], 0.325),
    topY: getTopY(STICK_POS[1]),
    radius: 0.28,
    stickPosition: [STICK_POS[0], STICK_POS[1], STICK_POS[2] + 0.325] as [number, number, number],
    stickScale: STICK_SCALE as [number, number, number],
  },
  {
    id: 1,
    basePosition: new Vector3(STICK_POS[0], STICK_POS[1], 0),
    topY: getTopY(STICK_POS[1]),
    radius: 0.28,
    stickPosition: [STICK_POS[0], STICK_POS[1], STICK_POS[2]] as [number, number, number],
    stickScale: STICK_SCALE as [number, number, number],
  },
  {
    id: 2,
    basePosition: new Vector3(STICK_POS[0], STICK_POS[1], -0.313),
    topY: getTopY(STICK_POS[1]),
    radius: 0.28,
    stickPosition: [STICK_POS[0], STICK_POS[1], STICK_POS[2] - 0.313] as [number, number, number],
    stickScale: STICK_SCALE as [number, number, number],
  },
]

// Objetos reutilizables para evitar allocations en el loop de render
const _q = new Quaternion()
const _localY = new Vector3()
const _targetY = new Vector3()
const _correction = new Quaternion()

export function useWaterForce(rigidBodyRefs: React.RefObject<RapierRigidBody[]>) {
  const waterActive = useGameStore((state) => state.waterActive)
  const setWaterActive = useGameStore((state) => state.setWaterActive)
  const waterPressureRef = useRef(1)

  //for each ring: toogle the rotation impulse on and off when the ring is in or out of the zone
  const rotImpulseApplied = useRef<boolean[]>([])

  useEffect(() => {
    if (waterActive) {
      waterPressureRef.current = 1
    }
  }, [waterActive])

  useFrame((_, delta) => {
    const bodies = rigidBodyRefs.current
    if (!bodies?.length) return

    //pressure decay once per frame
    let currentPressure = 0
    if (waterActive) {
      const next = Math.max(0, waterPressureRef.current - WATER_ZONE.decayRate * delta)
      waterPressureRef.current = next
      currentPressure = next
      if (next === 0) setWaterActive(false)
    }

    // Todos los postes comparten el mismo topY
    const sharedTopY = POLE_CONFIGS[0].topY

    bodies.forEach((rigidBody, i) => {
      if (!rigidBody) return
      const isInsidePost = (rigidBody.userData as RigidBodyUserData | undefined)?.isInsidePost

      const forceMultiplier = isInsidePost ? RING_IN_POST_STRENGTH : 1.0

      const pos = rigidBody.translation()
      const vel = rigidBody.linvel()

      // ── WATER FORCE ──────────────────────────────────────────────────────────
      if (waterActive && currentPressure > 0) {
        const dx = pos.x - WATER_ZONE.centerX
        const dz = pos.z - WATER_ZONE.centerZ
        const hDist = Math.sqrt(dx * dx + dz * dz)
        const inZone =
          hDist < WATER_ZONE.radius && pos.y > WATER_ZONE.minY && pos.y < WATER_ZONE.maxY

        if (inZone) {
          const distFalloff = Math.max(0, 1 - hDist / WATER_ZONE.radius)
          const heightFactor = Math.max(
            0,
            1 - (pos.y - WATER_ZONE.minY) / (WATER_ZONE.maxY - WATER_ZONE.minY)
          )
          const force = WATER_ZONE.maxStrength * distFalloff * currentPressure * heightFactor
          const finalForceX = (Math.random() * 2 - 1) * force * -0.5 * forceMultiplier
          const finalForceY = force * forceMultiplier
          const finalForceZ = (Math.random() * 2 - 1) * force * 0.5 * forceMultiplier

          rigidBody.applyImpulse(
            {
              x: finalForceX,
              y: finalForceY,
              z: finalForceZ,
            },
            true
          )
        }
      }

      // ── MAGNET ASSIST ─────────────────────────────────────────────────────────
      // active only while the ring is falling
      if (vel.y >= -0.05) {
        rotImpulseApplied.current[i] = false
        return
      }

      // Ventana de altura
      if (pos.y <= sharedTopY || pos.y >= sharedTopY + ACTIVATION_HEIGHT_MARGIN) {
        rotImpulseApplied.current[i] = false
        return
      }

      // find the closest pole by comparing squares distances
      let closestPole = POLE_CONFIGS[0]
      let minDistSq = Infinity
      for (const pole of POLE_CONFIGS) {
        const dx = pos.x - pole.basePosition.x
        const dz = pos.z - pole.basePosition.z
        const dSq = dx * dx + dz * dz
        if (dSq < minDistSq) {
          minDistSq = dSq
          closestPole = pole
        }
      }
      const minDist = Math.sqrt(minDistSq)

      if (minDist >= closestPole.radius) {
        rotImpulseApplied.current[i] = false
        return
      }

      // ── LATERAL PULL ────────────────────────────────────────────────────────
      if (minDist >= 0.075) {
        const t = 1 - minDist / closestPole.radius
        const smooth = t * t * (3 - 2 * t)
        const pull = MAGNET_STRENGTH * smooth
        rigidBody.applyImpulse(
          {
            x: ((closestPole.basePosition.x - pos.x) / minDist) * pull,
            y: 0,
            z: ((closestPole.basePosition.z - pos.z) / minDist) * pull,
          },
          true
        )
      }

      // ── ROTATION IMPULSE (only once per zone entry) ─────────────

      if (!rotImpulseApplied.current[i]) {
        const rot = rigidBody.rotation()
        if (isFinite(rot.x) && isFinite(rot.y) && isFinite(rot.z) && isFinite(rot.w)) {
          //Local Y axis of the ring in world space
          _q.set(rot.x, rot.y, rot.z, rot.w)
          _localY.set(0, 1, 0).applyQuaternion(_q)

          // Pointing to the closest pole (+Y or -Y) to not force
          // a 180° flip in rings that are almost below
          _targetY.set(0, _localY.y >= 0 ? 1 : -1, 0)
          _correction.setFromUnitVectors(_localY, _targetY)

          const sinHalf = Math.sqrt(
            _correction.x * _correction.x +
              _correction.y * _correction.y +
              _correction.z * _correction.z
          )

          // If the angle is small enough (< ~6°)
          if (sinHalf > 0.05) {
            const angle = 2 * Math.atan2(sinHalf, _correction.w)
            const inv = 1 / sinHalf
            rigidBody.applyTorqueImpulse(
              {
                x: _correction.x * inv * angle * ROTATION_IMPULSE_STRENGTH,
                y: _correction.y * inv * angle * ROTATION_IMPULSE_STRENGTH,
                z: _correction.z * inv * angle * ROTATION_IMPULSE_STRENGTH,
              },
              true
            )
          }
          rotImpulseApplied.current[i] = true
        }
      }
    })
  })
}
