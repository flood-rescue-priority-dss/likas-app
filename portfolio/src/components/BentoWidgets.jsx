import React, { useState, useEffect, useRef } from 'react';
import { Music, Coffee, Clock, Sparkles, RefreshCw, Volume2, VolumeX } from 'lucide-react';

export default function BentoWidgets() {
  // --- 1. Pixel Art Canvas ---
  const [pixels, setPixels] = useState(Array(64).fill(false));
  const [paintColor, setPaintColor] = useState('pink'); // 'pink', 'purple', 'clear'

  const togglePixel = (index) => {
    const newPixels = [...pixels];
    if (paintColor === 'clear') {
      newPixels[index] = false;
    } else {
      newPixels[index] = paintColor; // stores color name or falsy
    }
    setPixels(newPixels);
  };

  const clearCanvas = () => {
    setPixels(Array(64).fill(false));
  };

  // --- 2. Retro Cassette Player & Web Audio Synth ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const audioCtxRef = useRef(null);
  const synthTimerRef = useRef(null);

  // Play a soft synth progression using Web Audio API
  const playSynthNode = (freq, duration, type = 'sine') => {
    if (!audioCtxRef.current || audioMuted) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      // Soft lofi filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.1); // soft volume
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      // Initialize AudioContext on user interaction
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      let step = 0;
      // Simple pleasant chord progression (Cmaj7, Am7, Fmaj7, G)
      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
        [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
        [174.61, 220.00, 261.63, 349.23], // Fmaj7 (F3, A3, C4, F4)
        [196.00, 246.94, 293.66, 392.00]  // G (G3, B3, D4, G4)
      ];

      const interval = setInterval(() => {
        const chord = chords[step % chords.length];
        // Play chord notes with slight offsets
        chord.forEach((freq, idx) => {
          setTimeout(() => {
            playSynthNode(freq, 2.5, 'triangle');
          }, idx * 150);
        });
        step++;
      }, 3000);

      synthTimerRef.current = interval;
    } else {
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }
    }

    return () => {
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }
    };
  }, [isPlaying, audioMuted]);

  const toggleCassette = () => {
    setIsPlaying(!isPlaying);
  };

  // --- 3. Coffee Clicker ---
  const [coffeeCount, setCoffeeCount] = useState(() => {
    const saved = localStorage.getItem('portfolio_coffee_clicks');
    return saved ? parseInt(saved, 10) : 0;
  });

  const addCoffee = () => {
    const nextVal = coffeeCount + 1;
    setCoffeeCount(nextVal);
    localStorage.setItem('portfolio_coffee_clicks', nextVal.toString());
  };

  const resetCoffee = (e) => {
    e.stopPropagation();
    setCoffeeCount(0);
    localStorage.setItem('portfolio_coffee_clicks', '0');
  };

  // --- 4. Local Time ---
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTimeStr(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="widgets" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '12px' }}>
          Interactive <span className="gradient-text">Playground</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Clean React widgets built with state management and native browser APIs. Tap, draw, or play some beats.
        </p>
      </div>

      <div className="bento-grid">
        {/* Pixel Art Card (Col 8) */}
        <div className="glass-card col-8" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                Pixel Art Canvas
              </h3>
              <button 
                onClick={clearCanvas} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-secondary)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontSize: '0.8rem',
                  transition: 'var(--transition)'
                }}
                className="hover-white"
              >
                <RefreshCw size={12} /> Clear
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Click cells to draw. Select your paint color below:
            </p>
          </div>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', margin: '20px 0' }}>
            <div className="pixel-art-grid">
              {pixels.map((activeColor, idx) => (
                <div
                  key={idx}
                  onClick={() => togglePixel(idx)}
                  className={`pixel-cell ${activeColor ? 'active' : ''}`}
                  style={{
                    backgroundColor: activeColor === 'pink' ? 'var(--primary)' : activeColor === 'purple' ? 'var(--secondary)' : activeColor ? 'rgba(255,255,255,0.7)' : ''
                  }}
                />
              ))}
            </div>

            {/* Colors picker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => setPaintColor('pink')} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${paintColor === 'pink' ? 'var(--primary)' : 'var(--border-color)'}`,
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                Pink Neon
              </button>
              <button 
                onClick={() => setPaintColor('purple')} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${paintColor === 'purple' ? 'var(--secondary)' : 'var(--border-color)'}`,
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--secondary)' }}></span>
                Purple Neon
              </button>
              <button 
                onClick={() => setPaintColor('clear')} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${paintColor === 'clear' ? 'white' : 'var(--border-color)'}`,
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px dashed white', background: 'transparent' }}></span>
                Eraser
              </button>
            </div>
          </div>
        </div>

        {/* Cassette Tape Card (Col 4) */}
        <div className="glass-card col-4" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
              <Music size={18} style={{ color: 'var(--secondary)' }} />
              Retro Lofi Deck
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Synthesizer loop made with Web Audio API. Play to listen.
            </p>
          </div>

          <div 
            className="cassette-container" 
            onClick={toggleCassette}
          >
            <div className="cassette-label">
              ALEX_LOFI_LOOP.JS
            </div>
            <div className="cassette-window">
              <div className={`cassette-spindle ${isPlaying ? 'cassette-spinning' : ''}`}></div>
              <div className={`cassette-spindle ${isPlaying ? 'cassette-spinning' : ''}`}></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
            <button 
              onClick={toggleCassette} 
              className="btn btn-secondary" 
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              {isPlaying ? 'Pause Loop' : 'Play Loop'}
            </button>
            <button 
              onClick={() => setAudioMuted(!audioMuted)} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              className="hover-white"
              title={audioMuted ? "Unmute sound" : "Mute sound"}
            >
              {audioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>

        {/* Coffee Clicker Card (Col 6) */}
        <div className="glass-card col-6" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coffee size={18} style={{ color: '#b45309' }} />
                Coffee Clicker
              </h3>
              {coffeeCount > 0 && (
                <button 
                  onClick={resetCoffee} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}
                  className="hover-white"
                >
                  Reset
                </button>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Add a coffee to support the developer! Progress is saved.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '12px 0' }}>
            <div 
              onClick={addCoffee}
              style={{ 
                fontSize: '3rem', 
                cursor: 'pointer', 
                transition: 'transform 0.1s ease',
                transform: 'scale(1)',
                userSelect: 'none'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ☕
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '1.4rem' }}>
                {coffeeCount} <span style={{ fontSize: '0.95rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>Cuppas Brewed</span>
              </div>
              <div className="coffee-bar-track">
                <div 
                  className="coffee-bar-fill" 
                  style={{ width: `${Math.min(coffeeCount * 5, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button 
            onClick={addCoffee} 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Brew One Coffee
          </button>
        </div>

        {/* Local Time Card (Col 6) */}
        <div className="glass-card col-6" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              Developer Local Time
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Synced with the developer's timezone clock.
            </p>
          </div>

          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.8rem', 
              fontWeight: '700', 
              fontFamily: 'monospace',
              letterSpacing: '1px',
              color: 'white',
              textShadow: '0 0 10px rgba(255,255,255,0.05)'
            }}>
              {timeStr || '12:00:00 AM'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '1.2rem' }}>🕒</span>
            <span>Running on UTC/Local client synchrony.</span>
          </div>
        </div>
      </div>

      <style>{`
        .hover-white:hover {
          color: white !important;
        }
      `}</style>
    </section>
  );
}
