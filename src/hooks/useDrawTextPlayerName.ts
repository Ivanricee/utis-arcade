import { useEffect, useRef, type RefObject } from 'react'
import { useGameStore } from '../store/gameStore'
import type { canvasType } from '../components/ConsoleGame'
import * as THREE from 'three'
import { drawText } from '../utils'

interface Props {
  imageRef: RefObject<TexImageSource | null>
  drawCanvasRef: RefObject<canvasType | null>
  textureRef: RefObject<THREE.CanvasTexture | null>
}
export function useDrawTextPlayerName({ imageRef, drawCanvasRef, textureRef }: Props) {
  const playerName = useGameStore((state) => state.playerName)
  const prevPlayerNameRef = useRef<string | null>(null)
  useEffect(() => {
    if (playerName === prevPlayerNameRef.current) return
    prevPlayerNameRef.current = playerName

    if (!imageRef.current || !drawCanvasRef.current || !textureRef.current) return
    const { canvas, ctx } = drawCanvasRef.current

    drawText(playerName, imageRef.current, canvas, ctx, textureRef.current)
  }, [playerName])
}
