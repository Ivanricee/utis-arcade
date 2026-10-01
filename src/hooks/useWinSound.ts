import { useEffect, useRef } from 'react'
import { playWin } from '../audio/audioManager'

export function useWinSound(hasWon: boolean) {
  const wasWonRef = useRef(false)

  useEffect(() => {
    if (hasWon && !wasWonRef.current) playWin()
    wasWonRef.current = hasWon
  }, [hasWon])
}
