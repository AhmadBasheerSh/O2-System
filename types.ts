
export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  ON_DELIVERY = 'ON_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  WALLET = 'WALLET',
  QR = 'QR',
  ONLINE = 'ONLINE'
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: 'DEPOSIT' | 'PURCHASE' | 'REFUND' | 'BONUS';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  description: string;
}

export interface SavedCard {
  id: string;
  brand: 'VISA' | 'MASTERCARD';
  last4: string;
  expiry: string;
}

export interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  category: string;
  image: string;
  descriptionAr?: string;
  popular?: boolean;
  dietary?: { vegan?: boolean; glutenFree?: boolean; spicyLevel?: number };
  sizes?: { name: string; price: number }[];
  addons?: { name: string; price: number }[];
}

export interface OrderItem {
  itemId: string;
  uniqueId: string;
  name: string;
  quantity: number;
  price: number; 
  basePrice: number;
  size?: string;
  addons?: string[];
  note?: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  time: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  tableId?: string;
  branchId?: string;
  customerId?: string;
  waiterId?: string;
  createdAt: Date;
  subtotal: number;
  tax: number;
  deliveryFee?: number;
  discount: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  timeline: OrderTimeline[];
  deliveryInfo?: {
    address: string;
    driverName?: string;
    driverPhone?: string;
    eta: string;
  };
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Department {
  id: string;
  name: string;
  parentId?: string;
  branchId: string;
  description?: string;
}

export interface JobTitle {
  id: string;
  name: string;
  departmentIds: string[];
  description?: string;
}

export interface JobType {
  id: string;
  name: string;
  description?: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  nationalId: string;
  dob: Date;
  jobTitleId: string;
  departmentId: string;
  branchId: string;
  typeId: string;
  managerId?: string;
  hireDate: Date;
  salary: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  role: 'CASHIER' | 'WAITER' | 'MANAGER' | 'ADMIN' | 'BRANCH_MANAGER';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'CASHIER' | 'CUSTOMER' | 'WAITER' | 'BRANCH_MANAGER';
  branchId?: string;
  points: number;
  balance: number;
  tier: 'SILVER' | 'GOLD' | 'PLATINUM';
  vouchers: any[];
  favorites: string[];
  addresses: any[];
  transactions: Transaction[];
  savedCards: SavedCard[];
  commissionRate?: number;
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING'
}

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  capacity: number;
  currentOrderId?: string;
  seatedAt?: Date;
  reservationName?: string;
  reservationTime?: string;
  position: { x: number; y: number };
}

export interface Shift {
  id: string;
  cashierId: string;
  startTime: Date;
  openingBalance: number;
  status: 'OPEN' | 'CLOSED';
}
