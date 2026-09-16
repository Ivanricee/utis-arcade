import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export function OverlayInstructions() {
  const [draftName, setDraftName] = useState('')
  const setPlayerName = useGameStore((state) => state.setPlayerName)

  const handleConfirm = () => {
    setPlayerName(draftName)
  }
  return (
    <div>
      <input
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        placeholder="Enter your name"
        className="w-full rounded-md border-2 border-black p-2"
        maxLength={12}
      />
      <button onClick={handleConfirm} className="rounded-md border-2 border-black p-2">
        Confirm
      </button>
    </div>
  )
}
