import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { FLOATING_DATA } from '../../store/model-data'
import usePlasticMeshes from '../../hooks/usePlasticMeshes'
import { Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'
import { OctoField } from './Octo/OctoField'

export function CompoundFloatingCollider() {
  const { geometries, material } = usePlasticMeshes()

  const { balloon, zepp1, zepp2 } = FLOATING_DATA
  return (
    <>
      <RigidBody type="kinematicPosition" colliders={false}>
        <CuboidCollider
          args={[zepp1.scale[0], zepp1.scale[1], zepp1.scale[2]]}
          position={[zepp1.position[0], zepp1.position[1], zepp1.position[2]]}
          rotation={[zepp1.rotation[0], zepp1.rotation[1], zepp1.rotation[2]]}
        />
        <CuboidCollider
          args={[zepp2.scale[0], zepp2.scale[1], zepp2.scale[2]]}
          position={[zepp2.position[0], zepp2.position[1], zepp2.position[2]]}
          rotation={[zepp2.rotation[0], zepp2.rotation[1], zepp2.rotation[2]]}
        />
        <mesh geometry={geometries.zeppe} material={material} />
      </RigidBody>

      <OctoField />
      <RigidBody type="kinematicPosition" colliders={false}>
        <CuboidCollider
          args={[balloon.scale[0], balloon.scale[1], balloon.scale[2]]}
          position={[balloon.position[0], balloon.position[1], balloon.position[2]]}
          rotation={[balloon.rotation[0], balloon.rotation[1], balloon.rotation[2]]}
        />
        <BalloonInstancedCollider geometries={geometries} material={material} />
      </RigidBody>
    </>
  )
}
interface PlasticMeshType {
  geometries: Record<string, THREE.BufferGeometry>
  material: THREE.MeshStandardMaterial
}
const BALLOON_POSITIONS = [
  [0, 0.25, 0],
  [0, 0.2, -1.5],
] as [number, number, number][]

const BalloonInstancedCollider = ({ geometries, material }: PlasticMeshType) => {
  return (
    <Instances geometry={geometries.balloon} material={material}>
      {BALLOON_POSITIONS.map((pos) => (
        <Instance position={pos} key={pos.join(',')} />
      ))}
    </Instances>
  )
}
