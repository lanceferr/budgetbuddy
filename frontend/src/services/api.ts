// API service to communicate with your backend

import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ExpensesResponse,
  Expense,
  ExpenseFilters,
  BudgetsResponse,
  RecurringExpense,
  RecurringExpensesResponse,
  CreateRecurringExpenseResponse,
  Income,
  IncomeResponse,
  SavingsGoal,
  SavingsGoalsResponse,
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

  // Check if user is currently authenticated
  getCurrentUser: () =>
    apiRequest<AuthResponse>('/auth/me'),

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

  getDashboardStats: () =>
    apiRequest<any>('/dashboard/stats'),
};

// Budgets API
export const budgetsAPI = {
  getBudgets: () => apiRequest<BudgetsResponse>('/budgets'),

  getBudget: (id: string) => apiRequest<{ budget: any }>(`/budgets/${id}`),

  createBudget: (payload: { amount: number; period: 'weekly' | 'monthly'; category?: string }) =>
    apiRequest<{ message: string; budget: any }>('/budgets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateBudget: (id: string, updates: Partial<{ amount: number; period: 'weekly' | 'monthly'; category?: string }>) =>
    apiRequest<{ message: string; budget: any }>(`/budgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteBudget: (id: string) =>
    apiRequest(`/budgets/${id}`, {
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

// Recurring Expenses API
export const recurringExpensesAPI = {
  getRecurringExpenses: (includeInactive = false) => {
    const endpoint = includeInactive ? '/recurring-expenses?includeInactive=true' : '/recurring-expenses';
    return apiRequest<RecurringExpensesResponse>(endpoint);
  },

  getRecurringExpense: (id: string) =>
    apiRequest<{ message: string; recurringExpense: RecurringExpense }>(`/recurring-expenses/${id}`),

  createRecurringExpense: (payload: Omit<RecurringExpense, '_id' | 'userId' | 'isActive' | 'lastGenerated' | 'createdAt' | 'updatedAt'> & { generateImmediately?: boolean }) =>
    apiRequest<CreateRecurringExpenseResponse>('/recurring-expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateRecurringExpense: (id: string, updates: Partial<Omit<RecurringExpense, '_id' | 'userId'>>) =>
    apiRequest<{ message: string; recurringExpense: RecurringExpense }>(`/recurring-expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteRecurringExpense: (id: string) =>
    apiRequest<{ message: string; recurringId: string }>(`/recurring-expenses/${id}`, {
      method: 'DELETE',
    }),

  toggleRecurringExpense: (id: string) =>
    apiRequest<{ message: string; recurringExpense: RecurringExpense }>(`/recurring-expenses/${id}/toggle`, {
      method: 'POST',
    }),
};

// Income API
export const incomeAPI = {
  getIncomes: () => apiRequest<IncomeResponse>('/income'),

  getIncome: (id: string) =>
    apiRequest<{ message: string; income: Income }>(`/income/${id}`),

  createIncome: (payload: Omit<Income, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<{ message: string; income: Income }>('/income', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateIncome: (id: string, updates: Partial<Omit<Income, '_id' | 'userId'>>) =>
    apiRequest<{ message: string; income: Income }>(`/income/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteIncome: (id: string) =>
    apiRequest<{ message: string; incomeId: string }>(`/income/${id}`, {
      method: 'DELETE',
    }),
};

// Savings Goals API
export const savingsGoalsAPI = {
  getSavingsGoals: (filters?: { startDate?: string; endDate?: string; sort?: string }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.sort) params.append('sort', filters.sort);

    const queryString = params.toString();
    const endpoint = queryString ? `/savings-goals?${queryString}` : '/savings-goals';

    return apiRequest<SavingsGoalsResponse>(endpoint);
  },

  getSavingsGoal: (id: string) =>
    apiRequest<{ message: string; savingsGoal: SavingsGoal }>(`/savings-goals/${id}`),

  createSavingsGoal: (payload: Omit<SavingsGoal, '_id' | 'userId' | 'currentAmount' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<{ message: string; savingsGoal: SavingsGoal }>('/savings-goals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateSavingsGoal: (id: string, updates: Partial<Omit<SavingsGoal, '_id' | 'userId' | 'currentAmount'>>) =>
    apiRequest<{ message: string; savingsGoal: SavingsGoal }>(`/savings-goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteSavingsGoal: (id: string) =>
    apiRequest<{ message: string }>(`/savings-goals/${id}`, {
      method: 'DELETE',
    }),

  addContribution: (id: string, amount: number) =>
    apiRequest<{ message: string; savingsGoal: SavingsGoal & { progress: number } }>(`/savings-goals/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
};