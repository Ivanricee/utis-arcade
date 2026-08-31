import { MeshTransmissionMaterial, useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import * as THREE from 'three'

const isMeshNode = (node: THREE.Object3D): node is THREE.Mesh => node instanceof THREE.Mesh

const hasTextureMaterial = (
  mat: THREE.Material
): mat is THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial =>
  'normalMap' in mat && 'normalScale' in mat && 'roughnessMap' in mat

export default function Dome() {
  const { nodes, materials } = useGLTF('/modelos/cupula.glb')

  useEffect(() => {
    Object.values(materials).forEach((mat) => {
      if (hasTextureMaterial(mat) && mat.normalMap) {
        mat.normalScale.set(30, 30)
      }
    })
  }, [materials])

  return (
    <group>
      {Object.entries(nodes).map(([name, node]) => {
        if (!isMeshNode(node)) return null

        const meshMaterial = node.material
        if (Array.isArray(meshMaterial)) return null

        const textureMaterial = hasTextureMaterial(meshMaterial) ? meshMaterial : null

        if (name === 'cupula_up') {
          return (
            <mesh
              key={name}
              geometry={node.geometry}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
            >
              <MeshTransmissionMaterial
                normalMap={textureMaterial?.normalMap ?? null}
                roughnessMap={textureMaterial?.roughnessMap ?? null}
                transmission={1}
                roughness={0.5}
                thickness={0.98}
                ior={1.2}
                chromaticAberration={0.5}
                anisotropy={2.2}
                distortion={0.8}
                distortionScale={0.5}
                temporalDistortion={0.3}
                clearcoat={0.2}
                attenuationColor="#ffffff"
                attenuationDistance={1}
                color="#f9fff4"
                samples={10}
                resolution={2048}
              />
            </mesh>
          )
        }

        return (
          <mesh
            key={name}
            geometry={node.geometry}
            material={materials[meshMaterial.name] ?? meshMaterial}
            material-side={THREE.FrontSide}
            renderOrder={-100}
            castShadow={false}
            position={node.position}
            rotation={node.rotation}
            scale={node.scale}
          />
        )
      })}
    </group>
  )
}
