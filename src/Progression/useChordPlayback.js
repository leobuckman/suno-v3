import { useRef, useCallback } from 'react';

// Base frequency for C4
const C4_FREQUENCY = 261.63;

// Semitones from C for each scale degree in major scale
const SCALE_DEGREE_SEMITONES = {
  1: 0,   // C (tonic)
  2: 2,   // D
  3: 4,   // E
  4: 5,   // F
  5: 7,   // G
  6: 9,   // A
  7: 11,  // B
};

// Chord quality intervals (semitones from root)
const QUALITY_INTERVALS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  halfdim: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
};

/**
 * Convert semitones from C4 to frequency
 */
const semitoneToFrequency = (semitones) => {
  return C4_FREQUENCY * Math.pow(2, semitones / 12);
};

/**
 * Get all note frequencies for a chord
 */
const getChordFrequencies = (degree, quality, accidental = 0) => {
  // Get base semitone for the scale degree
  const baseSemitone = SCALE_DEGREE_SEMITONES[degree] + accidental;
  
  // Get intervals for the chord quality
  const intervals = QUALITY_INTERVALS[quality] || QUALITY_INTERVALS.major;
  
  // Calculate frequencies for each note in the chord
  return intervals.map(interval => semitoneToFrequency(baseSemitone + interval));
};

/**
 * Custom hook for playing chord audio feedback
 */
const useChordPlayback = () => {
  const audioContextRef = useRef(null);
  const activeNodesRef = useRef([]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Stop all currently playing notes
   */
  const stopAllNotes = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    activeNodesRef.current.forEach(({ oscillator, gainNode }) => {
      try {
        gainNode.gain.cancelScheduledValues(audioContext.currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    activeNodesRef.current = [];
  }, []);

  /**
   * Play a chord based on degree and quality
   */
  const playChord = useCallback((chord) => {
    const { degree, quality, accidental = 0 } = chord;
    
    const audioContext = getAudioContext();
    
    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Stop any currently playing notes
    stopAllNotes();

    // Get frequencies for the chord
    const frequencies = getChordFrequencies(degree, quality, accidental);
    
    // Create oscillators for each note
    frequencies.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Use sine wave for a softer, organ-like tone
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      // Stagger the attack slightly for a more natural sound
      const attackDelay = index * 0.008;
      const baseGain = 0.15 / frequencies.length; // Normalize volume by number of notes
      
      // Create envelope: attack -> sustain -> release
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseGain, audioContext.currentTime + attackDelay + 0.03);
      gainNode.gain.setValueAtTime(baseGain, audioContext.currentTime + attackDelay + 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime + attackDelay);
      oscillator.stop(audioContext.currentTime + 0.9);
      
      activeNodesRef.current.push({ oscillator, gainNode });
    });
  }, [getAudioContext, stopAllNotes]);

  /**
   * Play a single note (for degree selection)
   */
  const playDegree = useCallback((degree, accidental = 0) => {
    const audioContext = getAudioContext();
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    stopAllNotes();

    const semitone = SCALE_DEGREE_SEMITONES[degree] + accidental;
    const frequency = semitoneToFrequency(semitone);
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
    
    activeNodesRef.current.push({ oscillator, gainNode });
  }, [getAudioContext, stopAllNotes]);

  return { playChord, playDegree, stopAllNotes };
};

export default useChordPlayback;
