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

# Edit .env with your database credentials
# Update DATABASE_URL with your PostgreSQL connection string
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed database with sample data
npm run db:seed
```

Or run all database setup commands at once:
```bash
npm run setup
```

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

2. **Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@library.com","password":"admin123"}'
   ```

3. **Get Books:**
   ```
   GET http://localhost:3000/api/books
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

### Port Already in Use
- Change PORT in .env file
- Or kill the process using the port: `lsof -ti:3000 | xargs kill`

### TypeScript Errors
- Run `npm run build` to check for compilation errors
- Ensure all dependencies are installed

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

## 🎯 Next Steps

1. **Customize the API** - Modify controllers and services for your needs
2. **Add Authentication** - Implement JWT refresh tokens
3. **Add Tests** - Write unit and integration tests
4. **Deploy** - Deploy to your preferred platform
5. **Monitor** - Add logging and monitoring

Happy coding! 🎉