import { Request, Response, NextFunction } from 'express';
import { BorrowService } from '../services/borrowService';
import { createResponse } from '../utils/helper';

export class BorrowController {
  static async borrowBook(req: Request, res: Response, next: NextFunction) {
    try {
      const borrowRecord = await BorrowService.borrowBook(req.user!.id, req.body);
      res.status(201).json(
        createResponse(true, 'Book borrowed successfully', borrowRecord)
      );
    } catch (error) {
      next(error);
    }
  }

  static async returnBook(req: Request, res: Response, next: NextFunction) {
    try {
      const borrowRecord = await BorrowService.returnBook(req.user!.id, req.params.borrowId);
      res.status(200).json(
        createResponse(true, 'Book returned successfully', borrowRecord)
      );
    } catch (error) {
      next(error);
    }
  }

  static async reserveBook(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await BorrowService.reserveBook(req.user!.id, req.body);
      res.status(201).json(
        createResponse(true, 'Book reserved successfully', reservation)
      );
    } catch (error) {
      next(error);
    }
  }

  static async getBorrowHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await BorrowService.getUserBorrowHistory(req.user!.id);
      res.status(200).json(
        createResponse(true, 'Borrow history retrieved successfully', history)
      );
    } catch (error) {
      next(error);
    }
  }

  static async getReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const reservations = await BorrowService.getUserReservations(req.user!.id);
      res.status(200).json(
        createResponse(true, 'Reservations retrieved successfully', reservations)
      );
    } catch (error) {
      next(error);
    }
  }

  static async cancelReservation(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await BorrowService.cancelReservation(req.user!.id, req.params.id);
      res.status(200).json(
        createResponse(true, 'Reservation cancelled successfully', reservation)
      );
    } catch (error) {
      next(error);
    }
  }

  static async getOverdueBooks(_req: Request, res: Response, next: NextFunction) {
    try {
      const overdueBooks = await BorrowService.getOverdueBooks();
      res.status(200).json(
        createResponse(true, 'Overdue books retrieved successfully', overdueBooks)
      );
    } catch (error) {
      next(error);
    }
  }
}