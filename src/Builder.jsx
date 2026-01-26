import { motion } from 'framer-motion'

const tools = [
  { name: 'Swift', logo: '/Logos/Swift.png' },
  { name: 'Figma', logo: '/Logos/Figma.png' },
  { name: 'Cursor', logo: '/Logos/Cursor.png' },
  { name: 'GitHub', logo: '/Logos/GitHub.png' },
  { name: 'Gemini', logo: '/Logos/Gemini.png' },
  { name: 'Claude', logo: '/Logos/Claude.png' },
  { name: 'OpenAI', logo: '/Logos/OpenAI.png' },
  { name: 'Python', logo: '/Logos/Python.png' },
  { name: 'React', logo: '/Logos/React.png' },
  { name: 'Tailwind', logo: '/Logos/Tailwind.png' },
  { name: 'Vercel', logo: '/Logos/Vercel.png' },
]

// Logo Columns Component
const LogoColumns = () => {
  // Split tools into two columns
  const col1 = tools.filter((_, i) => i % 2 === 0)
  const col2 = tools.filter((_, i) => i % 2 === 1)
  
  // Duplicate for seamless loop
  const col1Logos = [...col1, ...col1]
  const col2Logos = [...col2, ...col2]

  return (
    <div className="flex gap-1 lg:gap-2 h-full overflow-visible">
      {/* Column 1 - moves up */}
      <div 
        className="overflow-x-visible overflow-y-hidden px-4"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      >
        <motion.div
          className="flex flex-col items-center gap-6 lg:gap-8 px-2"
          animate={{ y: ['0%', '-50%'] }}
          transition={{
            y: {
              duration: 35,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {col1Logos.map((tool, index) => (
            <div key={`col1-${index}`} className="flex-shrink-0 relative">
              <div className="absolute -inset-2 bg-black/[0.09] rounded-full blur-md" />
              <img
                src={tool.logo}
                alt={tool.name}
                className="relative w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain opacity-80"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Column 2 - moves down */}
      <div 
        className="overflow-x-visible overflow-y-hidden px-4"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      >
        <motion.div
          className="flex flex-col items-center gap-6 lg:gap-8 px-2"
          initial={{ y: '-50%' }}
          animate={{ y: '0%' }}
          transition={{
            y: {
              duration: 35,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {col2Logos.map((tool, index) => (
            <div key={`col2-${index}`} className="flex-shrink-0 relative">
              <div className="absolute -inset-2 bg-black/[0.09] rounded-full blur-md" />
              <img
                src={tool.logo}
                alt={tool.name}
                className="relative w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain opacity-80"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

const Builder = () => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
    >
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6 lg:gap-12 items-center max-w-4xl">
        {/* Text Content - Left */}
        <div className="space-y-4 lg:space-y-6 overflow-visible">
          <h3 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-ink leading-snug pb-1">
            Builder
          </h3>
          
          <div className="space-y-3 lg:space-y-4 text-muted text-base lg:text-lg leading-relaxed overflow-visible">
            <p className="overflow-visible">
              I've always loved to build things.
            </p>
            <p className="overflow-visible">
              In middle school, I would pick random places on the globe and design Snapchat geofilters for them; by high school, that curiosity had grown into developing and publishing a couple iOS apps. At Northwestern, I spent a summer leading a small team in the design and development of a website for an e-commerce startup, alongside building a wide range of projects for my coursework.
            </p>
            <p className="overflow-visible">
              I pride myself on my ability to quickly adapt to new technologies—whether that meant transitioning from UIKit to SwiftUI, Adobe XD to Figma, or navigating the rapidly expanding ecosystem of AI tools at my disposal.
            </p>
          </div>
        </div>

        {/* Logo Columns - Right */}
        <div className="w-full flex justify-center">
          <div className="relative flex flex-col items-center">
            <p className="text-muted text-xs uppercase tracking-widest mb-10">Tools I use</p>
            <div className="h-80 md:h-96 lg:h-[25rem]">
              <LogoColumns />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Builder
