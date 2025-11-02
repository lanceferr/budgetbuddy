import { addExpense, getExpenses, getSingleExpense, updateExpense, deleteExpense } from '../controllers/expenses.ts';
import {
  createExpense,
  getExpensesByUser,
  getTotalExpenses,
  getExpenseById,
  updateExpenseById,
  deleteExpenseById,
} from '../db/expenses.ts';

jest.mock('../db/expenses');

// helper for mock req/res
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

describe('Expense Controller', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Add Expense Tests
  describe('addExpense', () => {
    it('should return 401 if user not authenticated', async () => {
      const req: any = { identity: {} };
      const res = mockResponse();
      await addExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });

    it('should return 400 if required fields are missing', async () => {
      const req: any = { identity: { _id: '123' }, body: { amount: 100 } };
      const res = mockResponse();
      await addExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Amount, Name, and Category are required' });
    });

    it('should return 400 if amount is invalid', async () => {
      const req: any = {
        identity: { _id: '123' },
        body: { amount: -5, name: 'Food', category: 'Meals' },
      };
      const res = mockResponse();
      await addExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Amount must be a positive number' });
    });

    it('should create an expense successfully', async () => {
      (createExpense as jest.Mock).mockResolvedValue({
        userId: '123',
        amount: 100,
        name: 'Food',
        category: 'Meals',
        notes: '',
        date: '2025-11-02',
      });

      const req: any = {
        identity: { _id: '123' },
        body: { amount: 100, name: 'Food', category: 'Meals' },
      };
      const res = mockResponse();
      await addExpense(req, res);

      expect(createExpense).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Expense creation successful',
          expense: expect.objectContaining({ amount: 100 }),
        })
      );
    });
  });

  // Get Expenses tests
  describe('getExpenses', () => {
    it('should return 401 if user not authenticated', async () => {
      const req: any = { identity: {} };
      const res = mockResponse();
      await getExpenses(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });

    it('should return expenses and total', async () => {
      (getExpensesByUser as jest.Mock).mockResolvedValue([{ id: 1, name: 'Food' }]);
      (getTotalExpenses as jest.Mock).mockResolvedValue(200);

      const req: any = { identity: { _id: '123' }, query: {} };
      const res = mockResponse();
      await getExpenses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Expenses was retrieved',
        expenses: [{ id: 1, name: 'Food' }],
        total: 200,
      });
    });
  });

  // Get Single Expense tests
  describe('getSingleExpense', () => {
    it('should return 401 if user not authenticated', async () => {
      const req: any = { identity: {} };
      const res = mockResponse();
      await getSingleExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 400 if expenseId missing', async () => {
      const req: any = { identity: { _id: '123' }, params: {} };
      const res = mockResponse();
      await getSingleExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if expense not found', async () => {
      (getExpenseById as jest.Mock).mockResolvedValue(null);
      const req: any = { identity: { _id: '123' }, params: { expenseId: '1' } };
      const res = mockResponse();
      await getSingleExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if user tries to access another user\'s expense', async () => {
      (getExpenseById as jest.Mock).mockResolvedValue({ userId: '999' });
      const req: any = { identity: { _id: '123' }, params: { expenseId: '1' } };
      const res = mockResponse();
      await getSingleExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return expense successfully', async () => {
      (getExpenseById as jest.Mock).mockResolvedValue({ userId: '123', name: 'Food' });
      const req: any = { identity: { _id: '123' }, params: { expenseId: '1' } };
      const res = mockResponse();
      await getSingleExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Expense retrieved successfully' })
      );
    });
  });

  //Update Expense tests
  describe('updateExpense', () => {
    it('should return 401 if user not authenticated', async () => {
      const req: any = { identity: {} };
      const res = mockResponse();
      await updateExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 if expense not found', async () => {
      (getExpenseById as jest.Mock).mockResolvedValue(null);
      const req: any = {
        identity: { _id: '123' },
        params: { expenseId: '1' },
        body: { amount: 100 },
      };
      const res = mockResponse();
      await updateExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should update successfully', async () => {
      (getExpenseById as jest.Mock).mockResolvedValue({ userId: '123' });
      (updateExpenseById as jest.Mock).mockResolvedValue({ id: '1', amount: 200 });
      const req: any = {
        identity: { _id: '123' },
        params: { expenseId: '1' },
        body: { amount: 200 },
      };
      const res = mockResponse();
      await updateExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Expense updated successfully' })
      );
    });
  });

  //Delete Expense tests
  describe('deleteExpense', () => {
    it('should return 401 if user not authenticated', async () => {
      const req: any = { identity: {} };
      const res = mockResponse();
      await deleteExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 if expense not found', async () => {
      (getExpenseById as jest.Mock).mockResolvedValue(null);
      const req: any = { identity: { _id: '123' }, params: { expenseId: '1' } };
      const res = mockResponse();
      await deleteExpense(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should delete successfully', async () => {
      (getExpenseById as jest.Mock).mockResolvedValue({ userId: '123' });
      const req: any = { identity: { _id: '123' }, params: { expenseId: '1' } };
      const res = mockResponse();
      await deleteExpense(req, res);
      expect(deleteExpenseById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Expense deleted successfully' })
      );
    });
  });
});
