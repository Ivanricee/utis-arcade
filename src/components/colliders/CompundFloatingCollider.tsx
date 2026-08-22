import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { FLOATING_DATA } from '../../store/model-data'
import usePlasticMeshes from '../../hooks/usePlasticMeshes'
import { OctoField } from './Octo/OctoField'
import { useWaterForce } from '../../hooks/useWaterForce'
import { useRingPoleAssist } from '../../hooks/useRingPoleAssist'
import Rings from './Rings/Rings'
import { useFloatingAnimation } from '../../hooks/useFloatingAnimation'
import { BalloonField } from './Balloon/BalloonField'

export function CompoundFloatingCollider() {
  const { geometries, material } = usePlasticMeshes()
  useWaterForce()
  useRingPoleAssist()
  useFloatingAnimation()
  const { zepp1, zepp2 } = FLOATING_DATA
  return (
    <>
      <Rings />
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
      <BalloonField />
    </>
  )
}
