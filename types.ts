
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
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  COLLECTED = 'COLLECTED'
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
  departmentId?: string;
}

export interface OrderItem {
  itemId: string;
  uniqueId: string;
  name: string;
  quantity: number;
  price: number; 
  basePrice: number;
  departmentId?: string;
  status?: OrderStatus;
  preparedAt?: Date;
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
  shelfLocation?: string;
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
  role: 'CASHIER' | 'WAITER' | 'MANAGER' | 'ADMIN' | 'BRANCH_MANAGER' | 'HOSPITALITY' | 'KITCHEN' | 'DEPARTMENT_STAFF' | 'ORDER_AGGREGATOR';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'CASHIER' | 'CUSTOMER' | 'WAITER' | 'BRANCH_MANAGER' | 'HOSPITALITY' | 'KITCHEN' | 'DEPARTMENT_STAFF' | 'ORDER_AGGREGATOR';
  branchId?: string;
  departmentId?: string;
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
  PAID = 'PAID',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING'
}

export interface Hall {
  id: string;
  name: string;
}

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  capacity: number;
  hallId: string;
  currentOrderId?: string;
  seatedAt?: Date;
  guestCount?: number;
  mergedWithId?: string;
  reservationName?: string;
  reservationTime?: string;
  position: { x: number; y: number };
}

export enum FinancialTransactionType {
  WITHDRAWAL = 'WITHDRAWAL', // سحوبات (مصاريف)
  DEPOSIT = 'DEPOSIT',       // توريد (زيادة رصيد)
  REFUND = 'REFUND',         // مرتجع
  CASH_DROP = 'CASH_DROP',   // توريد للبنك/الإدارة
  VOID = 'VOID'              // إلغاء فاتورة
}

export interface FinancialTransaction {
  id: string;
  shiftId: string;
  cashierId: string;
  type: FinancialTransactionType;
  amount: number;
  reason: string;
  timestamp: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  attachment?: string; // Optional image/receipt
}

export interface CustomerFeedback {
  id: string;
  orderId?: string;
  customerId?: string;
  customerName: string;
  type: 'COMPLAINT' | 'SUGGESTION' | 'COMPLIMENT';
  category: 'FOOD' | 'SERVICE' | 'CLEANLINESS' | 'ATMOSPHERE' | 'OTHER';
  rating: number; // 1-5
  comment: string;
  status: 'NEW' | 'REVIEWED' | 'RESOLVED';
  timestamp: Date;
}

export interface StaffTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // Employee ID
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: Date;
}

export interface TableAssignment {
  tableId: string;
  staffId: string; // Employee ID (Captain/Waiter)
  shiftId: string;
}

export interface Shift {
  id: string;
  cashierId: string;
  startTime: Date;
  openingBalance: number;
  status: 'OPEN' | 'CLOSED';
}
