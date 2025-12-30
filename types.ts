export interface UserProfile {
  uid: string;
  name: string;
  phone?: string | null;
  provider: 'google' | 'phone';
  ffUid?: string;
  ffName?: string;
  coins: number;
  role: 'user' | 'admin';
  status: 'active' | 'banned' | 'suspended';
  createdAt: any; // Firestore Timestamp
  lastLogin: any; // Firestore Timestamp
  photoURL?: string | null;
}

export interface Tournament {
  id: string;
  title: string;
  map: string;
  type: 'Solo' | 'Duo' | 'Squad';
  entryFee: number;
  prizePool: number;
  startTime: any;
  status: 'open' | 'ongoing' | 'completed';
  joined: number;
  slots: number;
  // Advanced fields
  perKill: number;
  rules: string[];
  prizeDistribution: { rank: number; amount: number }[];
  roomId?: string;
  roomPassword?: string;
  isJoined?: boolean; // Virtual field for UI
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  photoURL?: string;
  earnings: number;
  matches: number;
  wins: number;
}