import { AppData, Expense, ExpenseStatus } from '../types';
import { INITIAL_EXPENSES, DEFAULT_BUSINESS_UNITS, DEFAULT_CATEGORIES } from '../constants';

const STORAGE_KEY = 'vyapaar_track_data_v1';

export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize default data
  const defaultData: AppData = {
    expenses: INITIAL_EXPENSES,
    businessUnits: DEFAULT_BUSINESS_UNITS,
    categories: DEFAULT_CATEGORIES
  };
  saveData(defaultData);
  return defaultData;
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};
