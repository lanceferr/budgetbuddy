// TypeScript types matching your backend models

export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  name: string;
  category: string;
  notes?: string;
  date: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ExpensesResponse {
  message: string;
  expenses: Expense[];
  total: number;
}

export interface Budget {
  _id: string;
  userId: string;
  amount: number;
  period: 'weekly' | 'monthly';
  category?: string;
  currentSpent?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface BudgetsResponse {
  message: string;
  budgets: Budget[];
}

export interface ApiError {
  error: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  sort?: string;
}

export interface RecurringExpense {
  _id: string;
  userId: string;
  amount: number;
  name: string;
  category: string;
  frequency: 'minutely' | 'daily' | 'weekly' | 'monthly';
  startDate: Date | string;
  endDate?: Date | string | null;
  lastGenerated?: Date | string | null;
  notes?: string;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface RecurringExpensesResponse {
  message: string;
  recurringExpenses: RecurringExpense[];
}

export interface CreateRecurringExpenseResponse {
  message: string;
  recurringExpense: RecurringExpense;
  expenseGenerated?: boolean;
}