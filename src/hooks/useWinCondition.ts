import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'

export function useWinCondition(holdMs = 300) {
  const [hasWon, setHasWon] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    let confirmed = false

    const checkCondition = (state: ReturnType<typeof useGameStore.getState>) => {
      const conditionMet = state.rings.length > 0 && state.score === state.rings.length

      if (conditionMet) {
        if (!confirmed && timeout === null) {
          timeout = setTimeout(() => {
            confirmed = true
            timeout = null
            setHasWon(true)
          }, holdMs)
        }
        return
      }

      if (timeout !== null) {
        clearTimeout(timeout)
        timeout = null
      }
      confirmed = false
      setHasWon(false)
    }

    checkCondition(useGameStore.getState())
    const unsubscribe = useGameStore.subscribe(checkCondition)

    return () => {
      unsubscribe()
      if (timeout !== null) clearTimeout(timeout)
    }
  }, [holdMs])

  return hasWon
}
