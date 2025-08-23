import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/bookService';
import { createResponse } from '../utils/helper';

export class BookController {
  static async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await BookService.createBook(req.body);
      res.status(201).json(
        createResponse(true, 'Book created successfully', book)
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAllBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookService.getAllBooks(req.query as any);
      res.status(200).json(
        createResponse(true, 'Books retrieved successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  static async getBookById(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await BookService.getBookById(req.params.id);
      res.status(200).json(
        createResponse(true, 'Book retrieved successfully', book)
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateBook(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await BookService.updateBook(req.params.id, req.body);
      res.status(200).json(
        createResponse(true, 'Book updated successfully', book)
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteBook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookService.deleteBook(req.params.id);
      res.status(200).json(
        createResponse(true, 'Book deleted successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }


}