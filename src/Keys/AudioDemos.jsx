import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'

// Marquee component for scrolling long text when playing
const ScrollingText = ({ text, isPlaying, className }) => {
  const containerRef = useRef(null)
  const singleTextRef = useRef(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const [textWidth, setTextWidth] = useState(0)

  useLayoutEffect(() => {
    if (containerRef.current && singleTextRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const width = singleTextRef.current.offsetWidth
      const overflow = width > containerWidth
      setShouldScroll(overflow)
      setTextWidth(width)
    }
  }, [text])

  const shouldAnimate = isPlaying && shouldScroll
  const gap = 48 // Gap between repeated text

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <motion.div
        className="inline-flex whitespace-nowrap"
        animate={shouldAnimate ? {
          x: [0, -(textWidth + gap)],
        } : { x: 0 }}
        transition={shouldAnimate ? {
          duration: textWidth / 15, // Speed: 15px per second
          repeat: Infinity,
          ease: "linear",
        } : { duration: 0.3 }}
      >
        <span ref={singleTextRef}>{text}</span>
        {shouldScroll && <span style={{ marginLeft: gap }}>{text}</span>}
      </motion.div>
    </div>
  )
}

const audioTracks = [
  {
    id: 1,
    title: 'Nocturne in C-Sharp minor',
    artist: 'Frederic Chopin, Stephen Hough',
    cover: '/Songs/Chopin Nocturnes.jpeg',
    audio: '/audio/Chopin.mp3',
    startTime: 18,    // 0:18
    endTime: 45,      // 0:45
    keyName: 'C♯ minor',
    keyEmotions: 'Longing, lonely, somber',
  },
  {
    id: 2,
    title: 'Ein Heldenleben',
    artist: 'Richard Strauss, Bamberger Symphoniker, Jakub Hrüsa',
    cover: '/Songs/Heldenleben.jpeg',
    audio: '/audio/Heldenleben.flac',
    startTime: 193,   // 3:13
    endTime: 224,     // 3:47
    keyName: 'E♭ major',
    keyEmotions: 'Triumphant, heroic, bold',
  },
  {
    id: 3,
    title: 'Here Comes the Sun',
    artist: 'The Beatles',
    cover: '/Songs/Beatles.png',
    audio: '/audio/Beatles.m4a',
    startTime: 0,
    endTime: 28,
    keyName: 'A major',
    keyEmotions: 'Joyful, bright, optimistic',
  },
]

const AudioCard = ({ track, isPlaying, onPlayPause, currentTime, onSeek }) => {
  const clipDuration = track.endTime - track.startTime
  const clipCurrentTime = Math.max(0, currentTime - track.startTime)
  const progress = clipDuration > 0 ? (clipCurrentTime / clipDuration) * 100 : 0

  return (
    <motion.div
      className="flex flex-col items-center gap-3 w-[200px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Key Info */}
      <div className="text-center w-full -mt-2">
        <h3 className="font-semibold text-white text-[15px]">
          {track.keyName}
        </h3>
        <p className="text-[#8a8a8e] text-[12px] leading-tight mt-0.5">
          {track.keyEmotions}
        </p>
      </div>

      {/* Album Cover */}
      <div className="relative">
        <img
          src={track.cover}
          alt={track.title}
          className="w-[200px] h-[200px] object-cover rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
        />
      </div>

      {/* Track Info */}
      <div className="text-center w-full px-1">
        <h4 className="font-medium text-white text-[15px] leading-tight truncate">
          {track.title}
        </h4>
        <ScrollingText 
          text={track.artist}
          isPlaying={isPlaying}
          className="text-[#8a8a8e] text-[13px] mt-0.5"
        />
      </div>

      {/* Audio Controls */}
      <div className="w-full space-y-3 -mb-2">
        {/* Progress Bar */}
        <div 
          className="relative h-1.5 bg-[#3a3a3f] rounded-full cursor-pointer group/progress"
          onClick={onSeek}
        >
          <div 
            className="absolute h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        {/* Play Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={onPlayPause}
            type="button"
            className="w-9 h-9 rounded-full bg-[#3a3a3f] hover:bg-[#4a4a4f] transition-colors flex items-center justify-center relative z-10"
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const AudioDemos = forwardRef((props, ref) => {
  const [playingId, setPlayingId] = useState(null)
  const [currentTimes, setCurrentTimes] = useState({})
  const audioRefs = useRef({})

  // Expose pauseAll method to parent component
  useImperativeHandle(ref, () => ({
    pauseAll: () => {
      if (playingId !== null && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause()
        setPlayingId(null)
      }
    }
  }))

  // Initialize audio elements
  useEffect(() => {
    audioTracks.forEach(track => {
      if (!audioRefs.current[track.id]) {
        const audio = new Audio()
        audio.src = track.audio
        audio.preload = 'metadata'
        
        audio.addEventListener('loadedmetadata', () => {
          // Set initial position to start of clip
          audio.currentTime = track.startTime
          setCurrentTimes(prev => ({ ...prev, [track.id]: track.startTime }))
        })
        
        audio.addEventListener('timeupdate', () => {
          // Stop at end time
          if (audio.currentTime >= track.endTime) {
            audio.pause()
            audio.currentTime = track.startTime
            setPlayingId(prev => prev === track.id ? null : prev)
            setCurrentTimes(prev => ({ ...prev, [track.id]: track.startTime }))
          } else {
            setCurrentTimes(prev => ({ ...prev, [track.id]: audio.currentTime }))
          }
        })
        
        audio.addEventListener('ended', () => {
          setPlayingId(null)
          audio.currentTime = track.startTime
          setCurrentTimes(prev => ({ ...prev, [track.id]: track.startTime }))
        })

        audio.addEventListener('error', (e) => {
          console.error('Audio error for track:', track.title, e)
        })
        
        audioRefs.current[track.id] = audio
      }
    })

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause()
      })
    }
  }, [])

  const handlePlayPause = async (trackId) => {
    const audio = audioRefs.current[trackId]
    const track = audioTracks.find(t => t.id === trackId)
    
    if (playingId === trackId) {
      // Pause current track
      audio.pause()
      setPlayingId(null)
    } else {
      // Pause any currently playing track
      if (playingId !== null && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause()
      }
      // Reset to start time if at or past end
      if (audio.currentTime < track.startTime || audio.currentTime >= track.endTime) {
        audio.currentTime = track.startTime
      }
      // Play new track
      try {
        await audio.play()
        setPlayingId(trackId)
      } catch (err) {
        console.error('Playback failed:', err)
      }
    }
  }

  const handleSeek = (trackId, e) => {
    const audio = audioRefs.current[trackId]
    const track = audioTracks.find(t => t.id === trackId)
    if (!audio || !track) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const clipDuration = track.endTime - track.startTime
    audio.currentTime = track.startTime + (percent * clipDuration)
  }

  return (
    <div className="relative flex flex-row gap-[48px] items-start justify-center px-[44px] py-[24px]" data-name="AudioDemos">
      {audioTracks.map((track, index) => (
        <motion.div
          key={track.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.15 }}
        >
          <AudioCard
            track={track}
            isPlaying={playingId === track.id}
            onPlayPause={() => handlePlayPause(track.id)}
            currentTime={currentTimes[track.id] || track.startTime}
            onSeek={(e) => handleSeek(track.id, e)}
          />
        </motion.div>
      ))}
    </div>
  )
})

export default AudioDemos
