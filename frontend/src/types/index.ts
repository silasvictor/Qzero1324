export type UserRole = 'STUDENT' | 'ADMIN' | 'OPERATOR';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  rollNumber?: string | null;
  department?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  balance: number;
  loyaltyPoints?: number;
  year?: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'QUEUED'
  | 'PRINTING'
  | 'PACKING'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
  | 'CANCELLED'
  | 'FAILED';

export interface PrintSettings {
  id?: string;
  colorMode: 'BW' | 'COLOR';
  duplexMode: 'SINGLE' | 'DOUBLE';
  paperSize: 'A4' | 'A3';
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  pageRange: string;
  oddEven: 'ALL' | 'ODD' | 'EVEN';
  copies: number;
  includeTrackingMargin: boolean;
  bindingOption?: 'NONE' | 'CORNER_STAPLE' | 'SPIRAL';
  calculatedPrice: number;
}

export interface DocumentItem {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  pageCount: number;
  isColorDetected: boolean;
  fileUrl: string;
  printSettings?: PrintSettings;
  createdAt: string;
}

export interface Kiosk {
  id: string;
  name: string;
  campusCode: string;
  location: string;
  description?: string;
  latitude: number;
  longitude: number;
  status: 'ONLINE' | 'BUSY' | 'MAINTENANCE' | 'OFFLINE';
  paperLevelPercent: number;
  tonerLevelPercent: number;
  queueDepth: number;
  ppmSpeed: number;
  activeQueueCapacity: number;
  operatorName?: string;
  activeOrdersCount?: number;
  estimatedWaitTimeMin?: number;
  isDemonstration?: boolean;
}

export interface PickupSlot {
  id: string;
  kioskId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
}

export interface PrintOrder {
  id: string;
  trackingCode: string;
  userId: string;
  documentId: string;
  printSettingsId: string;
  kioskId: string;
  pickupSlotId?: string | null;
  printMode: 'INSTANT' | 'SCHEDULED';
  status: OrderStatus;
  priorityScore: number;
  estimatedPrintTimeSec: number;
  totalPages: number;
  amount: number;
  currency: string;
  pickupWindowStart?: string | null;
  pickupWindowEnd?: string | null;
  collectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  document: DocumentItem;
  printSettings: PrintSettings;
  kiosk: Kiosk;
  pickupSlot?: PickupSlot | null;
  payment?: Payment | null;
  user?: Partial<User>;
  verificationRecord?: {
    verifiedAt: string;
    verificationNotes?: string;
    operator?: { name: string };
  } | null;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: 'WALLET' | 'RAZORPAY_SANDBOX' | 'UPI_MOCK';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionId: string;
  receiptNumber: string;
  paidAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  orderId?: string | null;
  category: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminResponse?: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    rollNumber?: string;
  };
}
