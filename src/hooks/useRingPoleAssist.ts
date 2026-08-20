import type { RapierRigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Quaternion, Vector3 } from 'three'
import { useGameStore } from '../store/gameStore'
import { ARROW_DATA } from '../store/model-data'

const MAGNET_STRENGTH = 0.000006
const ACTIVATION_HEIGHT_MARGIN = 1
const ROTATION_IMPULSE_STRENGTH = 0.0000018
const STICK_POS = ARROW_DATA.stick.position
const STICK_SCALE = ARROW_DATA.stick.scale
const getTopY = (baseY: number) => baseY + STICK_SCALE[1]

interface RingUserData {
  ringIndex?: number
  isInsidePost?: boolean
}

// Mantengo stickPosition/stickScale por si se usan para renderizar el mesh del stick en otro lado
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

export function useRingPoleAssist() {
  //for each ring: toogle the rotation impulse on and off when the ring is in or out of the zone
  const rotImpulseApplied = useRef<WeakMap<RapierRigidBody, boolean>>(new WeakMap())

  useFrame(() => {
    const bodies = useGameStore.getState().floatingBodies
    if (!bodies.length) return
    // all poles share the same topY
    const sharedTopY = POLE_CONFIGS[0].topY

    bodies.forEach((rigidBody) => {
      if (!rigidBody) return

      const userData = rigidBody.userData as RingUserData | undefined
      if (userData?.ringIndex === undefined) return // apply only to rings

      const vel = rigidBody.linvel()
      // active only while the ring is falling
      if (vel.y >= -0.05) {
        rotImpulseApplied.current.set(rigidBody, false)
        return
      }
      // max height
      const pos = rigidBody.translation()
      if (pos.y <= sharedTopY || pos.y >= sharedTopY + ACTIVATION_HEIGHT_MARGIN) {
        rotImpulseApplied.current.set(rigidBody, false)
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
        rotImpulseApplied.current.set(rigidBody, false)
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
      if (!rotImpulseApplied.current.get(rigidBody)) {
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
          rotImpulseApplied.current.set(rigidBody, true)
        }
      }
    })
  })
}
