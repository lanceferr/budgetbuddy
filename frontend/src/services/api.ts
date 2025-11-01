// API service to communicate with your backend

import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ExpensesResponse,
  Expense,
  ExpenseFilters,
} from '../types';

const API_BASE_URL = 'http://localhost:8080';

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Important: includes cookies for auth
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    // Better error handling
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to backend server. Make sure it is running at http://localhost:8080');
    }
    throw error;
  }
}

// Authentication API
export const authAPI = {
  register: (credentials: RegisterCredentials) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  login: (credentials: LoginCredentials) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  requestPasswordReset: (email: string) =>
    apiRequest('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};

// Expenses API
export const expensesAPI = {
  getExpenses: (filters?: ExpenseFilters) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.sort) params.append('sort', filters.sort);

    const queryString = params.toString();
    const endpoint = queryString ? `/expenses?${queryString}` : '/expenses';

    return apiRequest<ExpensesResponse>(endpoint);
  },

  getExpense: (id: string) =>
    apiRequest<{ expense: Expense }>(`/expenses/${id}`),

  createExpense: (expense: Omit<Expense, '_id' | 'userId'>) =>
    apiRequest<{ message: string; expense: Expense }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),

  updateExpense: (id: string, updates: Partial<Expense>) =>
    apiRequest<{ message: string; expense: Expense }>(`/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteExpense: (id: string) =>
    apiRequest(`/expenses/${id}`, {
      method: 'DELETE',
    }),
};

// Users API
export const usersAPI = {
  getAllUsers: () => apiRequest('/users'),

  updateUser: (id: string, updates: { username?: string; email?: string }) =>
    apiRequest(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteUser: (id: string) =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
};
