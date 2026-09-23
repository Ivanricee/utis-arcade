import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function BackgroundOnly({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl)
  const { scene, gl } = useThree()

  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    const image = texture.image as { height: number }
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(image.height)
    cubeRenderTarget.fromEquirectangularTexture(gl, texture)

    const oldBg = scene.background
    scene.background = cubeRenderTarget.texture // cubemap real, listo para mostrar
    return () => {
      scene.background = oldBg
      cubeRenderTarget.dispose()
    }
  }, [texture, scene, gl])

  return null
}
