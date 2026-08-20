import * as THREE from 'three'

import { useEffect, useMemo, useRef } from 'react'
import {
  BallCollider,
  CylinderCollider,
  interactionGroups,
  RapierRigidBody,
  RigidBody,
  type CollisionPayload,
} from '@react-three/rapier'
import usePlasticMeshes from '../../../hooks/usePlasticMeshes'
import { useGameStore } from '../../../store/gameStore'

interface TorusRingColliderProps {
  ringIndex: number
  position: [number, number, number]
  sphereCount?: number
  overlapFactor?: number
  restitution?: number
  friction?: number
  showMesh?: boolean
  onRigidBodyReady?: (rb: RapierRigidBody) => void
}

interface RigidBodyUserData {
  ringIndex?: number
  postIndex?: number
  isInsidePost?: boolean
}

interface SpherePosition {
  x: number
  y: number
  z: number
  radius: number
}

const extractTorusDimmensions = (geometry: THREE.BufferGeometry) => {
  geometry.computeBoundingBox()
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  geometry.boundingBox?.getSize(size)
  geometry.boundingBox?.getCenter(center)
  const axes = (
    [
      { axis: 'x' as const, value: size.x },
      { axis: 'y' as const, value: size.y },
      { axis: 'z' as const, value: size.z },
    ] satisfies { axis: 'x' | 'y' | 'z'; value: number }[]
  ).sort((a, b) => a.value - b.value)

  const tubeRadius = axes[0].value / 2
  const outerRadius = axes[1].value / 2
  const torusRadius = outerRadius - tubeRadius
  const holeAxis = axes[0].axis
  return { tubeRadius, torusRadius, holeAxis, center }
}

const generateSpherePositions = (
  torusRadius: number,
  sphereCount: number,
  overlapFactor: number,
  holeAxis: 'x' | 'y' | 'z',
  center: THREE.Vector3
): SpherePosition[] => {
  const circumference = Math.PI * 2 * torusRadius
  const sphereRadius = circumference / (sphereCount * overlapFactor) / 2
  return Array.from({ length: sphereCount }, (_, i) => {
    const angle = (i / sphereCount) * Math.PI * 2
    const cos = Math.cos(angle) * torusRadius
    const sin = Math.sin(angle) * torusRadius
    const pos: Record<'x' | 'y' | 'z', number> =
      holeAxis === 'z'
        ? { x: cos + center.x, y: sin + center.y, z: center.z }
        : holeAxis === 'y'
          ? { x: cos + center.x, y: center.y, z: sin + center.z }
          : { x: center.x, y: cos + center.y, z: sin + center.z }
    return { ...pos, radius: sphereRadius }
  })
}

export function CompoundTorusRingCollider({
  ringIndex,
  position,
  sphereCount = 8,
  overlapFactor = 0.7,
  restitution = 0.2,
  friction = 0.1,
  onRigidBodyReady,
}: TorusRingColliderProps) {
  const intersectionCount = useRef(0)
  const rigidBodyRef = useRef<RapierRigidBody>(null)

  // stays the same for the lifetime of the component
  const stableUserData = useRef<RigidBodyUserData>({ ringIndex, isInsidePost: false })

  const { geometries } = usePlasticMeshes()
  const mesh = geometries.ring
  if (!mesh) return null

  const { tubeRadius, torusRadius, holeAxis, center } = useMemo(
    () => extractTorusDimmensions(mesh),
    [mesh]
  )

  const spherePositions = useMemo(
    () => generateSpherePositions(torusRadius, sphereCount, overlapFactor, holeAxis, center),
    [torusRadius, tubeRadius, sphereCount, overlapFactor, holeAxis, center]
  )
  const registerFloatingBody = useGameStore((s) => s.registerFloatingBody)
  const unregisterFloatingBody = useGameStore((s) => s.unregisterFloatingBody)
  const setRingInPost = useGameStore((s) => s.setRingInPost)
  //starts with a randm impulse
  useEffect(() => {
    if (!rigidBodyRef.current) return
    const rb = rigidBodyRef.current
    registerFloatingBody(rb)
    onRigidBodyReady?.(rb)
    const strength = 0.0035
    rb.applyImpulse(
      {
        x: (Math.random() - 0.5) * strength,
        y: (Math.random() - 0.5) * strength * 0.6,
        z: (Math.random() - 0.5) * strength,
      },
      true
    )
    return () => unregisterFloatingBody(rb)
  }, [])

  const handleIntersectionEnter = ({ other }: CollisionPayload) => {
    const otherUserData = other.rigidBody?.userData as RigidBodyUserData | undefined
    if (other.colliderObject?.name !== 'stick') return
    if (otherUserData?.postIndex === undefined) return

    intersectionCount.current = Math.max(0, intersectionCount.current + 1)
    stableUserData.current.isInsidePost = true
    setRingInPost(ringIndex, otherUserData?.postIndex)
  }

  const handleIntersectionExit = ({ other }: CollisionPayload) => {
    if (other.colliderObject?.name !== 'stick') return
    if ((other.rigidBody?.userData as RigidBodyUserData | undefined)?.postIndex === undefined)
      return

    intersectionCount.current = Math.max(0, intersectionCount.current - 1)
    stableUserData.current.isInsidePost = intersectionCount.current > 0
    setRingInPost(ringIndex, null)
  }

  return (
    <RigidBody
      ccd
      canSleep={false}
      ref={rigidBodyRef}
      userData={stableUserData.current}
      linearDamping={3.9}
      angularDamping={2}
      position={position}
      colliders={false}
      restitution={restitution}
      friction={friction}
    >
      {spherePositions.map((sphere, i) => (
        <BallCollider
          key={i}
          position={[sphere.x, sphere.y, sphere.z]}
          args={[sphere.radius]}
          name={`ringIndex-${ringIndex}-sphere-${i}`}
        />
      ))}
      <CylinderCollider
        sensor
        args={[0.001, torusRadius - tubeRadius]}
        position={[center.x, center.y, center.z]}
        collisionGroups={interactionGroups(1, [0])}
        onIntersectionEnter={handleIntersectionEnter}
        onIntersectionExit={handleIntersectionExit}
      />
    </RigidBody>
  )
}
