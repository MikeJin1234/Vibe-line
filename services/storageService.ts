
import { SongRequest, DJPreferences } from '../types';

const STORAGE_KEY = 'vibeline_requests';
const PREFS_KEY = 'vibeline_dj_prefs';

export const getRequests = (): SongRequest[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRequests = (requests: SongRequest[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event('storage_update'));
};

export const addRequest = (request: Omit<SongRequest, 'id' | 'timestamp' | 'status'>) => {
  const requests = getRequests();
  const newRequest: SongRequest = {
    ...request,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    status: 'pending'
  };
  saveRequests([...requests, newRequest]);
  return newRequest;
};

export const updateRequestStatus = (id: string, status: SongRequest['status']) => {
  const requests = getRequests();
  const updated = requests.map(req => req.id === id ? { ...req, status } : req);
  saveRequests(updated);
};

export const clearAllRequests = () => {
  saveRequests([]);
};

export const getDJPreferences = (): DJPreferences => {
  const data = localStorage.getItem(PREFS_KEY);
  return data ? JSON.parse(data) : { genres: [], artists: [], styles: [] };
};

export const saveDJPreferences = (prefs: DJPreferences) => {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new Event('storage_update'));
};
