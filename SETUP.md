# 🚀 Quick Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials and JWT secrets
# Update the following variables:
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/library_db"

# JWT Configuration (IMPORTANT: Use strong secrets in production)
JWT_SECRET="your-super-secret-access-token-key"
JWT_EXPIRE="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key"
JWT_REFRESH_EXPIRE="7d"

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN="*"
```

**⚠️ Security Note:** 
- Use strong, unique secrets for JWT_SECRET and JWT_REFRESH_SECRET
- Never commit real secrets to version control
- In production, use environment-specific secret management

### 3. Database Setup
```bash
# Generate Prisma client (includes new RefreshToken model)
npm run db:generate

# Apply database migrations (creates all tables including refresh_tokens)
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

Or run all database setup commands at once:
```bash
npm run setup
```

**📋 Database Tables Created:**
- `users` - User accounts and profiles
- `authors` - Book authors information
- `books` - Book catalog and inventory
- `book_copies` - Individual book copies tracking
- `borrow_records` - Borrowing history and status
- `reservations` - Book reservation queue
- `refresh_tokens` - **NEW**: Secure refresh token storage

### 4. Start the Server
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

## 🔐 Default Login Credentials

After seeding, you can use these credentials:

**Admin Account:**
- Email: `admin@library.com`
- Password: `admin123`

**Regular User Accounts:**
- Email: `john@example.com` / Password: `user123`
- Email: `jane@example.com` / Password: `user123`

## 🧪 Testing the API

1. **Health Check:**
   ```
   GET http://localhost:3000/api/health
   ```

2. **Login (Returns Access & Refresh Tokens):**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@library.com","password":"admin123"}'
   ```
   
   **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "user": { ... },
       "accessToken": "eyJhbGciOiJIUzI1NiIs...",
       "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
     }
   }
   ```

3. **Test Refresh Token:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"YOUR_REFRESH_TOKEN_HERE"}'
   ```

4. **Get Books (Using Access Token):**
   ```bash
   curl -X GET http://localhost:3000/api/books \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
   ```

5. **Test Logout:**
   ```bash
   # Logout from current device
   curl -X POST http://localhost:3000/api/auth/logout \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"YOUR_REFRESH_TOKEN_HERE"}'
   
   # Logout from all devices
   curl -X POST http://localhost:3000/api/auth/logout-all \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
   ```

## 📊 Database Management

```bash
# View database in browser
npm run db:studio

# Reset database (WARNING: Deletes all data)
npm run db:reset

# Create new migration
npm run db:migrate
```

## 🔧 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists and credentials are correct
- Run `npm run db:generate` after schema changes

### Authentication Issues
- Verify JWT_SECRET and JWT_REFRESH_SECRET are set in .env
- Check token expiration times (JWT_EXPIRE, JWT_REFRESH_EXPIRE)
- Ensure refresh tokens are stored in database correctly
- Use `npm run db:studio` to inspect refresh_tokens table

### Migration Issues
- If migration fails, check database permissions
- For development, you can reset with `npm run db:reset`
- Ensure Prisma schema matches your database structure

### Port Already in Use
- Change PORT in .env file
- Or kill the process using the port: `lsof -ti:3000 | xargs kill`

### TypeScript Errors
- Run `npm run build` to check for compilation errors
- Ensure all dependencies are installed
- Check for type mismatches in refresh token implementation

## 📁 Project Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Helper functions
├── validation/      # Input validation schemas
└── app.ts          # Main application file
```

## 🔄 Refresh Token Features

This setup includes a complete refresh token implementation with:

### ✅ **Security Features**
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Token rotation on refresh
- Database-stored refresh tokens with revocation
- Separate secrets for access and refresh tokens

### ✅ **API Endpoints**
- `POST /api/auth/login` - Get access & refresh tokens
- `POST /api/auth/refresh` - Exchange refresh token for new tokens
- `POST /api/auth/logout` - Revoke specific refresh token
- `POST /api/auth/logout-all` - Revoke all user refresh tokens

### ✅ **Database Integration**
- `refresh_tokens` table for secure token storage
- Automatic cleanup of expired/revoked tokens
- User cascade deletion includes refresh tokens

## 🎯 Next Steps

1. **Test the Authentication Flow** - Use the provided curl commands
2. **Customize Token Expiration** - Adjust JWT_EXPIRE and JWT_REFRESH_EXPIRE
3. **Implement Frontend Integration** - Handle token refresh in your client app
4. **Add Monitoring** - Track token usage and security events
5. **Deploy Securely** - Use proper secrets management in production

## 📚 Additional Resources

- **API Documentation**: Check `test-api.http` for more examples
- **Refresh Token Guide**: See `REFRESH_TOKEN_GUIDE.md` for detailed implementation
- **Database Schema**: View `src/prisma/schema.prisma` for complete data model
- **Tests**: Run `npm test` to verify refresh token functionality

Happy coding! 🎉