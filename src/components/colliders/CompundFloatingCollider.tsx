import { useWaterForce } from '../../hooks/useWaterForce'
import { useRingPoleAssist } from '../../hooks/useRingPoleAssist'

import { useFloatingAnimation } from '../../hooks/useFloatingAnimation'

import { ZeppField } from './zepp/ZeppField'
import Rings from './Rings/Rings'
import { OctoField } from './Octo/OctoField'
import { BalloonField } from './Balloon/BalloonField'

export function CompoundFloatingCollider() {
  useWaterForce()
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
