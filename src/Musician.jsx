import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play } from 'lucide-react'

const Musician = () => {
  const [showVideo, setShowVideo] = useState(false)

  return (
    <>
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid lg:grid-cols-[5fr_4fr] gap-6 lg:gap-16 items-center max-w-5xl">
          {/* Text Content - Left */}
          <div className="space-y-4 lg:space-y-6 overflow-visible">
            <div>
              <h3 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-ink leading-snug pb-1">
                Musician
              </h3>
            </div>
            
            <div className="space-y-3 lg:space-y-4 text-muted text-base lg:text-lg leading-relaxed overflow-visible">
              <p className="overflow-visible">
                As a double bassist, I learned to provide a foundation for others, listen attentively, and perform under high-stakes conditions—skills developed alongside extensive training in music theory, aural skills, and music history.
              </p>
              <p className="overflow-visible">
                Individualized instruction from members of world-class orchestras reinforced the importance of seeking and integrating feedback from experienced mentors, a practice I carry into any professional environment.                  
              </p>
              <p className="overflow-visible">
                Enjoy a short clip from my Senior Recital this past spring.
              </p>
            </div>
          </div>

          {/* Video - Right */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-lg lg:max-w-xl">
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer" onClick={() => setShowVideo(true)}>
                {/* Video Thumbnail */}
                <div className="relative aspect-[9/12]">
                  <img
                    src="/recital.jpg"
                    alt="Senior Recital"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ objectPosition: '70% center' }}
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Play button and text - bottom left */}
                  <div className="absolute bottom-5 left-5 flex items-center gap-3">
                    <motion.div
                      className="w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #F7A505 0%, #FD2D6C 50%, #F14925 100%)'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play size={16} fill="white" className="text-white lg:w-4.5 lg:h-4.5" />
                    </motion.div>
                    <div className="text-white">
                      <div className="font-semibold text-sm lg:text-base">Bottesini Concerto No. 2</div>
                      <div className="text-xs lg:text-sm text-white/80">Nathan Canfield, piano</div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-2xl overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                onClick={() => setShowVideo(false)}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Video */}
              <video 
                src="/videos/recital.mov" 
                controls 
                autoPlay
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Musician
