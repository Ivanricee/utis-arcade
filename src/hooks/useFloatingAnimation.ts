import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useGameStore } from '../store/gameStore'

const FLOAT_AMPLITUDE_Y = 0.1
const FLOAT_AMPLITUDE_XZ = 0.1
const FLOAT_SPEED = 0.8
const SPRING_STIFFNESS = 0.001
const SPRING_DAMPING = 0.003

export interface FloatingBodyUserData {
  isInsidePost?: boolean
  floatType?: 'balloon' | 'octo'
  hasIdleFloat?: boolean //float + smooth return to base position (false)
  floatCenter?: [number, number, number]
  basePosition?: [number, number, number]
  phase?: number
  impulseScale?: number
  floatSuspendedUntil?: number
}

const _target = new Vector3()

export function useFloatingAnimation() {
  useFrame((state) => {
    const bodies = useGameStore.getState().floatingBodies
    if (!bodies.length) return

    const t = state.clock.elapsedTime

    bodies.forEach((rigidBody) => {
      if (!rigidBody) return
      const userData = rigidBody.userData as FloatingBodyUserData | undefined
      //console.log({ userData })

      if (!userData?.hasIdleFloat || !userData.floatCenter) return
      if (userData.floatSuspendedUntil && t < userData.floatSuspendedUntil) return
      const [cx, cy, cz] = userData.floatCenter
      const phase = userData.phase ?? 0

      _target.set(
        cx + Math.sin(t * FLOAT_SPEED + phase) * FLOAT_AMPLITUDE_XZ,
        cy + Math.sin(t * FLOAT_SPEED * 1.3 + phase) * FLOAT_AMPLITUDE_Y,
        cz + Math.cos(t * FLOAT_SPEED + phase) * FLOAT_AMPLITUDE_XZ
      )

      const pos = rigidBody.translation()
      const vel = rigidBody.linvel()
      if (!isFinite(pos.x) || !isFinite(pos.y) || !isFinite(pos.z)) return
      //console.log({ pos, vel, rigidBody })

      rigidBody.applyImpulse(
        {
          x: (_target.x - pos.x) * SPRING_STIFFNESS - vel.x * SPRING_DAMPING,
          y: (_target.y - pos.y) * SPRING_STIFFNESS - vel.y * SPRING_DAMPING,
          z: (_target.z - pos.z) * SPRING_STIFFNESS - vel.z * SPRING_DAMPING,
        },
        true
      )
    })
  })
}
