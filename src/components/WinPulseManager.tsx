import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useWinCondition } from '../hooks/useWinCondition'

interface WinPulseManagerProps {
  lights: (THREE.PointLight | null)[]
  materials: THREE.MeshStandardMaterial[]
}

export function WinPulseManager({ lights, materials }: WinPulseManagerProps) {
  const hasWon = useWinCondition()
  const initialLightIntensities = useRef(new Map<THREE.PointLight, number>())
  const initialMaterialValues = useRef(
    new Map<THREE.MeshStandardMaterial, { emissive: THREE.Color; intensity: number }>()
  )
  const winEmissive = useRef(new THREE.Color('#ffe057'))

  useFrame((state) => {
    for (const light of lights) {
      if (light && !initialLightIntensities.current.has(light)) {
        initialLightIntensities.current.set(light, light.intensity)
      }
    }
    for (const material of materials) {
      if (!initialMaterialValues.current.has(material)) {
        initialMaterialValues.current.set(material, {
          emissive: material.emissive.clone(),
          intensity: material.emissiveIntensity,
        })
      }
    }

    const pulse = hasWon ? (Math.sin(state.clock.elapsedTime * 9) + 1) / 2 : 0

    for (const [light, intensity] of initialLightIntensities.current) {
      light.intensity = hasWon ? intensity * (0.35 + pulse * 1.15) : intensity
    }
    for (const [material, initial] of initialMaterialValues.current) {
      if (hasWon) {
        material.emissive.copy(initial.emissive).lerp(winEmissive.current, pulse)
        material.emissiveIntensity = initial.intensity + pulse * 4
      } else {
        material.emissive.copy(initial.emissive)
        material.emissiveIntensity = initial.intensity
      }
    }
  })

  return null
}
