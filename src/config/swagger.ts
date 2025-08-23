import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management System API',
      version: '1.0.0',
      description: 'A comprehensive library management system API with user authentication, book management, and borrowing functionality.',
      contact: {
        name: 'API Support',
        email: 'support@library.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
              description: 'User role',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        Book: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Book ID',
            },
            title: {
              type: 'string',
              description: 'Book title',
            },
            author: {
              type: 'string',
              description: 'Book author',
            },
            isbn: {
              type: 'string',
              description: 'Book ISBN',
            },
            genre: {
              type: 'string',
              description: 'Book genre',
            },
            publishedYear: {
              type: 'integer',
              description: 'Year of publication',
            },
            totalCopies: {
              type: 'integer',
              description: 'Total number of copies',
            },
            availableCopies: {
              type: 'integer',
              description: 'Available copies for borrowing',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Book creation timestamp',
            },
          },
        },
        BorrowRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Borrow record ID',
            },
            userId: {
              type: 'string',
              description: 'User ID who borrowed the book',
            },
            bookId: {
              type: 'string',
              description: 'Book ID that was borrowed',
            },
            borrowDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date when book was borrowed',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Due date for returning the book',
            },
            returnDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Date when book was returned (null if not returned)',
            },
            status: {
              type: 'string',
              enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
              description: 'Current status of the borrow record',
            },
          },
        },
        Reservation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Reservation ID',
            },
            userId: {
              type: 'string',
              description: 'User ID who made the reservation',
            },
            bookId: {
              type: 'string',
              description: 'Book ID that was reserved',
            },
            reservationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date when reservation was made',
            },
            expiryDate: {
              type: 'string',
              format: 'date-time',
              description: 'Expiry date of the reservation',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'FULFILLED', 'EXPIRED', 'CANCELLED'],
              description: 'Current status of the reservation',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that caused the error',
                  },
                  message: {
                    type: 'string',
                    description: 'Error message for the field',
                  },
                },
              },
              description: 'Validation errors (if applicable)',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API files
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };