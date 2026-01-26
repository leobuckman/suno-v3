import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Musician from './Musician'
import KeysSection from './Keys/KeysSection'
import Builder from './Builder'

// Sequence: Loop1 -> Loop1 -> Loop2 -> repeat
const bassSequence = ['/Loops/BassLoop1.mp4', '/Loops/BassLoop1.mp4', '/Loops/BassLoop2.mp4']
const chestSequence = ['/Loops/BoilingPot.mp4']
const flipSequence = ['/Loops/FlipLoop1.mp4', '/Loops/FlipLoop1.mp4', '/Loops/FlipLoop2.mp4']

// ========== VIDEO LAYOUT CONFIG ==========
// Each video has FIXED position - changing one won't affect others
// Use top/left to position, scale to resize (1 = original size, 0.5 = half, 2 = double)
const videoConfig = {
  container: {
    height: '600px', // total height of the video section
  },
  bass: {
    scale: 0.3,
    top: '-30px',
    left: '230px',
    crop: 'inset(15% 0 0 0)', // Crop 30% from left and right sides
  },
  chest: {
    scale: 0.3,
    top: '50px',
    left: '645px',
    crop: 'inset(35% 15% 0 10%)', // Crop 30% from left and right sides
  },
  flip: {
    scale: 0.32,
    top: '-30px',
    left: '910px',
    crop: 'inset(15% 0 0 0)',
  },
}
// ==========================================

export default function App() {
  // Double-buffering: two video elements for each to eliminate loading gaps
  const bassVideoRef1 = useRef(null)
  const bassVideoRef2 = useRef(null)
  const chestVideoRef1 = useRef(null)
  const chestVideoRef2 = useRef(null)
  const flipVideoRef1 = useRef(null)
  const flipVideoRef2 = useRef(null)
  const startedRef = useRef(false)
  
  // Track which video element is active (0 or 1) and which sequence index
  const [bassState, setBassState] = useState({ activePlayer: 0, index: 0 })
  const [chestState, setChestState] = useState({ activePlayer: 0, index: 0 })
  const [flipState, setFlipState] = useState({ activePlayer: 0, index: 0 })
  
  // Track which view is open (null, 'musician', 'keys', 'builder')
  const [activeView, setActiveView] = useState(null)
  
  // Track hover state for videos
  const [bassHover, setBassHover] = useState(false)
  const [chestHover, setChestHover] = useState(false)
  const [flipHover, setFlipHover] = useState(false)

  const desiredPlaybackRate = 0.9

  // Preload next video in sequence for bass
  useEffect(() => {
    const nextIndex = (bassState.index + 1) % bassSequence.length
    const nextPlayer = bassState.activePlayer === 0 ? bassVideoRef2.current : bassVideoRef1.current
    if (nextPlayer && startedRef.current) {
      nextPlayer.src = bassSequence[nextIndex]
      nextPlayer.load()
      nextPlayer.playbackRate = desiredPlaybackRate
    }
  }, [bassState])

  // Preload next video in sequence for chest
  useEffect(() => {
    const nextIndex = (chestState.index + 1) % chestSequence.length
    const nextPlayer = chestState.activePlayer === 0 ? chestVideoRef2.current : chestVideoRef1.current
    if (nextPlayer && startedRef.current) {
      nextPlayer.src = chestSequence[nextIndex]
      nextPlayer.load()
      nextPlayer.playbackRate = desiredPlaybackRate
    }
  }, [chestState])

  // Preload next video in sequence for flip
  useEffect(() => {
    const nextIndex = (flipState.index + 1) % flipSequence.length
    const nextPlayer = flipState.activePlayer === 0 ? flipVideoRef2.current : flipVideoRef1.current
    if (nextPlayer && startedRef.current) {
      nextPlayer.src = flipSequence[nextIndex]
      nextPlayer.load()
      nextPlayer.playbackRate = desiredPlaybackRate
    }
  }, [flipState])

  // Handle video ended events
  useEffect(() => {
    const bass1 = bassVideoRef1.current
    const bass2 = bassVideoRef2.current
    const chest1 = chestVideoRef1.current
    const chest2 = chestVideoRef2.current
    const flip1 = flipVideoRef1.current
    const flip2 = flipVideoRef2.current
    if (!bass1 || !bass2 || !chest1 || !chest2 || !flip1 || !flip2) return

    const handleBassEnded = (fromPlayer) => () => {
      setBassState((prev) => {
        const nextIndex = (prev.index + 1) % bassSequence.length
        const nextPlayer = fromPlayer === 0 ? bass2 : bass1
        nextPlayer.currentTime = 0
        nextPlayer.play().catch(() => {})
        return { activePlayer: fromPlayer === 0 ? 1 : 0, index: nextIndex }
      })
    }

    const handleChestEnded = (fromPlayer) => () => {
      setChestState((prev) => {
        const nextIndex = (prev.index + 1) % chestSequence.length
        const nextPlayer = fromPlayer === 0 ? chest2 : chest1
        nextPlayer.currentTime = 0
        nextPlayer.play().catch(() => {})
        return { activePlayer: fromPlayer === 0 ? 1 : 0, index: nextIndex }
      })
    }

    const handleFlipEnded = (fromPlayer) => () => {
      setFlipState((prev) => {
        const nextIndex = (prev.index + 1) % flipSequence.length
        const nextPlayer = fromPlayer === 0 ? flip2 : flip1
        nextPlayer.currentTime = 0
        nextPlayer.play().catch(() => {})
        return { activePlayer: fromPlayer === 0 ? 1 : 0, index: nextIndex }
      })
    }

    const bass1Handler = handleBassEnded(0)
    const bass2Handler = handleBassEnded(1)
    const chest1Handler = handleChestEnded(0)
    const chest2Handler = handleChestEnded(1)
    const flip1Handler = handleFlipEnded(0)
    const flip2Handler = handleFlipEnded(1)

    bass1.addEventListener('ended', bass1Handler)
    bass2.addEventListener('ended', bass2Handler)
    chest1.addEventListener('ended', chest1Handler)
    chest2.addEventListener('ended', chest2Handler)
    flip1.addEventListener('ended', flip1Handler)
    flip2.addEventListener('ended', flip2Handler)

    return () => {
      bass1.removeEventListener('ended', bass1Handler)
      bass2.removeEventListener('ended', bass2Handler)
      chest1.removeEventListener('ended', chest1Handler)
      chest2.removeEventListener('ended', chest2Handler)
      flip1.removeEventListener('ended', flip1Handler)
      flip2.removeEventListener('ended', flip2Handler)
    }
  }, [])

  // Initial synchronized start
  useEffect(() => {
    const bass1 = bassVideoRef1.current
    const bass2 = bassVideoRef2.current
    const chest1 = chestVideoRef1.current
    const chest2 = chestVideoRef2.current
    const flip1 = flipVideoRef1.current
    const flip2 = flipVideoRef2.current
    if (!bass1 || !bass2 || !chest1 || !chest2 || !flip1 || !flip2) return

    // Set up initial sources
    bass1.src = bassSequence[0]
    bass2.src = bassSequence[1] // Preload next
    chest1.src = chestSequence[0]
    chest2.src = chestSequence[0] // Preload same (only one in sequence)
    flip1.src = flipSequence[0]
    flip2.src = flipSequence[1] // Preload next

    ;[bass1, bass2, chest1, chest2, flip1, flip2].forEach(v => {
      v.playbackRate = desiredPlaybackRate
    })

    const tryStartTogether = () => {
      if (startedRef.current) return
      // Check if primary videos are ready
      if (bass1.readyState >= 2 && chest1.readyState >= 2 && flip1.readyState >= 2) {
        startedRef.current = true
        bass1.currentTime = 0
        chest1.currentTime = 0
        flip1.currentTime = 0
        ;[bass1.play(), chest1.play(), flip1.play()].forEach((p) => p?.catch(() => {}))
      }
    }

    bass1.addEventListener('canplay', tryStartTogether)
    chest1.addEventListener('canplay', tryStartTogether)
    flip1.addEventListener('canplay', tryStartTogether)
    tryStartTogether()

    return () => {
      bass1.removeEventListener('canplay', tryStartTogether)
      chest1.removeEventListener('canplay', tryStartTogether)
      flip1.removeEventListener('canplay', tryStartTogether)
    }
  }, [])

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col items-center font-body">
      {/* Header */}
      <div className="text-center pt-12 pb-1">
        <h1 className="text-5xl text-gray-900 mb-6 font-up font-extrabold tracking-wide">
          Hey, I'm <span className="text-accent">Leo</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        I'm interested in joining Suno as a Product Designer because it sits at the intersection of software and music. I recently graduated from Northwestern with a dual degree in <strong>Computer Science</strong> and <strong>Music Performance</strong>.
        </p>
      </div>

      {/* Video container with relative positioning */}
      <div className="relative w-full mt-6" style={{ height: videoConfig.container.height }}>
        {/* LeoBass video - double buffered */}
        <video
          ref={bassVideoRef1}
          className="absolute origin-top-left transition-transform duration-200"
          style={{ 
            transform: `scale(${videoConfig.bass.scale}) translateY(${bassHover ? '-25px' : '0'})`,
            top: videoConfig.bass.top, 
            left: videoConfig.bass.left,
            clipPath: videoConfig.bass.crop,
            visibility: bassState.activePlayer === 0 ? 'visible' : 'hidden'
          }}
          muted
          playsInline
        />
        <video
          ref={bassVideoRef2}
          className="absolute origin-top-left transition-transform duration-200"
          style={{ 
            transform: `scale(${videoConfig.bass.scale}) translateY(${bassHover ? '-25px' : '0'})`,
            top: videoConfig.bass.top, 
            left: videoConfig.bass.left,
            clipPath: videoConfig.bass.crop,
            visibility: bassState.activePlayer === 1 ? 'visible' : 'hidden'
          }}
          muted
          playsInline
        />
        {/* Clickable overlay for Bass */}
        <div
          className="absolute cursor-pointer"
          style={{
            top: videoConfig.bass.top,
            left: videoConfig.bass.left,
            width: '320px',
            height: '500px',
          }}
          onClick={() => setActiveView('musician')}
          onMouseEnter={() => setBassHover(true)}
          onMouseLeave={() => setBassHover(false)}
        />

        {/* BoilingPot video - double buffered */}
        <video
          ref={chestVideoRef1}
          className="absolute origin-top-left transition-transform duration-200"
          style={{ 
            transform: `scale(${videoConfig.chest.scale}) translateY(${chestHover ? '-25px' : '0'})`,
            top: videoConfig.chest.top, 
            left: videoConfig.chest.left,
            clipPath: videoConfig.chest.crop,
            visibility: chestState.activePlayer === 0 ? 'visible' : 'hidden'
          }}
          muted
          playsInline
        />
        <video
          ref={chestVideoRef2}
          className="absolute origin-top-left transition-transform duration-200"
          style={{ 
            transform: `scale(${videoConfig.chest.scale}) translateY(${chestHover ? '-25px' : '0'})`,
            top: videoConfig.chest.top, 
            left: videoConfig.chest.left,
            clipPath: videoConfig.chest.crop,
            visibility: chestState.activePlayer === 1 ? 'visible' : 'hidden'
          }}
          muted
          playsInline
        />
        {/* Clickable overlay for Chest */}
        <div
          className="absolute cursor-pointer"
          style={{
            top: videoConfig.chest.top,
            left: videoConfig.chest.left,
            width: '200px',
            height: '500px',
          }}
          onClick={() => setActiveView('keys')}
          onMouseEnter={() => setChestHover(true)}
          onMouseLeave={() => setChestHover(false)}
        />

        {/* LeoBackflip video - double buffered */}
        <video
          ref={flipVideoRef1}
          className="absolute origin-top-left transition-transform duration-200"
          style={{ 
            transform: `scale(${videoConfig.flip.scale}) translateY(${flipHover ? '-25px' : '0'})`,
            top: videoConfig.flip.top, 
            left: videoConfig.flip.left,
            clipPath: videoConfig.flip.crop,
            visibility: flipState.activePlayer === 0 ? 'visible' : 'hidden'
          }}
          playsInline
        />
        <video
          ref={flipVideoRef2}
          className="absolute origin-top-left transition-transform duration-200"
          style={{ 
            transform: `scale(${videoConfig.flip.scale}) translateY(${flipHover ? '-25px' : '0'})`,
            top: videoConfig.flip.top, 
            left: videoConfig.flip.left,
            clipPath: videoConfig.flip.crop,
            visibility: flipState.activePlayer === 1 ? 'visible' : 'hidden'
          }}
          playsInline
        />
        {/* Clickable overlay for Flip */}
        <div
          className="absolute cursor-pointer"
          style={{
            top: videoConfig.flip.top,
            left: videoConfig.flip.left,
            width: '320px',
            height: '500px',
          }}
          onClick={() => setActiveView('builder')}
          onMouseEnter={() => setFlipHover(true)}
          onMouseLeave={() => setFlipHover(false)}
        />
      </div>

      {/* Full Screen Panel */}
      <AnimatePresence>
        {activeView && (
          <motion.div
            className="fixed inset-0 z-50 bg-white flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header with back button */}
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100">
              <button 
                onClick={() => setActiveView(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back</span>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              {activeView === 'musician' && <Musician />}
              {activeView === 'keys' && <KeysSection />}
              {activeView === 'builder' && <Builder />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
