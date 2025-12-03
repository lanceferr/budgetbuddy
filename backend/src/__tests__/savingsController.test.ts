import { 
  addSavingsGoal, 
  listSavingsGoals, 
  listSavingsGoalById, 
  updateSavingsGoal, 
  deleteSavingsGoal, 
  addSavingsContribution 
} from '../controllers/savings.ts';
import * as db from '../db/savings.ts';
import _ from 'lodash';

jest.mock('../db/savings');

describe('Savings Controller', () => {
  let req: any;
  let res: any;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let endMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    endMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock, end: endMock }));
    res = { status: statusMock };
    req = { body: {}, params: {}, query: {}, identity: { _id: 'user123' } };
    jest.clearAllMocks();
  });

  // ----------------- addSavingsGoal -----------------
  describe('addSavingsGoal', () => {
    it('should return 401 if user is not authenticated', async () => {
      _.set(req, 'identity', {});
      await addSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {};
      await addSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'goalName, targetAmount, and targetDate are required' });
    });

    it('should return 400 if targetAmount is not positive', async () => {
      req.body = { goalName: 'Goal', targetAmount: -10, targetDate: '2025-12-31' };
      await addSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: "targetAmount must be a positive number" });
    });

    it('should create a savings goal successfully', async () => {
      req.body = { goalName: 'Goal', targetAmount: 1000, targetDate: '2025-12-31', notes: 'note' };
      (db.createSavingsGoal as jest.Mock).mockResolvedValue({
        userId: 'user123',
        goalName: 'Goal',
        targetAmount: 1000,
        targetDate: new Date('2025-12-31'),
        notes: 'note',
        currentAmount: 0
      });

      await addSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: "Savings goal created successfully",
        savingsGoal: expect.objectContaining({
          userId: 'user123', goalName: 'Goal', targetAmount: 1000
        })
      }));
    });

    it('should return 500 if creation fails', async () => {
      req.body = { goalName: 'Goal', targetAmount: 1000, targetDate: '2025-12-31' };
      (db.createSavingsGoal as jest.Mock).mockRejectedValue(new Error('fail'));
      await addSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Creating Savings Goal Failed!!' });
    });
  });

  // ----------------- listSavingsGoals -----------------
  describe('listSavingsGoals', () => {
    it('should return 401 if not authenticated', async () => {
      _.set(req, 'identity', {});
      await listSavingsGoals(req, res);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should list savings goals successfully', async () => {
      (db.getSavingsGoalsByUser as jest.Mock).mockResolvedValue([{ goalName: 'Goal1' }]);
      await listSavingsGoals(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: "Savings goals retrieved successfully",
        savingsGoals: [{ goalName: 'Goal1' }]
      }));
    });

    it('should return 500 on error', async () => {
      (db.getSavingsGoalsByUser as jest.Mock).mockRejectedValue(new Error('fail'));
      await listSavingsGoals(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  // ----------------- listSavingsGoalById -----------------
  describe('listSavingsGoalById', () => {
    it('should return 401 if not authenticated', async () => {
      _.set(req, 'identity', {});
      await listSavingsGoalById(req, res);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should return 400 if goalId missing', async () => {
      req.params = {};
      await listSavingsGoalById(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 404 if goal not found', async () => {
      req.params.goalId = 'goal1';
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue(null);
      await listSavingsGoalById(req, res);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('should return 403 if goal belongs to another user', async () => {
      req.params.goalId = 'goal1';
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue({ userId: 'otherUser' });
      await listSavingsGoalById(req, res);
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('should return 200 if goal belongs to current user', async () => {
      req.params.goalId = 'goal1';
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue({ userId: 'user123', goalName: 'Goal1' });
      await listSavingsGoalById(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  // ----------------- updateSavingsGoal -----------------
  describe('updateSavingsGoal', () => {
    it('should return 401 if not authenticated', async () => {
      _.set(req, 'identity', {});
      await updateSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should return 400 if goalId missing', async () => {
      req.params = {};
      await updateSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 404 if goal not found', async () => {
      req.params.goalId = 'goal1';
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue(null);
      await updateSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('should return 403 if goal belongs to another user', async () => {
      req.params.goalId = 'goal1';
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue({ userId: 'otherUser' });
      await updateSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('should update successfully', async () => {
      req.params.goalId = 'goal1';
      req.body = { goalName: 'Updated' };
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue({ userId: 'user123', goalName: 'Old' });
      (db.updateSavingsGoalById as jest.Mock).mockResolvedValue({ userId: 'user123', goalName: 'Updated' });
      await updateSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'Savings goal updated successfully' }));
    });
  });

  // ----------------- deleteSavingsGoal -----------------
  describe('deleteSavingsGoal', () => {
    it('should return 401 if not authenticated', async () => {
      _.set(req, 'identity', {});
      await deleteSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should return 400 if goalId missing', async () => {
      req.params = {};
      await deleteSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 404 if goal not found', async () => {
      req.params.goalId = 'goal1';
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue(null);
      await deleteSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('should return 403 if goal belongs to another user', async () => {
      req.params.goalId = 'goal1';
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue({ userId: 'otherUser' });
      await deleteSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('should delete successfully', async () => {
      req.params.goalId = 'goal1';
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue({ userId: 'user123' });
      (db.deleteSavingsGoalById as jest.Mock).mockResolvedValue(true);
      await deleteSavingsGoal(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  // ----------------- addSavingsContribution -----------------
  describe('addSavingsContribution', () => {
    it('should return 401 if not authenticated', async () => {
      _.set(req, 'identity', {});
      await addSavingsContribution(req, res);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should return 400 if goalId missing', async () => {
      req.params = {};
      await addSavingsContribution(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 400 if amount invalid', async () => {
      req.params.goalId = 'goal1';
      req.body.amount = -10;
      await addSavingsContribution(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 404 if goal not found', async () => {
      req.params.goalId = 'goal1';
      req.body.amount = 100;
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue(null);
      await addSavingsContribution(req, res);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('should return 403 if goal belongs to another user', async () => {
      req.params.goalId = 'goal1';
      req.body.amount = 100;
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue({ userId: 'otherUser' });
      await addSavingsContribution(req, res);
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('should add contribution successfully', async () => {
      req.params.goalId = 'goal1';
      req.body.amount = 100;
      const updatedGoal = { userId: 'user123', currentAmount: 100, targetAmount: 500 };
      (db.getSavingsGoalById as jest.Mock).mockResolvedValue({ userId: 'user123', currentAmount: 0, targetAmount: 500 });
      (db.addContributionToSavingsGoal as jest.Mock).mockResolvedValue(updatedGoal);

      await addSavingsContribution(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: "Contribution added successfully",
        savingsGoal: expect.objectContaining({
          userId: 'user123',
          progress: 20
        })
      }));
    });
  });
});
