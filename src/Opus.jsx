import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Headphones, FileText, Upload, X, Check } from 'lucide-react'

const MODIFICATION_SUGGESTIONS = [
  'remove soloist',
  'more rubato',
  'turn into a pop song',
  'double flute',
  'remove horn',
  'add strings',
  'jazz reharmonization',
  'minimize dynamics',
]

// Demo detected movements from an uploaded score
const DETECTED_MOVEMENTS = [
  { id: 1, name: 'I. Allegro moderato', duration: '12:34', key: 'D major' },
  { id: 2, name: 'II. Andante con moto', duration: '8:21', key: 'B minor' },
  { id: 3, name: 'III. Menuetto', duration: '5:47', key: 'D major' },
  { id: 4, name: 'IV. Finale: Presto', duration: '9:15', key: 'D major' },
]

// Animated placeholder prompts
const PLACEHOLDER_PROMPTS = [
  'Mute the solo violin track and re-balance the remaining orchestral backing',
  'Layer a soft French horn section in the mid-range',
  'Isolate the opening violin melody and adapt it into a high-energy pop chorus',
  'Increase the tempo flexibility at rehearsal mark C',
  'Re-arrange this jazz standard into a K-pop hit',
  'Replace the acoustic piano with a shimmering Rhodes electric piano and add a light chorus effect',
  'Gradually increase the velocity of the string section over the last eight measures for a dramatic crescendo',
]

// The inner card UI matching the reference image style
const ScoreTransformCard = () => {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('transform') // 'transform', 'extract'
  const [activeSuggestions, setActiveSuggestions] = useState(new Set())
  const [hasScore, setHasScore] = useState(true) // Start with demo score uploaded
  const [excludedMovements, setExcludedMovements] = useState(new Set())
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const scrollRef = useRef(null)

  // Cycle through placeholder prompts
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Check scroll position
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [])

  const toggleSuggestion = (suggestion) => {
    setActiveSuggestions(prev => {
      const next = new Set(prev)
      if (next.has(suggestion)) {
        next.delete(suggestion)
      } else {
        next.add(suggestion)
        setPrompt(p => p ? `${p}, ${suggestion}` : suggestion)
      }
      return next
    })
  }

  const toggleMovement = (id) => {
    setExcludedMovements(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="w-full h-full bg-[#101012] flex flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pt-6 pb-6">
        <div className="flex flex-col items-center">
          {/* Main input card */}
          <div className="w-full max-w-[780px] bg-[#1A1A1C] rounded-2xl p-6 mb-4">
            {/* Text input area */}
            <div className="relative mb-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-transparent text-white text-base resize-none h-[100px] focus:outline-none pr-14"
                style={{ lineHeight: '1.6' }}
              />
              {/* Animated placeholder */}
              {!prompt && (
                <div className="absolute inset-0 pointer-events-none pr-14 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={placeholderIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-zinc-500 text-base block"
                      style={{ lineHeight: '1.6' }}
                    >
                      {PLACEHOLDER_PROMPTS[placeholderIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
              {/* Dice icon */}
              <div className="absolute right-0 top-0 w-12 h-12">
                <img src="/images/Dice.png" alt="" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Mode toggles */}
            <div className="flex items-center gap-7">
              <button
                onClick={() => setMode('transform')}
                className="flex items-center gap-2.5 text-sm text-zinc-500"
              >
                <Headphones size={18} />
                Audio
              </button>
              <button
                onClick={() => setMode('extract')}
                className="flex items-center gap-2.5 text-sm text-zinc-500"
              >
                <FileText size={18} />
                Lyrics
              </button>
              
              {/* Upload Score button */}
              <button
                onClick={() => setHasScore(true)}
                className={`flex items-center gap-2.5 text-sm transition-colors ml-auto ${
                  hasScore ? 'text-[#FF1493]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Upload size={18} />
                {hasScore ? 'Score uploaded' : 'Upload score'}
              </button>
            </div>
          </div>

          {/* Suggestion pills - horizontal scroll with gradient edges */}
          <div className="w-full max-w-[780px] relative mb-4">
            {/* Left gradient */}
            <div 
              className={`absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-[#101012] to-transparent pointer-events-none transition-opacity duration-200 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* Right gradient */}
            <div 
              className={`absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-[#101012] to-transparent pointer-events-none transition-opacity duration-200 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
            />
            <div 
              ref={scrollRef}
              className="overflow-x-auto hide-scrollbar"
            >
              <div className="flex gap-3 pb-2">
                {MODIFICATION_SUGGESTIONS.map((suggestion) => (
                  <motion.button
                    key={suggestion}
                    onClick={() => toggleSuggestion(suggestion)}
                    className={`
                      flex items-center gap-2 px-5 py-3 rounded-full text-sm whitespace-nowrap
                      transition-all duration-200 border flex-shrink-0
                      ${activeSuggestions.has(suggestion)
                        ? 'bg-[#2a2a2a] text-white border-zinc-600'
                        : 'bg-[#1A1A1C] text-zinc-400 border-transparent hover:border-zinc-700'}
                    `}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-zinc-500">+</span>
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Uploaded Score - Shows below inspiration pills when uploaded */}
          <AnimatePresence>
            {hasScore && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-[780px] overflow-hidden"
              >
                <div className="bg-[#1A1A1C] rounded-2xl p-6">
                  {/* Score file info */}
                  <div className="flex items-center gap-4 mb-5 pb-5 border-b border-zinc-800">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-base font-medium">Brahms Symphony No. 4 in E minor, Op. 98</p>
                      <p className="text-zinc-500 text-sm mt-1">4 movements • 35:57 total duration</p>
                    </div>
                    <button 
                      onClick={() => {
                        setHasScore(false)
                        setExcludedMovements(new Set())
                      }}
                      className="w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#333] transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Detected Movements */}
                  <div className="space-y-2">
                    {DETECTED_MOVEMENTS.map((movement) => {
                      const isExcluded = excludedMovements.has(movement.id)
                      return (
                        <motion.button
                          key={movement.id}
                          onClick={() => toggleMovement(movement.id)}
                          className={`
                            w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-left transition-all
                            ${isExcluded 
                              ? 'opacity-40' 
                              : 'bg-[#232323] hover:bg-[#2a2a2a]'}
                          `}
                          whileTap={{ scale: 0.99 }}
                        >
                          {/* Checkbox */}
                          <div className={`
                            w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all
                            ${isExcluded 
                              ? 'bg-[#2a2a2a] border border-zinc-700' 
                              : 'bg-[#FF1493]'}
                          `}>
                            {!isExcluded && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                          
                          <p className={`text-sm flex-1 truncate ${isExcluded ? 'text-zinc-600 line-through' : 'text-white'}`}>
                            {movement.name}
                          </p>
                          
                          <span className={`text-xs flex-shrink-0 ${isExcluded ? 'text-zinc-700' : 'text-zinc-500'}`}>
                            {movement.duration}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}

// Main Section Component (matching KeysSection layout)
const OpusSection = () => {
  return (
    <div className="relative overflow-visible">
      <div className="w-full relative overflow-visible flex justify-center">
        {/* Main Content - Text on left, Card on right */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center overflow-visible">
          {/* Text Content - Left side */}
          <motion.div
            className="space-y-4 lg:w-[450px] flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-ink leading-relaxed pb-2">
              Reimagine Scores
            </h2>
            
            {/* Description and Use Cases */}
            <div className="flex flex-col gap-2">
                {[
                  "Works published before 1930 are in the public domain in the U.S., meaning any score from that period can be legally uploaded.",
                  "Access to this material enables detailed analysis of a vast body of existing music, opening the door to powerful new creative possibilities on Suno.",
                  "A violinist can play along with an orchestra in a concerto, Beethoven’s Fifth can be reimagined as a K-pop track, and existing works can be remixed."                ].map((point, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  >
                    <span className="flex-shrink-0 leading-relaxed text-[#FF1493]">•</span>
                    <p className="text-lg leading-relaxed font-normal text-ink">
                      {point}
                    </p>
                  </motion.div>
                ))}
            </div>
          </motion.div>

          {/* Interactive Content - Right side */}
          {/* Wrapper sized to match visual dimensions after 0.9 scale */}
          <div className="w-[745px] h-[425px] relative overflow-visible flex-shrink-0">
            <motion.div
              className="origin-top-left"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 0.9 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Card Container - Same dimensions as other sections */}
              <div className="bg-[#101012] overflow-hidden relative rounded-[24px] w-[828px] h-[472px] ring-1 ring-white/5 shadow-2xl">
              <ScoreTransformCard />
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpusSection
