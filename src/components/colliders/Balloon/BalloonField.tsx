import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { RapierRigidBody } from '@react-three/rapier'
import usePlasticMeshes from '../../../hooks/usePlasticMeshes'
import { BalloonRigidBody } from './BalloonRigidBody'
import { generateBalloonInstances } from '../../../store/balloon-data'

const _matrix = new THREE.Matrix4()
const _position = new THREE.Vector3()
const _quaternion = new THREE.Quaternion()
const _scale = new THREE.Vector3()

export function BalloonField() {
  const { geometries, material } = usePlasticMeshes()
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const rigidBodyRefs = useRef<(RapierRigidBody | null)[]>([])

  const instances = useMemo(() => generateBalloonInstances({ left: 2, central: 0, right: 2 }), [])
  const totalBalloons = instances.length

  useFrame(() => {
    const mesh = instancedMeshRef.current
    if (!mesh) return

    rigidBodyRefs.current.forEach((rb, i) => {
      if (!rb) return
      const pos = rb.translation()
      const rot = rb.rotation()
      _position.set(pos.x, pos.y, pos.z)
      _quaternion.set(rot.x, rot.y, rot.z, rot.w)
      _scale.setScalar(instances[i].scale)
      _matrix.compose(_position, _quaternion, _scale)
      mesh.setMatrixAt(i, _matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      {instances.map((instance, i) => (
        <BalloonRigidBody
          key={instance.id}
          basePosition={instance.basePosition}
          scale={instance.scale}
          phase={instance.phase}
          onRigidBodyReady={(rb) => {
            rigidBodyRefs.current[i] = rb
          }}
        />
      ))}
      <instancedMesh
        ref={instancedMeshRef}
        args={[geometries.balloon, material, totalBalloons]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
    </>
  )
}
