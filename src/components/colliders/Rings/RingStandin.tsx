import { useFrame } from '@react-three/fiber'
import type { RapierRigidBody } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import usePlasticMeshes from '../../../hooks/usePlasticMeshes'
interface RingStandInProps {
  rigidBodyRefs: RapierRigidBody[]

  positions: [number, number, number][]
  colors?: string[]
}

const DEFAULT_COLORS = [
  '#54f30a',
  '#24f783',
  '#ff4ca0',
  '#6572ec',
  '#85c72e',
  '#f3e8f0',
  '#8f2f1a',
  '#beff45',
  '#64a56d',
]

export function RingStandin({
  positions,
  colors = DEFAULT_COLORS,
  rigidBodyRefs,
}: RingStandInProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const { geometries, material } = usePlasticMeshes()
  const mesh = geometries.ring

  const matrix = useRef(new THREE.Matrix4())
  const pos = useRef(new THREE.Vector3())
  const rot = useRef(new THREE.Quaternion())
  const scale = useRef(new THREE.Vector3(1, 1, 1))

  useFrame(() => {
    if (!instancedMeshRef.current || rigidBodyRefs.length === 0) return

    rigidBodyRefs.forEach((rb, i) => {
      if (!rb) return

      const translation = rb.translation()
      const rotation = rb.rotation()

      pos.current.set(translation.x, translation.y, translation.z)
      rot.current.set(rotation.x, rotation.y, rotation.z, rotation.w)

      matrix.current.compose(pos.current, rot.current, scale.current)
      instancedMeshRef.current!.setMatrixAt(i, matrix.current)
    })

    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  })

  useEffect(() => {
    if (!instancedMeshRef.current) return

    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()

    positions.forEach((position, i) => {
      // Posición de cada instancia
      matrix.setPosition(position[0], position[1], position[2])
      instancedMeshRef.current!.setMatrixAt(i, matrix)

      // Color placeholder por instancia
      color.set(colors[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length])
      instancedMeshRef.current!.setColorAt(i, color)
    })

    //notify matrix and color changes
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true
    }
  }, [positions, colors])
  if (!mesh) return null
  return (
    <instancedMesh
      position={[0, 1.5, 0]}
      rotation={[0, 1.5, 0]}
      frustumCulled={false}
      ref={instancedMeshRef}
      args={[mesh, material, positions.length]}
      castShadow
      receiveShadow
    />
  )
}
