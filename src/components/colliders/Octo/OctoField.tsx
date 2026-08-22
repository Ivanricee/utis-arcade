import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { RapierRigidBody } from '@react-three/rapier'
import usePlasticMeshes from '../../../hooks/usePlasticMeshes'
import { OctoRigidBody } from './OctoRigidBody'
import { generateOctoInstances } from '../../../store/octo-data'

const _matrix = new THREE.Matrix4()
const _position = new THREE.Vector3()
const _quaternion = new THREE.Quaternion()
const _scale = new THREE.Vector3()

export function OctoField() {
  const { geometries, material } = usePlasticMeshes()
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const rigidBodyRefs = useRef<(RapierRigidBody | null)[]>([])

  const instances = useMemo(() => generateOctoInstances({ left: 2, central: 5, right: 2 }), [])
  const octoCount = instances.length
  const pivotOffset = useMemo(() => {
    const geo = geometries.octo
    geo.computeBoundingBox()
    const center = new THREE.Vector3()
    geo.boundingBox?.getCenter(center)
    return center
  }, [geometries.octo])
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

      // offset del pivot, rotado y escalado igual que la instancia
      _offset.copy(pivotOffset).multiplyScalar(-1).applyQuaternion(_quaternion).multiply(_scale)
      _position.set(pos.x, pos.y, pos.z).add(_offset)

      _matrix.compose(_position, _quaternion, _scale)
      mesh.setMatrixAt(i, _matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      {instances.map((instance, i) => (
        <OctoRigidBody
          key={instance.id}
          position={instance.position}
          scale={instance.scale}
          onRigidBodyReady={(rb) => {
            rigidBodyRefs.current[i] = rb
          }}
        />
      ))}
      <instancedMesh
        ref={instancedMeshRef}
        args={[geometries.octo, material, octoCount]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
    </>
  )
}
