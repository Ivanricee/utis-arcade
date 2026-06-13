import { useState } from 'react'
import { RingSpawner } from './RingSpawner'
import { RingStandin } from './RingStandin'
import type { RapierRigidBody } from '@react-three/rapier'

export default function Rings() {
  const [ringPositions, setRingPositions] = useState<[number, number, number][]>([])
  const [rigidBodyRefs, setRigidBodyRefs] = useState<RapierRigidBody[]>([])
  return (
    <>
      <RingSpawner
        onRefsReady={setRigidBodyRefs}
        ringsPerStack={3}
        stackSpacing={0.12}
        spawnDelay={500}
        onPositionsReady={setRingPositions}
      />
      <RingStandin rigidBodyRefs={rigidBodyRefs} positions={ringPositions} />
    </>
  )
}
