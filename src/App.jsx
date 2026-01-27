import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Musician from './Musician'
import KeysSection from './Keys/KeysSection'
import ProgressionSection from './Progression/Progression'
import OpusSection from './Opus'
import Builder from './Builder'

// Sequence: Loop1 -> Loop1 -> Loop2 -> repeat
const bassSequence = ['/Loops/BassLoop1.mp4', '/Loops/BassLoop1.mp4', '/Loops/BassLoop2.mp4']
const chestSequence = ['/Loops/BoilingPot.mp4']
const flipSequence = ['/Loops/FlipLoop1.mp4', '/Loops/FlipLoop1.mp4', '/Loops/FlipLoop2.mp4']

// ========== VIDEO LAYOUT CONFIG ==========
// Center-based positioning: all videos positioned relative to container center (50%)
// Use translateX to offset from center, scale to resize
const videoConfig = {
  container: {
    height: '600px', // total height of the video section
    maxWidth: '1280px', // max width for centered layout (prevents uncentering on zoom)
  },
  bass: {
    scale: 0.3,
    top: '-10px',
    translateX: '-500px', // offset from center (negative = left of center)
    crop: 'inset(15% 0 0 0)', // Crop 30% from left and right sides
  },
  chest: {
    scale: 0.3,
    top: '37px',
    translateX: '-100px', // offset from center
    crop: 'inset(35% 17% 0 17%)', // Crop 30% from left and right sides
  },
  flip: {
    scale: 0.32,
    top: '20px',
    translateX: '200px', // offset from center (positive = right of center)
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

  // Track which section is shown in the keys view
  const [sectionIndex, setSectionIndex] = useState(0)
  const sections = [
    { name: 'Keys', component: KeysSection },
    { name: 'Progressions', component: ProgressionSection },
    { name: 'Scores', component: OpusSection }
  ]
  
  // Track hover state for videos
  const [bassHover, setBassHover] = useState(false)
  const [chestHover, setChestHover] = useState(false)
  const [flipHover, setFlipHover] = useState(false)

  const desiredPlaybackRate = 0.9
  const chestPlaybackRate = desiredPlaybackRate * 1.2 // 1.08x speed
  
  // Synchronization state for bass and flip loops
  const syncPendingRef = useRef({ bass: false, flip: false })
  const syncTimeoutRef = useRef(null)
  const bassStateRef = useRef(bassState)
  const flipStateRef = useRef(flipState)
  
  // Keep refs in sync with state
  useEffect(() => {
    bassStateRef.current = bassState
  }, [bassState])
  
  useEffect(() => {
    flipStateRef.current = flipState
  }, [flipState])

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
      nextPlayer.playbackRate = chestPlaybackRate
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

  // Periodic sync check to correct drift
  useEffect(() => {
    if (!startedRef.current) return
    
    const syncInterval = setInterval(() => {
      const bass1 = bassVideoRef1.current
      const bass2 = bassVideoRef2.current
      const flip1 = flipVideoRef1.current
      const flip2 = flipVideoRef2.current
      if (!bass1 || !bass2 || !flip1 || !flip2) return
      
      const currentBassState = bassStateRef.current
      const currentFlipState = flipStateRef.current
      
      const currentBass = currentBassState.activePlayer === 0 ? bass1 : bass2
      const currentFlip = currentFlipState.activePlayer === 0 ? flip1 : flip2
      
      // Only sync if both are playing and not paused
      if (currentBass.readyState >= 3 && currentFlip.readyState >= 3 && 
          !currentBass.paused && !currentFlip.paused) {
        const timeDiff = Math.abs(currentBass.currentTime - currentFlip.currentTime)
        
        // If drift exceeds 0.1 seconds, correct it
        if (timeDiff > 0.1) {
          // Use the bass video as the reference (or average them)
          const targetTime = currentBass.currentTime
          currentFlip.currentTime = targetTime
        }
      }
    }, 100) // Check every 100ms
    
    return () => clearInterval(syncInterval)
  }, [])

  // Handle video ended events with synchronization
  useEffect(() => {
    const bass1 = bassVideoRef1.current
    const bass2 = bassVideoRef2.current
    const chest1 = chestVideoRef1.current
    const chest2 = chestVideoRef2.current
    const flip1 = flipVideoRef1.current
    const flip2 = flipVideoRef2.current
    if (!bass1 || !bass2 || !chest1 || !chest2 || !flip1 || !flip2) return

    // Synchronized transition function for bass and flip loops
    const performSynchronizedTransition = () => {
      if (!bass1 || !bass2 || !flip1 || !flip2) return

      const currentBassState = bassStateRef.current
      const currentFlipState = flipStateRef.current
      
      // Calculate next indices
      const nextBassIndex = (currentBassState.index + 1) % bassSequence.length
      const nextFlipIndex = (currentFlipState.index + 1) % flipSequence.length
      
      // Get next players
      const nextBass = currentBassState.activePlayer === 0 ? bass2 : bass1
      const nextFlip = currentFlipState.activePlayer === 0 ? flip2 : flip1
      
      // Reset and start both together
      nextBass.currentTime = 0
      nextFlip.currentTime = 0
      
      // Use requestAnimationFrame to ensure they start at the same time
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          Promise.all([
            nextBass.play().catch(() => {}),
            nextFlip.play().catch(() => {})
          ]).then(() => {
            setBassState({ activePlayer: currentBassState.activePlayer === 0 ? 1 : 0, index: nextBassIndex })
            setFlipState({ activePlayer: currentFlipState.activePlayer === 0 ? 1 : 0, index: nextFlipIndex })
            syncPendingRef.current = { bass: false, flip: false }
          })
        })
      })
    }

    const handleBassEnded = (fromPlayer) => () => {
      syncPendingRef.current.bass = true
      
      // If flip is also pending, transition together
      if (syncPendingRef.current.flip) {
        performSynchronizedTransition()
      } else {
        // Wait a short time for flip to catch up, then force sync
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current)
        }
        syncTimeoutRef.current = setTimeout(() => {
          if (syncPendingRef.current.bass || syncPendingRef.current.flip) {
            performSynchronizedTransition()
          }
        }, 50) // Small timeout to allow flip to catch up
      }
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
      syncPendingRef.current.flip = true
      
      // If bass is also pending, transition together
      if (syncPendingRef.current.bass) {
        performSynchronizedTransition()
      } else {
        // Wait a short time for bass to catch up, then force sync
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current)
        }
        syncTimeoutRef.current = setTimeout(() => {
          if (syncPendingRef.current.bass || syncPendingRef.current.flip) {
            performSynchronizedTransition()
          }
        }, 50) // Small timeout to allow bass to catch up
      }
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
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  // Reset section index when opening keys view
  useEffect(() => {
    if (activeView === 'keys') {
      setSectionIndex(0)
    }
  }, [activeView])

  // Mute/unmute videos when a page is displayed
  useEffect(() => {
    const bass1 = bassVideoRef1.current
    const bass2 = bassVideoRef2.current
    const chest1 = chestVideoRef1.current
    const chest2 = chestVideoRef2.current
    const flip1 = flipVideoRef1.current
    const flip2 = flipVideoRef2.current
    if (!bass1 || !bass2 || !chest1 || !chest2 || !flip1 || !flip2) return

    // Mute all videos when a page is displayed, unmute when no page is displayed
    // Bass loops are always muted
    const shouldMute = activeView !== null
    bass1.muted = true
    bass2.muted = true
    ;[chest1, chest2, flip1, flip2].forEach(v => {
      v.muted = shouldMute
    })
  }, [activeView])

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

    ;[bass1, bass2, flip1, flip2].forEach(v => {
      v.playbackRate = desiredPlaybackRate
    })
    ;[chest1, chest2].forEach(v => {
      v.playbackRate = chestPlaybackRate
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
        <h1 className="text-5xl text-gray-900 mb-6 font-display font-extrabold tracking-wide">
          Hey, I'm <span className="text-accent">Leo</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        I'm interested in joining Suno as a Product Designer because it sits at the intersection of software and music. I recently graduated from Northwestern with a dual degree in <strong>Computer Science</strong> and <strong>Music Performance</strong>.
        </p>
      </div>

      {/* Video container with relative positioning */}
      <div className="relative w-full mx-auto mt-6" style={{ height: videoConfig.container.height, maxWidth: videoConfig.container.maxWidth }}>
        {/* LeoBass video - double buffered */}
        <video
          ref={bassVideoRef1}
          className="absolute origin-top-left transition-transform duration-200"
          style={{
            transform: `translateX(${videoConfig.bass.translateX}) scale(${videoConfig.bass.scale}) translateY(${bassHover ? '-25px' : '0'})`,
            top: videoConfig.bass.top,
            left: '50%',
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
            transform: `translateX(${videoConfig.bass.translateX}) scale(${videoConfig.bass.scale}) translateY(${bassHover ? '-25px' : '0'})`,
            top: videoConfig.bass.top,
            left: '50%',
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
            left: '50%',
            transform: `translateX(${videoConfig.bass.translateX})`,
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
            transform: `translateX(${videoConfig.chest.translateX}) scale(${videoConfig.chest.scale}) translateY(${chestHover ? '-25px' : '0'})`,
            top: videoConfig.chest.top,
            left: '50%',
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
            transform: `translateX(${videoConfig.chest.translateX}) scale(${videoConfig.chest.scale}) translateY(${chestHover ? '-25px' : '0'})`,
            top: videoConfig.chest.top,
            left: '50%',
            clipPath: videoConfig.chest.crop,
            visibility: chestState.activePlayer === 1 ? 'visible' : 'hidden'
          }}
          muted
          playsInline
        />
        {/* Text above chest video */}
        <div
          className="absolute text-center text-sm text-gray-400 font-medium pointer-events-none"
          style={{
            top: '90px',
            left: '50%',
            transform: `translateX(calc(${videoConfig.chest.translateX}))`,
            width: '220px',
          }}
        >
          Click to check out some ideas I've got brewing for Suno.
        </div>

        {/* Clickable overlay for Chest */}
        <div
          className="absolute cursor-pointer"
          style={{
            top: videoConfig.chest.top,
            left: '50%',
            transform: `translateX(${videoConfig.chest.translateX})`,
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
            transform: `translateX(${videoConfig.flip.translateX}) scale(${videoConfig.flip.scale}) translateY(${flipHover ? '-25px' : '0'})`,
            top: videoConfig.flip.top,
            left: '50%',
            clipPath: videoConfig.flip.crop,
            visibility: flipState.activePlayer === 0 ? 'visible' : 'hidden'
          }}
          playsInline
        />
        <video
          ref={flipVideoRef2}
          className="absolute origin-top-left transition-transform duration-200"
          style={{
            transform: `translateX(${videoConfig.flip.translateX}) scale(${videoConfig.flip.scale}) translateY(${flipHover ? '-25px' : '0'})`,
            top: videoConfig.flip.top,
            left: '50%',
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
            left: '50%',
            transform: `translateX(${videoConfig.flip.translateX})`,
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
            <div className="sticky top-0 bg-white z-10 px-6 py-4">
              <button
                onClick={() => setActiveView(null)}
                className="text-gray-600 hover:text-gray-900 transition-all hover:-translate-y-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-start px-6 pt-16 pb-8 overflow-y-auto">
              <div className="flex items-start justify-center w-full">
                {activeView === 'musician' && <Musician />}
                {activeView === 'keys' && (
                  <div className="w-full">
                    {sectionIndex === 0 && <KeysSection />}
                    {sectionIndex === 1 && <ProgressionSection />}
                    {sectionIndex === 2 && <OpusSection />}
                  </div>
                )}
                {activeView === 'builder' && <Builder />}
              </div>

              {/* Navigation controls for keys view */}
              {activeView === 'keys' && (
                <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-3 pointer-events-auto relative">
                    {sections.map((section, idx) => (
                      <button
                        key={section.name}
                        onClick={() => setSectionIndex(idx)}
                        className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        {idx === sectionIndex && (
                          <motion.div
                            layoutId="activeSection"
                            className="absolute inset-0 bg-gray-900 rounded-full"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className={`relative z-10 ${
                          idx === sectionIndex
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}>
                          {section.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
