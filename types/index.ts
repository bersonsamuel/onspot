export interface Job {
  id: string;
  category: string;
  categoryDisplay: string;
  image: string;
  title: string;
  fullTitle?: string;
  dealerName: string;
  dealerRating: number;
  pay: string;
  payType: string;
  rawPay: number;
  loc: string;
  lat?: number;
  lng?: number;
  durationHours?: number;
  /** ISO timestamp; replaces the old text `date` + `date_type` columns */
  startAt?: string;
  /** ISO timestamp for shift end (optional) */
  endAt?: string;
  /** Human-readable date label derived from startAt ("Today" / "Tomorrow" / "DD Mon") */
  date: string;
  time: string;
  slotsTotal: number;
  slotsFilled: number;
  urgent: boolean;
  instantPay: boolean;
  genderReq?: string;
  perks?: string[];
  requirements?: string;
  dressCode?: string;
  description: string;
  phone?: string;
  applicants?: Applicant[];
}

export interface Applicant {
  id: string;
  name: string;
  rating: string | number;
  gigs: number;
  phone: string;
  avatar: string;
  status?: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  status: 'Applied' | 'Under Review' | 'Accepted' | 'Declined' | 'Cancelled' | 'Completed';
  appliedAt: string;
  paymentId?: string;
  notes?: string | null;
  job?: Job;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
  job?: Job;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  upiId: string;
  role: 'seeker' | 'dealer' | 'admin';
  rating: number;
  avatarUrl: string;
  /** Escrow wallet balance in INR paise or full rupees, from the DB */
  walletBalance?: number;
}

export interface ChatMessage {
  id?: string;
  conversationId?: string;
  senderId: string;
  senderName?: string;
  receiverId?: string;
  message: string;
  status?: 'sent' | 'delivered' | 'read';
  read?: boolean;
  timestamp: string | Date;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  location?: string;
  payAmount?: number;
  jobId?: string;
  isRead: boolean;
  timestamp: string | Date;
}

export interface FilterState {
  searchQuery: string;
  activeCategory: string;
  activeFilterChips: string[];
  advancedFilters: {
    categories: string[];
    dateFilter: string | null;
    duration: number | string | null;
    gender: string | null;
    location: { name: string; lat: number; lng: number } | null;
    distanceKm: number | null;
  };
}
