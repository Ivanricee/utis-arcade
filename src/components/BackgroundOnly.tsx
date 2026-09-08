import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import * as THREE from 'three'

export function BackgroundOnly({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl)
  const scene = useThree((state) => state.scene)

  useLayoutEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.colorSpace = THREE.SRGBColorSpace
    const oldBg = scene.background
    scene.background = texture
    return () => {
      scene.background = oldBg
    }
  }, [texture, scene])

  return null
}
