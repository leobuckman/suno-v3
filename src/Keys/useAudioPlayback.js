import { useRef, useCallback } from 'react';

// Note frequencies (Hz) for octave 4
export const NOTE_FREQUENCIES = {
  'C': 261.63,
  'G': 392.00,
  'D': 293.66,
  'A': 440.00,
  'E': 329.63,
  'B': 493.88,
  'F♯/G♭': 369.99,
  'D♭': 277.18,
  'A♭': 415.30,
  'E♭': 311.13,
  'B♭': 466.16,
  'F': 349.23,
  // Minor keys (same root frequency)
  'Am': 440.00,
  'Em': 329.63,
  'Bm': 493.88,
  'F♯m': 369.99,
  'C♯m': 277.18,
  'G♯m': 415.30,
  'D♯m/E♭m': 311.13,
  'B♭m': 466.16,
  'Fm': 349.23,
  'Cm': 261.63,
  'Gm': 392.00,
  'Dm': 293.66,
};

/**
 * Custom hook for managing audio playback of musical keys
 * @returns {Object} Object containing playNote and stopNote functions
 */
const useAudioPlayback = () => {
  const audioContextRef = useRef(null);
  const activeOscillatorsRef = useRef({});

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playNote = useCallback((keyName) => {
    const frequency = NOTE_FREQUENCIES[keyName];
    if (!frequency) return;

    const audioContext = getAudioContext();
    
    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Stop any existing oscillator for this key
    if (activeOscillatorsRef.current[keyName]) {
      const { oscillator } = activeOscillatorsRef.current[keyName];
      oscillator.stop();
      delete activeOscillatorsRef.current[keyName];
    }

    // Create oscillator for a piano-like tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Use triangle wave for a softer, more musical tone
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Create envelope for piano-like attack and sustain
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.15, audioContext.currentTime + 0.1); // Decay to sustain
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    activeOscillatorsRef.current[keyName] = { oscillator, gainNode };
  }, [getAudioContext]);

  const stopNote = useCallback((keyName) => {
    const active = activeOscillatorsRef.current[keyName];
    if (active) {
      const { oscillator, gainNode } = active;
      const audioContext = getAudioContext();
      
      // Smooth release
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.stop(audioContext.currentTime + 0.3);
      delete activeOscillatorsRef.current[keyName];
    }
  }, [getAudioContext]);

  return { playNote, stopNote };
};

export default useAudioPlayback;
