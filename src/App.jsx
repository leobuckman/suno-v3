import { useRef, useEffect, useState } from 'react'

// Sequence: Loop1 -> Loop1 -> Loop2 -> repeat
const bassSequence = ['/BassLoop1.mp4', '/BassLoop1.mp4', '/BassLoop2.mp4']
const chestSequence = ['/ChestLoop.mp4']
const flipSequence = ['/FlipLoop1.mp4', '/FlipLoop1.mp4', '/FlipLoop2.mp4']

// ========== VIDEO LAYOUT CONFIG ==========
// Each video has FIXED position - changing one won't affect others
// Use top/left to position, scale to resize (1 = original size, 0.5 = half, 2 = double)
const videoConfig = {
  container: {
    height: '600px', // total height of the video section
  },
  bass: {
    scale: 0.3,
    top: '20px',
    left: '200px',
  },
  chest: {
    scale: 0.25,
    top: '30px',
    left: '585px',
  },
  flip: {
    scale: 0.32,
    top: '20px',
    left: '950px',
  },
}
// ==========================================

export default function App() {
  // Double-buffering: two video elements for bass and flip to eliminate loading gaps
  const bassVideoRef1 = useRef(null)
  const bassVideoRef2 = useRef(null)
  const chestVideoRef = useRef(null)
  const flipVideoRef1 = useRef(null)
  const flipVideoRef2 = useRef(null)
  const startedRef = useRef(false)
  
  // Track which video element is active (0 or 1) and which sequence index
  const [bassState, setBassState] = useState({ activePlayer: 0, index: 0 })
  const [chestIndex, setChestIndex] = useState(0)
  const [flipState, setFlipState] = useState({ activePlayer: 0, index: 0 })

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
    const chest = chestVideoRef.current
    const flip1 = flipVideoRef1.current
    const flip2 = flipVideoRef2.current
    if (!bass1 || !bass2 || !chest || !flip1 || !flip2) return

    const handleBassEnded = (fromPlayer) => () => {
      setBassState((prev) => {
        const nextIndex = (prev.index + 1) % bassSequence.length
        const nextPlayer = fromPlayer === 0 ? bass2 : bass1
        nextPlayer.currentTime = 0
        nextPlayer.play().catch(() => {})
        return { activePlayer: fromPlayer === 0 ? 1 : 0, index: nextIndex }
      })
    }

    const handleChestEnded = () => {
      setChestIndex((prev) => (prev + 1) % chestSequence.length)
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
    const flip1Handler = handleFlipEnded(0)
    const flip2Handler = handleFlipEnded(1)

    bass1.addEventListener('ended', bass1Handler)
    bass2.addEventListener('ended', bass2Handler)
    chest.addEventListener('ended', handleChestEnded)
    flip1.addEventListener('ended', flip1Handler)
    flip2.addEventListener('ended', flip2Handler)

    return () => {
      bass1.removeEventListener('ended', bass1Handler)
      bass2.removeEventListener('ended', bass2Handler)
      chest.removeEventListener('ended', handleChestEnded)
      flip1.removeEventListener('ended', flip1Handler)
      flip2.removeEventListener('ended', flip2Handler)
    }
  }, [])

  // Handle chest video source changes (single player, loops)
  useEffect(() => {
    const chest = chestVideoRef.current
    if (chest && startedRef.current) {
      chest.load()
      chest.playbackRate = desiredPlaybackRate
      chest.play().catch(() => {})
    }
  }, [chestIndex])

  // Initial synchronized start
  useEffect(() => {
    const bass1 = bassVideoRef1.current
    const bass2 = bassVideoRef2.current
    const chest = chestVideoRef.current
    const flip1 = flipVideoRef1.current
    const flip2 = flipVideoRef2.current
    if (!bass1 || !bass2 || !chest || !flip1 || !flip2) return

    // Set up initial sources
    bass1.src = bassSequence[0]
    bass2.src = bassSequence[1] // Preload next
    flip1.src = flipSequence[0]
    flip2.src = flipSequence[1] // Preload next

    ;[bass1, bass2, chest, flip1, flip2].forEach(v => {
      v.playbackRate = desiredPlaybackRate
    })

    const tryStartTogether = () => {
      if (startedRef.current) return
      // Check if primary videos are ready
      if (bass1.readyState >= 2 && chest.readyState >= 2 && flip1.readyState >= 2) {
        startedRef.current = true
        bass1.currentTime = 0
        chest.currentTime = 0
        flip1.currentTime = 0
        ;[bass1.play(), chest.play(), flip1.play()].forEach((p) => p?.catch(() => {}))
      }
    }

    bass1.addEventListener('canplay', tryStartTogether)
    chest.addEventListener('canplay', tryStartTogether)
    flip1.addEventListener('canplay', tryStartTogether)
    tryStartTogether()

    return () => {
      bass1.removeEventListener('canplay', tryStartTogether)
      chest.removeEventListener('canplay', tryStartTogether)
      flip1.removeEventListener('canplay', tryStartTogether)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center font-body">
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
          className="absolute origin-top-left"
          style={{ 
            transform: `scale(${videoConfig.bass.scale})`,
            top: videoConfig.bass.top, 
            left: videoConfig.bass.left,
            visibility: bassState.activePlayer === 0 ? 'visible' : 'hidden'
          }}
          muted
          playsInline
        />
        <video
          ref={bassVideoRef2}
          className="absolute origin-top-left"
          style={{ 
            transform: `scale(${videoConfig.bass.scale})`,
            top: videoConfig.bass.top, 
            left: videoConfig.bass.left,
            visibility: bassState.activePlayer === 1 ? 'visible' : 'hidden'
          }}
          muted
          playsInline
        />

        {/* ChestLoop video */}
        <video
          ref={chestVideoRef}
          className="absolute origin-top-left"
          style={{ 
            transform: `scale(${videoConfig.chest.scale})`,
            top: videoConfig.chest.top, 
            left: videoConfig.chest.left 
          }}
          autoPlay
          muted
          playsInline
          loop
          src={chestSequence[chestIndex]}
        />

        {/* LeoBackflip video - double buffered */}
        <video
          ref={flipVideoRef1}
          className="absolute origin-top-left"
          style={{ 
            transform: `scale(${videoConfig.flip.scale})`,
            top: videoConfig.flip.top, 
            left: videoConfig.flip.left,
            visibility: flipState.activePlayer === 0 ? 'visible' : 'hidden'
          }}
          muted
          playsInline
        />
        <video
          ref={flipVideoRef2}
          className="absolute origin-top-left"
          style={{ 
            transform: `scale(${videoConfig.flip.scale})`,
            top: videoConfig.flip.top, 
            left: videoConfig.flip.left,
            visibility: flipState.activePlayer === 1 ? 'visible' : 'hidden'
          }}
          muted
          playsInline
        />
      </div>
    </div>
  )
}
