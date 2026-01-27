import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Plus, 
  X,
  Volume2,
  Play,
  Square,
} from 'lucide-react';
import useChordPlayback from './useChordPlayback';

/**
 * ------------------------------------------------------------------
 * DATA MODELS & UTILS
 * ------------------------------------------------------------------
 */

const QUALITIES = {
  major: { label: 'Maj', interval: [0, 4, 7] },
  minor: { label: 'min', interval: [0, 3, 7] },
  dim: { label: 'dim', interval: [0, 3, 6] },
  aug: { label: 'aug', interval: [0, 4, 8] },
  dom7: { label: '7', interval: [0, 4, 7, 10] },
  maj7: { label: 'Maj7', interval: [0, 4, 7, 11] },
  min7: { label: 'min7', interval: [0, 3, 7, 10] },
  halfdim: { label: 'm7b5', interval: [0, 3, 6, 10] },
  dim7: { label: 'dim7', interval: [0, 3, 6, 9] },
};

const ROMAN = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII'
};

const createChord = () => ({
  id: crypto.randomUUID(),
  degree: 1, 
  accidental: 0, 
  quality: 'major',
  inversion: 0,
  secondary: null, 
  customBass: null
});

const getChordDisplayName = (chord) => {
  let acc = chord.accidental === -1 ? '♭' : chord.accidental === 1 ? '♯' : '';
  let roman = ROMAN[chord.degree] || '?';
  
  const isMinorISH = ['minor', 'dim', 'min7', 'halfdim', 'dim7'].includes(chord.quality);
  if (isMinorISH) roman = roman.toLowerCase();

  let qualitySuffix = '';
  switch(chord.quality) {
    case 'aug': qualitySuffix = '+'; break;
    case 'dim': qualitySuffix = '°'; break;
    case 'halfdim': qualitySuffix = 'ø7'; break;
    case 'dim7': qualitySuffix = '°7'; break;
    case 'dom7': qualitySuffix = '7'; break;
    case 'maj7': qualitySuffix = 'M7'; break;
    case 'min7': qualitySuffix = '7'; break; 
    default: break;
  }

  let text = `${acc}${roman}${qualitySuffix}`;
  if (chord.secondary) text += `/${ROMAN[chord.secondary]}`;
  if (chord.inversion > 0) {
    const bassMap = { 1: 3, 2: 5, 3: 7 };
    text += `/${bassMap[chord.inversion]}`;
  }
  return text;
};

/**
 * ------------------------------------------------------------------
 * COMPONENTS
 * ------------------------------------------------------------------
 */

const ChordPill = ({ chord, isActive, isPlaying, onClick, onDelete, onPlay }) => (
  <div 
    className={`
      group relative flex flex-col items-center justify-center 
      w-28 h-40 rounded-2xl transition-colors select-none cursor-grab active:cursor-grabbing border-2
      ${isPlaying 
        ? 'bg-[#101012] border-[#FF1493]' 
        : isActive 
          ? 'bg-[#272729] border-transparent' 
          : 'bg-[#101012] border-transparent'}
    `}
    onClick={onClick}
  >
    <button 
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
      className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <X size={14} strokeWidth={3} />
    </button>

    {/* Play button */}
    <button 
      onClick={(e) => { e.stopPropagation(); onPlay(); }}
      className="absolute top-2 left-2 text-zinc-600 hover:text-[#FF1493] p-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
    >
      <Volume2 size={14} strokeWidth={2.5} />
    </button>

    <span className="text-3xl font-serif font-bold text-white">
      {getChordDisplayName(chord).split('/')[0]}
    </span>
    
    {(chord.secondary || chord.inversion > 0) && (
      <span className="text-sm font-medium text-zinc-500 mt-2 border-t border-zinc-800 pt-2 w-16 text-center">
        {chord.secondary && `/${ROMAN[chord.secondary]}`}
        {chord.inversion > 0 && (chord.secondary ? ` ` : `/`) + (chord.inversion === 1 ? '3' : chord.inversion === 2 ? '5' : '7')}
      </span>
    )}
    
    <div className="absolute bottom-4 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
      {chord.quality === 'major' || chord.quality === 'minor' ? '' : chord.quality}
    </div>
  </div>
);

// Add Chord Button with hover state for dashed border
const AddChordButton = ({ onClick, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);
  const borderColor = isHovered && !disabled ? '#ffffff' : '#52525b';
  
  return (
    <div className="snap-center shrink-0 p-[2px]">
      <button 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-28 h-40 rounded-2xl flex items-center justify-center bg-transparent transition-all border-2 border-dashed ${disabled ? 'opacity-50 cursor-not-allowed text-zinc-600 border-zinc-600' : 'text-zinc-600 hover:text-white'}`}
        style={{
          borderColor: borderColor,
        }}
      >
        <Plus size={28} strokeWidth={2} />
      </button>
    </div>
  );
};

// Unified Persistent Editor Panel
const EditorPanel = ({ chord, onChange, playChord }) => {
  const update = (field, value) => {
    const newChord = { ...chord, [field]: value };
    onChange(newChord);
    // Play full chord audio feedback for any change
    playChord(newChord);
  };

  // View State for UI Toggles (Does not affect data)
  const is7th = ['dom7', 'maj7', 'min7', 'halfdim', 'dim7'].includes(chord.quality);
  const [qualityTab, setQualityTab] = useState(is7th ? '7th' : 'triad');
  
  // Update UI tab if the chord data changes externally
  useEffect(() => {
    const _is7th = ['dom7', 'maj7', 'min7', 'halfdim', 'dim7'].includes(chord.quality);
    setQualityTab(_is7th ? '7th' : 'triad');
  }, [chord.id, chord.quality]);

  return (
    <div className="w-full bg-[#19191B] px-5 pt-3 pb-4 flex flex-col gap-3 h-[210px]"> 
      
      {/* 1. PRIMARY ROW: Root & Accidental */}
      <div className="flex gap-4 h-12">
         {/* Accidentals */}
         <div className="flex bg-[#101012] p-1 rounded-lg gap-1 shrink-0">
            {[-1, 0, 1].map(acc => (
                <button 
                    key={acc} 
                    onClick={() => update('accidental', acc)} 
                    className={`w-10 rounded-md flex items-center justify-center text-sm font-serif transition-colors
                    ${chord.accidental === acc ? 'bg-[#272729] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    {acc === -1 ? '♭' : acc === 1 ? '♯' : '♮'}
                </button>
            ))}
         </div>

         {/* Degrees */}
         <div className="flex-1 grid grid-cols-7 gap-1 bg-[#101012] p-1 rounded-lg">
             {[1, 2, 3, 4, 5, 6, 7].map(deg => (
                <button 
                    key={deg} 
                    onClick={() => update('degree', deg)} 
                    className={`rounded-md font-serif font-bold text-lg transition-all
                    ${chord.degree === deg ? 'bg-[#272729] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    {ROMAN[deg]}
                </button>
             ))}
         </div>
      </div>

      {/* 2. QUALITY SELECTION - Matching widths to row above */}
      <div className="flex gap-4 h-12">
         {/* Quality Tabs - Rectangle matching accidentals width */}
         <div className="flex bg-[#101012] p-1 rounded-lg gap-1 shrink-0 relative">
            {/* Sliding indicator */}
            <motion.div
              className="absolute top-1 bottom-1 bg-[#272729] rounded-md"
              initial={false}
              animate={{
                left: qualityTab === 'triad' ? '4px' : 'calc(50%)',
                width: 'calc(50% - 6px)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            <button 
                onClick={() => setQualityTab('triad')}
                className={`relative z-10 w-[62px] text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${qualityTab === 'triad' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Triads
            </button>
            <button 
                onClick={() => setQualityTab('7th')}
                className={`relative z-10 w-[62px] text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${qualityTab === '7th' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                7ths
            </button>
         </div>
         
         {/* Quality Buttons - fills remaining space matching degrees row */}
         <div className="flex-1 bg-[#101012] p-1 rounded-lg">
            {qualityTab === 'triad' ? (
                <div className="grid grid-cols-4 gap-1 h-full">
                    {['major', 'minor', 'dim', 'aug'].map(q => (
                        <button 
                            key={q} 
                            onClick={() => update('quality', q)} 
                            className={`rounded-md text-xs font-medium transition-all ${chord.quality === q ? 'bg-[#272729] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {QUALITIES[q].label}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-1 h-full">
                    {['dom7', 'maj7', 'min7', 'halfdim', 'dim7'].map(q => (
                        <button 
                            key={q} 
                            onClick={() => update('quality', q)} 
                            className={`rounded-md text-xs font-medium transition-all ${chord.quality === q ? 'bg-[#272729] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {QUALITIES[q].label}
                        </button>
                    ))}
                </div>
            )}
         </div>
      </div>
      
      {/* 3. CONTEXT (Placeholder for POC) */}
      <div className="flex-1 flex items-start justify-center pt-2 opacity-40">
          <span className="text-xs text-zinc-500 italic font-serif tracking-wide">... further options</span>
      </div>

    </div>
  );
};

// Chord Editor Card Component
const ChordEditorCard = () => {
  // Separate ORDER from DATA to prevent layout animations on property changes
  const [chordOrder, setChordOrder] = useState([]); // Array of IDs - only changes on reorder/add/remove
  const [chordsById, setChordsById] = useState({}); // Object keyed by ID - changes on property updates
  
  const [selectedId, setSelectedId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playbackTimeoutRef = useRef(null);
  const listRef = useRef(null);
  const selectedChord = useMemo(() => chordsById[selectedId], [chordsById, selectedId]);
  
  // Audio playback hook
  const { playChord, stopAllNotes } = useChordPlayback();

  // Play all chords sequentially
  const playAllChords = useCallback(() => {
    if (chordOrder.length === 0) return;
    
    setIsPlayingAll(true);
    let currentIndex = 0;
    
    const playNext = () => {
      if (currentIndex >= chordOrder.length) {
        // Finished playing all chords
        setPlayingId(null);
        setIsPlayingAll(false);
        return;
      }
      
      const chordId = chordOrder[currentIndex];
      const chord = chordsById[chordId];
      setPlayingId(chordId);
      playChord(chord);
      currentIndex++;
      
      // Schedule next chord (duration matches the chord audio length ~0.8s)
      playbackTimeoutRef.current = setTimeout(playNext, 700);
    };
    
    playNext();
  }, [chordOrder, chordsById, playChord]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    stopAllNotes();
    setPlayingId(null);
    setIsPlayingAll(false);
  }, [stopAllNotes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  // Stop playback if chords change
  useEffect(() => {
    if (isPlayingAll) {
      stopPlayback();
    }
  }, [chordOrder.length]);

  useEffect(() => {
    if (!selectedChord && chordOrder.length > 0) {
      setSelectedId(chordOrder[0]);
    }
  }, [chordOrder.length, selectedChord]);

  const addChord = () => {
    const newChord = createChord();
    // Update both order and data
    setChordOrder(prev => [...prev, newChord.id]);
    setChordsById(prev => ({ ...prev, [newChord.id]: newChord }));
    setSelectedId(newChord.id); 
    setTimeout(() => {
        if (listRef.current) listRef.current.scrollTo({ left: listRef.current.scrollWidth, behavior: 'smooth' });
    }, 10);
  };

  const updateChord = (newChord) => {
    // Only update chordsById, NOT chordOrder - this prevents layout animations
    setChordsById(prev => ({ ...prev, [newChord.id]: newChord }));
  };

  const removeChord = (id) => {
    const idx = chordOrder.indexOf(id);
    const newOrder = chordOrder.filter(cid => cid !== id);
    setChordOrder(newOrder);
    setChordsById(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (newOrder.length > 0) {
        const nextId = newOrder[idx] || newOrder[idx - 1];
        setSelectedId(nextId);
    } else {
        setSelectedId(null);
    }
  };

  return (
    <div className="w-full h-full bg-[#19191B] relative flex flex-col">
      
      {/* Play All Button - Top right (hidden when empty) */}
      {chordOrder.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              isPlayingAll ? stopPlayback() : playAllChords(); 
            }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all
              ${isPlayingAll 
                ? 'bg-[#FF1493] text-white hover:bg-[#e01280]' 
                : 'bg-[#272729] text-zinc-300 hover:bg-[#333335] hover:text-white'}
            `}
          >
            {isPlayingAll ? (
              <>
                <Square size={14} fill="currentColor" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Play All</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Middle: Horizontal List - Flex-1 and justify-end to push content down */}
      <div 
        className="flex-1 relative flex flex-col justify-end pb-2" 
        onClick={() => setSelectedId(null)}
      >
        <Reorder.Group 
          ref={listRef}
          axis="x"
          values={chordOrder}
          onReorder={(newIdOrder) => { 
            if (!isPlayingAll) {
              setChordOrder(newIdOrder);
            }
          }}
          className="flex items-center overflow-x-auto px-8 pt-16 pb-2 gap-6 snap-x hide-scrollbar"
        >
          {chordOrder.map((chordId) => {
            const chord = chordsById[chordId];
            if (!chord) return null;
            return (
            <Reorder.Item 
              key={chordId} 
              value={chordId}
              className="snap-center shrink-0"
              onClick={(e) => e.stopPropagation()}
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              whileDrag={isPlayingAll ? {} : { scale: 1.08, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 25 }}
              transition={{ opacity: { duration: 0 }, scale: { type: "spring", stiffness: 300, damping: 25 } }}
              drag={!isPlayingAll}
              style={{ x: 0, y: 0 }}
            >
              <ChordPill 
                chord={chord} 
                isActive={selectedId === chordId}
                isPlaying={playingId === chordId}
                onClick={() => setSelectedId(chordId)}
                onDelete={() => { if (!isPlayingAll) removeChord(chordId); }}
                onPlay={() => { if (!isPlayingAll) playChord(chord); }}
              />
            </Reorder.Item>
          );})}

          <AddChordButton 
            onClick={(e) => { e.stopPropagation(); if (!isPlayingAll) addChord(); }}
            disabled={isPlayingAll}
          />
          <div className="w-12 shrink-0"></div>
        </Reorder.Group>
      </div>

      {/* Bottom: Persistent Editor Panel */}
      <div className="flex-none flex flex-col justify-end">
          <EditorPanel 
            chord={selectedChord || { id: 'default', degree: 1, accidental: 0, quality: 'major', inversion: 0, secondary: null, customBass: null }} 
            onChange={selectedChord ? updateChord : () => {}} 
            playChord={playChord}
          />
      </div>
      
    </div>
  );
};

// Main Section Component (matching KeysSection layout)
const ProgressionSection = () => {
  return (
    <div className="relative overflow-visible">
      <div className="w-full relative overflow-visible flex justify-center">
        {/* Main Content - Text on left, Card on right */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start overflow-visible">
          {/* Text Content - Left side */}
          <motion.div
            className="space-y-4 overflow-visible lg:w-[450px] flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-ink leading-relaxed pb-2">
              Build Progressions
            </h2>
            
            {/* Bullet Points List - Vertical */}
            <div className="flex flex-col gap-3">
              {[
                "Chord progressions are the backbone of any song, defining its harmonic journey and emotional arc. From the classic ii-V-I to more adventurous borrowed chords, progressions shape how music feels.",
                "This editor lets users craft custom chord sequences using Roman numeral notation—a universal language that works across any key. Select degrees, adjust qualities, and play the chords back.",
              ].map((point, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                >
                  <span className="flex-shrink-0 leading-relaxed text-[#e63946]">•</span>
                  <p className="text-lg leading-relaxed font-normal text-ink">
                    {point}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Interactive Content - Right side */}
          {/* Sized directly without scale transform to prevent Framer Motion coordinate issues */}
          <div className="w-[745px] h-[425px] relative overflow-visible flex-shrink-0">
            <motion.div
              className="overflow-visible"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Card Container - Sized directly to intended dimensions */}
              <div className="bg-[#19191b] overflow-hidden relative rounded-[22px] w-[745px] h-[425px] ring-1 ring-white/5 shadow-2xl">
              <ChordEditorCard />
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressionSection;
