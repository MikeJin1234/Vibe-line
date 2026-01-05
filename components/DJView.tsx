
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
    const content = `${req.songName} ${req.artist} ${req.vibe} ${req.note}`.toLowerCase();
    return prefs.genres.some(tag => content.includes(tag));
  };

  const processedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      // Priority 1: Status (Pending > Accepted > Completed > Paid/Rejected)
      const statusOrder = { 'pending': 0, 'accepted': 1, 'completed': 2, 'paid': 3, 'rejected': 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      // Priority 2: High Bid (For pending requests)
      if (a.status === 'pending' && b.status === 'pending') {
        const aBid = parseFloat(a.bidAmount || '0');
        const bBid = parseFloat(b.bidAmount || '0');
        if (aBid !== bBid) return bBid - aBid;
        
        // Priority 3: Matches
        const aMatch = checkMatch(a);
        const bMatch = checkMatch(b);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
      }
      
      // Priority 4: Timestamp
      return b.timestamp - a.timestamp;
    });
  }, [requests, prefs]);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const totalBids = requests.reduce((sum, req) => sum + (req.status === 'paid' ? parseFloat(req.bidAmount || '0') : 0), 0);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 max-w-7xl mx-auto flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-white pb-8 gap-4">
        <div>
          <h1 className="text-5xl md:text-7xl font-heading font-black italic tracking-tighter uppercase">DECK CTRL</h1>
          <p className="text-sm text-gray-500 uppercase tracking-[0.3em] mt-2">Active Session: {user.name} @ {totalBids.toFixed(2)} USD EARNED</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
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
            <div className="flex gap-2">
              <span className="bg-white text-black text-xs font-bold px-2 py-1 uppercase">{pendingCount} PENDING</span>
              <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 uppercase">BIDS ACTIVE</span>
            </div>
          </div>

          <div className="space-y-4">
            {processedRequests.length === 0 ? (
              <div className="py-20 border border-dashed border-white/20 flex items-center justify-center">
                <p className="text-gray-600 uppercase tracking-widest animate-pulse">Silence is deafening... waiting for requests</p>
              </div>
            ) : (
              processedRequests.map((req) => {
                const isMatch = checkMatch(req);
                const isHighBid = parseFloat(req.bidAmount || '0') > 0;
                
                return (
                  <div key={req.id} className={`group border transition-all duration-300 relative ${
                    req.status === 'pending' 
                      ? isHighBid ? 'border-orange-500 border-2 bg-orange-500/5' : isMatch ? 'border-white border-2 bg-white/10' : 'border-white/20 bg-white/5'
                      : req.status === 'accepted' ? 'border-green-500 bg-green-500/5' : req.status === 'paid' ? 'border-white opacity-100 bg-white/10' : 'border-white/5 opacity-40'
                  } p-6`}>
                    {isHighBid && req.status === 'pending' && (
                      <div className="absolute -top-3 left-4 bg-orange-500 text-black text-[9px] font-black px-2 py-0.5 tracking-[0.2em] uppercase shadow-lg">
                        HIGH PRIORITY BID
                      </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] px-1.5 font-bold ${req.status === 'paid' ? 'bg-green-500 text-black' : 'bg-white text-black'}`}>
                            {req.status === 'paid' ? 'PAYMENT RECEIVED' : new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Guest: {req.userName}</span>
                        </div>
                        
                        <div className="flex items-baseline gap-4">
                          <h3 className="text-2xl font-heading font-bold uppercase tracking-tight">{req.songName}</h3>
                          {req.bidAmount && (
                            <span className="text-xl font-bold text-orange-500 tracking-tighter">
                              {req.bidAmount} {req.bidCurrency}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-lg text-gray-400 mb-1">{req.artist}</p>
                        
                        <div className="flex items-center gap-3 mb-3">
                          {req.vibe && (
                            <span className="text-[10px] border border-white/40 px-2 py-0.5 uppercase tracking-widest font-medium">
                              Vibe: {req.vibe}
                            </span>
                          )}
                          {req.bidNetwork && (
                            <span className="text-[9px] text-gray-500 uppercase font-mono bg-white/5 px-2">
                              via {req.bidNetwork}
                            </span>
                          )}
                        </div>

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
                            className="flex-1 md:flex-none px-4 py-2 bg-orange-500 text-black hover:bg-white border border-orange-500 text-xs font-black uppercase transition-all"
                          >
                            Set Played
                          </button>
                        )}
                        {req.status === 'completed' && (
                          <div className="flex flex-col items-center justify-center p-2 border border-white/20 bg-white/5 text-[9px] uppercase tracking-widest text-gray-400">
                            Waiting for User Confirmation
                          </div>
                        )}
                        {req.status !== 'paid' && req.status !== 'rejected' && (
                          <button 
                            disabled={isGenerating}
                            onClick={() => handleVibeCheck(req)}
                            className="flex-1 md:flex-none px-4 py-2 border border-white/40 text-white/40 hover:border-white hover:text-white text-[9px] font-bold uppercase transition-all"
                          >
                            {isGenerating ? 'Analyzing...' : 'Vibe Check'}
                          </button>
                        )}
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
            <h2 className="text-2xl font-heading font-bold uppercase">Deck Earnings</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 space-y-6">
            <div>
              <p className="text-[10px] text-gray-500 uppercase mb-1">Total Payouts Released</p>
              <p className="text-4xl font-heading font-bold text-green-500 tracking-tighter">${totalBids.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase mb-1">Queue Value (Pending)</p>
              <p className="text-4xl font-heading font-bold text-orange-500 tracking-tighter">
                ${requests.filter(r => r.status === 'pending' || r.status === 'accepted').reduce((s, r) => s + parseFloat(r.bidAmount || '0'), 0).toFixed(2)}
              </p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-[10px] text-gray-500 uppercase mb-4 tracking-widest">Revenue Channels</p>
              <div className="space-y-2">
                {['Camp Network', 'BSC', 'Base'].map(net => {
                  const val = requests.filter(r => r.bidNetwork === net && r.status === 'paid').reduce((s, r) => s + parseFloat(r.bidAmount || '0'), 0);
                  return (
                    <div key={net} className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-gray-400">{net}</span>
                      <span className="font-bold">${val.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold tracking-widest">SECURE SETTLEMENT ON</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
