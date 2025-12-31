
export interface UserProfile {
  uid: string;
  name: string;
  phone?: string | null;
  email?: string;
  provider: 'google' | 'phone';
  ffUid?: string;
  ffName?: string;
  coins: number;
  role: 'user' | 'admin';
  status: 'active' | 'banned' | 'suspended';
  createdAt: any; // Firestore Timestamp
  lastLogin: any; // Firestore Timestamp
  photoURL?: string | null;
  referralCode?: string;
}

export interface Tournament {
  id: string;
  title: string;
  image: string; // New field for custom images
  map: string;
  type: string; // e.g., 'Solo', 'Duo', 'Squad', 'Solo vs Squad'
  gameMode: 'Classic' | 'CS-Ranked' | 'Custom Lobby' | 'Lone Wolf'; // New field for game modes
  entryFee: number;
  prizePool: number;
  startTime: string;
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
  status: 'success' | 'pending' | 'failed';
  amount: number;
  description: string;
  date: string;
  method?: string; // e.g., 'UPI', 'Bonus'
  utr?: string; // For manual UPI verification
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
  // New Features
  clan?: string;
  kdRatio: number;
  headshotRate: number;
  trend: 'up' | 'down' | 'same';
  isVip?: boolean;
  isAdmin?: boolean;
}

export interface AppSettings {
  pushNotifs: boolean;
  emailNotifs: boolean;
  soundEffects: boolean;
  haptic: boolean;
  darkMode: boolean;
  showStats: boolean;
  twoFactor: boolean;
}
