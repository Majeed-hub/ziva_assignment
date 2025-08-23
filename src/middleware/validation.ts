import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createResponse } from '../utils/helper';

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
        res.status(400).json(
          createResponse(false, 'Validation failed', null, errorMessages.join(', '))
        );
        return;
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
        res.status(400).json(
          createResponse(false, 'Query validation failed', null, errorMessages.join(', '))
        );
        return;
      }
      next(error);
    }
  };
};