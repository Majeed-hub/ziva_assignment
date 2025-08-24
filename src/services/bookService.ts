import prisma from '../config/database';
import { UpdateBookRequest, BookSearchQuery } from '../types';
import { AppError } from '../middleware/errorHandler';
import { generatePagination } from '../utils/helper';

export class BookService {
  static async createBook(bookData: any) {
    // Check if ISBN already exists & the book is not soft deleted
    const existingBook = await prisma.book.findUnique({
      where: { isbn: bookData.isbn, deletedAt: null }
    });

    if (existingBook) {
      throw new AppError('Book with this ISBN already exists', 400);
    }

    let authorId = bookData.authorId;

    // Create author if provided
    if (bookData.author && !authorId) {
      const existingAuthor = await prisma.author.findUnique({
        where: { email: bookData.author.email }
      });

      if (existingAuthor) {
        authorId = existingAuthor.id;
      } else {
        const newAuthor = await prisma.author.create({
          data: bookData.author
        });
        authorId = newAuthor.id;
      }
    }

    // Verify author exists
    const author = await prisma.author.findUnique({
      where: { id: authorId }
    });

    if (!author) {
      throw new AppError('Author not found', 404);
    }

    const book = await prisma.book.create({
      data: {
        title: bookData.title,
        isbn: bookData.isbn,
        publicationYear: bookData.publicationYear,
        totalCopies: bookData.totalCopies,
        availableCopies: bookData.totalCopies,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Create book copies
    const bookCopies = Array.from({ length: bookData.totalCopies }, () => ({
      bookId: book.id,
    }));

    await prisma.bookCopy.createMany({
      data: bookCopies
    });

    return book;
  }

  static async getAllBooks(query: BookSearchQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.title) {
      where.title = { contains: query.title, mode: 'insensitive' };
    }

    if (query.isbn) {
      where.isbn = { contains: query.isbn };
    }

    if (query.author) {
      where.author = {
        name: { contains: query.author, mode: 'insensitive' }
      };
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({

        // only records with isActive true should be retrieved
        where: {isActive: true},
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: { bookCopies: true, reservations: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.book.count({ where })
    ]);

    const pagination = generatePagination(page, limit, total);

    return { books, pagination };
  }

  static async getBookById(bookId: string) {
    const book = await prisma.book.findUnique({
      where: { id: bookId, deletedAt: null },
      include: {
        author: {
          select: { id: true, name: true, email: true, bio: true }
        },
        bookCopies: {
          select: {
            id: true,
            condition: true,
            borrowRecords: {
              where: { status: 'ACTIVE' },
              select: { id: true, dueDate: true }
            }
          }
        },
        reservations: {
          where: { status: 'PENDING' },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    return book;
  }

  static async updateBook(bookId: string, updateData: UpdateBookRequest) {
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId, deletedAt: null }
    });

    if (!existingBook) {
      throw new AppError('Book not found', 404);
    }

    // If ISBN is being updated, check for duplicates
    if (updateData.isbn && updateData.isbn !== existingBook.isbn) {
      const duplicateBook = await prisma.book.findUnique({
        where: { isbn: updateData.isbn }
      });

      if (duplicateBook) {
        throw new AppError('Book with this ISBN already exists', 400);
      }
    }

    // Handle total copies update
    if (updateData.totalCopies && updateData.totalCopies !== existingBook.totalCopies) {
      const currentCopies = await prisma.bookCopy.count({
        where: { bookId }
      });

      if (updateData.totalCopies > currentCopies) {
        // Add new copies
        const newCopies = Array.from({ length: updateData.totalCopies - currentCopies }, () => ({
          bookId,
        }));

        await prisma.bookCopy.createMany({
          data: newCopies
        });
      } else if (updateData.totalCopies < currentCopies) {

        // Remove excess copies (only if they're not borrowed)
        const copiesToRemove = await prisma.bookCopy.findMany({
          where: {
            bookId,
            borrowRecords: { none: { status: 'ACTIVE' } }
          },
          take: currentCopies - updateData.totalCopies
        });

        await prisma.bookCopy.deleteMany({
          where: {
            id: { in: copiesToRemove.map(copy => copy.id) }
          }
        });
      }

      // Update available copies
      const activeBorrows = await prisma.borrowRecord.count({
        where: {
          bookCopy: { bookId },
          status: 'ACTIVE'
        }
      });
      
      if (updateData.totalCopies < activeBorrows) {
          throw new AppError('Cannot reduce total copies below the number of active borrows', 400);
        }


      const availableCopies = updateData.totalCopies - activeBorrows;
      
      // Update the book with new available copies
      await prisma.book.update({
        where: { id: bookId },
        data: { availableCopies }
      });
    }

    const book = await prisma.book.update({
      where: { id: bookId },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return book;
  }

  static async deleteBook(bookId: string) {
    const book = await prisma.book.findUnique({
      where: { id: bookId, deletedAt: null }
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check for active borrows
    const activeBorrows = await prisma.borrowRecord.count({
      where: {
        bookCopy: { bookId },
        status: 'ACTIVE'
      }
    });

    if (activeBorrows > 0) {
      throw new AppError('Cannot delete book with active borrows', 400);
    }

    // books delete
    await prisma.book.update({
      where: { id: bookId },
      data: { deletedAt: new Date()}
    });

    return { message: 'Book deleted successfully' };
  }

  static async createAuthor(authorData: { name: string; email: string; bio?: string }) {
    const existingAuthor = await prisma.author.findUnique({
      where: { email: authorData.email }
    });

    if (existingAuthor) {
      throw new AppError('Author with this email already exists', 400);
    }

    const author = await prisma.author.create({
      data: authorData
    });

    return author;
  }

  static async getAllAuthors() {
    const authors = await prisma.author.findMany({

      // author with deleteAt = null
      where: { deletedAt : null},

      include: {
        _count: {
          select: { books: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return authors;
  }

  // soft delete author
  static async deleteAuthor(authorId: string){

    // check if auhtor exist or not
    const existingAuthor = await prisma.author.findUnique({
      where: { id: authorId }
    });

    if (!existingAuthor) {
      throw new AppError('Author with this Id does not exists', 400);
    }

     await prisma.author.update({
      where: {id: authorId},
      data: { deletedAt: new Date()}
    })

    return { message: " Author Deleted Successfully"}
  }
}