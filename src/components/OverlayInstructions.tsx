import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export function OverlayInstructions() {
  const [showMenu, setShowMenu] = useState(true)
  const [showMenuButton, setShowMenuButton] = useState(false)
  const [draftName, setDraftName] = useState(useGameStore.getState().playerName)
  const setPlayerName = useGameStore((state) => state.setPlayerName)

  const handleClose = () => {
    setShowMenu(false)
  }

  const handleOpen = () => {
    setShowMenuButton(false)
    setShowMenu(true)
  }

  const handleConfirm = () => {
    setPlayerName(draftName)
    handleClose()
  }
  return (
    <>
      <section
        onTransitionEnd={(event) => {
          const isClosing = !showMenu
          const isOpacityTransition = event.propertyName === 'opacity'

          if (isClosing && isOpacityTransition) {
            setShowMenuButton(true)
          }
        }}
        className={`absolute inset-0 z-10 grid place-items-center bg-blue-300/10 px-4 backdrop-blur-xs transition-opacity duration-300 sm:px-0 ${
          showMenu ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          className={`relative flex w-full flex-col items-center gap-2 space-y-2 rounded-3xl border border-cyan-200/60 bg-radial-[at_50%_90%] from-[#05224d]/90 from-30% to-[#175680]/40 p-8 shadow-2xl shadow-cyan-300/30 transition-all duration-300 ease-in-out sm:mx-0 sm:w-[30rem] ${
            showMenu
              ? 'translate-x-0 translate-y-0 scale-100'
              : 'translate-x-[calc(50vw-2rem)] -translate-y-[calc(50vh-2rem)] scale-[0.1]'
          }`}
        >
          {
            //<!--close button -->
          }
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute -top-2 -right-2 grid size-8 place-items-center rounded-full border border-cyan-200/60 bg-blue-700/40 pb-[8px] text-2xl leading-none text-cyan-100 transition-all transition-colors hover:bg-cyan-200/20 hover:text-white hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-100 sm:top-4 sm:right-4"
          >
            ×
          </button>
          <h1 className="mt-0! !text-3xl !font-bold !text-cyan-100 sm:text-4xl!">UTIS RING TOSS</h1>
          <div className="h-0.5 w-full rounded-sm bg-cyan-100/10"></div>
          <label className="text-sm text-blue-200/90">Player Name</label>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-xl border border-cyan-100/70 p-2 text-center text-orange-300"
            maxLength={12}
            autoFocus
          />
          <button
            type="button"
            onClick={handleConfirm}
            className={
              `w-3/5 rounded-full border-2 border-cyan-100/50 bg-[#2dd5ff]/90 px-6 py-2` +
              ` text-center text-xl font-bold tracking-wide text-[#05224d] shadow-lg` +
              ` shadow-cyan-700/80 transition-all duration-200 hover:-translate-y-0.5` +
              ` hover:bg-[#53dafc] hover:shadow-xl hover:shadow-cyan-300/35 focus-visible:outline-2` +
              ` focus-visible:outline-offset-4 focus-visible:outline-cyan-100 active:translate-y-0 active:scale-[0.98] active:shadow-md`
            }
          >
            ENTER
          </button>
        </div>
      </section>
      {showMenuButton && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open menu"
          className="absolute top-2 right-2 z-20 grid size-11 place-items-center rounded-xl border border-cyan-200/70 bg-[#05224d]/90 text-2xl text-cyan-100 shadow-lg shadow-cyan-400/30 transition-all duration-200 hover:scale-105 hover:border-cyan-100 hover:bg-[#175680] hover:text-white hover:shadow-cyan-300/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-100 active:scale-95 sm:top-4 sm:right-4"
        >
          <span aria-hidden="true">☰</span>
        </button>
      )}
    </>
  )
}
