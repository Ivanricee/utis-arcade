import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
const WAVES = [
  { name: 'w1', colliderName: 'convex1', amplitude: 0.033, speed: 1.75 },
  { name: 'w2', colliderName: 'convex2', amplitude: 0.041, speed: 1.65 },
  { name: 'w3', colliderName: 'collider3', amplitude: 0.027, speed: 1.44 },
  { name: 'w4', colliderName: 'convex4', amplitude: 0.0357, speed: 1.38 },
  { name: 'w5', colliderName: 'conex5', amplitude: 0.0245, speed: 1.1 },
] as const
const STATIC_MESH_NAME = 'w6' as const // horse as fixed
const PHASE_STEP = (Math.PI * 2) / 5
const getWaveY = (baseLimitY: number, wave: (typeof WAVES)[number], i: number, time: number) => {
  const { amplitude, speed } = wave
  return baseLimitY + (Math.sin(time * speed + i * PHASE_STEP) - 1) * amplitude - 1.5
}
export default function CompoundHorse({ isPaused }: { isPaused: React.RefObject<boolean> }) {
  const { nodes: colliderNodes } = useGLTF('/modelos/ConvexMesh.glb')
  const { nodes: visualNodes } = useGLTF('/modelos/horses.glb')
  const lightMap = useTexture('/modelos/textures/horses/lightmap_horses.WebP')
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
  const ALL_MESH_NAMES = [...WAVES.map(({ name }) => name), STATIC_MESH_NAME] as const
  const preparedVisual = useMemo(() => {
    const result: Record<string, THREE.Mesh> = {}
    ALL_MESH_NAMES.forEach((name) => {
      const original = visualNodes[name] as THREE.Mesh
      const mesh = original.clone()
      const mat = (
        Array.isArray(original.material) ? original.material[0] : original.material
      ).clone() as THREE.MeshStandardMaterial
      mat.lightMap = lightMap
      mat.lightMapIntensity = 8
      mat.normalScale?.set(0.4, 0.4)
      mat.emissiveIntensity = 2
      mat.toneMapped = true
      mat.needsUpdate = true
      mesh.material = mat
      result[name] = mesh
    })
    return result
  }, [visualNodes, lightMap])

  const rigidRefs = useRef<(RapierRigidBody | null)[]>([])
  const visualRefs = useRef<(THREE.Group | null)[]>([])
  const localTime = useRef(0)

  const colliderWaveNodes = WAVES.map((w) => colliderNodes[w.colliderName])

  const baseLimitY = colliderWaveNodes.map((n) => n.position.y)
  useEffect(() => {
    ;[...colliderWaveNodes, colliderNodes.fixed].forEach((node) => {
      node?.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = Array.isArray(child.material) ? child.material : [child.material]

          material.forEach((m) => {
            m.visible = false
          })
        }
      })
    })
  }, [colliderNodes])
  useFrame((_, delta) => {
    if (isPaused.current) return
    const safeDelta = Math.min(delta, 1 / 30)
    localTime.current += safeDelta
    const time = localTime.current

    for (let i = 0; i < WAVES.length; i++) {
      const y = getWaveY(baseLimitY[i], WAVES[i], i, time)

      rigidRefs.current[i]?.setNextKinematicTranslation({ x: 0, y, z: 0 })

      const vGroup = visualRefs.current[i]
      if (vGroup) vGroup.position.y = y
    }
  })

  return (
    <group rotation={[0, -1.5, 0]} /* position={[0, 0, 0]}*/>
      {
        <pointLight
          position={[-0.47, -0.15, 0.3]}
          intensity={3}
          distance={1}
          decay={1}
          color="#09FF00"
          castShadow={false} // opcional, ya es false por defecto
        />
      }
      {
        <pointLight
          // ref={lightRef}
          position={[-0.2, 0.15, -0.15]}
          intensity={10}
          distance={1.4}
          decay={0.5}
          color="#004aeb"
          castShadow={false} // opcional, ya es false por defecto
        />
      }
      {
        <pointLight
          position={[-0.55, 0.6, -0.05]}
          intensity={10}
          distance={1.4}
          decay={1}
          color="#ff4b04"
          castShadow={false} // opcional, ya es false por defecto
        />
      }
      {WAVES.map((wave, i) => {
        const y = getWaveY(baseLimitY[i], wave, i, 0)
        return (
          <RigidBody
            key={`collider-${wave.name}`}
            ref={(el) => {
              rigidRefs.current[i] = el
            }}
            colliders="hull"
            rotation={[0, -0, 0]}
            position={[0, y, 0]}
            type="kinematicPosition"
          >
            <primitive object={colliderWaveNodes[i]} />
          </RigidBody>
        )
      })}
      <RigidBody type="fixed" colliders="hull" position={[0, -1.5, 0]}>
        <primitive object={colliderNodes.fixed} /*position={[0, -5.5, 0]} */ />
      </RigidBody>
      {WAVES.map((wave, i) => {
        const y = getWaveY(baseLimitY[i], wave, i, 0)
        return (
          <group
            key={`visual-${wave.name}`}
            ref={(el) => (visualRefs.current[i] = el)}
            rotation={[0, 0, 0]}
            position={[0, y, 0]}
          >
            <primitive object={preparedVisual[wave.name]} />
          </group>
        )
      })}
      <primitive object={preparedVisual.w6} position={[-0.334, -1.475, 0.025]} />
    </group>
  )
}
