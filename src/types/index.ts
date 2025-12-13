export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Entertainment' | 'Other';
export type IncomeCategory = 'Salary' | 'Freelance' | 'Investment' | 'Gift' | 'Other';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  username: string;
  role: UserRole;
}

export interface Budget {
  id: string;
  userId: string;
  category: ExpenseCategory;
  limitAmount: number;
  period: 'weekly' | 'monthly';
  createdAt: string;
}
