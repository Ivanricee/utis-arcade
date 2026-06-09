import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { CuboidCollider } from '@react-three/rapier'
import { useRef } from 'react'
import { WINGS_WALL_DATA } from '../store/model-data'
import { generateWallData } from '../utils/generate-wall-data'
export type WingsWallData = {
  left: Array<{
    args: [number, number, number]
    position: [number, number, number]
    rotation: [number, number, number]
  }>
  right: Array<{
    args: [number, number, number]
    position: [number, number, number]
    rotation: [number, number, number]
  }>
}
export default function CompoundWings() {
  const { nodes } = useGLTF('/modelos/ConvexMesh.glb')
  const wingData = useRef<WingsWallData>({ left: [], right: [] })

  const getWallData = () => {
    if (WINGS_WALL_DATA.left.length > 0 || WINGS_WALL_DATA.right.length > 0) {
      wingData.current.left = WINGS_WALL_DATA.left
      wingData.current.right = WINGS_WALL_DATA.right
      return
    }
    const wingsGeometry = (nodes.a1 as THREE.Mesh).geometry
    //console.log({ nodes: nodes.b2 })
    wingData.current.left = generateWallData(wingsGeometry)
  }
  getWallData()

  return (
    <>
      {wingData.current.left.map((face, i) => (
        <CuboidCollider
          key={i}
          args={face.args}
          position={face.position}
          rotation={face.rotation}
        />
      ))}
      {wingData.current.right.map((face, i) => (
        <CuboidCollider
          key={i}
          args={face.args}
          position={face.position}
          rotation={face.rotation}
        />
      ))}
    </>
  )
}
