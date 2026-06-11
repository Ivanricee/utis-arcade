import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { BallCollider, RigidBody } from '@react-three/rapier'

interface TorusRingColliderProps {
  sphereCount?: number
  /** Overlap entre esferas vecinas. 0.65 = más gap, 0.85 = más overlap */
  overlapFactor?: number
  restitution?: number
  friction?: number
  color?: string
  showMesh?: boolean
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
  return { tubeRadius, torusRadius, holeAxis, center }
}
const generateSpherePositions = (
  torusRadius: number,
  tubeRadius: number,
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
  sphereCount = 8,
  overlapFactor = 0.75,
  restitution = 0.2,
  friction = 0.8,
  /* color = 'royalblue',
  showMesh = true,*/
}: TorusRingColliderProps) {
  const { nodes } = useGLTF('/modelos/RING.glb')
  const position = nodes.ring.position
  const mesh = nodes.ring as THREE.Mesh
  if (!mesh.geometry) {
    //console.log('no geometry found in mesh')
    return null
  }
  const { tubeRadius, torusRadius, holeAxis, center } = useMemo(
    () => extractTorusDimmensions(mesh.geometry),
    [mesh.geometry]
  )

  const spherePositions = useMemo(
    () =>
      generateSpherePositions(
        torusRadius,
        tubeRadius,
        sphereCount,
        overlapFactor,
        holeAxis,
        center
      ),
    [torusRadius, tubeRadius, sphereCount, overlapFactor, holeAxis, center]
  )

  /*useMemo(() => {
    console.log(`[TorusRingCollider] "ring"`, {
      torusRadius: torusRadius.toFixed(4),
      tubeRadius: tubeRadius.toFixed(4),
      holeAxis,
      sphereCount,
      sphereRadius: spherePositions[0]?.radius.toFixed(4),
    })
  }, [torusRadius, tubeRadius, holeAxis, sphereCount])*/
  return (
    <RigidBody
      ccd
      position={position}
      colliders={false}
      restitution={restitution}
      friction={friction}
    >
      {/*showMesh && (
        <mesh geometry={mesh.geometry}>
          <meshStandardMaterial color={color} />
        </mesh>
      )*/}

      {spherePositions.map((sphere, i) => (
        <BallCollider key={i} position={[sphere.x, sphere.y, sphere.z]} args={[sphere.radius]} />
      ))}
    </RigidBody>
  )
}
