import { Expense, ExpenseStatus, PaymentMethod } from './types';
import { LayoutDashboard, PlusCircle, ListChecks, FileText, Settings as SettingsIcon } from 'lucide-react';

export const APP_NAME = "VyapaarTrack";

// Default seed data for the trial run
export const DEFAULT_BUSINESS_UNITS = [
  'uPVC Manufacturing',
  'Brick Factory',
  'Construction Projects',
  'College',
  'School',
  'Head Office'
];

export const DEFAULT_CATEGORIES = [
  'Materials',
  'Labor',
  'Fuel & Transport',
  'Utilities',
  'Maintenance',
  'Food & Refreshments',
  'Office Supplies',
  'Other'
];

export const PAYMENT_METHODS = Object.values(PaymentMethod);

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['admin'] },
  { label: 'Review Queue', icon: ListChecks, path: '/review', roles: ['admin'] },
  { label: 'New Entry', icon: PlusCircle, path: '/add', roles: ['admin', 'staff'] },
  { label: 'Reports', icon: FileText, path: '/reports', roles: ['admin'] },
  { label: 'Settings', icon: SettingsIcon, path: '/settings', roles: ['admin'] },
];

export const MOCK_USERS = [
  { id: 'u1', name: 'Accountant (Admin)', role: 'admin' },
  { id: 'u2', name: 'Site Manager (Staff)', role: 'staff' },
];

// Initial mock data
export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e1',
    date: '2023-10-25',
    amount: 12500,
    merchant: 'Shree Cement Traders',
    businessUnit: 'Construction Projects',
    category: 'Materials',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    description: '50 bags of cement for Site A',
    status: ExpenseStatus.APPROVED,
    submittedBy: 'Ramesh (Site Manager)',
    submittedById: 'u2',
    submittedAt: '2023-10-25T10:30:00Z',
  },
  {
    id: 'e2',
    date: '2023-10-26',
    amount: 450,
    merchant: 'Local Tea Stall',
    businessUnit: 'Brick Factory',
    category: 'Food & Refreshments',
    paymentMethod: PaymentMethod.CASH,
    description: 'Tea and snacks for laborers',
    status: ExpenseStatus.PENDING_REVIEW,
    submittedBy: 'Suresh (Supervisor)',
    submittedById: 'u3',
    submittedAt: '2023-10-26T14:15:00Z',
  },
  {
    id: 'e3',
    date: '2023-10-27',
    amount: 3200,
    merchant: 'Indian Oil Pump',
    businessUnit: 'uPVC Manufacturing',
    category: 'Fuel & Transport',
    paymentMethod: PaymentMethod.UPI,
    description: 'Diesel for Generator',
    status: ExpenseStatus.PENDING_REVIEW,
    submittedBy: 'Driver Mohan',
    submittedById: 'u4',
    submittedAt: '2023-10-27T09:00:00Z',
  },
];
