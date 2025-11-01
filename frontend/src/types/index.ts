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
