import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play } from 'lucide-react'
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
    scale: 0.4,
    top: '-137px',
    translateX: '-610px', // offset from center (negative = left of center)
    crop: 'inset(20% 0 0 0)', // Crop 30% from left and right sides
  },
  chest: {
    scale: 0.38,
    top: '-50px',
    translateX: '-136px', // offset from center
    crop: 'inset(35% 17% 0 17%)', // Crop 30% from left and right sides
  },
  flip: {
    scale: 0.45,
    top: '-124px',
    translateX: '200px', // offset from center (positive = right of center)
    crop: 'inset(15% 0 0 0)',
  },
}

// ========== TEXT LABEL CONFIG ==========
const textConfig = {
  musician: {
    top: '370px',
    translateX: '-550px', // offset from center
    width: '320px',
  },
  pot: {
    top: '370px',
    translateX: '-110px', // offset from center
    width: '220px',
  },
  builder: {
    top: '370px',
    translateX: '220px', // offset from center
    width: '320px',
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
  const audioRef = useRef(null)
  const startedRef = useRef(false)
  const audioFirstPlayRef = useRef(true) // Track if this is the first audio playback
  const audioRestartTimeoutRef = useRef(null) // Track audio restart timeout
  const [isPlaying, setIsPlaying] = useState(false) // Track if videos/audio are playing
  const [readyToStart, setReadyToStart] = useState(false) // Track if all media is ready to play
  
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

  const desiredPlaybackRate = 1.0
  const chestPlaybackRate = desiredPlaybackRate * 1.2 // 1.08x speed
  const audioPlaybackRate = 1.13 // Slightly faster to match video loops
  
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

  // Handle audio looping - first loop starts at 0.5s, subsequent loops start at 0s with 4s pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleAudioEnded = () => {
      // Only restart if we're currently in playing state
      if (!isPlaying) return

      // After first playback, wait 3 seconds before restarting from 0
      audioFirstPlayRef.current = false
      audioRestartTimeoutRef.current = setTimeout(() => {
        if (isPlaying) { // Check again in case state changed during timeout
          audio.currentTime = 0
          audio.play().catch(() => {})
        }
      }, 3100) // 3 second pause
    }

    audio.addEventListener('ended', handleAudioEnded)

    return () => {
      audio.removeEventListener('ended', handleAudioEnded)
      if (audioRestartTimeoutRef.current) {
        clearTimeout(audioRestartTimeoutRef.current)
      }
    }
  }, [isPlaying])

  // Reset section index when opening keys view
  useEffect(() => {
    if (activeView === 'keys') {
      setSectionIndex(0)
    }
  }, [activeView])

  // Mute/unmute videos and audio when a page is displayed
  useEffect(() => {
    const bass1 = bassVideoRef1.current
    const bass2 = bassVideoRef2.current
    const chest1 = chestVideoRef1.current
    const chest2 = chestVideoRef2.current
    const flip1 = flipVideoRef1.current
    const flip2 = flipVideoRef2.current
    const audio = audioRef.current
    if (!bass1 || !bass2 || !chest1 || !chest2 || !flip1 || !flip2 || !audio) return

    // Mute all videos and audio when a page is displayed, unmute when no page is displayed
    // Bass loops are always muted
    const shouldMute = activeView !== null
    bass1.muted = true
    bass2.muted = true
    ;[chest1, chest2, flip1, flip2].forEach(v => {
      v.muted = shouldMute
    })
    audio.muted = shouldMute
  }, [activeView])

  // Initial setup - load media but don't auto-start
  useEffect(() => {
    const bass1 = bassVideoRef1.current
    const bass2 = bassVideoRef2.current
    const chest1 = chestVideoRef1.current
    const chest2 = chestVideoRef2.current
    const flip1 = flipVideoRef1.current
    const flip2 = flipVideoRef2.current
    const audio = audioRef.current
    if (!bass1 || !bass2 || !chest1 || !chest2 || !flip1 || !flip2 || !audio) return

    // Set up initial sources
    bass1.src = bassSequence[0]
    bass2.src = bassSequence[1] // Preload next
    chest1.src = chestSequence[0]
    chest2.src = chestSequence[0] // Preload same (only one in sequence)
    flip1.src = flipSequence[0]
    flip2.src = flipSequence[1] // Preload next
    audio.src = '/audio/SunoTrack.wav'

    ;[bass1, bass2, flip1, flip2].forEach(v => {
      v.playbackRate = desiredPlaybackRate
    })
    ;[chest1, chest2].forEach(v => {
      v.playbackRate = chestPlaybackRate
    })
    audio.playbackRate = audioPlaybackRate

    const checkIfReady = () => {
      // Check if primary videos and audio are ready
      if (bass1.readyState >= 2 && chest1.readyState >= 2 && flip1.readyState >= 2 && audio.readyState >= 2) {
        setReadyToStart(true)
      }
    }

    bass1.addEventListener('canplay', checkIfReady)
    chest1.addEventListener('canplay', checkIfReady)
    flip1.addEventListener('canplay', checkIfReady)
    audio.addEventListener('canplay', checkIfReady)
    checkIfReady()

    return () => {
      bass1.removeEventListener('canplay', checkIfReady)
      chest1.removeEventListener('canplay', checkIfReady)
      flip1.removeEventListener('canplay', checkIfReady)
      audio.removeEventListener('canplay', checkIfReady)
    }
  }, [])

  // Function to start playback (no pause)
  const handlePlay = () => {
    const bass1 = bassVideoRef1.current
    const chest1 = chestVideoRef1.current
    const flip1 = flipVideoRef1.current
    const audio = audioRef.current
    if (!bass1 || !chest1 || !flip1 || !audio || startedRef.current) return

    // First time starting
    startedRef.current = true
    bass1.currentTime = 0
    chest1.currentTime = 0
    flip1.currentTime = 0
    audio.currentTime = 0.5
    audioFirstPlayRef.current = true

    setIsPlaying(true) // Set state before playing
    ;[bass1.play(), chest1.play(), flip1.play(), audio.play()].forEach((p) => p?.catch(() => {}))
  }

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col items-center font-body">
      {/* Hidden audio element for background music */}
      <audio ref={audioRef} />

      {/* Header */}
      <div className="text-center pt-12 pb-1">
        <h1 className="text-4xl text-gray-900 mb-4 font-display font-extrabold tracking-wide">
          <span>Hi, I'm Leo</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
I'm interested in joining Suno as a Product Designer because it sits at the intersection of the two worlds that I live between: software and music. I recently graduated from Northwestern University with a dual degree in Computer Science (B.A.) and Music Performance (B.M.).<br />        </p>
        <div className="flex items-center justify-center mt-6">
          {!isPlaying ? (
            <motion.button
              onClick={handlePlay}
              disabled={!readyToStart}
              className="flex items-center justify-center text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #F7A505 0%, #FD2D6C 50%, #F14925 100%)'
              }}
              initial={false}
              animate={{
                width: readyToStart ? '48px' : '48px',
                height: '48px',
                paddingLeft: '0px',
                paddingRight: '0px'
              }}
              whileHover={readyToStart ? { scale: 1.1 } : {}}
              whileTap={readyToStart ? { scale: 0.95 } : {}}
            >
              <AnimatePresence mode="wait">
                {!readyToStart ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                  />
                ) : (
                  <motion.div
                    key="play"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <Play size={20} fill="white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ) : (
            <motion.a
              href="mailto:leo.s.buckman@gmail.com"
              className="flex items-center justify-center text-white font-medium rounded-full transition-all overflow-hidden whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #F7A505 0%, #FD2D6C 50%, #F14925 100%)'
              }}
              initial={{
                width: 48,
                height: 48,
                paddingLeft: 0,
                paddingRight: 0
              }}
              animate={{
                width: 152,
                height: 48,
                paddingLeft: 24,
                paddingRight: 24
              }}
              transition={{ duration: 0.13, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                className="whitespace-nowrap"
              >
                Contact Me
              </motion.span>
            </motion.a>
          )}
        </div>
      </div>

      {/* Video container with relative positioning */}
      <div
        className="relative w-full mx-auto mt-6 transition-opacity duration-300"
        style={{
          height: videoConfig.container.height,
          maxWidth: videoConfig.container.maxWidth,
          opacity: isPlaying ? 1 : 0.4
        }}
      >
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
            top: '-40px',
            left: '59%',
            transform: `translateX(${videoConfig.bass.translateX})`,
            width: '270px',
            height: '400px',
          }}
          onClick={() => setActiveView('musician')}
          onMouseEnter={() => setBassHover(true)}
          onMouseLeave={() => setBassHover(false)}
        />
        {/* Text below bass video */}
        <div
          className="absolute text-center text-sm text-gray-400 font-medium pointer-events-none"
          style={{
            top: textConfig.musician.top,
            left: '50%',
            transform: `translateX(${textConfig.musician.translateX})`,
            width: textConfig.musician.width,
          }}
        >
          Musician
        </div>

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
        {/* Clickable overlay for Chest */}
        <div
          className="absolute cursor-pointer"
          style={{
            top: '100px',
            left: '50%',
            transform: `translateX(${videoConfig.chest.translateX})`,
            width: '270px',
            height: '260px',
          }}
          onClick={() => setActiveView('keys')}
          onMouseEnter={() => setChestHover(true)}
          onMouseLeave={() => setChestHover(false)}
        />
        {/* Text below chest video */}
        <div
          className="absolute text-center text-sm text-gray-400 font-medium pointer-events-none"
          style={{
            top: textConfig.pot.top,
            left: '50%',
            transform: `translateX(${textConfig.pot.translateX})`,
            width: textConfig.pot.width,
          }}
        >
          Ideas brewing for Suno
        </div>

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
            top: '-35px',
            left: '53%',
            transform: `translateX(${videoConfig.flip.translateX})`,
            width: '400px',
            height: '400px',
          }}
          onClick={() => setActiveView('builder')}
          onMouseEnter={() => setFlipHover(true)}
          onMouseLeave={() => setFlipHover(false)}
        />
        {/* Text below flip video */}
        <div
          className="absolute text-center text-sm text-gray-400 font-medium pointer-events-none"
          style={{
            top: textConfig.builder.top,
            left: '50%',
            transform: `translateX(${textConfig.builder.translateX})`,
            width: textConfig.builder.width,
          }}
        >
          Builder
        </div>
      </div>

      {/* Full Screen Panel */}
      <AnimatePresence>
        {activeView && (
          <motion.div
            className="fixed inset-0 z-50 bg-white flex flex-col"
            style={{ willChange: 'transform' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Header with back button */}
            <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4">
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
              <div className={`flex items-start justify-center w-full ${
                activeView === 'builder' ? 'pt-8' :
                activeView === 'keys' && sectionIndex === 0 ? '-mt-8' :
                activeView === 'keys' && sectionIndex > 0 ? 'pt-2' : ''
              }`}>
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
                  <div className="pointer-events-auto flex items-center gap-8">
                    {sections.map((section, idx) => (
                      <button
                        key={section.name}
                        onClick={() => setSectionIndex(idx)}
                        className="relative pb-2"
                      >
                        <span className={`text-base font-medium transition-colors duration-200 ${
                          sectionIndex === idx
                            ? 'text-[#19191b]'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}>
                          {section.name}
                        </span>
                        {sectionIndex === idx && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#19191b]"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
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
