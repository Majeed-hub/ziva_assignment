# Rate Limiting Design Document

## Overview

The rate limiting feature will use the `express-rate-limit` middleware to implement IP-based rate limiting for the Library Management System API. The solution provides two-tier rate limiting: general API limits and stricter authentication endpoint limits, both configurable via environment variables.

## Architecture

The rate limiting system follows a middleware-based architecture that integrates seamlessly with the existing Express.js application:

```
Request → Rate Limit Middleware → Existing Middleware → Route Handlers
```

### Components

1. **General Rate Limiter**: Applied to all API routes
2. **Auth Rate Limiter**: Applied specifically to authentication routes
3. **Configuration Module**: Reads environment variables and provides defaults

## Components and Interfaces

### Rate Limiting Middleware (`src/middleware/rateLimiter.ts`)

```typescript
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

export const generalRateLimit: RequestHandler;
export const authRateLimit: RequestHandler;
```

### Configuration

The system will use existing environment variables:
- `RATE_LIMIT_WINDOW_MS`: General API window (default: 900000ms = 15 minutes)
- `RATE_LIMIT_MAX_REQUESTS`: General API max requests (default: 100)
- `RATE_LIMIT_AUTH_WINDOW_MS`: Auth API window (default: 900000ms = 15 minutes)
- `RATE_LIMIT_AUTH_MAX_REQUESTS`: Auth API max requests (default: 5)

## Data Models

No new data models are required. Rate limiting uses in-memory storage provided by `express-rate-limit`.

## Error Handling

### Rate Limit Exceeded Response

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 900
}
```

### Authentication Rate Limit Response

```json
{
  "error": "Too Many Requests", 
  "message": "Too many authentication attempts. Please try again later.",
  "retryAfter": 900
}
```

## Testing Strategy

### Unit Tests
- Test rate limiter configuration with different environment variables
- Test rate limit middleware behavior with mock requests
- Test error responses and headers

### Integration Tests
- Test general API rate limiting across different endpoints
- Test authentication-specific rate limiting
- Test rate limit headers in responses
- Test rate limit reset functionality