import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { RapierRigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
interface RingStandInProps {
  rigidBodyRefs: RapierRigidBody[]

  positions: [number, number, number][]
  colors?: string[]
}

const DEFAULT_COLORS = [
  '#ffcc00',
  '#44ff44',
  '#00ccff',
  '#4444ff',
  '#ff44cc',
  '#ffffff',
  '#ff6644',
  '#44ffcc',
]

export function RingStandin({
  positions,
  colors = DEFAULT_COLORS,
  rigidBodyRefs,
}: RingStandInProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const { nodes } = useGLTF('/modelos/RING.glb')
  const mesh = nodes.ring as THREE.Mesh

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

  if (!mesh.material) {
    console.warn('no material found in mesh')
    return null
  }

  const material = useMemo(() => {
    const mtrl = (mesh.material as THREE.MeshStandardMaterial).clone()
    return mtrl
  }, [mesh.material])

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

    // Notifica a Three.js que las matrices y colores cambiaron
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true
    }
  }, [positions, colors])
  if (!mesh?.geometry) return null
  return (
    <instancedMesh
      frustumCulled={false}
      ref={instancedMeshRef}
      args={[mesh.geometry, material, positions.length]}
      castShadow
      receiveShadow
    />
  )
}
