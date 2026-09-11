import { useGLTF } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'
import { useBakedLighting } from '../hooks/useBaseBakedLight'
import { usePushButton } from '../hooks/usePushButton'
//import { WATER_ZONE } from '../hooks/useWaterForce'
const BUTTON_NAME = 'base_button'
export function ConsoleGame() {
  const { scene } = useGLTF('/modelos/base.glb')

  const waterActive = useGameStore((state) => state.waterActive)
  const setWaterActive = useGameStore((state) => state.setWaterActive)
  useBakedLighting(scene)
  const buttonHandlers = usePushButton({
    scene,
    buttonName: BUTTON_NAME,
    //iconTexturePath: '/text/push.png',
    iconTexturePath: '/text/push.webp',
    pushAxis: 'x',
    pushDirection: -2,
    onPress: () => setWaterActive(true),
    onRelease: () => setWaterActive(false),
    isBlocked: () => waterActive,
  })
  // const centerY = (WATER_ZONE.minY + WATER_ZONE.maxY) / 2
  //const height = WATER_ZONE.maxY - WATER_ZONE.minY

  return (
    <>
      <primitive object={scene} {...buttonHandlers} />
      {/* <primitive
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
      // debug:
      <mesh position={[WATER_ZONE.centerZ, centerY + 1.5, WATER_ZONE.centerX]}>
        <cylinderGeometry args={[WATER_ZONE.radius, WATER_ZONE.radius, height, 30]} />
        <meshStandardMaterial color="gold" transparent opacity={0.5} wireframe />
      </mesh>*/}
    </>
  )
}
