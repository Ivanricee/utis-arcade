import { CuboidCollider, RapierRigidBody, RigidBody, interactionGroups } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import { useGameStore } from '../../../store/gameStore'

const OCTO_GROUP = 2
// choca solo con el grupo default (0) → cúpula, convex, paredes. No con otros octos.
const OCTO_COLLISION_GROUPS = interactionGroups(OCTO_GROUP, [0])
const BASE_HALF_EXTENTS: [number, number, number] = [0.02, 0.165, 0.12]

interface OctoUserData {
  floatType: 'octo'
  impulseScale?: number
}

interface OctoRigidBodyProps {
  position: [number, number, number]
  scale: number
  onRigidBodyReady: (rb: RapierRigidBody) => void
}

export function OctoRigidBody({ position, scale, onRigidBodyReady }: OctoRigidBodyProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const userData = useRef<OctoUserData>({ floatType: 'octo', impulseScale: 0.18 })
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
      position={position}
      userData={userData.current}
      ccd
      angularDamping={2}
      linearDamping={3.9}
      restitution={0.2}
      friction={0.05}
      canSleep={false}
      // canSleep default (true) y sin ccds
    >
      <CuboidCollider
        args={[
          BASE_HALF_EXTENTS[0] * scale,
          BASE_HALF_EXTENTS[1] * scale,
          BASE_HALF_EXTENTS[2] * scale,
        ]}
        collisionGroups={OCTO_COLLISION_GROUPS}
      />
    </RigidBody>
  )
}
