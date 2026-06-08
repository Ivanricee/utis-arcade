import { ConeCollider, CuboidCollider, RigidBody } from '@react-three/rapier'
import { ARROW_DATA } from '../../store/model-data'

interface ArrowColliderProps {
  position: [number, number, number]
}

function ArrowCollider({ position }: ArrowColliderProps) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      {Object.entries(ARROW_DATA).map(([name, c]) => {
        if (name === 'punta_1' || name === 'punta_2' || name === 'tail_1' || name === 'tail_2') {
          return (
            <ConeCollider
              key={name}
              args={[c.scale[0], c.scale[1]]}
              position={[c.position[0], c.position[1], c.position[2]]}
              rotation={[c.rotation[0], c.rotation[1], c.rotation[2]]}
            />
          )
        }
        return (
          <CuboidCollider
            key={name}
            args={[c.scale[0], c.scale[1], c.scale[2]]}
            position={[c.position[0], c.position[1], c.position[2]]}
            rotation={[c.rotation[0], c.rotation[1], c.rotation[2]]}
          />
        )
      })}
    </RigidBody>
  )
}

export default function CompundArrowCollider() {
  return (
    <>
      <ArrowCollider position={[0, -0.115, 0.325]} />
      <ArrowCollider position={[0, 0, 0]} />
      <ArrowCollider position={[0, -0.115, -0.313]} />
    </>
  )
}
