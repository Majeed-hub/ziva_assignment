import { ApiResponse } from '../types';

export const createResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  error?: string
): ApiResponse<T> => {
  return {
    success,
    message,
    data,
    error,
  };
};

export const calculateDueDate = (borrowDate: Date, daysToAdd: number = 14): Date => {
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + daysToAdd);
  return dueDate;
};

export const isOverdue = (dueDate: Date): boolean => {
  return new Date() > dueDate;
};

export const generatePagination = (page: number, limit: number, total: number) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};