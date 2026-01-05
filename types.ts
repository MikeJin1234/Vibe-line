
export type RequestStatus = 'pending' | 'accepted' | 'completed' | 'rejected';

export interface SongRequest {
  id: string;
  songName: string;
  artist: string;
  note: string;
  userId: string;
  userName: string;
  status: RequestStatus;
  timestamp: number;
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
