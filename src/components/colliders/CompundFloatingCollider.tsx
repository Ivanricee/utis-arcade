import { useWaterForce } from '../../hooks/useWaterForce'
import { useWaterJetSound } from '../../hooks/useWaterJetSound'
import { useRingPoleAssist } from '../../hooks/useRingPoleAssist'
import { useGameStore } from '../../store/gameStore'

import { useFloatingAnimation } from '../../hooks/useFloatingAnimation'

import { ZeppField } from './zepp/ZeppField'
import Rings from './Rings/Rings'
import { OctoField } from './Octo/OctoField'
import { BalloonField } from './Balloon/BalloonField'

export function CompoundFloatingCollider() {
  const waterActive = useGameStore((state) => state.waterActive)

  useWaterForce()
  useWaterJetSound(waterActive)
  useRingPoleAssist()
  useFloatingAnimation()

  return (
    <>
      <ZeppField />

      <Rings />
      <OctoField />
      <BalloonField />
    </>
  )
}
