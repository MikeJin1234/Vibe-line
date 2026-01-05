
import React, { useState } from 'react';
import { AppRole, User } from './types';
import { RoleSelector } from './components/RoleSelector';
import { AudienceView } from './components/AudienceView';
import { DJView } from './components/DJView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vibeline_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [tempRole, setTempRole] = useState<AppRole>(null);
  const [guestName, setGuestName] = useState('');

  const handleRoleSelect = (role: AppRole) => {
    if (role === 'dj') {
      const newUser: User = {
        id: crypto.randomUUID(),
        name: 'DJ Master',
        role: 'dj'
      };
      finalizeUser(newUser);
    } else {
      setTempRole('audience');
    }
  };

  const finalizeUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('vibeline_user', JSON.stringify(newUser));
    setTempRole(null);
    setGuestName('');
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name: guestName.trim(),
      role: 'audience'
    };
    finalizeUser(newUser);
  };

  const handleExit = () => {
    setUser(null);
    localStorage.removeItem('vibeline_user');
  };

  if (!user && tempRole === 'audience') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-sm uppercase tracking-[0.4em] text-gray-500">Identification Required</h2>
            <h1 className="text-4xl font-heading font-bold italic uppercase tracking-tighter">Enter Your Alias</h1>
          </div>
          
          <form onSubmit={handleGuestSubmit} className="space-y-6">
            <input
              autoFocus
              required
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full bg-transparent border-b-2 border-white focus:border-gray-400 outline-none py-4 text-2xl font-heading text-center transition-all"
              placeholder="YOUR NAME"
            />
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTempRole(null)}
                className="flex-1 py-4 border border-white/20 uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-[2] py-4 bg-white text-black uppercase tracking-widest text-xs font-bold hover:bg-gray-200 transition-all"
              >
                Enter Club
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!user) {
    return <RoleSelector onSelect={handleRoleSelect} />;
  }

  return (
    <div className="min-h-screen">
      {user.role === 'dj' ? (
        <DJView user={user} onExit={handleExit} />
      ) : (
        <AudienceView user={user} onExit={handleExit} />
      )}
    </div>
  );
};

export default App;
