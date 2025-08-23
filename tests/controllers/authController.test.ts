import request from 'supertest';
import express from 'express';
import { AuthController } from '../../src/controllers/authController';
import { AuthService } from '../../src/services/authService';
import { UserRole } from '../../src/types';

// Mock the auth service and helper
jest.mock('../../src/services/authService');
jest.mock('../../src/utils/helper', () => ({
    createResponse: jest.fn((success, message, data, error) => ({
        success,
        message,
        data,
        error,
    })),
}));

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

const app = express();
app.use(express.json());
app.post('/register', AuthController.register);
app.post('/login', AuthController.login);

describe('AuthController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /register', () => {
        it('should return 201 for successful registration', async () => {
            const mockUser = {
                id: '1',
                name: 'John Doe',
                email: 'test@example.com',
                phone: '1234567890',
                role: UserRole.USER,
                createdAt: new Date(),
            };
            const mockToken = 'mock.jwt.token';

            mockAuthService.register.mockResolvedValue({
                user: mockUser,
                token: mockToken,
            });

            const response = await request(app)
                .post('/register')
                .send({
                    name: 'John Doe',
                    email: 'test@example.com',
                    password: 'password123',
                    phone: '1234567890',
                });

            expect(response.status).toBe(201);
            expect(mockAuthService.register).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'test@example.com',
                password: 'password123',
                phone: '1234567890',
            });
        });

        it('should handle registration errors', async () => {
            mockAuthService.register.mockRejectedValue(new Error('User already exists'));

            await request(app)
                .post('/register')
                .send({
                    name: 'John Doe',
                    email: 'test@example.com',
                    password: 'password123',
                    phone: '1234567890',
                });

            expect(mockAuthService.register).toHaveBeenCalled();
        });
    });

    describe('POST /login', () => {
        it('should return 200 for successful login', async () => {
            const mockUser = {
                id: '1',
                name: 'John Doe',
                email: 'test@example.com',
                phone: '1234567890',
                role: UserRole.USER,
                createdAt: new Date(),
            };
            const mockToken = 'mock.jwt.token';

            mockAuthService.login.mockResolvedValue({
                user: mockUser,
                token: mockToken,
            });

            const response = await request(app)
                .post('/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(200);
            expect(mockAuthService.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });

        it('should handle login errors', async () => {
            mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

            await request(app)
                .post('/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(mockAuthService.login).toHaveBeenCalled();
        });
    });
});