
export type RequestStatus = 'pending' | 'accepted' | 'completed' | 'rejected' | 'paid';

export interface SongRequest {
  id: string;
  songName: string;
  artist: string;
  vibe: string;
  note: string;
  userId: string;
  userName: string;
  status: RequestStatus;
  timestamp: number;
  bidAmount?: string;
  bidCurrency?: 'USDT' | 'USDC';
  bidNetwork?: 'Camp Network' | 'BSC' | 'Base';
}

export type AppRole = 'dj' | 'audience' | null;

export interface User {
  id: string;
  name: string;
  role: AppRole;
}

export interface DJPreferences {
  genres: string[];
  artists: string[];
  styles: string[];
}
