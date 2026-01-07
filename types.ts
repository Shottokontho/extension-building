export enum UserStatus {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  PENDING = 'PENDING'
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'Binance';

export interface PaymentRequest {
  id: string;
  userId: string;
  username: string;
  phoneNumber: string; // Used for phone or Binance ID/Address
  method: PaymentMethod;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  amount: number;
  currency: 'BDT' | 'USD';
}

export interface User {
  id: string;
  username: string;
  status: UserStatus;
  downloadsToday: number;
  lastDownloadDate: string;
  joinedAt: number;
}