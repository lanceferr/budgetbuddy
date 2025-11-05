
import {
  validatePassword,
  login,
  register,
  logout,
  loginWithShortExpiry,
  requestPasswordReset,
  resetPassword
} from '../controllers/authentication.ts';

import {
  getUserByEmail,
  createUser,
  getUserByEmailWithAuth,
  setResetToken,
  getUserByResetToken,
  clearResetToken,
  updateUserById
} from '../db/users.ts';
import { random, authentication } from '../helpers/index.ts';

// --- Mock dependencies ---
jest.mock('../db/users');
jest.mock('../helpers/index', () => ({
  random: jest.fn(),
  authentication: jest.fn()
}));

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

// --- Reset mocks before each test ---
beforeEach(() => {
  jest.clearAllMocks();
});

// --------------------
// validate Password
// --------------------

describe ('validate password', () =>{
  it('should return 8 character minimum for the password', async () => {
    let password: string = 'hello'; // 5 letters
    const result = validatePassword(password);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  })

  it('at least 1 uppercase letter', async () => {
    let password: string = 'helloooo'; // 8 letters all lowercase
    const result = validatePassword(password);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  })

  it('at least 1 lowercase character', async () => {
    let password: string = 'HELLOOOO'; // 8 letters, all uppercase
    const result = validatePassword(password);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  })

  it('at least 1 number', async () => {
    let password: string = 'Helloooo'; //8 letters, 1 uppercase, the rest is lowercase
    const result = validatePassword(password);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  })

    it('at least 1 special character', async () => {
    let password: string = 'Hellooo1'; // 8 letters, 1 uppercase, the rest is lowercase
    const result = validatePassword(password);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  })

  it('valid password', async () => {
    let password: string = 'Helloo@1'; // 9 characters, 1 uppercase, the rest is lowercase, 1 number, 1 special character
    const result = validatePassword(password);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  })

})


// --------------------
// LOGIN TESTS
// --------------------
describe('login', () => {
  it('should return 400 if email or password is missing', async () => {
    const req = mockRequest({ email: '' });
    const res = mockResponse();
    await login(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email and password are required' });
  });

  it('should return 400 if user not found', async () => {
    (getUserByEmailWithAuth as jest.Mock).mockResolvedValue(null);
    const req = mockRequest({ email: 'test@example.com', password: 'pass123' });
    const res = mockResponse();
    await login(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 403 if password is invalid', async () => {
    const mockUser = {
      authentication: { salt: 's', password: 'hash' },
      _id: '123',
    };
    (getUserByEmailWithAuth as jest.Mock).mockResolvedValue(mockUser);
    (authentication as jest.Mock).mockReturnValue('wrong-hash');
    const req = mockRequest({ email: 'test@example.com', password: 'wrongpass' });
    const res = mockResponse();
    await login(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should return 200 on successful login', async () => {
    const mockUser = {
      authentication: { salt: 's', password: 'hash' },
      _id: '123',
      save: jest.fn(),
      email: 'test@example.com',
      username: 'tester'
    };
    (getUserByEmailWithAuth as jest.Mock).mockResolvedValue(mockUser);
    (authentication as jest.Mock).mockImplementation((_, str) => str === 'pass' ? 'hash' : 'newtoken');
    (random as jest.Mock).mockReturnValue('salt');
    const req = mockRequest({ email: 'test@example.com', password: 'pass' });
    const res = mockResponse();
    await login(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledWith(
      'AUTH',
      expect.any(String),
      expect.objectContaining({ httpOnly: true })
    );
  });
});

// --------------------
// REGISTER TESTS
// --------------------
describe('register', () => {
  it('should return 400 if required fields are missing', async () => {
    const req = mockRequest({});
    const res = mockResponse();
    await register(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 for invalid email', async () => {
    const req = mockRequest({ email: 'invalid', username: 'test', password: 'Pass123!' });
    const res = mockResponse();
    await register(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 for weak password', async () => {
    const req = mockRequest({ email: 'test@example.com', username: 'test', password: 'short' });
    const res = mockResponse();
    await register(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if user already exists', async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue({ email: 'test@example.com' });
    const req = mockRequest({ email: 'test@example.com', username: 'test', password: 'Pass123!' });
    const res = mockResponse();
    await register(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 201 on successful registration', async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(null);
    (createUser as jest.Mock).mockResolvedValue({
      _id: '123',
      email: 'test@example.com',
      username: 'test'
    });
    (random as jest.Mock).mockReturnValue('salt');
    (authentication as jest.Mock).mockReturnValue('hashed');
    const req = mockRequest({ email: 'test@example.com', username: 'test', password: 'Pass123!' });
    const res = mockResponse();
    await register(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Registration successful'
    }));
  });
});

// --------------------
// LOGOUT TEST
// --------------------
describe('logout', () => {
  it('should clear cookie and return 200', async () => {
    const req = mockRequest();
    const res = mockResponse();
    await logout(req as any, res as any);
    expect(res.clearCookie).toHaveBeenCalledWith('AUTH', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// --------------------
// PASSWORD RESET REQUEST
// --------------------
describe('requestPasswordReset', () => {
  it('should return 400 if no email', async () => {
    const req = mockRequest({});
    const res = mockResponse();
    await requestPasswordReset(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 200 if user does not exist (no leak)', async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(null);
    const req = mockRequest({ email: 'nonexistent@example.com' });
    const res = mockResponse();
    await requestPasswordReset(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 200 and debug info for valid user', async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue({ email: 'test@example.com' });
    (random as jest.Mock).mockReturnValue('token');
    (setResetToken as jest.Mock).mockResolvedValue(true);
    const req = mockRequest({ email: 'test@example.com' });
    const res = mockResponse();
    await requestPasswordReset(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      debug: expect.any(Object)
    }));
  });
});

// --------------------
// RESET PASSWORD
// --------------------
describe('resetPassword', () => {
  it('should return 400 if missing token or password', async () => {
    const req = mockRequest({});
    const res = mockResponse();
    await resetPassword(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if invalid reset token', async () => {
    (getUserByResetToken as jest.Mock).mockResolvedValue(null);
    const req = mockRequest({ token: 'invalid', newPassword: 'Pass123!' });
    const res = mockResponse();
    await resetPassword(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 200 when password reset is successful', async () => {
    const mockUser = { _id: '123', email: 'test@example.com' };
    (getUserByResetToken as jest.Mock).mockResolvedValue(mockUser);
    (random as jest.Mock).mockReturnValue('salt');
    (authentication as jest.Mock).mockReturnValue('hashed');
    (updateUserById as jest.Mock).mockResolvedValue(true);
    (clearResetToken as jest.Mock).mockResolvedValue(true);
    const req = mockRequest({ token: 'valid', newPassword: 'Pass123!' });
    const res = mockResponse();
    await resetPassword(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// --------------------
// SHORT EXPIRY LOGIN
// --------------------
describe('loginWithShortExpiry', () => {
  it('should return 200 and cookie with 1 min expiry', async () => {
    const mockUser = {
      authentication: { salt: 's', password: 'hash' },
      _id: '123',
      save: jest.fn(),
      email: 'test@example.com',
      username: 'tester'
    };
    (getUserByEmailWithAuth as jest.Mock).mockResolvedValue(mockUser);
    (authentication as jest.Mock).mockImplementation((salt, val) => val === 'pass' ? 'hash' : 'session');
    (random as jest.Mock).mockReturnValue('salt');
    const req = mockRequest({ email: 'test@example.com', password: 'pass' });
    const res = mockResponse();
    await loginWithShortExpiry(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledWith(
      'AUTH',
      expect.any(String),
      expect.objectContaining({ maxAge: 60 * 1000 })
    );
  });
});
