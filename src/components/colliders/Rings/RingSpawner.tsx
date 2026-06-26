import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CompoundTorusRingCollider } from './CompoundTorusRingCollider'
import type { RapierRigidBody } from '@react-three/rapier'
import { useWaterForce } from '../../../hooks/useWaterForce'

interface RingSpawnerProps {
  onPositionsReady?: (positions: [number, number, number][]) => void
  onRefsReady?: (refs: RapierRigidBody[]) => void
  /**total = stackCount * ringsPerStack */
  ringsPerStack?: number
  stackSpacing?: number
  spawnDelay?: number
  /** forzar reset completo */
  resetKey?: number
  sphereCount?: number
  overlapFactor?: number
  restitution?: number
  friction?: number
}

function extractMeshData(mesh: THREE.Mesh): {
  basePosition: THREE.Vector3
  diameter: number
} {
  mesh.geometry.computeBoundingBox()

  const basePosition = mesh.position.clone()
  let diameter = 1

  if (mesh.geometry.boundingBox) {
    const size = new THREE.Vector3()
    mesh.geometry.boundingBox.getSize(size)
    diameter = Math.max(size.x, size.y, size.z)
  }

  return { basePosition, diameter }
}

function generateStackPositions(
  basePosition: THREE.Vector3,
  diameter: number,
  ringsPerStack: number,
  stackSpacing: number
): [number, number, number][] {
  const positions: [number, number, number][] = []
  const stackOffsets = [-(diameter + stackSpacing), 0, diameter + stackSpacing]
  for (const zOffset of stackOffsets) {
    for (let i = 0; i < ringsPerStack; i++) {
      positions.push([
        basePosition.x - 0.305,
        basePosition.y - i * stackSpacing + 2.55,
        basePosition.z + zOffset - 0.000645,
      ])
    }
  }

  return positions
}

export function RingSpawner({
  onPositionsReady,
  onRefsReady,
  ringsPerStack = 4,
  stackSpacing = 0,
  spawnDelay = 200,
  resetKey = 0,
  sphereCount = 9,
  overlapFactor = 0.91,
  restitution = 0.2, //rebote
  friction = 0.8,
}: RingSpawnerProps) {
  const { nodes } = useGLTF('/modelos/RING.glb')
  const rigidBodyRefs = useRef<RapierRigidBody[]>([] as RapierRigidBody[])
  const mesh = nodes.ring as THREE.Mesh | undefined
  useWaterForce(rigidBodyRefs)

  //  base y diámetro from mesh
  const { basePosition, diameter } = useMemo(() => {
    if (!mesh?.geometry) return { basePosition: new THREE.Vector3(), diameter: 1 }
    return extractMeshData(mesh)
  }, [mesh])

  // stack position from mesh
  const allPositions = useMemo(
    () => generateStackPositions(basePosition, diameter, ringsPerStack, stackSpacing),

    [basePosition, diameter, ringsPerStack, stackSpacing]
  )
  // Visibility state of each ring — start all hidden
  const [visibleRings, setVisibleRings] = useState<boolean[]>(() =>
    new Array(allPositions.length).fill(false)
  )
  const handleRigidBodyReady = (rb: RapierRigidBody, index: number) => {
    rigidBodyRefs.current[index] = rb
    //notify
    const totalRings = ringsPerStack * 3
    if (rigidBodyRefs.current.filter(Boolean).length === totalRings) {
      onRefsReady?.(rigidBodyRefs.current)
    }
  }

  // Each time resetKey changes or component mounts,
  // reset visibility and start the spawn delay
  useEffect(() => {
    setVisibleRings(new Array(allPositions.length).fill(false))

    const timeouts: ReturnType<typeof setTimeout>[] = []

    allPositions.forEach((_, i) => {
      // Dentro de cada stack el delay es escalonado
      // Los 3 stacks spawnan en paralelo — el delay es por posición dentro del stack
      const positionInStack = i % ringsPerStack
      const delay = positionInStack * spawnDelay

      const t = setTimeout(() => {
        setVisibleRings((prev) => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, delay)

      timeouts.push(t)
    })

    return () => timeouts.forEach(clearTimeout)
  }, [resetKey, allPositions.length, ringsPerStack, spawnDelay])
  useEffect(() => {
    if (onPositionsReady) onPositionsReady(allPositions)
  }, [allPositions])

  return (
    <>
      {allPositions.map((position, i) =>
        visibleRings[i] ? (
          <CompoundTorusRingCollider
            ringIndex={i}
            key={`ring-${resetKey}-${i}`}
            position={position}
            sphereCount={sphereCount}
            overlapFactor={overlapFactor}
            restitution={restitution}
            friction={friction}
            onRigidBodyReady={(rb) => handleRigidBodyReady(rb, i)}
          />
        ) : null
      )}
      {/*POLE_CONFIGS.map((config) => (
        <group key={`debug-pole-${config.id}`}>
          {// 1. Cilindro Rosa: Muestra dónde está el palo visualmente
          }
          <mesh position={config.stickPosition} scale={config.stickScale}>
            {// Usamos cylinderGeometry básico, la escala lo ajustará a tu forma
            }
            <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
            <meshBasicMaterial color="hotpink" transparent opacity={0.4} wireframe />
          </mesh>


          {
          // 2. Esfera Amarilla: Muestra EXACTAMENTE dónde calculamos que está la cima (topY)
          }
          <mesh position={[config.stickPosition[0], config.topY, config.stickPosition[2]]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="yellow" wireframe />
          </mesh>

          {
          // Opcional: Círculo en el suelo mostrando el radio de atracción
          }
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={config.basePosition}>
            <ringGeometry args={[config.radius - 0.01, config.radius, 32]} />
            <meshBasicMaterial color="cyan" transparent opacity={0.3} side={2} />
          </mesh>
        </group>
      ))*/}
    </>
  )
}
