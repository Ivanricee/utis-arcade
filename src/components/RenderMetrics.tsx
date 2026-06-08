import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
export interface RenderMetricsProps {
  onUpdate: (metrics: {
    drawCalls: number
    triangles: number
    geometries: number
    textures: number
    shaders: number
    vertices: number
  }) => void
}
export function RenderMetrics({ onUpdate }: RenderMetricsProps) {
  const { gl, scene } = useThree()
  const lastUpdate = useRef(0)

  useFrame(({ clock }) => {
    if (clock.elapsedTime - lastUpdate.current < 10) return // actualiza cada 500ms
    lastUpdate.current = clock.elapsedTime

    let vertices = 0
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) vertices += obj.geometry.attributes.position.count
    })

    onUpdate({
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      shaders: gl.info.programs?.length ?? 0,
      vertices,
    })
  })

  return null
}
