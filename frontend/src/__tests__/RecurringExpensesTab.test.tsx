import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecurringExpensesTab from '../components/RecurringExpensesTab';

jest.mock('../services/api', () => ({

  recurringExpensesAPI: {

    getRecurringExpenses: jest.fn(),
    createRecurringExpense: jest.fn(),
    updateRecurringExpense: jest.fn(),
    deleteRecurringExpense: jest.fn(),

  },

}));

import { recurringExpensesAPI } from '../services/api';

describe('RecurringExpensesTab Component', () => {

  beforeEach(() => {

    jest.clearAllMocks();

  });

  it('should render the component with form and empty state', async () => {

    (recurringExpensesAPI.getRecurringExpenses as jest.Mock).mockResolvedValue({

      message: 'Success',
      recurringExpenses: [],

    });

    render(<RecurringExpensesTab />);

    await waitFor(() => {

      expect(screen.getByText('➕ Create Recurring Expense')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., Netflix Subscription')).toBeInTheDocument();
      expect(screen.getByText('🔁 Your Recurring Expenses')).toBeInTheDocument();

    });

    await waitFor(() => {

      expect(screen.getByText('No Recurring Expenses Yet')).toBeInTheDocument();

    });

  });

  it('should display recurring expenses when data is loaded', async () => {

    const mockRecurringExpenses = [

      {
        _id: '1',
        userId: 'user1',
        name: 'Netflix Subscription',
        amount: 15.99,
        category: 'Entertainment',
        frequency: 'monthly',
        startDate: new Date().toISOString(),
        isActive: true,
        notes: 'Streaming service',
      },
      {
        _id: '2',
        userId: 'user1',
        name: 'Gym Membership',
        amount: 50.00,
        category: 'Health',
        frequency: 'monthly',
        startDate: new Date().toISOString(),
        isActive: true,
      },

    ];

    (recurringExpensesAPI.getRecurringExpenses as jest.Mock).mockResolvedValue({

      message: 'Success',
      recurringExpenses: mockRecurringExpenses,

    });

    render(<RecurringExpensesTab />);

    await waitFor(() => {

      expect(screen.getByText('Netflix Subscription')).toBeInTheDocument();
      expect(screen.getByText('Gym Membership')).toBeInTheDocument();

    });

    expect(screen.getByText('₱15.99')).toBeInTheDocument();
    expect(screen.getByText('₱50.00')).toBeInTheDocument();

  });

  it('should show form elements and create button', async () => {

    (recurringExpensesAPI.getRecurringExpenses as jest.Mock).mockResolvedValue({

      message: 'Success',
      recurringExpenses: [],

    });

    render(<RecurringExpensesTab />);

    await waitFor(() => {

      expect(screen.getByText('➕ Create Recurring Expense')).toBeInTheDocument();

    });

    expect(screen.getByPlaceholderText('e.g., Netflix Subscription')).toBeInTheDocument();
    expect(screen.getByText('Amount (₱) *')).toBeInTheDocument();
    expect(screen.getByText('Category *')).toBeInTheDocument();
    expect(screen.getByText('Frequency *')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    
  });

  it('should display both active and paused expenses with correct badges', async () => {

    const mockRecurringExpenses = [

      {
        _id: '1',
        userId: 'user1',
        name: 'Active Expense',
        amount: 20.00,
        category: 'Food',
        frequency: 'weekly',
        startDate: new Date().toISOString(),
        isActive: true,
      },
      {
        _id: '2',
        userId: 'user1',
        name: 'Paused Expense',
        amount: 30.00,
        category: 'Transport',
        frequency: 'monthly',
        startDate: new Date().toISOString(),
        isActive: false,
      },

    ];

    (recurringExpensesAPI.getRecurringExpenses as jest.Mock).mockResolvedValue({

      message: 'Success',
      recurringExpenses: mockRecurringExpenses,

    });

    render(<RecurringExpensesTab />);

    await waitFor(() => {

      expect(screen.getByText('Active Expense')).toBeInTheDocument();
      expect(screen.getByText('Paused Expense')).toBeInTheDocument();
      
    });

    expect(screen.getByText('PAUSED')).toBeInTheDocument();

  });

});