import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
const WAVE_CONFIG = [
  { amplitude: 0.025, speed: 1.42 },
  { amplitude: 0.034, speed: 1.32 },
  { amplitude: 0.02, speed: 1.24 },
  { amplitude: 0.0345, speed: 1.12 },
  { amplitude: 0.0215, speed: 0.9 },
]

const PHASE_STEP = (Math.PI * 2) / 5
const WAVE_NAMES = ['w1', 'w2', 'w3', 'w4', 'w5'] as const // convex1, convex2, collider3, convex4, conex5

export default function CompoundHorse({ isPaused }: { isPaused: React.RefObject<boolean> }) {
  const { nodes: colliderNodes } = useGLTF('/modelos/ConvexMesh.glb')
  const { nodes: visualNodes } = useGLTF('/modelos/horses.glb')
  const lightMap = useTexture('/modelos/textures/horses/lightmap_horses.png')
  //const lightRef = useRef(null)
  //useHelper(lightRef, THREE.PointLightHelper, 0.1, 'red') // tamaño, color
  useEffect(() => {
    lightMap.colorSpace = THREE.LinearSRGBColorSpace
    lightMap.flipY = false
    lightMap.channel = 1
    lightMap.needsUpdate = true
    return () => {
      lightMap.dispose()
    }
  }, [lightMap])

  // Clona y prepara cada mesh visual UNA sola vez
  const preparedVisual = useMemo(() => {
    const allNames = [...WAVE_NAMES, 'w6'] as const
    const result: Record<string, THREE.Mesh> = {}
    allNames.forEach((name) => {
      const original = visualNodes[name] as THREE.Mesh
      const mesh = original.clone()
      const mat = (
        Array.isArray(original.material) ? original.material[0] : original.material
      ).clone() as THREE.MeshStandardMaterial
      mat.lightMap = lightMap
      mat.lightMapIntensity = 2
      mat.normalScale?.set(0.4, 0.4)
      mat.emissiveIntensity = 1
      mat.needsUpdate = true
      mesh.material = mat
      result[name] = mesh
    })
    return result
  }, [visualNodes, lightMap])

  const rigidRefs = useRef<(RapierRigidBody | null)[]>([])
  const visualRefs = useRef<(THREE.Group | null)[]>([])
  const localTime = useRef(0)

  const colliderWaveNodes = [
    colliderNodes.convex1,
    colliderNodes.convex2,
    colliderNodes.collider3,
    colliderNodes.convex4,
    colliderNodes.conex5,
  ]

  const baseLimitY = colliderWaveNodes.map((n) => n.position.y)
  useEffect(() => {
    ;[...colliderWaveNodes, colliderNodes.fixed].forEach((node) => {
      node?.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material
          if (Array.isArray(material)) material.forEach((m) => (m.visible = false))
          else material.visible = false
        }
      })
    })
  }, [colliderNodes])
  useFrame((_, delta) => {
    if (isPaused.current) return
    const safeDelta = Math.min(delta, 1 / 30)
    localTime.current += safeDelta
    const time = localTime.current

    for (let i = 0; i < WAVE_CONFIG.length; i++) {
      const { amplitude, speed } = WAVE_CONFIG[i]
      const y = baseLimitY[i] + (Math.sin(time * speed + i * PHASE_STEP) - 1) * amplitude

      rigidRefs.current[i]?.setNextKinematicTranslation({ x: 0, y, z: 0 })

      const vGroup = visualRefs.current[i]
      if (vGroup) vGroup.position.y = y
    }
  })

  return (
    <>
      {
        <pointLight
          position={[-0.47, 1.39, 0.3]}
          intensity={0.8}
          distance={1}
          decay={1}
          color="#09FF00"
          castShadow={false} // opcional, ya es false por defecto
        />
      }
      {
        <pointLight
          // ref={lightRef}
          position={[0, 1.5, -0.15]}
          intensity={7}
          distance={1.4}
          decay={0.5}
          color="#0256FF"
          castShadow={false} // opcional, ya es false por defecto
        />
      }
      {colliderWaveNodes.map((node, i) => (
        <RigidBody
          key={`collider-${i}`}
          ref={(el) => {
            rigidRefs.current[i] = el
          }}
          colliders="hull"
          type="kinematicPosition"
        >
          <primitive object={node} />
        </RigidBody>
      ))}
      <RigidBody type="fixed" colliders="hull">
        <primitive object={colliderNodes.fixed} />
      </RigidBody>
      {WAVE_NAMES.map((name, i) => (
        <group key={`visual-${name}`} ref={(el) => (visualRefs.current[i] = el)}>
          <primitive object={preparedVisual[name]} />
        </group>
      ))}
      <primitive object={preparedVisual.w6} />
    </>
  )
}
