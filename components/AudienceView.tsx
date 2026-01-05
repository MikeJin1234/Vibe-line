
import React, { useState, useEffect } from 'react';
import { addRequest, getRequests, getDJPreferences, updateRequestStatus } from '../services/storageService';
import { SongRequest, User, DJPreferences } from '../types';

interface AudienceViewProps {
  user: User;
  onExit: () => void;
}

export const AudienceView: React.FC<AudienceViewProps> = ({ user, onExit }) => {
  const [songName, setSongName] = useState('');
  const [artist, setArtist] = useState('');
  const [vibe, setVibe] = useState('');
  const [note, setNote] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [bidCurrency, setBidCurrency] = useState<'USDT' | 'USDC'>('USDT');
  const [bidNetwork, setBidNetwork] = useState<'Camp Network' | 'BSC' | 'Base'>('Camp Network');
  
  const [myRequests, setMyRequests] = useState<SongRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [djPrefs, setDjPrefs] = useState<DJPreferences>(getDJPreferences());

  useEffect(() => {
    const refreshData = () => {
      const all = getRequests();
      setMyRequests(all.filter(r => r.userId === user.id).sort((a, b) => b.timestamp - a.timestamp));
      setDjPrefs(getDJPreferences());
    };

    refreshData();

    const handleStorage = () => refreshData();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('storage_update', handleStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('storage_update', handleStorage);
    };
  }, [user.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songName || !artist) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addRequest({
        songName,
        artist,
        vibe,
        note,
        userId: user.id,
        userName: user.name,
        bidAmount: bidAmount || undefined,
        bidCurrency: bidAmount ? bidCurrency : undefined,
        bidNetwork: bidAmount ? bidNetwork : undefined,
      });
      setSongName('');
      setArtist('');
      setVibe('');
      setNote('');
      setBidAmount('');
      setIsSubmitting(false);
    }, 600);
  };

  const handleConfirmPayment = (id: string) => {
    updateRequestStatus(id, 'paid');
    alert("Simulation: Funds released to DJ's wallet. Thank you for supporting the vibes!");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-5xl mx-auto flex flex-col">
      <header className="flex justify-between items-center mb-10 border-b border-white/20 pb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold italic uppercase tracking-tighter">VibeLine / Guest</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Logged in as: <span className="text-white">{user.name}</span></p>
        </div>
        <button onClick={onExit} className="text-[10px] border border-white/40 px-3 py-1 hover:bg-white hover:text-black transition-colors uppercase tracking-widest">
          Sign Out
        </button>
      </header>

      <section className="mb-12 animate-in fade-in slide-in-from-top-2 duration-700">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">DJ's Current Pulse</h2>
          <div className="h-px flex-1 bg-white/10"></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {djPrefs.genres.length === 0 ? (
            <p className="text-xs text-gray-600 italic uppercase">The DJ hasn't set any specific vibes yet. Anything goes.</p>
          ) : (
            djPrefs.genres.map(pref => (
              <span key={pref} className="px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(255,255,255,0.2)]">
                {pref}
              </span>
            ))
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <section className="space-y-8">
          <h2 className="text-xl font-heading font-medium border-l-4 border-white pl-4 uppercase tracking-widest">Send Request</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">Track Name</label>
                <input
                  required
                  type="text"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none py-2 transition-all placeholder:text-gray-800"
                  placeholder="Track title..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">Artist</label>
                <input
                  required
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none py-2 transition-all placeholder:text-gray-800"
                  placeholder="Artist name..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">Vibe / Style</label>
              <input
                type="text"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none py-2 transition-all placeholder:text-gray-800"
                placeholder="Techno, Funk, House..."
              />
            </div>

            {/* Bidding Section */}
            <div className="p-4 border border-white/10 bg-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Priority Bidding (Optional)</h3>
                <span className="text-[8px] text-gray-600 uppercase italic">Higher bids get played faster</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[8px] uppercase tracking-widest text-gray-500">Amount</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full bg-black border border-white/20 focus:border-white outline-none p-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[8px] uppercase tracking-widest text-gray-500">Asset</label>
                  <select 
                    value={bidCurrency}
                    onChange={(e) => setBidCurrency(e.target.value as any)}
                    className="w-full bg-black border border-white/20 focus:border-white outline-none p-2 text-xs appearance-none"
                  >
                    <option>USDT</option>
                    <option>USDC</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[8px] uppercase tracking-widest text-gray-500">Network</label>
                  <select 
                    value={bidNetwork}
                    onChange={(e) => setBidNetwork(e.target.value as any)}
                    className="w-full bg-black border border-white/20 focus:border-white outline-none p-2 text-[10px] appearance-none"
                  >
                    <option>Camp Network</option>
                    <option>BSC</option>
                    <option>Base</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">Personal Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-transparent border border-white/20 focus:border-white outline-none p-3 h-16 transition-all resize-none text-sm placeholder:text-gray-800"
                placeholder="Optional message..."
              />
            </div>
            
            <button
              disabled={isSubmitting}
              type="submit"
              className={`w-full py-4 border-2 border-white uppercase tracking-[0.3em] text-xs font-black transition-all ${isSubmitting ? 'bg-white text-black opacity-50' : 'hover:bg-white hover:text-black active:scale-[0.98]'}`}
            >
              {isSubmitting ? 'Transmitting...' : 'Drop Track'}
            </button>
          </form>
        </section>

        <section className="space-y-8">
          <h2 className="text-xl font-heading font-medium border-l-4 border-white pl-4 uppercase tracking-widest">My Requests</h2>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {myRequests.length === 0 ? (
              <div className="py-12 border border-dashed border-white/10 flex items-center justify-center">
                <p className="text-gray-600 text-[10px] uppercase tracking-widest italic">No transmissions found.</p>
              </div>
            ) : (
              myRequests.map((req) => (
                <div key={req.id} className={`border p-5 bg-white/5 relative group transition-colors ${req.status === 'completed' ? 'border-orange-500/50' : 'border-white/10 hover:border-white/40'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                      req.status === 'pending' ? 'border-gray-500 text-gray-500' :
                      req.status === 'accepted' ? 'border-green-400 text-green-400 animate-pulse' :
                      req.status === 'completed' ? 'border-orange-500 text-orange-500' :
                      req.status === 'paid' ? 'border-white bg-white text-black' :
                      'border-red-500 text-red-500'
                    }`}>
                      {req.status === 'completed' ? 'PLAYED - AWAITING CONFIRMATION' : req.status}
                    </span>
                    <span className="text-[9px] text-gray-600 font-mono">
                      {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">{req.songName}</h3>
                  <p className="text-sm text-gray-400 mb-1">{req.artist}</p>
                  
                  {req.bidAmount && (
                    <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-2">
                      BID: {req.bidAmount} {req.bidCurrency} @ {req.bidNetwork}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {req.vibe && (
                      <span className="text-[8px] bg-white/10 border border-white/20 px-1.5 py-0.5 uppercase tracking-widest text-gray-400">
                        {req.vibe}
                      </span>
                    )}
                  </div>
                  
                  {req.status === 'completed' && (
                    <button 
                      onClick={() => handleConfirmPayment(req.id)}
                      className="mt-4 w-full py-2 bg-orange-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-orange-400 transition-colors"
                    >
                      Confirm Played & Release Funds
                    </button>
                  )}
                  
                  {req.status === 'accepted' && (
                    <div className="mt-4 p-2 bg-green-500/5 border-l-2 border-green-400">
                      <p className="text-[9px] text-green-400 uppercase font-black italic tracking-widest">In the Mix / Prepare Yourself</p>
                    </div>
                  )}
                  
                  {req.status === 'paid' && (
                    <div className="mt-4 p-2 bg-white/10 border border-white/20 text-center">
                      <p className="text-[9px] text-white uppercase font-black tracking-widest">TRANSACTION COMPLETED</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
