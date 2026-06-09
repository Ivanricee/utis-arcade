import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import {
  CuboidCollider,
  Physics,
  RigidBody,
  TrimeshCollider,
  type RapierRigidBody,
} from '@react-three/rapier'
import { useMemo, useRef } from 'react'
import { DOME_WALL_DATA } from '../store/model-data'
import { generateWallData } from '../utils/generate-wall-data'
import CompundArrowCollider from './colliders/CompundArrowCollider'
import CompoundWings from './CompundWings'

export type WallDataType = Array<{
  args: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
}>
export default function CompoundDomeCollider() {
  const WALLS_MESH_NAME = 'walls_collider'
  const DOME_MESH_NAME = 'dome_collider'

  const { nodes } = useGLTF('/modelos/ref-colliders.glb')
  //-----------------------------------------------------------------------------
  const { nodes: horseNodes } = useGLTF('/modelos/ConvexMesh.glb')
  useMemo(() => {
    if (horseNodes.fixed) {
      horseNodes.convex.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material
          if (Array.isArray(material)) {
            material.forEach((m) => (m.visible = false))
          } else {
            material.visible = false
          }
        }
      })
    }
  }, [horseNodes.fixed])
  //-----------------------------------------------------------------------------
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const wallData = useRef<WallDataType>([])

  const getWallData = () => {
    if (DOME_WALL_DATA.length > 0) {
      wallData.current = DOME_WALL_DATA
      return
    }
    const wallsGeometry = (nodes[WALLS_MESH_NAME] as THREE.Mesh).geometry

    wallData.current = generateWallData(wallsGeometry)
  }
  getWallData()
  const domeColliderData = useMemo(() => {
    const geometry = (nodes[DOME_MESH_NAME] as THREE.Mesh).geometry
    if (!geometry.index) throw new Error('wall data geometry has no index')
    return {
      vertices: geometry.attributes.position.array,
      indices: geometry.index.array,
    }
  }, [nodes])
  return (
    <Physics debug={true}>
      <RigidBody ref={rigidBodyRef} type="fixed" colliders={false}>
        {/**
        <mesh geometry={(nodes[DOME_MESH_NAME] as THREE.Mesh).geometry}>
          <meshStandardMaterial color="black" side={THREE.DoubleSide} />
        </mesh>

        <mesh geometry={(nodes[WALLS_MESH_NAME] as THREE.Mesh).geometry}>
          <meshStandardMaterial color="red" side={THREE.DoubleSide} />
        </mesh>

        */}
        <CompoundWings />
        <TrimeshCollider args={[domeColliderData.vertices, domeColliderData.indices]} />
        {wallData.current.map((face, i) => (
          <CuboidCollider
            key={i}
            args={face.args}
            position={face.position}
            rotation={face.rotation}
          />
        ))}
      </RigidBody>
      <CompundArrowCollider />
      <RigidBody colliders="hull" type="kinematicPosition">
        <primitive object={horseNodes.kinematic} />
      </RigidBody>
      <RigidBody type="fixed" colliders="hull">
        <primitive object={horseNodes.fixed} />
      </RigidBody>
    </Physics>
  )
}
