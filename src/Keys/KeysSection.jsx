import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InteractiveCircleOfFifths from './InteractiveCircleOfFifths'
import AudioDemos from './AudioDemos'

const KeysSection = () => {
  const [activeSlide, setActiveSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const audioDemosRef = useRef(null)

  // Pause audio when switching to Key Selection
  useEffect(() => {
    if (activeSlide === 1 && audioDemosRef.current) {
      audioDemosRef.current.pauseAll()
    }
  }, [activeSlide])

  const handleSlideChange = (newSlide) => {
    if (newSlide === activeSlide) return
    setDirection(newSlide > activeSlide ? 1 : -1)
    setActiveSlide(newSlide)
  }
  
  const slides = [
    { id: 0, label: 'Examples' },
    { id: 1, label: 'Key Selection UI' },
  ]

  return (
    <div className="relative overflow-visible pt-8 pb-12">
      <div className="w-full relative overflow-visible pl-8 lg:pl-12">
        {/* Main Content - Text on left, Keys UI on right */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start justify-center overflow-visible">
          {/* Text Content - Left side */}
          <motion.div
            className="space-y-4 overflow-visible lg:w-[450px] flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-ink leading-relaxed pb-2">
              Assign Keys
            </h2>
            
            {/* Bullet Points List - Vertical */}
            <div className="flex flex-col gap-3">
              {[
                "Musical keys play a major role in shaping emotional tone, with different keys carrying common expressive associations. Take a listen to a few examples to see how keys and mood align.",
                "Giving users the ability to select one or more keys allows them to guide the mood, harmonic color, and overall direction of their music. Certain keys can also better fit a vocalist's range.",
              ].map((point, index) => {
                const isHighlighted = (activeSlide === 0 && index === 0) || (activeSlide === 1 && index === 1)
                return (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  >
                    <motion.span
                      className="flex-shrink-0 leading-relaxed"
                      animate={{
                        color: isHighlighted ? '#e63946' : '#9ca3af',
                      }}
                      transition={{
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    >
                      •
                    </motion.span>
                    <motion.p
                      className="text-lg leading-relaxed font-normal"
                      animate={{
                        color: isHighlighted ? '#1a1a1a' : '#9ca3af',
                      }}
                      transition={{
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    >
                      {point}
                    </motion.p>
                  </motion.div>
                )
              })}
            </div>

            {/* Slide Switcher - Pill */}
            <motion.div
              className="pt-4 relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="relative bg-[#f0f0f0] rounded-full p-1 flex">
                {/* Sliding indicator */}
                <motion.div
                  className="absolute top-1 bottom-1 bg-[#19191b] rounded-full shadow-lg"
                  initial={false}
                  animate={{
                    left: activeSlide === 0 ? '4px' : '50%',
                    width: 'calc(50% - 4px)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
                {slides.map((slide) => (
                  <button
                    key={slide.id}
                    onClick={() => handleSlideChange(slide.id)}
                    className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      activeSlide === slide.id
                        ? 'text-white'
                        : 'text-[#5c5b61]'
                    }`}
                  >
                    {slide.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Interactive Content - Right side */}
          {/* Wrapper sized to match visual dimensions after 0.9 scale */}
          <div className="w-[745px] h-[425px] relative overflow-visible flex-shrink-0">
            <motion.div
              className="origin-top-left overflow-visible"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 0.9 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Shared Card Container - Fixed size to prevent layout shift */}
              <div className="bg-[#19191b] overflow-hidden relative rounded-[24px] w-[828px] h-[472px]">
              <div className="relative w-full h-full">
                <AnimatePresence initial={false} custom={direction}>
                  {/* Audio Demos */}
                  {activeSlide === 0 && (
                    <motion.div
                      key="audio-demos"
                      custom={direction}
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{
                        type: 'tween',
                        duration: 0.45,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    >
                      <AudioDemos ref={audioDemosRef} />
                    </motion.div>
                  )}
                  
                  {/* Key Selection */}
                  {activeSlide === 1 && (
                    <motion.div
                      key="key-selection"
                      custom={direction}
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{
                        type: 'tween',
                        duration: 0.45,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    >
                      <InteractiveCircleOfFifths />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeysSection
