import type { ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'
import { WATER_ZONE } from '../hooks/useWaterForce'

export function ConsoleGame() {
  const baseMesh = useGLTF('/modelos/BASE_mesh.glb')
  const waterActive = useGameStore((state) => state.waterActive)
  const setWaterActive = useGameStore((state) => state.setWaterActive)

  const centerY = (WATER_ZONE.minY + WATER_ZONE.maxY) / 2
  const height = WATER_ZONE.maxY - WATER_ZONE.minY
  return (
    <>
      <primitive
        object={baseMesh.scene}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          if (e.object.name !== 'button') return
          if (waterActive) return // chorro ya activo, no hace nada
          setWaterActive(true) // activa el chorro
        }}
        onPointerUp={(e: ThreeEvent<PointerEvent>) => {
          if (e.object.name !== 'button') return
          setWaterActive(false)
        }}
      />
      <mesh position={[WATER_ZONE.centerX, centerY, WATER_ZONE.centerZ]}>
        <cylinderGeometry args={[WATER_ZONE.radius, WATER_ZONE.radius, height, 16]} />
        <meshStandardMaterial color="blue" transparent opacity={0.3} wireframe />
      </mesh>
    </>
  )
}
