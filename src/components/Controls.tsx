import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type ComponentRef, type RefObject } from 'react'
import * as THREE from 'three'

const startDistance = 3
const offset = new THREE.Vector3(0, -0.3, 0)

export function Controls({ sceneRef }: { sceneRef: RefObject<THREE.Group | null> }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const camera = useThree((state) => state.camera)
  const done = useRef(false)

  useFrame(() => {
    if (done.current || !sceneRef.current || !controls.current) return

    const box = new THREE.Box3()
    sceneRef.current.traverse((child) => {
      if ('isMesh' in child && child.isMesh && child.visible) box.expandByObject(child)
    })
    if (box.isEmpty()) return

    const center = box.getCenter(new THREE.Vector3())
    center.add(offset)
    controls.current.target.copy(center)
    camera.position.set(center.x, center.y, center.z + startDistance)
    controls.current.update()
    done.current = true
  })

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      enablePan={false}
      minDistance={1.5}
      maxDistance={5}
      minAzimuthAngle={THREE.MathUtils.degToRad(-90)} // izquierda
      maxAzimuthAngle={THREE.MathUtils.degToRad(100)} // derecha
      minPolarAngle={THREE.MathUtils.degToRad(20)} // arriba
      maxPolarAngle={THREE.MathUtils.degToRad(120)} // abajo
    />
  )
}
