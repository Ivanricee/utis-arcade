import { useEffect } from 'react'
import { startJet, stopJet } from '../audio/audioManager'

export function useWaterJetSound(waterActive: boolean) {
  useEffect(() => {
    if (!waterActive) return
    startJet()
    return stopJet
  }, [waterActive])
}
