
import React from 'react';
import { AppRole } from '../types';

interface RoleSelectorProps {
  onSelect: (role: AppRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6 relative">
      {/* Powered By Branding - Now consistently highlighted */}
      <div className="absolute top-8 left-8 flex items-center gap-3 cursor-default animate-in fade-in duration-700">
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          Powered by
        </span>
        <div className="w-10 h-10 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(255,107,0,0.4)]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* The 'C' Shape - Inverted for dark theme (White) */}
            <path 
              d="M75,25 C65,15 50,15 40,20 C25,30 25,70 40,80 C50,85 65,85 75,75 L85,85 C70,100 30,100 15,75 C0,50 0,30 15,15 C30,0 70,0 85,15 Z" 
              fill="white" 
            />
            {/* The Flame Shape - Vivid Orange */}
            <path 
              d="M50,35 C55,45 65,50 65,65 C65,75 58,82 50,82 C42,82 35,75 35,65 C35,50 45,45 50,35 Z" 
              fill="#FF6B00" 
            />
            {/* The Black Central Element */}
            <path 
              d="M50,50 C53,55 58,58 58,68 C58,73 54,77 50,77 C46,77 42,73 42,68 C42,58 47,55 50,50 Z" 
              fill="black" 
            />
          </svg>
        </div>
      </div>

      <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tighter uppercase italic">
          VIBELINE
        </h1>
        <p className="text-gray-400 text-sm md:text-base tracking-[0.2em] uppercase">
          Connect with the Pulse
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl animate-in fade-in zoom-in duration-700 delay-300">
        <button
          onClick={() => onSelect('dj')}
          className="flex-1 group relative overflow-hidden border border-white p-12 hover:bg-white transition-all duration-500 ease-in-out"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-heading font-bold mb-2 group-hover:text-black transition-colors">I AM DJ</h2>
            <p className="text-gray-500 text-sm group-hover:text-black/60 transition-colors uppercase tracking-widest">Control the Setlist</p>
          </div>
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        </button>

        <button
          onClick={() => onSelect('audience')}
          className="flex-1 group relative overflow-hidden border border-white p-12 hover:bg-white transition-all duration-500 ease-in-out"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-heading font-bold mb-2 group-hover:text-black transition-colors">I AM GUEST</h2>
            <p className="text-gray-500 text-sm group-hover:text-black/60 transition-colors uppercase tracking-widest">Request a Track</p>
          </div>
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        </button>
      </div>

      <p className="mt-16 text-gray-700 text-xs tracking-widest font-light uppercase">
        Minimalist Club Interactive System v1.1
      </p>
    </div>
  );
};
