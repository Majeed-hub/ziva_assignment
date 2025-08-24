# 📚 Library Management System API

A REST API for managing a library system with JWT authentication, book management, and borrowing functionality.

## Features

- **User Management**: Register, login/logout with JWT refresh tokens
- **Book Management**: CRUD operations for books and authors
- **Borrowing System**: Borrow and return books with due date tracking
- **Reservation System**: Reserve books when unavailable
- **Search & Filter**: Find books by title, author, or ISBN
- **Admin Panel**: Admin-only operations for book management

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh token rotation
- **Validation**: Zod for input validation
- **Testing**: Jest with comprehensive test coverage

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm

### Setup
```bash
# Clone and install
git clone <repository-url>
cd library-management-system
npm install

# Environment setup
cp .env.example .env
# Edit .env with your database URL and JWT secrets

# Database setup
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL="postgresql://username:password@localhost:5432/library_db"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRE="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRE="7d"
PORT=3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login (returns access & refresh tokens)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout from current device
- `POST /api/auth/logout-all` - Logout from all devices

### Books
- `GET /api/books` - List books (with search & pagination)
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Create book (Admin)
- `PUT /api/books/:id` - Update book (Admin)
- `DELETE /api/books/:id` - Delete book (Admin)

### Borrowing
- `POST /api/borrow` - Borrow a book
- `POST /api/return/:borrowId` - Return a book
- `GET /api/my-books` - User's borrowed books
- `GET /api/overdue` - Overdue books (Admin)

### Reservations
- `POST /api/reserve` - Reserve a book
- `GET /api/reservations` - User's reservations
- `DELETE /api/reservations/:id` - Cancel reservation

## Authentication

The API uses JWT tokens with refresh token rotation for security:

- **Access tokens**: Short-lived (15 minutes)
- **Refresh tokens**: Long-lived (7 days), stored in database
- **Token rotation**: New refresh token issued on each refresh
- **Selective logout**: Logout from current device or all devices

### Login Response
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Usage
```bash
# Login
curl -X POST /api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.com","password":"admin123"}'

# Use access token
curl -X GET /api/books \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Refresh token
curl -X POST /api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

## Default Credentials

After running `npm run db:seed`:

- **Admin**: `admin@library.com` / `admin123`
- **User**: `john@example.com` / `user123`

## Testing

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report
```

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes
├── middleware/      # Express middleware
├── prisma/          # Database schema & migrations
├── types/           # TypeScript definitions
└── validation/      # Input validation schemas
```

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database
```

## License

MIT License

