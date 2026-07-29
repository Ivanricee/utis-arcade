import type { ThreeEvent } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'
import { useEffect } from 'react'
import * as THREE from 'three'
//import { WATER_ZONE } from '../hooks/useWaterForce'
/**
 1 Mari aumentar los nromales
 */
export function ConsoleGame() {
  const { scene } = useGLTF('/modelos/base.glb')
  const lightMap = useTexture('/modelos/textures/base/bakedLightBase.png')
  const waterActive = useGameStore((state) => state.waterActive)
  const setWaterActive = useGameStore((state) => state.setWaterActive)

  //const centerY = (WATER_ZONE.minY + WATER_ZONE.maxY) / 2
  //const height = WATER_ZONE.maxY - WATER_ZONE.minY

  useEffect(() => {
    // Config de la textura del lightmap
    lightMap.flipY = false
    lightMap.colorSpace = THREE.SRGBColorSpace
    lightMap.channel = 1
    lightMap.needsUpdate = true

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const geo = child.geometry

      // Solo aplicamos a mallas que realmente tengan el UV del lightmap
      if (!geo.attributes.uv1) return

      // Compatibilidad con three < r152 (hardcodea el nombre 'uv2')
      if (!geo.attributes.uv2) {
        geo.setAttribute('uv2', geo.attributes.uv1)
      }

      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((mat) => {
        const material = mat as THREE.MeshStandardMaterial
        //lightmap
        material.lightMap = lightMap
        material.lightMapIntensity = 5
        // normal map: intensifica el relieve/bump

        if (material.normalMap) {
          material.normalScale.set(0.6, 0.6)
        }

        if (material.emissiveMap) {
          if (material.emissive.getHex() === 0x000000) {
            material.emissive.set(0xffffff)
          }
          material.emissiveIntensity = 2

          material.toneMapped = false
        }
        material.needsUpdate = true
      })
    })
  }, [scene, lightMap])

  return (
    <>
      <primitive
        object={scene}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          if (e.object.name !== 'base_button') return
          if (waterActive) return // chorro ya activo, no hace nada
          setWaterActive(true) // activa el chorro
        }}
        onPointerUp={(e: ThreeEvent<PointerEvent>) => {
          if (e.object.name !== 'base_button') return
          setWaterActive(false)
        }}
      />
      {/**
 * debug:
      <mesh position={[WATER_ZONE.centerX, centerY, WATER_ZONE.centerZ]}>
        <cylinderGeometry args={[WATER_ZONE.radius, WATER_ZONE.radius, height, 16]} />
        <meshStandardMaterial color="blue" transparent opacity={0.3} wireframe />
      </mesh>
 */}
    </>
  )
}
