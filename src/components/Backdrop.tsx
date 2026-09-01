import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
interface BackdropProps {
  imageUrl: string
  distance?: number
}

export function Backdrop({ imageUrl, distance = 10 }: BackdropProps) {
  const texture = useTexture(imageUrl)
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera
  const size = useThree((state) => state.size)

  const [planeWidth, planeHeight] = useMemo(() => {
    const vFov = (camera.fov * Math.PI) / 180
    const frustumHeight = 2 * Math.tan(vFov / 2) * distance
    const frustumWidth = frustumHeight * (size.width / size.height)
    const img = texture.image as HTMLImageElement
    const imgAspect = img.width / img.height
    const frustumAspect = frustumWidth / frustumHeight

    return imgAspect > frustumAspect
      ? [frustumWidth, frustumWidth / imgAspect]
      : [frustumHeight * imgAspect, frustumHeight]
  }, [camera, size, texture, distance])

  return (
    <mesh position={[0, 0, -distance]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}
