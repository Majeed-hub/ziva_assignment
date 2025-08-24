import { AuthService } from '../../src/services/authService';
import { AppError } from '../../src/middleware/errorHandler';
import prisma from '../../src/config/database';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../../src/config/jwt';

// Mock the database
jest.mock('../../src/config/database', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
}));

describe('AuthService - Refresh Token', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    password: 'hashedpassword',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      const refreshToken = jwt.sign(
        { userId: mockUser.id, type: 'refresh' },
        JWT_CONFIG.refreshSecret,
        { expiresIn: '7d' }
      );

      const mockStoredToken = {
        id: 'token-123',
        token: refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: null,
        user: mockUser,
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockStoredToken);
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await AuthService.refreshToken({ refreshToken });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: mockStoredToken.id },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should throw error for invalid refresh token', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.refreshToken({ refreshToken: 'invalid-token' })
      ).rejects.toThrow(AppError);
    });

    it('should throw error for expired refresh token', async () => {
      const expiredToken = {
        id: 'token-123',
        token: 'some-token',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() - 1000), // Expired
        revokedAt: null,
        user: mockUser,
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(expiredToken);

      await expect(
        AuthService.refreshToken({ refreshToken: 'expired-token' })
      ).rejects.toThrow(AppError);
    });

    it('should throw error for revoked refresh token', async () => {
      const revokedToken = {
        id: 'token-123',
        token: 'some-token',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: new Date(), // Revoked
        user: mockUser,
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(revokedToken);

      await expect(
        AuthService.refreshToken({ refreshToken: 'revoked-token' })
      ).rejects.toThrow(AppError);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke refresh token successfully', async () => {
      const mockToken = {
        id: 'token-123',
        token: 'some-token',
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockToken);
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});

      await AuthService.revokeRefreshToken('some-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: mockToken.id },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should handle non-existent token gracefully', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.revokeRefreshToken('non-existent-token')
      ).resolves.not.toThrow();
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all user tokens successfully', async () => {
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      await AuthService.revokeAllUserTokens('user-123');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          revokedAt: null,
        },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});