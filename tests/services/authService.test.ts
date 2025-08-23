import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../src/services/authService';
import { AppError } from '../../src/middleware/errorHandler';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));
jest.mock('../../src/config/jwt', () => ({
  JWT_CONFIG: {
    secret: 'test-secret',
    expiresIn: '24h',
  },
}));

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw error if user already exists', async () => {
      const prisma = require('../../src/config/database').default;
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });

      const userData = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
      };

      await expect(AuthService.register(userData)).rejects.toThrow(AppError);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
    });

    it('should create user successfully', async () => {
      const prisma = require('../../src/config/database').default;
      const userData = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
      };

      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'USER',
        createdAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedpassword123' as never);
      prisma.user.create.mockResolvedValue(mockUser);
      mockJwt.sign.mockReturnValue('mock.jwt.token' as any);

      const result = await AuthService.register(userData);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });
  });

  describe('login', () => {
    it('should throw error for non-existent user', async () => {
      const prisma = require('../../src/config/database').default;
      prisma.user.findUnique.mockResolvedValue(null);

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(AuthService.login(credentials)).rejects.toThrow(AppError);
    });

    it('should throw error for invalid password', async () => {
      const prisma = require('../../src/config/database').default;
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'John Doe',
        phone: '1234567890',
        role: 'USER',
        createdAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(AuthService.login(credentials)).rejects.toThrow(AppError);
    });

    it('should login successfully with valid credentials', async () => {
      const prisma = require('../../src/config/database').default;
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'John Doe',
        phone: '1234567890',
        role: 'USER',
        createdAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue('mock.jwt.token' as any);

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await AuthService.login(credentials);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(credentials.email);
    });
  });
});