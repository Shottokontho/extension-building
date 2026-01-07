
export enum UserStatus {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  PENDING = 'PENDING'
}

export interface PaymentRequest {
  id: string;
  userId: string;
  username: string;
  phoneNumber: string;
  method: 'bKash' | 'Nagad';
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface User {
  id: string;
  username: string;
  status: UserStatus;
  downloadsToday: number;
  lastDownloadDate: string;
  joinedAt: number;
}
