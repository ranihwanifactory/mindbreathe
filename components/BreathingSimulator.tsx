import React, { useEffect, useState, useRef, useMemo } from 'react';
import { BreathingPattern, BreathPhase } from '../types';
import { Icons } from '../constants';

interface BreathingSimulatorProps {
  pattern: BreathingPattern;
  onExit: () => void;
}

// Helper to convert time to graph coordinates and status
const getStatusAtTime = (
  elapsedMs: number, 
  pattern: BreathingPattern, 
  totalDurationMs: number
) => {
  const inhaleEnd = pattern.inhale * 1000;
  const holdTopEnd = inhaleEnd + pattern.holdTop * 1000;
  const exhaleEnd = holdTopEnd + pattern.exhale * 1000;

  let xPercent = 0;
  let yPercent = 0; // 0 = Bottom (Empty), 1 = Top (Full)
  let phase = BreathPhase.Inhale;
  let timeLeft = 0;

  // Calculate X based on total time (0 to 1)
  xPercent = elapsedMs / totalDurationMs;

  if (elapsedMs < inhaleEnd) {
    // Inhale Phase
    phase = BreathPhase.Inhale;
    const phaseProgress = elapsedMs / inhaleEnd;
    yPercent = phaseProgress; // 0 -> 1
    timeLeft = (inhaleEnd - elapsedMs) / 1000;
  } else if (elapsedMs < holdTopEnd) {
    // Hold Top Phase
    phase = BreathPhase.HoldTop;
    yPercent = 1; // Stay at Top
    timeLeft = (holdTopEnd - elapsedMs) / 1000;
  } else if (elapsedMs < exhaleEnd) {
    // Exhale Phase
    phase = BreathPhase.Exhale;
    const phaseDuration = pattern.exhale * 1000;
    const timeInPhase = elapsedMs - holdTopEnd;
    yPercent = 1 - (timeInPhase / phaseDuration); // 1 -> 0
    timeLeft = (exhaleEnd - elapsedMs) / 1000;
  } else {
    // Hold Bottom Phase
    phase = BreathPhase.HoldBottom;
    yPercent = 0; // Stay at Bottom
    timeLeft = (totalDurationMs - elapsedMs) / 1000;
  }

  return { xPercent, yPercent, phase, timeLeft };
};

const BreathingSimulator: React.FC<BreathingSimulatorProps> = ({ pattern, onExit }) => {
  const [isActive, setIsActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  
  // Display state
  const [displayPhase, setDisplayPhase] = useState<BreathPhase>(BreathPhase.Inhale);
  const [displayTimer, setDisplayTimer] = useState(pattern.inhale);

  // Animation Refs
  const dotRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  const totalDurationMs = useMemo(() => {
    return (pattern.inhale + pattern.holdTop + pattern.exhale + pattern.holdBottom) * 1000;
  }, [pattern]);

  // Generate SVG Path Definition
  const pathData = useMemo(() => {
    const total = totalDurationMs;
    // X coordinates (normalized 0-100)
    const t1 = (pattern.inhale * 1000 / total) * 100;
    const t2 = ((pattern.inhale + pattern.holdTop) * 1000 / total) * 100;
    const t3 = ((pattern.inhale + pattern.holdTop + pattern.exhale) * 1000 / total) * 100;
    
    // Y coordinates (SVG: 0 is top, 100 is bottom)
    // We want Inhale to go UP (100 -> 0 in SVG y-coords effectively)
    // Let's use padding: Top=10, Bottom=90
    const bottom = 90;
    const top = 10;

    // Start at bottom-left
    let d = `M 0 ${bottom}`;
    // Line to Top (Inhale)
    d += ` L ${t1} ${top}`;
    // Line across Top (Hold)
    d += ` L ${t2} ${top}`;
    // Line to Bottom (Exhale)
    d += ` L ${t3} ${bottom}`;
    // Line across Bottom (Hold)
    d += ` L 100 ${bottom}`;
    
    return d;
  }, [pattern, totalDurationMs]);

  // Animation Loop
  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    
    // Calculate elapsed time considering pauses
    const rawElapsed = time - startTimeRef.current + pausedTimeRef.current;
    
    // Handle Cycle Loop
    let currentElapsed = rawElapsed % totalDurationMs;
    
    // Check for cycle completion
    const newCycleCount = Math.floor(rawElapsed / totalDurationMs);
    if (newCycleCount > cycleCount) {
      setCycleCount(newCycleCount);
    }

    elapsedRef.current = currentElapsed;

    // Get Status
    const status = getStatusAtTime(currentElapsed, pattern, totalDurationMs);

    // Update DOM directly for performance (The Dot)
    if (dotRef.current) {
      // Map xPercent (0-1) to width (0-100%)
      const xPos = status.xPercent * 100;
      // Map yPercent (0-1) to height (SVG coordinates: Top=10, Bottom=90)
      const topY = 10;
      const bottomY = 90;
      const yPos = bottomY - (status.yPercent * (bottomY - topY));

      dotRef.current.style.left = `${xPos}%`;
      dotRef.current.style.top = `${yPos}%`;
    }

    // Update React State for Text
    setDisplayPhase((prev) => (prev !== status.phase ? status.phase : prev));
    setDisplayTimer((prev) => {
      const newTime = Math.ceil(status.timeLeft);
      return newTime !== prev ? newTime : prev;
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      pausedTimeRef.current = elapsedRef.current;
      startTimeRef.current = null;
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, totalDurationMs, cycleCount]);

  const toggleSession = () => {
    setIsActive(!isActive);
  };

  const getPhaseKorean = (p: BreathPhase) => {
    switch (p) {
      case BreathPhase.Inhale: return "들이마시기";
      case BreathPhase.HoldTop: return "숨 참기";
      case BreathPhase.Exhale: return "내쉬기";
      case BreathPhase.HoldBottom: return "숨 참기";
      default: return "";
    }
  };

  const getPhaseColor = (p: BreathPhase) => {
     switch (p) {
      case BreathPhase.Inhale: return "text-calm-300 drop-shadow-[0_0_10px_rgba(125,211,252,0.5)]";
      case BreathPhase.HoldTop: return "text-indigo-300 drop-shadow-[0_0_10px_rgba(165,180,252,0.5)]";
      case BreathPhase.Exhale: return "text-sky-300 drop-shadow-[0_0_10px_rgba(186,230,253,0.5)]";
      case BreathPhase.HoldBottom: return "text-slate-400";
      default: return "text-white";
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
       {/* Background Decor */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className={`absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-calm-900 rounded-full mix-blend-screen filter blur-3xl animate-blob`}></div>
      </div>

      {/* Header */}
      <div className="w-full flex justify-between items-center p-6 z-20">
        <button 
          onClick={onExit}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <Icons.X />
        </button>
        <div className="flex flex-col items-center">
            <h2 className="text-sm uppercase tracking-widest text-calm-400 font-bold">{pattern.name}</h2>
            <span className="text-xs text-slate-500">{pattern.benefit}</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 w-full max-w-3xl px-4 flex flex-col justify-center items-center z-10">
        
        {/* Text Display */}
        <div className="mb-12 text-center h-20 flex flex-col justify-center">
            <div className={`text-4xl md:text-5xl font-bold tracking-tight transition-all duration-300 ${getPhaseColor(displayPhase)}`}>
              {isActive ? getPhaseKorean(displayPhase) : "준비"}
            </div>
        </div>

        {/* The Graph */}
        {/* Removed overflow-hidden to allow large ball to protrude */}
        <div className="relative w-full aspect-[2/1] md:aspect-[3/1] bg-slate-900/50 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm">
            
            {/* Grid Lines (Optional) */}
            <div className="absolute inset-0 opacity-10 rounded-3xl overflow-hidden pointer-events-none">
                <div className="w-full h-full border-b border-slate-500" style={{ height: '90%' }}></div>
                <div className="w-full h-full border-b border-slate-500" style={{ height: '10%' }}></div>
            </div>

            <svg 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full rounded-3xl"
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(56, 189, 248, 0.2)" />
                  <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
                </linearGradient>
              </defs>
              
              {/* Fill Area */}
              <path 
                d={`${pathData} L 100 100 L 0 100 Z`} 
                fill="url(#areaGradient)" 
              />
              
              {/* Stroke Line */}
              <path 
                d={pathData} 
                fill="none" 
                stroke="url(#lineGradient)" 
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* The Moving Dot */}
            <div 
                ref={dotRef}
                className="absolute w-20 h-20 -ml-10 -mt-10 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] z-30 flex items-center justify-center will-change-transform cursor-default select-none"
                style={{ 
                    left: '0%', 
                    top: '90%' // Start at bottom
                }}
            >
                {/* Ping effect */}
                <div className="absolute inset-0 bg-calm-400 rounded-full animate-ping opacity-20"></div>
                
                {/* Timer Number inside the dot */}
                <span className="relative z-10 text-slate-800 text-3xl font-bold font-mono tracking-tighter">
                  {isActive ? displayTimer : pattern.inhale}
                </span>
            </div>
        </div>
        
        {/* X-Axis Labels */}
        <div className="w-full flex justify-between px-2 mt-4 text-xs text-slate-500 font-mono">
            <span>시작</span>
            <span>1사이클 ({totalDurationMs / 1000}초)</span>
        </div>

      </div>

      {/* Footer Controls */}
      <div className="w-full max-w-md p-8 z-20 pb-12">
        {isActive && (
            <div className="text-center text-slate-400 font-mono text-sm mb-6">
                현재 사이클: {cycleCount + 1}회
            </div>
        )}
        <button
          onClick={toggleSession}
          className={`
            w-full py-4 rounded-2xl text-lg font-bold tracking-wide shadow-lg transition-all duration-200 transform active:scale-95
            ${isActive 
              ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' 
              : 'bg-gradient-to-r from-calm-500 to-indigo-500 text-white hover:from-calm-400 hover:to-indigo-400 shadow-calm-500/25'
            }
          `}
        >
          {isActive ? "일시 정지" : "시작하기"}
        </button>
      </div>
    </div>
  );
};

export default BreathingSimulator;