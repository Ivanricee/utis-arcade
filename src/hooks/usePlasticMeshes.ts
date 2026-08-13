import { useGLTF, useTexture } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

export default function usePlasticMeshes() {
  const { nodes: plasticNodes } = useGLTF('/modelos/plastics.glb') as unknown as {
    nodes: Record<string, THREE.Object3D>
  }

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

  const material = useMemo(() => {
    //get material
    const sourceNode = Object.values(plasticNodes).find(
      (node): node is THREE.Mesh => node instanceof THREE.Mesh
    )
    if (!sourceNode) {
      console.warn('usePlasticMeshes: no se encontró ningún mesh en plasticNodes')
      return new THREE.MeshStandardMaterial()
    }

    const ogMaterial = Array.isArray(sourceNode.material)
      ? sourceNode.material[0]
      : sourceNode.material

    const newMaterial = (ogMaterial as THREE.MeshStandardMaterial).clone()
    newMaterial.lightMap = lightMap
    newMaterial.lightMapIntensity = 1.2
    newMaterial.emissiveIntensity = 0.9
    newMaterial.normalScale?.set(1.7, 1.7)
    newMaterial.needsUpdate = true
    return newMaterial
  }, [lightMap, plasticNodes])

  const geometries = useMemo(() => {
    const out: Record<string, THREE.BufferGeometry> = {}

    Object.entries(plasticNodes).forEach(([name, node]) => {
      if (!(node instanceof THREE.Mesh)) return

      node.updateWorldMatrix(true, false)
      const geo = node.geometry.clone()
      geo.applyMatrix4(node.matrixWorld)
      geo.computeVertexNormals()
      out[name] = geo
    })

    return out
  }, [plasticNodes])

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((geo) => geo.dispose())
      material.dispose()
    }
  }, [geometries, material])

  return { geometries, material }
}
