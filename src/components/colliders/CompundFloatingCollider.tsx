import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { FLOATING_DATA } from '../../store/model-data'
import usePlasticMeshes from '../../hooks/usePlasticMeshes'
import { Instance, Instances } from '@react-three/drei'
const positions = [
  [0, 0.8, 0.3],
  [0, 0.7, 0.1],
  [0, 0.9, 0.4],
] as [number, number, number][]
export function CompoundFloatingCollider() {
  const { geometries, material } = usePlasticMeshes()
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
            <mesh geometry={geometries.balloon} material={material} position={[0, 0.25, 0]} />
            <mesh geometry={geometries.balloon} material={material} position={[0, 0.2, -1.5]} />
            <Instances geometry={geometries.octo} material={material} limit={20}>
              {positions.map((pos) => (
                <Instance scale={[0.45, 0.45, 0.45]} position={pos} key={pos.join(',')} />
              ))}

              {/* etc */}
            </Instances>
            <mesh geometry={geometries.zeppe} material={material} />
          </RigidBody>
        )
      })}
    </>
  )
}
