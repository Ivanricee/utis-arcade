import { ConeCollider, CuboidCollider, interactionGroups, RigidBody } from '@react-three/rapier'
import { ARROW_DATA } from '../../store/model-data'
import { Instance, Instances, useGLTF, useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

interface ArrowColliderProps {
  position: [number, number, number]
  postIndex: number
}

function ArrowCollider({ position, postIndex }: ArrowColliderProps) {
  return (
    <RigidBody type="fixed" colliders={false} position={position} userData={{ postIndex }}>
      {Object.entries(ARROW_DATA).map(([name, c]) => {
        if (name === 'tail_1') {
          return (
            <ConeCollider
              key={name}
              args={[c.scale[0], c.scale[1]]}
              position={[c.position[0], c.position[1], c.position[2]]}
              rotation={[c.rotation[0], c.rotation[1], c.rotation[2]]}
            />
          )
        }
        if (name === 'stick') {
          return (
            <CuboidCollider
              key={name}
              name="stick"
              args={[c.scale[0], c.scale[1], c.scale[2]]}
              position={[c.position[0], c.position[1], c.position[2]]}
              rotation={[c.rotation[0], c.rotation[1], c.rotation[2]]}
              collisionGroups={interactionGroups(0, [1])}
            />
          )
        }
        return (
          <CuboidCollider
            key={name}
            args={[c.scale[0], c.scale[1], c.scale[2]]}
            position={[c.position[0], c.position[1], c.position[2]]}
            rotation={[c.rotation[0], c.rotation[1], c.rotation[2]]}
          />
        )
      })}
      <Instance />
    </RigidBody>
  )
}

export default function CompundArrowCollider() {
  const { nodes: plasticNodes } = useGLTF('/modelos/plastics.glb')
  const postMMesh = plasticNodes['post'] as THREE.Mesh
  const lightMap = useTexture('/modelos/textures/plastic/plastic_lightmap.png')
  useEffect(() => {
    lightMap.colorSpace = THREE.LinearSRGBColorSpace
    lightMap.flipY = false
    lightMap.channel = 1
    lightMap.needsUpdate = true
    return () => {
      lightMap.dispose()
    }
  }, [lightMap])
  const bakedGeometry = useMemo(() => {
    postMMesh.updateMatrix()
    const geo = postMMesh.geometry.clone()
    geo.applyMatrix4(postMMesh.matrix)
    return geo
  }, [postMMesh])
  const postMaterial = useMemo(() => {
    const material = (
      Array.isArray(postMMesh.material) ? postMMesh.material[0] : postMMesh.material
    ).clone() as THREE.MeshStandardMaterial
    material.lightMap = lightMap
    material.lightMapIntensity = 1.2
    material.normalScale?.set(1.7, 1.7)
    material.emissiveIntensity = 0.9
    material.needsUpdate = true
    return material
  }, [postMMesh])
  return (
    <Instances geometry={bakedGeometry} material={postMaterial} limit={3}>
      <ArrowCollider position={[0, -0.115, 0.325]} postIndex={0} />
      <ArrowCollider position={[0, 0, 0]} postIndex={1} />
      <ArrowCollider position={[0, -0.115, -0.313]} postIndex={2} />
    </Instances>
  )
}
