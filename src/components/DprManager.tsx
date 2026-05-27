import { PerformanceMonitor } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

export default function DprManager() {
  const { setDpr } = useThree()
  return (
    <PerformanceMonitor
      onDecline={() => setDpr(1)}
      onIncline={() => setDpr(window.devicePixelRatio > 1 ? 2 : 1)}
    />
  )
}
