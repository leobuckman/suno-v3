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
    top: '-22px',
    left: '200px',
  },
  chest: {
    scale: 0.25,
    top: '-10px',
    left: '585px',
  },
  flip: {
    scale: 0.32,
    top: '-20px',
    left: '950px',
  },
}
// ==========================================

export default function App() {
  const bassVideoRef = useRef(null)
  const chestVideoRef = useRef(null)
  const videoRef = useRef(null)
  const startedRef = useRef(false)
  
  const [bassIndex, setBassIndex] = useState(0)
  const [chestIndex, setChestIndex] = useState(0)
  const [flipIndex, setFlipIndex] = useState(0)

  // Handle video ended events to cycle through sequences
  useEffect(() => {
    const bass = bassVideoRef.current
    const chest = chestVideoRef.current
    const backflip = videoRef.current
    if (!bass || !chest || !backflip) return

    const handleBassEnded = () => {
      setBassIndex((prev) => (prev + 1) % bassSequence.length)
    }

    const handleChestEnded = () => {
      setChestIndex((prev) => (prev + 1) % chestSequence.length)
    }

    const handleFlipEnded = () => {
      setFlipIndex((prev) => (prev + 1) % flipSequence.length)
    }

    bass.addEventListener('ended', handleBassEnded)
    chest.addEventListener('ended', handleChestEnded)
    backflip.addEventListener('ended', handleFlipEnded)

    return () => {
      bass.removeEventListener('ended', handleBassEnded)
      chest.removeEventListener('ended', handleChestEnded)
      backflip.removeEventListener('ended', handleFlipEnded)
    }
  }, [])

  // Play video when source changes
  useEffect(() => {
    const bass = bassVideoRef.current
    if (bass && startedRef.current) {
      bass.load()
      bass.playbackRate = 0.9
      bass.play().catch(() => {})
    }
  }, [bassIndex])

  useEffect(() => {
    const chest = chestVideoRef.current
    if (chest && startedRef.current) {
      chest.load()
      chest.playbackRate = 0.9
      chest.play().catch(() => {})
    }
  }, [chestIndex])

  useEffect(() => {
    const backflip = videoRef.current
    if (backflip && startedRef.current) {
      backflip.load()
      backflip.playbackRate = 0.9
      backflip.play().catch(() => {})
    }
  }, [flipIndex])

  // Initial synchronized start
  useEffect(() => {
    const bass = bassVideoRef.current
    const chest = chestVideoRef.current
    const backflip = videoRef.current
    if (!bass || !chest || !backflip) return

    const desiredPlaybackRate = 0.9
    bass.playbackRate = desiredPlaybackRate
    chest.playbackRate = desiredPlaybackRate
    backflip.playbackRate = desiredPlaybackRate

    const tryStartTogether = () => {
      if (startedRef.current) return
      // HAVE_CURRENT_DATA (2) or higher means current frame is available.
      if (bass.readyState >= 2 && chest.readyState >= 2 && backflip.readyState >= 2) {
        startedRef.current = true
        bass.currentTime = 0
        chest.currentTime = 0
        backflip.currentTime = 0
        ;[bass.play(), chest.play(), backflip.play()].forEach((p) => p?.catch(() => {}))
      }
    }

    bass.addEventListener('canplay', tryStartTogether)
    chest.addEventListener('canplay', tryStartTogether)
    backflip.addEventListener('canplay', tryStartTogether)
    tryStartTogether()

    return () => {
      bass.removeEventListener('canplay', tryStartTogether)
      chest.removeEventListener('canplay', tryStartTogether)
      backflip.removeEventListener('canplay', tryStartTogether)
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
        {/* LeoBass video */}
        <video
          ref={bassVideoRef}
          className="absolute origin-top-left"
          style={{ 
            transform: `scale(${videoConfig.bass.scale})`,
            top: videoConfig.bass.top, 
            left: videoConfig.bass.left 
          }}
          autoPlay
          muted
          playsInline
          src={bassSequence[bassIndex]}
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

        {/* LeoBackflip video */}
        <video
          ref={videoRef}
          className="absolute origin-top-left"
          style={{ 
            transform: `scale(${videoConfig.flip.scale})`,
            top: videoConfig.flip.top, 
            left: videoConfig.flip.left 
          }}
          autoPlay
          muted
          playsInline
          src={flipSequence[flipIndex]}
        />
      </div>
    </div>
  )
}
