import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
  publicationYear: z.number().min(1000).max(new Date().getFullYear()),
  totalCopies: z.number().min(1, 'Total copies must be at least 1'),
  authorId: z.string().uuid({ message: 'Invalid author ID' }).optional(),
  author: z.object({
    name: z.string().min(2, 'Author name must be at least 2 characters'),
    email: z.string().email({ message: 'Invalid author email format' }),
    bio: z.string().optional(),
  }).optional(),
}).refine(data => data.authorId || data.author, {
  message: 'Either authorId or author information is required',
});

export const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  isbn: z.string().min(10).optional(),
  publicationYear: z.number().min(1000).max(new Date().getFullYear()).optional(),
  totalCopies: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const borrowBookSchema = z.object({
  bookId: z.string().uuid({ message: 'Invalid book ID' }),
});

// Return book validation is handled via URL params

export const reserveBookSchema = z.object({
  bookId: z.string().uuid({ message: 'Invalid book ID' }),
});

// Author creation is handled within book creation

export const bookSearchSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  isbn: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});