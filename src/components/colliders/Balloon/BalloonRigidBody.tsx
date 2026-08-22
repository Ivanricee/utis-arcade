import { CuboidCollider, RapierRigidBody, RigidBody, interactionGroups } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import { useGameStore } from '../../../store/gameStore'

const BALLOON_GROUP = 3
const BALLOON_COLLISION_GROUPS = interactionGroups(BALLOON_GROUP, [0])
const BASE_HALF_EXTENTS: [number, number, number] = [0.12, 0.16, 0.12]

interface BalloonUserData {
  floatType: 'balloon'
  basePosition: [number, number, number]
  phase: number
  impulseScale: number
}

interface BalloonRigidBodyProps {
  basePosition: [number, number, number]
  scale: number
  phase: number
  onRigidBodyReady: (rb: RapierRigidBody) => void
}

export function BalloonRigidBody({
  basePosition,
  scale,
  phase,
  onRigidBodyReady,
}: BalloonRigidBodyProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const userData = useRef<BalloonUserData>({
    floatType: 'balloon',
    basePosition,
    phase,
    impulseScale: 0.4,
  })
  const registerFloatingBody = useGameStore((s) => s.registerFloatingBody)
  const unregisterFloatingBody = useGameStore((s) => s.unregisterFloatingBody)

  useEffect(() => {
    if (!rigidBodyRef.current) return
    const rb = rigidBodyRef.current
    registerFloatingBody(rb)
    onRigidBodyReady(rb)
    return () => unregisterFloatingBody(rb)
  }, [])

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      colliders={false}
      position={basePosition}
      userData={userData.current}
      canSleep={false}
      linearDamping={1.5}
      angularDamping={1.5}
      gravityScale={0}
    >
      <CuboidCollider
        args={[
          BASE_HALF_EXTENTS[0] * scale,
          BASE_HALF_EXTENTS[1] * scale,
          BASE_HALF_EXTENTS[2] * scale,
        ]}
        collisionGroups={BALLOON_COLLISION_GROUPS}
      />
    </RigidBody>
  )
}
