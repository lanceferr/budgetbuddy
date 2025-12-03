import { InferSchemaType } from 'mongoose';
import {
    getAllUsers,
    deleteUser,
    updateUser
}from '../controllers/users.ts';


import {
  UserModel,
  getUsers,
  deleteUserById,
  updateUserById
} from '../db/users.ts';

type User = InferSchemaType<typeof UserModel.schema>;

jest.mock('../db/users.ts');

// --- Mock Express objects ---
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn();
  res.clearCookie = jest.fn();
  return res;
};

const mockRequest = (body = {}) => ({ body });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Get All Users', () => {

      it('should return 500 for error', async () => {
        jest.spyOn(console, 'log').mockImplementation(() => {}); // suppress logs
        const req = mockRequest();
        const res = mockResponse();
        (getUsers as jest.Mock).mockRejectedValue(new Error('Connection to MONGODB Failed'));

        await getAllUsers(req as any, res as any);
        expect (getUsers).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({error: 'Failed to fetch users'});
      });

      it('should return 0 users as the db is empty (simulated)', async () => {
        const req = mockRequest();
        const res = mockResponse();
        const emptyDB: User[] = [];

        (getUsers as jest.Mock).mockResolvedValue(emptyDB);

        await getAllUsers(req as any, res as any);
        expect (getUsers).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
      });

    it('should return 1 user as the db has only one entry (simulated)', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const onePersonDB: User[] = [
        {
            _id: '123abc',
            username: 'tester',
            email: 'test@example.com',
            authentication: {
              password: 'hashedpass',
              salt: 'salt123',
              sessionToken: undefined,
              sessionExpiry: undefined,
              resetPasswordToken: undefined,
              resetPasswordExpiry: undefined
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any
        ];

        const onePersonRealDB: User[] = [
        {
          _id: '123abc',
          username: 'tester',
          email: 'test@example.com',
          authentication: {
            password: 'hashedpass',
            salt: 'salt123',
            sessionToken: undefined,
            sessionExpiry: undefined,
            resetPasswordToken: undefined,
            resetPasswordExpiry: undefined
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any
      ];        (getUsers as jest.Mock).mockResolvedValue(onePersonDB);

        await getAllUsers(req as any, res as any);

        // Expectations
        expect(getUsers).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(onePersonRealDB);
      });

    it('should return 2 users as the db has two entries (simulated)', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const twoPersonDB: User[] = [
        {
          _id: '123abc',
          username: 'tester1',
          email: 'tester1@example.com',
          authentication: {
            password: 'hash1',
            salt: 'salt1',
            sessionToken: undefined,
            sessionExpiry: undefined,
            resetPasswordToken: undefined,
            resetPasswordExpiry: undefined
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
        {
          _id: '456def',
          username: 'tester2',
          email: 'tester2@example.com',
          authentication: {
            password: 'hash2',
            salt: 'salt2',
            sessionToken: undefined,
            sessionExpiry: undefined,
            resetPasswordToken: undefined,
            resetPasswordExpiry: undefined
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any
      ];

      const twoPersonRealDB = twoPersonDB;

      (getUsers as jest.Mock).mockResolvedValue(twoPersonDB);

      await getAllUsers(req as any, res as any);

      expect(getUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(twoPersonRealDB);
    });
})


describe('deleteUser controller', () => {
  it('should return 200 when user is successfully deleted', async () => {
    const req = { params: { id: '123' } } as any;
    const res = mockResponse();

    const mockDeletedUser = { _id: '123', username: 'tester' };
    (deleteUserById as jest.Mock).mockResolvedValue(mockDeletedUser);

    await deleteUser(req, res);

    expect(deleteUserById).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User deleted successfully',
      user: mockDeletedUser,
    });
  });

  it('should return 404 if user is not found', async () => {
    const req = { params: { id: '999' } } as any;
    const res = mockResponse();

    (deleteUserById as jest.Mock).mockResolvedValue(null);

    await deleteUser(req, res);

    expect(deleteUserById).toHaveBeenCalledWith('999');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return 500 if there is a server error', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {}); // suppress logs
    const req = { params: { id: '123' } } as any;
    const res = mockResponse();

    (deleteUserById as jest.Mock).mockRejectedValue(new Error('DB failure'));

    await deleteUser(req, res);

    expect(deleteUserById).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete user' });
  });
});

describe('updateUser controller', () => {
  it('should return 200 when user is successfully updated', async () => {
    const req = {
      params: { id: '123' },
      body: { username: 'newName' }
    } as any;
    const res = mockResponse();

    const mockUpdatedUser = { _id: '123', username: 'newName' };
    (updateUserById as jest.Mock).mockResolvedValue(mockUpdatedUser);

    await updateUser(req, res);

    expect(updateUserById).toHaveBeenCalledWith('123', { username: 'newName' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
  });

  it('should return 400 if username is missing', async () => {
    const req = {
      params: { id: '123' },
      body: {} // no username
    } as any;
    const res = mockResponse();

    await updateUser(req, res);

    expect(updateUserById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Username is required' });
  });

  it('should return 404 if user is not found', async () => {
    const req = {
      params: { id: '123' },
      body: { username: 'newName' }
    } as any;
    const res = mockResponse();

    (updateUserById as jest.Mock).mockResolvedValue(null);

    await updateUser(req, res);

    expect(updateUserById).toHaveBeenCalledWith('123', { username: 'newName' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return 500 if there is a server error', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {}); // suppress logs
    const req = {
      params: { id: '123' },
      body: { username: 'newName' }
    } as any;
    const res = mockResponse();

    (updateUserById as jest.Mock).mockRejectedValue(new Error('DB error'));

    await updateUser(req, res);

    expect(updateUserById).toHaveBeenCalledWith('123', { username: 'newName' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update user' });
  });
});