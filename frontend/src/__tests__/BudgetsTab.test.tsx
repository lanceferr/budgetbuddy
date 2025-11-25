import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BudgetsTab from '../components/BudgetsTab';

jest.mock('../services/api', () => ({

  budgetsAPI: {

    getBudgets: jest.fn(),
    createBudget: jest.fn(),
    updateBudget: jest.fn(),
    deleteBudget: jest.fn(),

  },

}));

import { budgetsAPI } from '../services/api';

describe('BudgetsTab Component', () => {

  beforeEach(() => {

    jest.clearAllMocks();

  });

  it('should render the component with form and empty state', async () => {

    (budgetsAPI.getBudgets as jest.Mock).mockResolvedValue({

      message: 'Success',
      budgets: [],

    });

    render(<BudgetsTab />);

    await waitFor(() => {

      expect(screen.getByText('Create Budget')).toBeInTheDocument();

    });

    expect(screen.getByText('Amount *')).toBeInTheDocument();
    expect(screen.getByText('Period *')).toBeInTheDocument();
    expect(screen.getByText('Category (leave empty for overall)')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();

    await waitFor(() => {

      expect(screen.getByText('No budgets yet. Create one to get alerts.')).toBeInTheDocument();

    });

  });

  it('should display budgets when data is loaded', async () => {

    const mockBudgets = [

      {
        _id: '1',
        userId: 'user1',
        amount: 5000,
        period: 'monthly',
        category: 'Food',
        currentSpent: 3500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: '2',
        userId: 'user1',
        amount: 1000,
        period: 'weekly',
        category: '',
        currentSpent: 250,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

    ];

    (budgetsAPI.getBudgets as jest.Mock).mockResolvedValue({

      message: 'Success',
      budgets: mockBudgets,

    });

    render(<BudgetsTab />);

    await waitFor(() => {

      expect(screen.getByText('Food • monthly')).toBeInTheDocument();
      expect(screen.getByText('Overall • weekly')).toBeInTheDocument();

    });

    expect(screen.getByText('Amount: ₱5000.00')).toBeInTheDocument();
    expect(screen.getByText('Amount: ₱1000.00')).toBeInTheDocument();

  });

  it('should display period options in dropdown', async () => {

    (budgetsAPI.getBudgets as jest.Mock).mockResolvedValue({

      message: 'Success',
      budgets: [],

    });

    render(<BudgetsTab />);

    await waitFor(() => {

      expect(screen.getByText('Period *')).toBeInTheDocument();

    });

    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();

  });

  it('should display all category options including Overall', async () => {

    (budgetsAPI.getBudgets as jest.Mock).mockResolvedValue({

      message: 'Success',
      budgets: [],

    });

    render(<BudgetsTab />);

    await waitFor(() => {

      expect(screen.getByText('Category (leave empty for overall)')).toBeInTheDocument();

    });

    expect(screen.getByText('Overall')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Bills')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('should show spent percentage and warning when near limit', async () => {

    const mockBudgets = [

      {
        _id: '1',
        userId: 'user1',
        amount: 1000,
        period: 'monthly',
        category: 'Shopping',
        currentSpent: 950,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

    ];

    (budgetsAPI.getBudgets as jest.Mock).mockResolvedValue({

      message: 'Success',
      budgets: mockBudgets,

    });

    render(<BudgetsTab />);

    await waitFor(() => {

      expect(screen.getByText('Shopping • monthly')).toBeInTheDocument();

    });

    expect(screen.getByText(/95%/)).toBeInTheDocument();
    expect(screen.getByText('Near limit')).toBeInTheDocument();

  });

  it('should show exceeded warning when budget is over limit', async () => {

    const mockBudgets = [

      {
        _id: '1',
        userId: 'user1',
        amount: 500,
        period: 'weekly',
        category: 'Entertainment',
        currentSpent: 650,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

    ];

    (budgetsAPI.getBudgets as jest.Mock).mockResolvedValue({

      message: 'Success',
      budgets: mockBudgets,

    });

    render(<BudgetsTab />);

    await waitFor(() => {

      expect(screen.getByText('Entertainment • weekly')).toBeInTheDocument();

    });

    expect(screen.getByText(/100%/)).toBeInTheDocument();
    expect(screen.getByText('Exceeded')).toBeInTheDocument();

  });

  it('should display edit and delete buttons for each budget', async () => {

    const mockBudgets = [

      {
        _id: '1',
        userId: 'user1',
        amount: 2000,
        period: 'monthly',
        category: 'Bills',
        currentSpent: 800,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

    ];

    (budgetsAPI.getBudgets as jest.Mock).mockResolvedValue({

      message: 'Success',
      budgets: mockBudgets,

    });

    render(<BudgetsTab />);

    await waitFor(() => {

      expect(screen.getByText('Bills • monthly')).toBeInTheDocument();

    });

    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    
    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);

  });
  
});