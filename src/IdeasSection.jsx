import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InteractiveCircleOfFifths from './Keys/InteractiveCircleOfFifths'
import AudioDemos from './Keys/AudioDemos'
import { ChordEditorCard } from './Progression/Progression'
import { ScoreTransformCard } from './Opus'

const sectionData = {
  keys: {
    title: 'Assign Keys',
    bullets: [
      "Musical keys play a major role in shaping emotional tone, with different keys carrying common expressive associations. Take a listen to a few examples to see how keys and mood align.",
      "Giving users the ability to select one or more keys allows them to guide the mood, harmonic color, and overall direction of their music. Certain keys can also better fit a vocalist's range.",
    ],
    hasInternalSlides: true,
    slides: [
      { id: 0, label: 'Examples', component: AudioDemos },
      { id: 1, label: 'Key Selection UI', component: InteractiveCircleOfFifths },
    ],
    cardBgColor: '#19191b',
  },
  progressions: {
    title: 'Build Progressions',
    bullets: [
      "Chord progressions are the backbone of any song, defining its harmonic journey and emotional arc. From the classic ii-V-I to more adventurous borrowed chords, progressions shape how music feels.",
      "This editor lets users craft custom chord sequences using Roman numeral notation—a universal language that works across any key. Select degrees, adjust qualities, and play the chords back.",
    ],
    hasInternalSlides: false,
    cardComponent: ChordEditorCard,
    cardBgColor: '#19191b',
    cardDimensions: { w: '745px', h: '425px' },
  },
  scores: {
    title: 'Reimagine Scores',
    bullets: [
      "Works published before 1930 are in the public domain in the U.S., meaning any score from that period can be legally uploaded.",
      "Access to this material enables detailed analysis of a vast body of existing music, opening the door to powerful new creative possibilities on Suno.",
      "A violinist can play along with an orchestra in a concerto, Beethoven's Fifth can be reimagined as a K-pop track, and existing works can be remixed.",
    ],
    hasInternalSlides: false,
    cardComponent: ScoreTransformCard,
    cardBgColor: '#101012',
  },
}

const IdeasSection = ({ sectionKey, direction }) => {
  const section = sectionData[sectionKey]
  const audioDemosRef = useRef(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [slideDirection, setSlideDirection] = useState(1)

  // Reset internal slide when switching sections
  useEffect(() => {
    setActiveSlide(0)
    if (audioDemosRef.current) {
      audioDemosRef.current.pauseAll()
    }
  }, [sectionKey])

  // Pause audio when switching to Key Selection
  useEffect(() => {
    if (sectionKey === 'keys' && activeSlide === 1 && audioDemosRef.current) {
      audioDemosRef.current.pauseAll()
    }
  }, [sectionKey, activeSlide])

  const handleSlideChange = (newSlide) => {
    if (newSlide === activeSlide) return
    setSlideDirection(newSlide > activeSlide ? 1 : -1)
    setActiveSlide(newSlide)
  }

  return (
    <div className="relative overflow-visible pt-8 pb-12">
      <div className="w-full relative overflow-visible pl-8 lg:pl-12">
        {/* Main Content - Text on left, Card on right */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start justify-center overflow-visible">

          {/* Text Content - Left side - STATIC CONTAINER */}
          <div className="space-y-4 overflow-visible lg:w-[450px] flex-shrink-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`title-${sectionKey}`}
                custom={direction}
                initial={{ opacity: 0, y: direction * 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction * -20 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-ink leading-relaxed pb-2">
                  {section.title}
                </h2>
              </motion.div>
            </AnimatePresence>

            {/* Bullet Points - Stagger animation */}
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`bullets-${sectionKey}`}
                  className="flex flex-col gap-3"
                  custom={direction}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {section.bullets.map((point, index) => {
                    const isHighlighted =
                      sectionKey === 'keys' &&
                      ((activeSlide === 0 && index === 0) || (activeSlide === 1 && index === 1))

                    return (
                      <motion.div
                        key={index}
                        className="flex items-start gap-3"
                        custom={index}
                        variants={{
                          hidden: (i) => ({ opacity: 0, y: direction * 15 }),
                          visible: (i) => ({
                            opacity: 1,
                            y: 0,
                            transition: { delay: i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                          }),
                          exit: (i) => ({
                            opacity: 0,
                            y: direction * -15,
                            transition: { delay: i * 0.04, duration: 0.3, ease: [0.4, 0, 0.2, 1] }
                          }),
                        }}
                      >
                        <motion.span
                          className="flex-shrink-0 leading-relaxed"
                          animate={{
                            color: isHighlighted ? '#e63946' : (sectionKey === 'scores' ? '#FF1493' : '#9ca3af'),
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
                            color: isHighlighted ? '#1a1a1a' : (sectionKey === 'scores' ? '#1a1a1a' : '#9ca3af'),
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Interactive Content - Right side - STATIC CONTAINER */}
          <div className="w-[745px] relative overflow-visible flex-shrink-0 flex flex-col gap-0">
            <div className="origin-top-left overflow-visible">
              {/* Card Shell - STAYS MOUNTED */}
              <div
                className="overflow-hidden relative rounded-[24px] w-[828px] h-[472px] ring-1 ring-white/5 shadow-2xl"
                style={{
                  backgroundColor: section.cardBgColor,
                  transform: 'scale(0.9)',
                  transformOrigin: 'top left',
                }}
              >
                <div className="relative w-full h-full">
                  <AnimatePresence initial={false} custom={direction}>
                    {/* Keys Section with Internal Slides */}
                    {sectionKey === 'keys' && (
                      <motion.div
                        key="keys-content"
                        custom={direction}
                        className="absolute inset-0"
                        initial={{ x: direction > 0 ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: direction > 0 ? '-100%' : '100%' }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <div className="relative w-full h-full">
                          <AnimatePresence initial={false} custom={slideDirection}>
                            {activeSlide === 0 && (
                              <motion.div
                                key="audio-demos"
                                custom={slideDirection}
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

                            {activeSlide === 1 && (
                              <motion.div
                                key="key-selection"
                                custom={slideDirection}
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
                      </motion.div>
                    )}

                    {/* Progressions Section */}
                    {sectionKey === 'progressions' && (
                      <motion.div
                        key="progressions-content"
                        custom={direction}
                        className="absolute inset-0"
                        initial={{ x: direction > 0 ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: direction > 0 ? '-100%' : '100%' }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ChordEditorCard />
                      </motion.div>
                    )}

                    {/* Scores Section */}
                    {sectionKey === 'scores' && (
                      <motion.div
                        key="scores-content"
                        custom={direction}
                        className="absolute inset-0"
                        initial={{ x: direction > 0 ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: direction > 0 ? '-100%' : '100%' }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <ScoreTransformCard />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Internal Slide Switcher - Only for Keys - Below the card */}
            {section.hasInternalSlides && (
              <motion.div
                className="relative z-10 flex justify-center -mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className="relative bg-[#f0f0f0] rounded-full p-1 flex w-[420px]">
                  <motion.div
                    className="absolute top-1 bottom-1 bg-[#19191b] rounded-full shadow-lg"
                    initial={false}
                    animate={{
                      left: activeSlide === 0 ? '4px' : '50%',
                      width: 'calc(50% - 4px)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                  {section.slides.map((slide) => (
                    <button
                      key={slide.id}
                      onClick={() => handleSlideChange(slide.id)}
                      className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        activeSlide === slide.id ? 'text-white' : 'text-[#5c5b61]'
                      }`}
                    >
                      {slide.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IdeasSection
