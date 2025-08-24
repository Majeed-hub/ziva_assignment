import prisma from '../config/database';
import { BorrowBookRequest, ReserveBookRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { calculateDueDate, isOverdue } from '../utils/helper';
import { BorrowingStatus } from '@prisma/client';

export class BorrowService {
  static async borrowBook(userId: string, borrowData: BorrowBookRequest) {
    
    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: { id: borrowData.bookId },
      include: {
        bookCopies: {
          where: {
            borrowRecords: { none: { status: 'ACTIVE' } }
          },
          orderBy: { condition: 'desc' }, // Prefer better condition books
          take: 1
        },
        reservations: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (!book.isActive) {
      throw new AppError('Book is not available for borrowing', 400);
    }

    if (book.availableCopies <= 0 || book.bookCopies.length === 0) {
      throw new AppError('No copies available for borrowing. You can reserve this book instead.', 400);
    }

    // Check if user already has this book borrowed
    const existingBorrow = await prisma.borrowRecord.findFirst({
      where: {
        userId,
        bookCopy: { bookId: borrowData.bookId },
        status: 'ACTIVE'
      }
    });

    if (existingBorrow) {
      throw new AppError('You already have this book borrowed', 400);
    }

    // Check user's borrowing limit max 3
    const activeBorrows = await prisma.borrowRecord.count({
      where: { userId, status: 'ACTIVE' }
    });

    // one user can borrow only 3 books at a time
    if (activeBorrows >= 3) {
      throw new AppError('You have reached the maximum borrowing limit (5 books)', 400);
    }

    // Check if user has overdue books
    const overdueBooks = await prisma.borrowRecord.count({
      where: {
        userId,
        status: 'ACTIVE',
        dueDate: { lt: new Date() }
      }
    });

    if (overdueBooks > 0) {
      throw new AppError('You have overdue books. Please return them before borrowing new books.', 400);
    }

    // Check if there are reservations and user is not first in queue
    if (book.reservations.length > 0) {
      const firstReservation = book.reservations[0];
      if (firstReservation.userId !== userId) {
        throw new AppError('This book is reserved by other users. You need to reserve it first.', 400);
      }
    }

    const borrowDate = new Date();
    const dueDate = calculateDueDate(borrowDate);

    // Create borrow record
    const borrowRecord = await prisma.borrowRecord.create({
      data: {
        userId,
        bookCopyId: book.bookCopies[0].id,
        borrowedAt: borrowDate,
        dueDate,
        status: 'ACTIVE'
      },
      include: {
        bookCopy: {
          include: {
            book: {
              include: { author: true }
            }
          }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Update book available copies
    await prisma.book.update({
      where: { id: borrowData.bookId },
      data: { availableCopies: { decrement: 1 } }
    });

    // Fulfill user's reservation if they had one
    const userReservation = await prisma.reservation.findFirst({
      where: {
        userId,
        bookId: borrowData.bookId,
        status: 'PENDING'
      }
    });

    if (userReservation) {
      await prisma.reservation.update({
        where: { id: userReservation.id },
        data: { status: 'FULFILLED' }
      });
    }

    return borrowRecord;
  }

  static async returnBook(userId: string, borrowRecordId: string) {
    const borrowRecord = await prisma.borrowRecord.findUnique({
      where: { id: borrowRecordId },
      include: {
        bookCopy: {
          include: { book: true }
        },
        user: true
      }
    });

    if (!borrowRecord) {
      throw new AppError('Borrow record not found', 404);
    }

    if (borrowRecord.userId !== userId) {
      throw new AppError('You can only return your own borrowed books', 403);
    }

    if (borrowRecord.status !== 'ACTIVE') {
      throw new AppError('This book has already been returned', 400);
    }

    const returnDate = new Date();
    const status: BorrowingStatus = isOverdue(borrowRecord.dueDate) ? 'OVERDUE' : 'RETURNED';

    // Update borrow record
    const updatedRecord = await prisma.borrowRecord.update({
      where: { id: borrowRecordId },
      data: {
        returnedAt: returnDate,
        status
      },
      include: {
        bookCopy: {
          include: {
            book: {
              include: { author: true }
            }
          }
        }
      }
    });

    // Update book available copies
    // await prisma.book.update({
    //   where: { id: borrowRecord.bookCopy.bookId },
    //   data: { availableCopies: { increment: 1 } }
    // });

    //instead of making the copy available and notifying, assign this copy directly to the first user in the reservation table


    // Check for pending reservations and notify next user
    const nextReservation = await prisma.reservation.findFirst({
      where: {
        bookId: borrowRecord.bookCopy.bookId,
        status: 'PENDING'
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

      if (nextReservation) {

      const borrowDate = new Date();
      const dueDate = calculateDueDate(borrowDate);

    // map the returned copy to the nextReservation
      const FulfilledReservation = await prisma.borrowRecord.create({
      data: {
        userId: nextReservation?.user.id,
        bookCopyId: borrowRecord.bookCopy.id,
        borrowedAt: borrowDate,
        dueDate,
        status: 'ACTIVE'
      },
      include: {
        bookCopy: {
          include: {
            book: {
              include: { author: true }
            }
          }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // change reservation status
 
      await prisma.reservation.update({
        where: { id: nextReservation.id },
        data: { status: 'FULFILLED' }
      });

    }

    // let notificationMessage = null;
    // if (nextReservation) {
    //   notificationMessage = `Book is now available for ${nextReservation.user.name} (${nextReservation.user.email})`;
    // }

   
    return { 
      borrowRecord: updatedRecord, 
      // notification: notificationMessage 
    };
  }

  static async reserveBook(userId: string, reserveData: ReserveBookRequest) {
    const book = await prisma.book.findUnique({
      where: { id: reserveData.bookId },
      include: {
        reservations: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (!book.isActive) {
      throw new AppError('Book is not available for reservation', 400);
    }

    // Check if user already has a reservation for this book
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        userId,
        bookId: reserveData.bookId,
        status: 'PENDING'
      }
    });

    if (existingReservation) {
      throw new AppError('You already have a pending reservation for this book', 400);
    }

    // Check if user already has this book borrowed
    const existingBorrow = await prisma.borrowRecord.findFirst({
      where: {
        userId,
        bookCopy: { bookId: reserveData.bookId },
        status: 'ACTIVE'
      }
    });

    if (existingBorrow) {
      throw new AppError('You already have this book borrowed', 400);
    }

    // Check user's active reservations limit (max 3)
    const activeReservations = await prisma.reservation.count({
      where: { userId, status: 'PENDING' }
    });

    if (activeReservations >= 3) {
      throw new AppError('You have reached the maximum reservation limit (3 books)', 400);
    }

    // If book is available, suggest borrowing instead
    if (book.availableCopies > 0) {
      throw new AppError('Book is currently available. You can borrow it directly instead of reserving.', 400);
    }

    // Calculate queue position
    const queuePosition = book.reservations.length + 1;

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        bookId: reserveData.bookId,
        status: 'PENDING'
      },
      include: {
        book: {
          include: { author: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return {
      reservation,
      queuePosition,
      message: `You are #${queuePosition} in the reservation queue for this book`
    };
  }

  static async getUserBorrowHistory(userId: string) {
    const borrowRecords = await prisma.borrowRecord.findMany({
      where: { userId },
      include: {
        bookCopy: {
          include: {
            book: {
              include: { author: true }
            }
          }
        }
      },
      orderBy: { borrowedAt: 'desc' }
    });

    return borrowRecords;
  }

  static async getUserReservations(userId: string) {
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        book: {
          include: { author: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reservations;
  }

  static async cancelReservation(userId: string, reservationId: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    });

    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    if (reservation.userId !== userId) {
      throw new AppError('You can only cancel your own reservations', 403);
    }

    if (reservation.status !== 'PENDING') {
      throw new AppError('Only pending reservations can be cancelled', 400);
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
      include: {
        book: {
          include: { author: true }
        }
      }
    });

    return updatedReservation;
  }

  static async getOverdueBooks() {
    const overdueRecords = await prisma.borrowRecord.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: new Date() }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        bookCopy: {
          include: {
            book: {
              include: { author: true }
            }
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    // Update status to OVERDUE
    if (overdueRecords.length > 0) {
      await prisma.borrowRecord.updateMany({
        where: {
          id: { in: overdueRecords.map(record => record.id) }
        },
        data: { status: 'OVERDUE' }
      });
    }

    return overdueRecords;
  }
}