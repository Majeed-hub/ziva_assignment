import { UserRole, BookCondition, BorrowingStatus, ReservationStatus } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CreateBookRequest {
  title: string;
  isbn: string;
  publicationYear: number;
  totalCopies: number;
  authorId?: string;
  author?: {
    name: string;
    email: string;
    bio?: string;
  };
}

export interface UpdateBookRequest {
  title?: string;
  isbn?: string;
  publicationYear?: number;
  totalCopies?: number;
  availableCopies?: number;
  isActive?: boolean;
}

export interface BorrowBookRequest {
  bookId: string;
}

// Return book uses URL parameter instead of request body

export interface ReserveBookRequest {
  bookId: string;
}

export interface BookSearchQuery {
  title?: string;
  author?: string;
  isbn?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export { UserRole, BookCondition, BorrowingStatus, ReservationStatus };