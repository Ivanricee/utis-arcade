import { ConeCollider, CuboidCollider, interactionGroups, RigidBody } from '@react-three/rapier'
import { ARROW_DATA } from '../../store/model-data'

interface ArrowColliderProps {
  position: [number, number, number]
  postIndex: number
}

function ArrowCollider({ position, postIndex }: ArrowColliderProps) {
  return (
    <RigidBody type="fixed" colliders={false} position={position} userData={{ postIndex }}>
      {Object.entries(ARROW_DATA).map(([name, c]) => {
        if (name === 'tail_1') {
          return (
            <ConeCollider
              key={name}
              args={[c.scale[0], c.scale[1]]}
              position={[c.position[0], c.position[1], c.position[2]]}
              rotation={[c.rotation[0], c.rotation[1], c.rotation[2]]}
            />
          )
        }
        if (name === 'stick') {
          return (
            <CuboidCollider
              key={name}
              args={[c.scale[0], c.scale[1], c.scale[2]]}
              position={[c.position[0], c.position[1], c.position[2]]}
              rotation={[c.rotation[0], c.rotation[1], c.rotation[2]]}
              collisionGroups={interactionGroups(0, [1])}
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
      <ArrowCollider position={[0, -0.115, 0.325]} postIndex={0} />
      <ArrowCollider position={[0, 0, 0]} postIndex={1} />
      <ArrowCollider position={[0, -0.115, -0.313]} postIndex={2} />
    </>
  )
}
