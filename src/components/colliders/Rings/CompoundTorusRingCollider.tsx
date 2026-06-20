import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import {
  BallCollider,
  CylinderCollider,
  interactionGroups,
  RapierRigidBody,
  RigidBody,
} from '@react-three/rapier'
//import { useGameStore } from '../../../store/gameStore'

interface TorusRingColliderProps {
  ringIndex: number
  position: [number, number, number]
  sphereCount?: number
  /** Overlap entre esferas vecinas. 0.65 = más gap, 0.85 = más overlap */
  overlapFactor?: number
  restitution?: number
  friction?: number
  color?: string
  showMesh?: boolean
  onRigidBodyReady?: (rb: RapierRigidBody) => void
}

interface RigidBodyUserData {
  ringIndex?: number
  postIndex?: number
}
interface SpherePosition {
  x: number
  y: number
  z: number
  radius: number
}

const extractTorusDimmensions = (geometry: THREE.BufferGeometry) => {
  geometry.computeBoundingBox()
  if (!geometry.boundingBox) {
    console.warn('no bounding box found in geometry')
  }
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
  //console.log({ tubeRadius, torusRadius, holeAxis, center })
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
  //const minSphereCount = Math.ceil((Math.PI * 2 * torusRadius) / (tubeRadius * 2 * overlapFactor))
  //console.log({ minSphereCount })
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
  overlapFactor = 0.75,
  restitution = 0.2,
  friction = 0.8,
  onRigidBodyReady,
}: TorusRingColliderProps) {
  //const setRingInPost = useGameStore((state) => state.setRingInPost)
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const { nodes } = useGLTF('/modelos/RING.glb')
  const mesh = nodes.ring as THREE.Mesh
  if (!mesh.geometry) {
    return null
  }
  const { tubeRadius, torusRadius, holeAxis, center } = useMemo(
    () => extractTorusDimmensions(mesh.geometry),
    [mesh.geometry]
  )

  const spherePositions = useMemo(
    () => generateSpherePositions(torusRadius, sphereCount, overlapFactor, holeAxis, center),
    [torusRadius, tubeRadius, sphereCount, overlapFactor, holeAxis, center]
  )
  useEffect(() => {
    if (!rigidBodyRef.current) return
    if (rigidBodyRef.current && onRigidBodyReady) onRigidBodyReady(rigidBodyRef.current)
    const strength = 0.0035
    rigidBodyRef.current.applyImpulse(
      {
        x: (Math.random() - 0.5) * strength,
        y: (Math.random() - 0.5) * strength * 0.6,
        z: (Math.random() - 0.5) * strength,
      },
      true
    )
  }, [])
  return (
    <RigidBody
      ccd
      ref={rigidBodyRef}
      userData={{ ringIndex }}
      linearDamping={3.5}
      angularDamping={3}
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
        args={[0.001, torusRadius - tubeRadius]} //rad, h
        position={[center.x, center.y, center.z]}
        collisionGroups={interactionGroups(1, [0])}
        onIntersectionEnter={({ other }) => {
          const postIndex = (other.rigidBody?.userData as RigidBodyUserData)?.postIndex
          if (postIndex === undefined) return
          //console.log('enter postIndex', postIndex)

          // setRingInPost(ringIndex, postIndex)
        }}
        onIntersectionExit={({ other }) => {
          const postIndex = (other.rigidBody?.userData as RigidBodyUserData)?.postIndex
          if (postIndex === undefined) return
          //console.log('exit postIndex', postIndex)
          // setRingInPost(ringIndex, null)
        }}
      />
    </RigidBody>
  )
}
