# 📚 Library Management System API

A complete REST API for managing a library system with user authentication, book management, and borrowing functionality.

## 🎯 Project Overview

This is a **Library Management System** built with modern web technologies. Think of it as a digital system that helps librarians manage books, users, and borrowing activities - just like a real library but online!

### What This System Does:
- **User Management**: Register users, login/logout, manage profiles
- **Book Management**: Add books, update information, track copies
- **Author Management**: Manage book authors and their information
- **Borrowing System**: Let users borrow and return books
- **Reservation System**: Allow users to reserve books when they're not available
- **Search & Filter**: Find books by title, author, or other criteria

## 🏗️ Architecture Overview

The project follows a **layered architecture** pattern, which means different parts of the code have specific responsibilities:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Routes    │  │ Controllers │  │ Middleware  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Services  │  │ Validation  │  │   Utils     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Prisma   │  │  Database   │  │   Config    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure Explained

### 🚀 **Entry Point**
- `server.ts` - The main server file that starts everything

### 🔐 **Authentication & Security**
- `config/jwt.ts` - JWT token configuration
- `middleware/auth.ts` - Authentication middleware
- `middleware/validation.ts` - Input validation and sanitization
- `middleware/errorHandler.ts` - Error handling middleware

### 🛣️ **API Routes**
- `routes/index.ts` - Main router that connects all route modules
- `routes/auth.ts` - User authentication routes (login, register, etc.)
- `routes/books.ts` - Book management routes
- `routes/borrow.ts` - Borrowing and reservation routes

### 🎮 **Controllers** (Request Handlers)
- `controllers/authController.ts` - Handles user authentication requests
- `controllers/bookController.ts` - Handles book-related requests
- `controllers/borrowController.ts` - Handles borrowing requests

### 💼 **Services** (Business Logic)
- `services/authService.ts` - User authentication business logic
- `services/bookService.ts` - Book management business logic
- `services/borrowService.ts` - Borrowing business logic

### 🗄️ **Database**
- `prisma/schema.prisma` - Database schema definition
- `prisma/seed.ts` - Sample data for testing
- `config/database.ts` - Database connection configuration

### ✅ **Validation**
- `validation/schemas.ts` - Input validation rules using Zod

### 🛠️ **Utilities**
- `utils/logger.ts` - Logging functionality
- `utils/helpers.ts` - Helper functions
- `types/index.ts` - TypeScript type definitions

## 🗄️ Database Schema Explained

The database has 6 main tables:

### 1. **Users Table** 👥
```sql
- id: Unique identifier
- name: User's full name
- email: Email address (unique)
- phone: Phone number (optional)
- password: Encrypted password
- role: USER or ADMIN
- createdAt: When account was created
```

### 2. **Books Table** 📚
```sql
- id: Unique identifier
- title: Book title
- isbn: International Standard Book Number (unique)
- publicationYear: When book was published
- availableCopies: How many copies are available to borrow
- totalCopies: Total number of copies owned
- isActive: Whether book is available in system
- createdAt: When book was added
```

### 3. **Authors Table** ✍️
```sql
- id: Unique identifier
- name: Author's name
- email: Author's email (unique)
- bio: Author biography (optional)
- createdAt: When author was added
```



### 5. **BookCopies Table** 📖
```sql
- id: Unique identifier
- bookId: Reference to book
- condition: EXCELLENT, GOOD, FAIR, or POOR
- createdAt: When copy was added
```
*This tracks individual physical copies of books*

### 6. **BorrowRecords Table** 📋
```sql
- id: Unique identifier
- userId: Who borrowed the book
- bookCopyId: Which specific copy was borrowed
- borrowedAt: When book was borrowed
- dueDate: When book should be returned
- returnedAt: When book was actually returned (null if not returned)
- status: ACTIVE, RETURNED, or OVERDUE
- createdAt: When record was created
```

### 7. **Reservations Table** ⏰
```sql
- id: Unique identifier
- userId: Who reserved the book
- bookId: Which book was reserved
- status: PENDING, FULFILLED, or CANCELLED
- createdAt: When reservation was made
```

## 🔄 How Data Flows Through the System

### Example: User Borrows a Book

1. **User sends request**: `POST /api/borrow` with book ID
2. **Route receives request**: `routes/borrow.ts` catches the request
3. **Middleware processes**: Authentication checks if user is logged in
4. **Controller handles**: `borrowController.ts` receives the request
5. **Service processes**: `borrowService.ts` contains the business logic
6. **Database updated**: Prisma updates the database
7. **Response sent**: Success/error message sent back to user

```
User Request → Route → Middleware → Controller → Service → Database → Response
```

## 🔐 Security Features

### 1. **JWT Authentication**
- Users get a token when they login
- Token is required for protected routes
- Tokens expire after a certain time

### 2. **Password Security**
- Passwords are encrypted using bcrypt
- Strong password requirements enforced
- Passwords never stored in plain text

### 3. **Input Validation**
- All user inputs are validated using Zod
- Prevents malicious data from entering system
- Ensures data quality and consistency

### 4. **Rate Limiting**
- Limits how many requests a user can make
- Prevents abuse and attacks
- Protects server resources

### 5. **CORS Protection**
- Controls which websites can access the API
- Prevents unauthorized cross-origin requests

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd library-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**
   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Push schema to database
   npm run db:seed      # Add sample data
   ```

5. **Start the server**
   ```bash
   npm run dev  # Development mode
   # or
   npm run build && npm start  # Production mode
   ```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/library_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN="*"
```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login with JWT token

### Books Management
- `GET /api/books` - Get all books (with pagination & search)
- `GET /api/books/:id` - Get book details with author info
- `POST /api/books` - Add a new book (Admin only)
- `PUT /api/books/:id` - Update book details (Admin only)
- `DELETE /api/books/:id` - Delete a book (Admin only)

### Borrowing System
- `POST /api/borrow` - Borrow a book (authenticated users)
- `POST /api/return/:borrowId` - Return a borrowed book
- `GET /api/my-books` - Get user's borrowed books history
- `GET /api/overdue` - Get all overdue books (Admin only)

### Reservation System
- `POST /api/reserve` - Reserve a book when not available
- `GET /api/reservations` - Get user's reservations
- `DELETE /api/reservations/:id` - Cancel a reservation

### System
- `GET /api/health` - Health check endpoint

## 🔒 Edge Cases Handled

### Borrowing Edge Cases
- ✅ User cannot borrow more than 5 books
- ✅ User cannot borrow the same book twice
- ✅ User with overdue books cannot borrow new books
- ✅ Books with pending reservations require reservation first
- ✅ Automatic selection of best condition book copies

### Reservation Edge Cases
- ✅ User cannot reserve more than 3 books
- ✅ User cannot reserve books they already borrowed
- ✅ User cannot reserve available books (must borrow directly)
- ✅ Queue position tracking for reservations
- ✅ Automatic notification when reserved book becomes available

### Return Edge Cases
- ✅ Automatic overdue status calculation
- ✅ Notification to next user in reservation queue
- ✅ Proper availability count updates
- ✅ User can only return their own books

## 🧪 Testing

```bash
npm test  # Run all tests
npm test -- --watch  # Run tests in watch mode
```

## 📚 Key Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Zod** - Input validation
- **Winston** - Logging

### Development Tools
- **Jest** - Testing framework
- **Nodemon** - Auto-restart on file changes
- **Swagger** - API documentation

## 🎓 Learning Points for Interns

### 1. **Architecture Patterns**
- **MVC Pattern**: Model-View-Controller separation
- **Layered Architecture**: Separation of concerns
- **Middleware Pattern**: Request processing pipeline

### 2. **Database Design**
- **Relationships**: One-to-many, many-to-many
- **Normalization**: Proper data structure
- **Indexing**: Performance optimization

### 3. **Security Best Practices**
- **Authentication**: JWT tokens
- **Authorization**: Role-based access
- **Input Validation**: Data sanitization
- **Rate Limiting**: Abuse prevention

### 4. **API Design**
- **RESTful Principles**: Standard HTTP methods
- **Error Handling**: Consistent error responses
- **Documentation**: Swagger/OpenAPI

### 5. **Code Organization**
- **Modular Structure**: Separate files for different concerns
- **Type Safety**: TypeScript benefits
- **Testing**: Unit and integration tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Happy Coding! 🚀**

*This project demonstrates modern web development practices and is perfect for learning full-stack development concepts.*
