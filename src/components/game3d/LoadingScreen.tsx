import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Start fade out after reaching 100%
          setTimeout(() => {
            setFadeOut(true);
            // Notify parent that loading is complete
            setTimeout(() => {
              setIsVisible(false);
              onLoadingComplete?.();
            }, 800);
          }, 500);
          return 100;
        }
        // Random increment for realistic loading feel
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-700 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, hsl(215, 25%, 4%) 0%, hsl(215, 30%, 6%) 100%)',
      }}
    >
      {/* Scanlines effect */}
      <div className="scanlines" />

      {/* Corner brackets */}
      <div className="absolute inset-8">
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-neon-cyan" style={{ borderColor: '#00f0d0' }} />
        <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-neon-cyan" style={{ borderColor: '#00f0d0' }} />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-neon-cyan" style={{ borderColor: '#00f0d0' }} />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-neon-cyan" style={{ borderColor: '#00f0d0' }} />
      </div>

      {/* Title */}
      <div className="mb-2 text-[9px] tracking-[0.5em]" style={{ fontFamily: "'Orbitron', sans-serif", color: '#ffaa00', textShadow: '0 0 8px #ffaa00' }}>3800 CHIPPEWA · BATON ROUGE</div>
      <h1
        className="font-display text-4xl md:text-6xl font-bold mb-1 tracking-wider"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          color: '#fff',
          textShadow: '0 0 10px #00f0d0, 0 0 30px #00f0d0, 0 0 60px rgba(0,240,208,0.4)'
        }}
      >
        NEVER BROKE
      </h1>
      <h1
        className="font-display text-4xl md:text-6xl font-bold mb-2 tracking-wider"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          color: '#00f0d0',
          textShadow: '0 0 10px #00f0d0, 0 0 30px #00f0d0, 0 0 60px rgba(0,240,208,0.5)'
        }}
      >
        AGAIN
      </h1>
      <h2
        className="font-display text-sm md:text-base mb-12 tracking-[0.5em]"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          color: '#f000b8',
          textShadow: '0 0 10px #f000b8, 0 0 20px #f000b8'
        }}
      >
        NBA · STREET CHRONICLES EMPIRE
      </h2>

      {/* Loading bar container */}
      <div className="w-80 md:w-96 relative">
        {/* Progress bar background */}
        <div 
          className="h-1 w-full"
          style={{ background: 'hsl(215, 25%, 15%)' }}
        />
        
        {/* Progress bar fill */}
        <div 
          className="h-1 absolute top-0 left-0 transition-all duration-300 ease-out"
          style={{ 
            width: `${Math.min(progress, 100)}%`,
            background: '#00f0d0',
            boxShadow: '0 0 10px #00f0d0, 0 0 20px #00f0d0'
          }}
        />
        
        {/* Glowing edge effect */}
        <div 
          className="h-2 w-2 absolute top-[-2px] transition-all duration-300 ease-out"
          style={{ 
            left: `${Math.min(progress, 100)}%`,
            background: '#00f0d0',
            boxShadow: '0 0 15px #00f0d0, 0 0 30px #00f0d0',
            transform: 'translateX(-50%)'
          }}
        />
      </div>

      {/* Percentage text */}
      <p 
        className="mt-4 text-sm font-mono tracking-widest"
        style={{ 
          fontFamily: "'Roboto Mono', monospace",
          color: '#00f0d0'
        }}
      >
        {Math.floor(Math.min(progress, 100))}%
      </p>

      {/* Loading text with glitch effect */}
      <div className="mt-8 flex items-center gap-2">
        <span 
          className="text-xs font-mono animate-pulse"
          style={{ 
            fontFamily: "'Roboto Mono', monospace",
            color: 'hsl(215, 15%, 52%)'
          }}
        >
          INITIALIZING
        </span>
        <span 
          className="text-xs font-mono"
          style={{ 
            fontFamily: "'Roboto Mono', monospace",
            color: 'hsl(215, 15%, 52%)'
          }}
        >
          _
        </span>
      </div>

      {/* Decorative grid lines */}
      <div 
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64 h-32 opacity-20"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            #00f0d0 2px,
            #00f0d0 4px
          )`,
          maskImage: 'linear-gradient(to bottom, transparent, black)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)'
        }}
      />
    </div>
  );
}
