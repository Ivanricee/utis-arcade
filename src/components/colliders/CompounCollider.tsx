import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import {
  CuboidCollider,
  Physics,
  RigidBody,
  TrimeshCollider,
  type RapierRigidBody,
} from '@react-three/rapier'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DOME_WALL_DATA } from '../../store/model-data'
import { generateWallData } from '../../utils/generate-wall-data'
import CompundArrowCollider from './CompundArrowCollider'
import CompoundWings from './CompundWings'
import CompoundHorseCollider from './CompoundHorseCollider'
import { CompoundFloatingCollider } from './CompundFloatingCollider'
import Rings from './Rings/Rings'

export type WallDataType = Array<{
  args: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
}>
export default function CompoundCollider() {
  const WALLS_MESH_NAME = 'walls_collider'
  const DOME_MESH_NAME = 'dome_collider'

  const { nodes } = useGLTF('/modelos/ref-colliders.glb')
  const [paused, setPaused] = useState(false)
  const isPaused = useRef(false)
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

  useEffect(() => {
    const handleVisibility = () => {
      isPaused.current = document.hidden
      setPaused(document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return (
    <Physics debug={true} gravity={[0, -1.4, 0]} paused={paused}>
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
        <CompoundFloatingCollider />
        {wallData.current.map((face, i) => (
          <CuboidCollider
            key={i}
            args={face.args}
            position={face.position}
            rotation={face.rotation}
          />
        ))}
      </RigidBody>
      {
        //
      }
      <CompoundHorseCollider isPaused={isPaused} />
      <Rings />

      <CompundArrowCollider />
    </Physics>
  )
}
