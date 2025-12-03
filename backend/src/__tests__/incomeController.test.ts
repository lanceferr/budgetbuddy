import { createNewIncome, listIncomes, getSingleIncome, updateIncome, deleteIncome} from '../controllers/income.ts';
import { createIncome, getIncomeByUser, getIncomeById, updateIncomeById, deleteIncomeById } from '../db/income.ts';

/**
 * jest test cases for savings controller
 */
jest.mock('../db/income'); 
// helper for mock req/res
const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
};

describe('Income Controller', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Add Income Tests
    describe('createNewIncome', () => {
        it('should return 401 if user not authenticated', async () => {
            const req: any = { identity: {} };
            const res = mockResponse();
            await createNewIncome(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
        });

        it('should return 400 if required fields are missing', async () => {
            const req: any = { identity: { _id: '123' }, body: { amount: 100 } };
            const res = mockResponse();
            await createNewIncome(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Source is required' });
        });

        it('should return 400 if amount is invalid', async () => {
            const req: any = {
                identity: { _id: '123' },
                body: { amount: -5, source: 'Job', date: '2024-01-01' },
            };
            const res = mockResponse();
            await createNewIncome(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Amount must be a positive number' });
        });

        it('should create an income successfully', async () => {
            (createIncome as jest.Mock).mockResolvedValue({
                userId: '123',
                amount: 1000,
                source: 'Job',
                date: '2024-01-01',
                notes: '',
            });

            const req: any = {
                identity: { _id: '123' },
                body: { amount: 1000, source: 'Job', date: '2024-01-01', notes: '' },
            };
            const res = mockResponse();
            await createNewIncome(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                income: {
                    userId: '123',
                    amount: 1000,
                    source: 'Job',
                    date: '2024-01-01',
                    notes: '',
                },
                message: 'Income created'
            });
        });
    });
    describe('listIncomes', () => {
        it('should return 401 if user not authenticated', async () => {
            const req: any = { identity: {} };
            const res = mockResponse();
            await listIncomes(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
        });

        it('should return list of incomes for authenticated user', async () => {
            (getIncomeByUser as jest.Mock).mockResolvedValue([
                { id: '1', amount: 1000, source: 'Job', date: '2024-01-01' },
                { id: '2', amount: 200, source: 'Freelance', date: '2024-01-15' },
            ]);

            const req: any = { identity: { _id: '123' } };
            const res = mockResponse();
            await listIncomes(req, res);
            expect(getIncomeByUser).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                incomes: [
                    { id: '1', amount: 1000, source: 'Job', date: '2024-01-01' },
                    { id: '2', amount: 200, source: 'Freelance', date: '2024-01-15' },
                ],
                message: 'Incomes retrieved'
            });
        });
    });
    describe('getSingleIncome', () => {
        it('should return 401 if user not authenticated', async () => {
            const req: any = { identity: {}, params: { incomeId: '1' } };
            const res = mockResponse();
            await getSingleIncome(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
        });

        it('should return 404 if income not found', async () => {
            (getIncomeById as jest.Mock).mockResolvedValue(null);

            const req: any = { identity: { _id: '123' }, params: { incomeId: '1' } };
            const res = mockResponse();
            await getSingleIncome(req, res);
            expect(getIncomeById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Income not found' });
        });

        it('should return income if found and belongs to user', async () => {
            (getIncomeById as jest.Mock).mockResolvedValue({
                id: '1',
                userId: '123',
                amount: 1000,
                source: 'Job',
                date: '2024-01-01',
            });

            const req: any = { identity: { _id: '123' }, params: { incomeId: '1' } };
            const res = mockResponse();
            await getSingleIncome(req, res);
            expect(getIncomeById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                income: {
                    id: '1',
                    userId: '123',
                    amount: 1000,
                    source: 'Job',
                    date: '2024-01-01',
                },
                message: 'Income retrieved'
            });
        });
    });
    describe('updateIncome', () => {    
        it('should return 401 if user not authenticated', async () => {
            const req: any = { identity: {}, params: { incomeId: '1' }, body: { amount: 1500 } };
            const res = mockResponse();
            await updateIncome(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
        });

        it('should return 404 if income not found', async () => {
            (getIncomeById as jest.Mock).mockResolvedValue(null);

            const req: any = { identity: { _id: '123' }, params: { incomeId: '1' }, body: { amount: 1500 } };
            const res = mockResponse();
            await updateIncome(req, res);
            expect(getIncomeById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Income not found' });
        });

        it('should update income if found and belongs to user', async () => {
            (getIncomeById as jest.Mock).mockResolvedValue({
                id: '1',
                userId: '123',
                amount: 1000,
                source: 'Job',
                date: '2024-01-01',
            });
            (updateIncomeById as jest.Mock).mockResolvedValue({
                id: '1',
                userId: '123',
                amount: 1500,
                source: 'Job',
                date: '2024-01-01',
            });

            const req: any = { identity: { _id: '123' }, params: { incomeId: '1' }, body: { amount: 1500 } };
            const res = mockResponse();
            await updateIncome(req, res);
            expect(getIncomeById).toHaveBeenCalledWith('1');
            expect(updateIncomeById).toHaveBeenCalledWith('1', { amount: 1500 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                income: {
                    id: '1',
                    userId: '123',
                    amount: 1500,
                    source: 'Job',
                    date: '2024-01-01',
                },
                message: 'Income updated'
            });
        });
    });
    describe('deleteIncome', () => {    
        it('should return 401 if user not authenticated', async () => {
            const req: any = { identity: {}, params: { incomeId: '1' } };
            const res = mockResponse();
            await deleteIncome(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
        });

        it('should return 404 if income not found', async () => {
            (getIncomeById as jest.Mock).mockResolvedValue(null);

            const req: any = { identity: { _id: '123' }, params: { incomeId: '1' } };
            const res = mockResponse();
            await deleteIncome(req, res);
            expect(getIncomeById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Income not found' });
        });

        it('should delete income if found and belongs to user', async () => {
            (getIncomeById as jest.Mock).mockResolvedValue({
                id: '1',
                userId: '123',
                amount: 1000,
                source: 'Job',
                date: '2024-01-01',
            });
            (deleteIncomeById as jest.Mock).mockResolvedValue(true);

            const req: any = { identity: { _id: '123' }, params: { incomeId: '1' } };
            const res = mockResponse();
            await deleteIncome(req, res);
            expect(getIncomeById).toHaveBeenCalledWith('1');
            expect(deleteIncomeById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ 
                incomeId: '1',
                message: 'Income deleted'
            });
        });
    });
    

});