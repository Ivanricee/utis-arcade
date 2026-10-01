import { useCallback, useRef } from 'react'
import type { CollisionEnterPayload } from '@react-three/rapier'
import { playClack } from '../audio/audioManager'
import { COLLISION_AUDIO as C } from '../audio/audioConfig'
import { getRelativeSpeed, speedToIntensity } from '../audio/collisionUtils'

export function useRingCollisionSound() {
  const lastHitRef = useRef(0)

  return useCallback(({ target, other }: CollisionEnterPayload) => {
    const now = performance.now()
    if (now - lastHitRef.current < C.ringCooldownMs) return

    const velocity = target.rigidBody?.linvel()
    if (!velocity) return
    const speed = getRelativeSpeed(velocity, other.rigidBody?.linvel())

    if (C.debug) console.warn('[clack] speed', speed.toFixed(2))
    if (speed < C.minSpeed) return

    lastHitRef.current = now
    const isPost = other.rigidBodyObject?.userData?.postIndex !== undefined
    playClack({
      intensity: speedToIntensity(speed, C.minSpeed, C.maxSpeed),
      pitch: isPost ? C.postPitch : 1,
    })
  }, [])
}
