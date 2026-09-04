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

  const instances = useMemo(() => generateBalloonInstances({ left: 1, central: 1, right: 1 }), [])
  const totalBalloons = instances.length
  const pivotOffset = useMemo(() => new THREE.Vector3(0.28, -1.48, 0.03), [])

  const _offset = new THREE.Vector3()
  useFrame(() => {
    const mesh = instancedMeshRef.current
    if (!mesh) return

    rigidBodyRefs.current.forEach((rb, i) => {
      if (!rb) return
      const pos = rb.translation()
      const rot = rb.rotation()
      _quaternion.set(rot.x, rot.y, rot.z, rot.w)
      _scale.setScalar(instances[i].scale)

      _offset.copy(pivotOffset).applyQuaternion(_quaternion).multiply(_scale)
      _position.set(pos.x, pos.y, pos.z).add(_offset)

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
          floatCenter={instance.floatCenter}
          scale={instance.scale}
          phase={instance.phase}
          colliderOffset={[-pivotOffset.x, -pivotOffset.y, -pivotOffset.z]}
          onRigidBodyReady={(rb) => {
            rigidBodyRefs.current[i] = rb
          }}
        />
      ))}
      <instancedMesh
        position={[0, 1.5, 0]}
        rotation={[0, 1.5, 0]}
        ref={instancedMeshRef}
        args={[geometries.balloon, material, totalBalloons]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
    </>
  )
}
