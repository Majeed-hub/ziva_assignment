import { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../src/middleware/validation';
import { z } from 'zod';

// Mock the helper
jest.mock('../../src/utils/helper', () => ({
  createResponse: jest.fn((success, message, data, error) => ({
    success,
    message,
    data,
    error,
  })),
}));

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should call next() for valid data', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    mockRequest.body = {
      name: 'John Doe',
      age: 25,
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid data', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    mockRequest.body = {
      name: 'John Doe',
      age: 'invalid-age', // should be number
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 for missing required fields', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    mockRequest.body = {
      name: 'John Doe',
      // missing age
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });
});