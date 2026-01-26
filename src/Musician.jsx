import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
                <div className="relative aspect-[9/10]">
                  <img 
                    src="/recital.jpg" 
                    alt="Senior Recital"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </motion.div>
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
