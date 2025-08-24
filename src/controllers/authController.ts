import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { createResponse } from '../utils/helper';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(
        createResponse(true, 'User registered successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(
        createResponse(true, 'Login successful', result)
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getUserProfile(req.user!.id);
      res.status(200).json(
        createResponse(true, 'Profile retrieved successfully', user)
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body);
      res.status(200).json(
        createResponse(true, 'Profile updated successfully', user)
      );
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user!.id, currentPassword, newPassword);
      res.status(200).json(
        createResponse(true, 'Password changed successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await AuthService.refreshToken(req.body);
      res.status(200).json(
        createResponse(true, 'Token refreshed successfully', tokens)
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await AuthService.revokeRefreshToken(refreshToken);
      }
      res.status(200).json(
        createResponse(true, 'Logged out successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.revokeAllUserTokens(req.user!.id);
      res.status(200).json(
        createResponse(true, 'Logged out from all devices successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}