
import React, { useState, useEffect } from 'react';
import { addRequest, getRequests } from '../services/storageService';
import { SongRequest, User } from '../types';

interface AudienceViewProps {
  user: User;
  onExit: () => void;
}

export const AudienceView: React.FC<AudienceViewProps> = ({ user, onExit }) => {
  const [songName, setSongName] = useState('');
  const [artist, setArtist] = useState('');
  const [note, setNote] = useState('');
  const [myRequests, setMyRequests] = useState<SongRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMyRequests = () => {
      const all = getRequests();
      setMyRequests(all.filter(r => r.userId === user.id).sort((a, b) => b.timestamp - a.timestamp));
    };

    fetchMyRequests();

    const handleStorage = () => fetchMyRequests();
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
    // Add small delay for aesthetic effect
    setTimeout(() => {
      addRequest({
        songName,
        artist,
        note,
        userId: user.id,
        userName: user.name
      });
      setSongName('');
      setArtist('');
      setNote('');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto flex flex-col">
      <header className="flex justify-between items-center mb-12 border-b border-white/20 pb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold italic">VIBELINE / GUEST</h1>
          <p className="text-xs text-gray-500 uppercase tracking-tighter">Welcome, {user.name}</p>
        </div>
        <button onClick={onExit} className="text-xs border border-white px-3 py-1 hover:bg-white hover:text-black transition-colors uppercase tracking-widest">
          Exit
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-8">
          <h2 className="text-xl font-heading font-medium border-l-4 border-white pl-4">SEND REQUEST</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400">Track Name</label>
              <input
                required
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none py-2 transition-all"
                placeholder="Ex: Moonlight Sonata"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400">Artist</label>
              <input
                required
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none py-2 transition-all"
                placeholder="Ex: Beethoven"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400">Personal Note (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-transparent border border-white/30 focus:border-white outline-none p-3 h-24 transition-all resize-none"
                placeholder="Message for the DJ..."
              />
            </div>
            <button
              disabled={isSubmitting}
              type="submit"
              className={`w-full py-4 border border-white uppercase tracking-widest text-sm font-bold transition-all ${isSubmitting ? 'bg-white text-black opacity-50' : 'hover:bg-white hover:text-black'}`}
            >
              {isSubmitting ? 'TRANSMITTING...' : 'DROP TRACK'}
            </button>
          </form>
        </section>

        <section className="space-y-8">
          <h2 className="text-xl font-heading font-medium border-l-4 border-white pl-4">STATUS</h2>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {myRequests.length === 0 ? (
              <p className="text-gray-600 text-sm italic">You haven't requested anything yet.</p>
            ) : (
              myRequests.map((req) => (
                <div key={req.id} className="border border-white/10 p-4 bg-white/5 relative group">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border ${
                      req.status === 'pending' ? 'border-gray-500 text-gray-500' :
                      req.status === 'accepted' ? 'border-green-400 text-green-400 animate-pulse' :
                      req.status === 'completed' ? 'border-white bg-white text-black' :
                      'border-red-500 text-red-500'
                    }`}>
                      {req.status}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight uppercase">{req.songName}</h3>
                  <p className="text-sm text-gray-400">{req.artist}</p>
                  
                  {req.status === 'accepted' && (
                    <div className="mt-4 p-2 bg-green-500/10 border-l-2 border-green-400">
                      <p className="text-xs text-green-400 uppercase italic">Your track is up next!</p>
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
