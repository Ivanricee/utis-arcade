import { PerformanceMonitor } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'

export default function DprManager() {
  const downgrade = useGameStore((state) => state.downgrade)
  const upgrade = useGameStore((state) => state.upgrade)
  return (
    <PerformanceMonitor
      onDecline={() => downgrade()}
      onIncline={() => upgrade()}
      ms={250} // ventana de muestreo de FPS antes de decidir (default suele andar bien)
      iterations={10} // cuántas muestras promedia antes de disparar onIncline/onDecline
      flipflops={3} // si detecta N cambios de dirección seguidos (sube-baja-sube), lo considera inestable
      onFallback={() => downgrade()} // se llama cuando hay demasiado flapping: en vez de seguir oscilando, se asienta en un nivel fijo más bajo
    />
  )
}
