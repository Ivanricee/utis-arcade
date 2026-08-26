import { CuboidCollider, RapierRigidBody, RigidBody, interactionGroups } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import { useGameStore } from '../../../store/gameStore'
import { FLOATING_DATA } from '../../../store/model-data'

const BALLOON_GROUP = 6
const BALLOON_COLLISION_GROUPS = interactionGroups(BALLOON_GROUP, [0])

interface ZeppUserData {
  floatType: 'zepp'
  basePosition: [number, number, number]
  floatCenter: [number, number, number]
  phase: number
  hasIdleFloat: boolean
  impulseScale: number
}

interface ZeppRigidBodyProps {
  basePosition: [number, number, number]
  floatCenter: [number, number, number]
  scale: number
  phase: number
  colliderOffset: [number, number, number]
  onRigidBodyReady: (rb: RapierRigidBody) => void
}

export function ZeppRigidBody({
  basePosition,
  floatCenter,
  scale,
  phase,
  onRigidBodyReady,
}: ZeppRigidBodyProps) {
  const { zepp1 } = FLOATING_DATA
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const userData = useRef<ZeppUserData>({
    floatType: 'zepp',
    hasIdleFloat: true,
    basePosition,
    floatCenter,
    phase,
    impulseScale: 1,
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
        args={[zepp1.scale[0] * scale, zepp1.scale[1] * scale, zepp1.scale[2] * scale]}
        collisionGroups={BALLOON_COLLISION_GROUPS}
      />
      {/**
         *
        <CuboidCollider
          args={[zepp2.scale[0] * scale, zepp2.scale[1] * scale, zepp2.scale[2] * scale]}
          position={[0, -0.08, 0]}
          collisionGroups={BALLOON_COLLISION_GROUPS}
        />
         */}
    </RigidBody>
  )
}
