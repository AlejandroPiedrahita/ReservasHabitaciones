export type Role = 'ROLE_ADMIN' | 'ROLE_CLIENTE';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PAID';

export interface PaymentReceipt {
  method: string;
  last4: string;
  transactionId: string;
  paidAt: string;
}

export type AssetType = 'HOSPITALITY_SUITE';

export interface UserProfile {
  userId: number;
  email: string;
  fullName: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  avatarUrl?: string;
  biography?: string;
}

export interface UserSession {
  userId: number;
  email: string;
  fullName: string;
  role: Role;
  terminalId: string;
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  mfaVerified: boolean;
  profile?: UserProfile;
}

export type RoomCategory = 'EXECUTIVE_SUITE' | 'CREW_REST_CABIN' | 'STANDARD_ROOM' | 'LONG_HAUL_VIP';
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING_DISINFECTION';

export interface HospitalityRoom {
  id: number;
  roomNumber: string;
  name: string;
  category: RoomCategory;
  depotId: number;
  depotCode: string;
  capacityPersons: number;
  baseHourlyRate: number;
  pricePerNight: number;
  status: RoomStatus;
  iotLockId: string;
  floor: number;
  amenities: string[];
  cleanlinessScore: number;
  notes: string;
  lastSanitizedAt: string;
}

export interface Depot {
  id: number;
  code: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  supervisorName?: string;
  supervisorPhone?: string;
  operatingStatus?: 'OPERATIONAL' | 'LIMITED' | 'MAINTENANCE';
  suitesCapacity: number;
  suitesActive: number;
  activeUtilizationRate: number;
}

export interface Asset {
  id: number;
  assetIdentifier: string;
  name: string;
  type: AssetType;
  depotId: number;
  depotCode: string;
  baseHourlyRate: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'IN_SERVICE';
  iotLockId: string;
  cleanlinessScore: number;
  conditionReport: string;
}

export interface Reservation {
  id: number;
  reservationCode: string;
  assetId: number;
  assetIdentifier: string;
  assetName: string;
  depotId: number;
  depotCode: string;
  userId: number;
  userEmail: string;
  customerName: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  status: ReservationStatus;
  baseCost: number;
  serviceFee: number;
  insuranceFee: number;
  totalAmount: number;
  destinationOrRoom: string;
  manifestNotes: string;
  assignedConcierge: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  paymentReceipt?: PaymentReceipt;
  createdAt: string;
  updatedAt: string;
}

export interface TelemetryAlert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  resolved: boolean;
  resolutionNote?: string;
  actions: string[];
}

export interface SystemSettings {
  strictHousekeepingLock: boolean;
  turnaroundBufferMinutes: number;
  hospitalityPmsSync: boolean;
  maxLateCheckoutGraceMinutes: number;
  jwtBearerLifetime: '15m' | '60m' | '8h';
  mandateFido2Keys: boolean;
  kmsKeyHash: string;
  serviceFeeRate: number;
}
