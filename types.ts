export type BusinessUnit = string;
export type ExpenseCategory = string;

export enum ExpenseStatus {
  PENDING_REVIEW = 'Pending Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export enum PaymentMethod {
  UPI = 'UPI (PhonePe/GPay)',
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer',
  CARD = 'Card',
  OTHER = 'Other'
}

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  businessUnit: BusinessUnit;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  description: string;
  referenceNumber?: string;
  receiptUrl?: string; 
  receiptBase64?: string;
  status: ExpenseStatus;
  submittedBy: string; // User Name
  submittedById: string; // User ID
  submittedAt: string;
  reviewNote?: string;
}

export interface AppData {
  expenses: Expense[];
  businessUnits: string[];
  categories: string[];
}