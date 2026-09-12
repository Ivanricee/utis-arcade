import { MeshTransmissionMaterial, useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { getTierSettings } from '../utils/optimizationInitilizer'

const isMeshNode = (node: THREE.Object3D): node is THREE.Mesh => node instanceof THREE.Mesh

type DomeMaterial = THREE.MeshPhysicalMaterial & {
  specularIntensityMap?: THREE.Texture | null
}

const hasTextureMaterial = (mat: THREE.Material): mat is DomeMaterial =>
  'normalMap' in mat && 'normalScale' in mat && 'roughnessMap' in mat && 'specularIntensity' in mat

export default function Dome() {
  const tier = useGameStore((state) => state.tier)
  const dpr = useGameStore((state) => state.dpr)
  const settings = useMemo(() => getTierSettings(dpr)[tier], [tier, dpr])
  const { resolution, samples, useTransmission } = settings
  //console.log({ tier, resolution, samples })
  const { nodes, materials } = useGLTF('/modelos/cupula.glb')
  const cupulaDown = isMeshNode(nodes.cupula_down) ? nodes.cupula_down : null
  const cupulaUp = isMeshNode(nodes.cupula_up) ? nodes.cupula_up : null
  const material = materials.cupula1 as DomeMaterial

  if (!cupulaDown || !cupulaUp) {
    return null
  }

  useMemo(() => {
    if (hasTextureMaterial(material) && material.normalMap) {
      material.normalScale.set(2.5, 2.5)
      material.opacity = 0.05
      material.color = new THREE.Color('#402d58')
      material.roughness = 0.7
      material.specularIntensity = 0.4
    }
  }, [material])

  return (
    <group>
      <mesh
        geometry={cupulaDown.geometry}
        material={material}
        position={cupulaDown.position}
        rotation={cupulaDown.rotation}
        scale={cupulaDown.scale}
        renderOrder={-100}
        receiveShadow={false}
        castShadow={false}
      />
      <mesh
        geometry={cupulaUp.geometry}
        position={cupulaUp.position}
        rotation={cupulaUp.rotation}
        scale={cupulaUp.scale}
        castShadow={false}
      >
        {useTransmission ? (
          <MeshTransmissionMaterial
            normalMap={material?.normalMap ?? null}
            roughnessMap={material?.roughnessMap ?? null}
            specularIntensityMap={material?.specularIntensityMap ?? null}
            specularIntensity={2}
            transmission={1}
            roughness={0.5}
            thickness={0.78}
            ior={1.35}
            chromaticAberration={1}
            anisotropy={4}
            distortion={0.5}
            distortionScale={0.9}
            temporalDistortion={0.4}
            clearcoat={0.2}
            attenuationColor="#0e30f3"
            attenuationDistance={5}
            color="#f9fff4"
            samples={samples}
            resolution={resolution}
          />
        ) : (
          <meshPhysicalMaterial
            normalMap={material?.normalMap ?? null}
            roughnessMap={material?.roughnessMap ?? null}
            specularIntensityMap={material?.specularIntensityMap ?? null}
            transparent
            opacity={0.2}
            roughness={0.35}
            ior={1.8}
            color="#1347b6"
            envMapIntensity={1.2}
          />
        )}
      </mesh>
    </group>
  )
}
