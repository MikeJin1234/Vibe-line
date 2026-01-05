
import React from 'react';
import { AppRole } from '../types';

interface RoleSelectorProps {
  onSelect: (role: AppRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tighter uppercase italic">
          VIBELINE
        </h1>
        <p className="text-gray-400 text-sm md:text-base tracking-[0.2em] uppercase">
          Connect with the Pulse
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl">
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

      <p className="mt-16 text-gray-700 text-xs tracking-widest font-light">
        MINIMALIST CLUB INTERACTIVE SYSTEM v1.0
      </p>
    </div>
  );
};
