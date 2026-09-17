import { useEffect } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function useBakedLighting(scene: THREE.Object3D) {
  const lightMap = useTexture('/modelos/textures/base/bakedLightBase.webp')

  useEffect(() => {
    lightMap.flipY = false
    lightMap.colorSpace = THREE.SRGBColorSpace
    lightMap.channel = 1
    lightMap.needsUpdate = true

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const geo = child.geometry
      if (!geo.attributes.uv1) return
      if (!geo.attributes.uv2) geo.setAttribute('uv2', geo.attributes.uv1)

      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((mat) => {
        const material = mat as THREE.MeshStandardMaterial
        material.lightMap = lightMap
        material.lightMapIntensity = 8
        if (material.normalMap) material.normalScale.set(0.6, 0.6)
        if (material.emissiveMap) {
          if (material.emissive.getHex() === 0x000000) material.emissive.set(0xffffff)
          material.emissiveIntensity = 1
          material.toneMapped = true
        }
        material.needsUpdate = true
      })
    })
  }, [scene, lightMap])
}
