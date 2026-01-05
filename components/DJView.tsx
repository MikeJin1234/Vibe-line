
import React, { useState, useEffect, useMemo } from 'react';
import { getRequests, updateRequestStatus, clearAllRequests, getDJPreferences, saveDJPreferences } from '../services/storageService';
import { generateDJShoutout } from '../services/geminiService';
import { SongRequest, User, DJPreferences } from '../types';

interface DJViewProps {
  user: User;
  onExit: () => void;
}

export const DJView: React.FC<DJViewProps> = ({ user, onExit }) => {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [shoutout, setShoutout] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prefs, setPrefs] = useState<DJPreferences>(getDJPreferences());
  const [isEditingPrefs, setIsEditingPrefs] = useState(false);
  const [prefInput, setPrefInput] = useState('');

  const refreshRequests = () => {
    setRequests(getRequests());
  };

  useEffect(() => {
    refreshRequests();
    const handleStorage = () => {
      refreshRequests();
      setPrefs(getDJPreferences());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('storage_update', handleStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('storage_update', handleStorage);
    };
  }, []);

  const handleAction = (id: string, status: SongRequest['status']) => {
    updateRequestStatus(id, status);
    refreshRequests();
  };

  const handleClear = () => {
    if (confirm('Clear all requests?')) {
      clearAllRequests();
      refreshRequests();
    }
  };

  const handleVibeCheck = async (req: SongRequest) => {
    setIsGenerating(true);
    const text = await generateDJShoutout(req.songName, req.artist, req.userName, req.note);
    setShoutout(text);
    setIsGenerating(false);
  };

  const addPrefTag = () => {
    if (!prefInput.trim()) return;
    const newPrefs = { ...prefs, genres: [...new Set([...prefs.genres, prefInput.trim().toLowerCase()])] };
    setPrefs(newPrefs);
    saveDJPreferences(newPrefs);
    setPrefInput('');
  };

  const removePrefTag = (tag: string) => {
    const newPrefs = { ...prefs, genres: prefs.genres.filter(t => t !== tag) };
    setPrefs(newPrefs);
    saveDJPreferences(newPrefs);
  };

  const checkMatch = (req: SongRequest) => {
    const content = `${req.songName} ${req.artist} ${req.note}`.toLowerCase();
    return prefs.genres.some(tag => content.includes(tag));
  };

  const processedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      // First priority: Status (pending first)
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      
      // Second priority: Matches for pending requests
      if (a.status === 'pending' && b.status === 'pending') {
        const aMatch = checkMatch(a);
        const bMatch = checkMatch(b);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
      }
      
      // Third priority: Timestamp
      return b.timestamp - a.timestamp;
    });
  }, [requests, prefs]);

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 max-w-6xl mx-auto flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-white pb-8 gap-4">
        <div>
          <h1 className="text-5xl md:text-7xl font-heading font-black italic tracking-tighter uppercase">DECK CTRL</h1>
          <p className="text-sm text-gray-500 uppercase tracking-[0.3em] mt-2">Active Session: {user.name} @ Main Stage</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsEditingPrefs(!isEditingPrefs)}
            className={`flex-1 md:flex-none text-xs border px-6 py-2 transition-all uppercase tracking-widest font-bold ${isEditingPrefs ? 'bg-white text-black border-white' : 'border-white hover:bg-white hover:text-black'}`}
          >
            {isEditingPrefs ? 'Close Prefs' : 'Set Vibes'}
          </button>
          <button 
            onClick={handleClear}
            className="flex-1 md:flex-none text-xs border border-red-900 text-red-900 px-6 py-2 hover:bg-red-900 hover:text-white transition-all uppercase tracking-widest font-bold"
          >
            Clear Log
          </button>
          <button 
            onClick={onExit}
            className="flex-1 md:flex-none text-xs border border-white px-6 py-2 hover:bg-white hover:text-black transition-all uppercase tracking-widest font-bold"
          >
            End
          </button>
        </div>
      </header>

      {isEditingPrefs && (
        <div className="mb-12 p-8 border border-white bg-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-xl font-heading font-bold mb-4 uppercase tracking-widest">DJ Preferences</h2>
          <p className="text-xs text-gray-500 mb-6 uppercase tracking-tighter">Enter genres, artists, or styles you're feeling tonight. Requests matching these will be highlighted.</p>
          
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={prefInput}
              onChange={(e) => setPrefInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPrefTag()}
              placeholder="e.g. Techno, Daft Punk, Melodic"
              className="flex-1 bg-transparent border-b border-white/30 focus:border-white outline-none py-2 text-sm transition-all"
            />
            <button 
              onClick={addPrefTag}
              className="px-6 py-2 bg-white text-black text-xs font-bold uppercase hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {prefs.genres.length === 0 && <p className="text-xs text-gray-600 italic uppercase">No preferences set...</p>}
            {prefs.genres.map(tag => (
              <span key={tag} className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 text-[10px] uppercase font-bold tracking-widest bg-white/10">
                {tag}
                <button onClick={() => removePrefTag(tag)} className="hover:text-red-500 transition-colors">×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {shoutout && (
        <div className="mb-12 p-6 border-2 border-white bg-white text-black animate-in fade-in slide-in-from-top-4 duration-500 relative">
          <button onClick={() => setShoutout(null)} className="absolute top-2 right-2 font-bold hover:scale-125 transition-transform text-xl">×</button>
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1">AI VIBE CHECK</p>
          <p className="text-xl font-heading font-bold italic">"{shoutout}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center border-l-4 border-white pl-4">
            <h2 className="text-2xl font-heading font-bold uppercase">Requests Queue</h2>
            <span className="bg-white text-black text-xs font-bold px-2 py-1">{pendingCount} PENDING</span>
          </div>

          <div className="space-y-4">
            {processedRequests.length === 0 ? (
              <div className="py-20 border border-dashed border-white/20 flex items-center justify-center">
                <p className="text-gray-600 uppercase tracking-widest animate-pulse">Silence is deafening... waiting for requests</p>
              </div>
            ) : (
              processedRequests.map((req) => {
                const isMatch = checkMatch(req);
                return (
                  <div key={req.id} className={`group border transition-all duration-300 relative ${
                    req.status === 'pending' 
                      ? isMatch ? 'border-white border-2 shadow-[0_0_15px_rgba(255,255,255,0.2)] bg-white/10' : 'border-white/20 bg-white/5'
                      : req.status === 'accepted' ? 'border-green-500 bg-green-500/5' : 'border-white/5 opacity-40'
                  } p-6`}>
                    {isMatch && req.status === 'pending' && (
                      <div className="absolute -top-3 left-4 bg-white text-black text-[9px] font-black px-2 py-0.5 tracking-[0.2em] uppercase">
                        Vibe Match
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] bg-white text-black px-1.5 font-bold">
                            {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Guest: {req.userName}</span>
                        </div>
                        <h3 className="text-2xl font-heading font-bold uppercase tracking-tight">{req.songName}</h3>
                        <p className="text-lg text-gray-400 mb-3">{req.artist}</p>
                        {req.note && (
                          <div className="bg-black/40 p-3 text-xs text-gray-300 border-l-2 border-gray-600 italic">
                            "{req.note}"
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-2 justify-end">
                        {req.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleAction(req.id, 'accepted')}
                              className="flex-1 md:flex-none px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black text-xs font-bold uppercase transition-all"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleAction(req.id, 'rejected')}
                              className="flex-1 md:flex-none px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black text-xs font-bold uppercase transition-all"
                            >
                              Pass
                            </button>
                          </>
                        )}
                        {req.status === 'accepted' && (
                          <button 
                            onClick={() => handleAction(req.id, 'completed')}
                            className="flex-1 md:flex-none px-4 py-2 bg-white text-black hover:bg-black hover:text-white border border-white text-xs font-bold uppercase transition-all"
                          >
                            Played
                          </button>
                        )}
                        <button 
                          disabled={isGenerating}
                          onClick={() => handleVibeCheck(req)}
                          className="flex-1 md:flex-none px-4 py-2 border border-white/40 text-white/40 hover:border-white hover:text-white text-[9px] font-bold uppercase transition-all"
                        >
                          {isGenerating ? 'Analyzing...' : 'Vibe Check'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-8">
           <div className="border-l-4 border-white pl-4">
            <h2 className="text-2xl font-heading font-bold uppercase">Analytics</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 space-y-6">
            <div>
              <p className="text-[10px] text-gray-500 uppercase mb-1">Total Requests</p>
              <p className="text-4xl font-heading font-bold">{requests.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase mb-1">Match Ratio</p>
              <p className="text-4xl font-heading font-bold">
                {requests.length > 0 ? Math.round((requests.filter(r => checkMatch(r)).length / requests.length) * 100) : 0}%
              </p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-[10px] text-gray-500 uppercase mb-4 tracking-widest">Active Genres</p>
              <div className="flex flex-wrap gap-1">
                {prefs.genres.map(g => (
                  <span key={g} className="text-[8px] border border-white/30 px-1 py-0.5 uppercase">{g}</span>
                ))}
                {prefs.genres.length === 0 && <span className="text-[8px] text-gray-600 italic">NONE SET</span>}
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                <span className="text-xs font-bold tracking-widest">SYSTEM ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
