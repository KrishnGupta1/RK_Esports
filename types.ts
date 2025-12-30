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
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: any;
}