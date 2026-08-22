import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useGameStore } from '../store/gameStore'

const FLOAT_AMPLITUDE_Y = 0.06
const FLOAT_AMPLITUDE_XZ = 0.02
const FLOAT_SPEED = 1.2
const SPRING_STIFFNESS = 8
const SPRING_DAMPING = 3

interface FloatingUserData {
  floatType?: 'balloon' | 'octo'
  hasIdleFloat?: boolean //float + smooth return to base position
  basePosition?: [number, number, number]
  phase?: number
  impulseScale?: number
}

const _target = new Vector3()

export function useFloatingAnimation() {
  useFrame((state) => {
    const bodies = useGameStore.getState().floatingBodies
    if (!bodies.length) return

    const t = state.clock.elapsedTime

    bodies.forEach((rigidBody) => {
      if (!rigidBody) return
      const userData = rigidBody.userData as FloatingUserData | undefined
      if (!userData?.hasIdleFloat || !userData.basePosition) return

      const [bx, by, bz] = userData.basePosition
      const phase = userData.phase ?? 0

      _target.set(
        bx + Math.sin(t * FLOAT_SPEED + phase) * FLOAT_AMPLITUDE_XZ,
        by + Math.sin(t * FLOAT_SPEED * 1.3 + phase) * FLOAT_AMPLITUDE_Y,
        bz + Math.cos(t * FLOAT_SPEED + phase) * FLOAT_AMPLITUDE_XZ
      )

      const pos = rigidBody.translation()
      const vel = rigidBody.linvel()

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
