import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { JWT_CONFIG } from '../config/jwt';
import { RegisterRequest, LoginRequest, JwtPayload, AuthTokens, RefreshTokenRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  static async register(userData: RegisterRequest) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      }
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    
    return { user, ...tokens };
  }

  static async login(credentials: LoginRequest) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: userResponse, ...tokens };
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async updateProfile(userId: string, updateData: Partial<RegisterRequest>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      }
    });

    return user;
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return { message: 'Password changed successfully' };
  }

  static async refreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<AuthTokens> {
    const { refreshToken } = refreshTokenRequest;

    // Find the refresh token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Verify the refresh token
    try {
      jwt.verify(refreshToken, JWT_CONFIG.refreshSecret);
    } catch (error) {
      // Revoke the token if verification fails
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() }
      });
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role
    );

    // Revoke the old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    });

    return tokens;
  }

  static async revokeRefreshToken(refreshToken: string): Promise<void> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (storedToken) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() }
      });
    }
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { 
        userId,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });
  }

  private static generateAccessToken(userId: string, email: string, role: any): string {
    const payload: JwtPayload = { userId, email, role };
    return jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn } as jwt.SignOptions);
  }

  private static async generateTokens(userId: string, email: string, role: any): Promise<AuthTokens> {
    const accessToken = this.generateAccessToken(userId, email, role);
    
    // Generate refresh token
    const refreshTokenPayload = { userId, type: 'refresh' };
    const refreshToken = jwt.sign(refreshTokenPayload, JWT_CONFIG.refreshSecret, { 
      expiresIn: JWT_CONFIG.refreshExpiresIn 
    } as jwt.SignOptions);

    // Calculate expiration date
    const expiresAt = new Date();
    const refreshExpiry = JWT_CONFIG.refreshExpiresIn || '7d';
    const expirationDays = parseInt(refreshExpiry.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt
      }
    });

    return { accessToken, refreshToken };
  }
}