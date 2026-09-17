import { useGLTF } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'
import { useBakedLighting } from '../hooks/useBaseBakedLight'
import { usePushButton } from '../hooks/usePushButton'
import { useEffect, useRef } from 'react'
import { drawText } from '../utils'
import {
  applyNameTexture,
  createDrawCanvas,
  createTextureFromCanvas,
  getBaseMaterial,
  loadNameFont,
} from '../utils'
import * as THREE from 'three'
import { useDrawTextPlayerName } from '../hooks/useDrawTextPlayerName'
const BUTTON_NAME = 'base_button'
export type canvasType = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
}

export function ConsoleGame() {
  const { scene } = useGLTF('/modelos/base.glb')

  const waterActive = useGameStore((state) => state.waterActive)
  const setWaterActive = useGameStore((state) => state.setWaterActive)
  const imageRef = useRef<TexImageSource | null>(null)
  const drawCanvasRef = useRef<canvasType | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  useBakedLighting(scene)

  const buttonHandlers = usePushButton({
    scene,
    buttonName: BUTTON_NAME,
    iconTexturePath: '/text/push.webp',
    pushAxis: 'x',
    pushDirection: -2,
    onPress: () => setWaterActive(true),
    onRelease: () => setWaterActive(false),
    isBlocked: () => waterActive,
  })
  // const centerY = (WATER_ZONE.minY + WATER_ZONE.maxY) / 2
  //const height = WATER_ZONE.maxY - WATER_ZONE.minY
  useEffect(() => {
    let canceled = false
    const init = async () => {
      await loadNameFont()
      if (canceled) return
      const material = getBaseMaterial(scene)
      if (!material || !material.map) return
      const ogTexture = material.map as THREE.Texture
      const image = ogTexture.image as TexImageSource
      imageRef.current = image //store to clean leter

      const draw = createDrawCanvas(image)
      drawCanvasRef.current = draw

      const canvasTexture = createTextureFromCanvas(draw.canvas, ogTexture)
      textureRef.current = canvasTexture
      applyNameTexture(material, canvasTexture)
      drawText(useGameStore.getState().playerName, image, draw.canvas, draw.ctx, canvasTexture)
    }
    init()
    return () => {
      canceled = true
    }
  }, [scene])
  useDrawTextPlayerName({ imageRef, drawCanvasRef, textureRef })
  return (
    <>
      <primitive object={scene} {...buttonHandlers} />
      {/*
      // debug:
      <mesh position={[WATER_ZONE.centerZ, centerY + 1.5, WATER_ZONE.centerX]}>
        <cylinderGeometry args={[WATER_ZONE.radius, WATER_ZONE.radius, height, 30]} />
        <meshStandardMaterial color="gold" transparent opacity={0.5} wireframe />
      </mesh>*/}
    </>
  )
}
