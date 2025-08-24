# Refresh Token Implementation Guide

## Overview
This implementation provides secure refresh token functionality for the Library Management System API. Refresh tokens allow users to obtain new access tokens without re-entering credentials.

## Features
- **Secure Token Storage**: Refresh tokens are stored in the database with expiration dates
- **Token Rotation**: New refresh tokens are issued on each refresh, old ones are revoked
- **Selective Logout**: Users can logout from specific devices or all devices
- **Automatic Cleanup**: Expired and revoked tokens are tracked

## Database Changes
A new `RefreshToken` model has been added:
```sql
-- Run this migration to add the refresh_tokens table
-- File: src/prisma/migrations/add_refresh_tokens.sql
```

## API Endpoints

### 1. Login/Register Response
Both login and register now return both tokens:
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

### 2. Refresh Token
**POST** `/api/auth/refresh`
```json
{
  "refreshToken": "your_refresh_token_here"
}
```

Response:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### 3. Logout (Single Device)
**POST** `/api/auth/logout`
```json
{
  "refreshToken": "refresh_token_to_revoke"
}
```

### 4. Logout All Devices
**POST** `/api/auth/logout-all`
Headers: `Authorization: Bearer access_token`

## Configuration
Update your `.env` file:
```env
JWT_SECRET=your-access-token-secret
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=7d
```

## Security Features
- **Token Rotation**: Each refresh generates new tokens and revokes old ones
- **Expiration Tracking**: Database tracks token expiration and revocation
- **Cascade Deletion**: Refresh tokens are deleted when users are deleted
- **Separate Secrets**: Access and refresh tokens use different signing secrets

## Usage Flow
1. User logs in → receives both access and refresh tokens
2. Access token expires → client uses refresh token to get new tokens
3. Refresh endpoint returns new access + refresh tokens, revokes old refresh token
4. Repeat as needed
5. On logout → refresh token is revoked

## Migration Steps
1. Run the database migration: `npx prisma migrate dev`
2. Update your client applications to handle the new token structure
3. Implement token refresh logic in your frontend

## Error Handling
- **401**: Invalid or expired refresh token
- **400**: Missing refresh token in request
- **404**: User not found (token valid but user deleted)