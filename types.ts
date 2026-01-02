
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
  createdAt: any; 
  lastLogin: any; 
  photoURL?: string | null;
  referralCode?: string;
  
  // Verification & Custom Tags
  isVerified?: boolean;
  customTag?: string; // The Red Text (e.g. Owner)
  activeBadge?: { name: string; icon: string; color: string };

  // New Progression Features
  level?: number;
  xp?: number;
  maxXp?: number;
  achievements?: string[];
  
  // Clan & Daily Features
  clanTag?: string;
  dailyLoginStreak?: number;
  lastDailyClaim?: string; // ISO Date

  // Social Features
  friends?: string[]; // List of UIDs
  friendRequestsSent?: string[]; // List of UIDs
  followers?: string[]; // List of UIDs
  following?: string[]; // List of UIDs
  likes?: number;
  
  // Team Logic
  teamMembers?: { uid: string; name: string; role: 'Leader' | 'Member' }[];
  teamInvites?: { fromUid: string; teamName: string; leaderName: string }[]; // Incoming Invites

  // Stats (Editable by Admin)
  stats?: {
      kd: string;
      headshot: string;
      matches: string;
      wins: string;
  }
}

export interface Advertisement {
  id: string;
  imageUrl: string;
  link?: string; // Where to redirect on click
  title?: string;
  active: boolean;
}

export interface Tournament {
  id: string;
  title: string;
  image: string; 
  map: string;
  mapType?: 'Day' | 'Night' | 'Sunset';
  serverRegion?: 'IN' | 'SG' | 'BD' | 'NA'; 
  gameVersion?: 'OB43' | 'OB44'; 
  
  // Game Format
  type: 'Solo' | 'Duo' | 'Squad' | 'Solo vs Squad'; 
  gameMode: 'BR-Ranked' | 'CS-Ranked' | 'Lone Wolf' | 'Classic'; 
  difficulty: 'Rookie' | 'Elite' | 'Legendary' | 'Hardcore';

  entryFee: number;
  prizePool: number;
  startTime: string; 
  status: 'open' | 'ongoing' | 'completed';
  
  // Slot Logic
  joined: number; 
  slots: number; 
  
  perKill: number;
  rules: string[];
  prizeDistribution: { rank: number; amount: number }[];
  
  // Admin Controlled Fields
  roomId?: string;
  roomPassword?: string;
  adminMessage?: string; 
  lastUpdated?: number; 
  organizerVerified?: boolean; 

  isJoined?: boolean;
  
  // Advanced Features
  youtubeLink?: string; 
  topFragger?: string; 
  topFraggerKills?: number;
  tags?: string[]; 
  deviceRestriction?: 'Mobile Only' | 'PC Allowed' | 'iPad Allowed'; 
  spectateLink?: string;
  
  // User specific data
  myTeam?: string[]; 
  mySlot?: number;
  joinedAs?: 'Solo' | 'Team'; 
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  status: 'success' | 'pending' | 'failed';
  amount: number;
  description: string;
  date: string;
  method?: string; 
  utr?: string; 
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
  clan?: string;
  kdRatio: number;
  headshotRate: number;
  trend: 'up' | 'down' | 'same';
  
  // Roles & Badges
  isVip?: boolean;
  isAdmin?: boolean;
  isVerified?: boolean; // Blue Tick
  customTag?: string;   // Red Text
  activeBadge?: { name: string; icon: string; color: string }; // The bought badge
  
  achievements?: string[];
  
  // Social Stats for Leaderboard Display
  likes?: number;
  followersCount?: number;
  isFollowing?: boolean;
  isFriend?: boolean;
  isRequested?: boolean; // If friend request sent
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
