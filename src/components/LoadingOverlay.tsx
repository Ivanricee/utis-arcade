import { useProgress } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'

export function LoadingOverlay() {
  const { active, progress } = useProgress()
  const isSceneReady = useGameStore((state) => state.isSceneReady)

  if (isSceneReady) return null // ya terminó todo, no mostrar nada

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        fontFamily: 'monospace',
      }}
    >
      {active ? `Cargando... ${progress.toFixed(0)}%` : 'Preparando escena...'}
    </div>
  )
}
