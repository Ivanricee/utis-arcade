import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
const WAVE_CONFIG = [
  { amplitude: 0.025, speed: 1.22 },
  { amplitude: 0.035, speed: 1.12 },
  { amplitude: 0.045, speed: 1.04 },
  { amplitude: 0.0275, speed: 0.9 },
  { amplitude: 0.0325, speed: 0.88 },
]
const PHASE_STEP = (Math.PI * 2) / 5

export default function CompoundHorseCollider({
  isPaused,
}: {
  isPaused: React.RefObject<boolean>
}) {
  const { nodes: horseNodes } = useGLTF('/modelos/ConvexMesh.glb')
  const waveRefs = useRef<(RapierRigidBody | null)[]>([])
  const localTime = useRef(0)

  useMemo(() => {
    //console.log({ convex1: horseNodes.convex1 })
    if (horseNodes.fixed) {
      horseNodes.convex.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material
          if (Array.isArray(material)) {
            material.forEach((m) => (m.visible = false))
          } else {
            material.visible = false
          }
        }
      })
    }
  }, [horseNodes.fixed])
  const fixedNodes = [
    horseNodes.convex1,
    horseNodes.convex2,
    horseNodes.collider3,
    horseNodes.convex4,
    horseNodes.conex5,
  ]
  const baseLimitY = fixedNodes.map((node) => node.position.y)
  useFrame((_, delta) => {
    if (isPaused.current) return

    const safeDelta = Math.min(delta, 1 / 30)
    localTime.current += safeDelta
    const time = localTime.current

    waveRefs.current.forEach((rb, i) => {
      if (!rb) return
      const { amplitude, speed } = WAVE_CONFIG[i]
      const y = baseLimitY[i] + (Math.sin(time * speed + i * PHASE_STEP) - 1) * amplitude
      rb.setNextKinematicTranslation({ x: 0, y, z: 0 })
    })
  })
  return (
    <>
      {fixedNodes.map((node, i) => (
        <RigidBody
          key={i}
          ref={(el) => {
            waveRefs.current[i] = el
          }}
          colliders="hull"
          type="kinematicPosition"
        >
          <primitive object={node} />
        </RigidBody>
      ))}
      <RigidBody type="fixed" colliders="hull">
        <primitive object={horseNodes.fixed} />
      </RigidBody>
    </>
  )
}
