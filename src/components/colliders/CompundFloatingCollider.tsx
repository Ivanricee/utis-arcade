import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { FLOATING_DATA } from '../../store/model-data'

export function CompoundFloatingCollider() {
  return (
    <>
      {(Object.keys(FLOATING_DATA) as Array<keyof typeof FLOATING_DATA>).map((key) => {
        const data = FLOATING_DATA[key]
        return (
          <RigidBody key={key} type="kinematicPosition" colliders={false}>
            <CuboidCollider
              args={[data.scale[0], data.scale[1], data.scale[2]]}
              position={[data.position[0], data.position[1], data.position[2]]}
              rotation={[data.rotation[0], data.rotation[1], data.rotation[2]]}
            />
          </RigidBody>
        )
      })}
    </>
  )
}
