# Implementation Plan

- [x] 1. Install express-rate-limit dependency


  - Add express-rate-limit package to project dependencies
  - Install type definitions for TypeScript support
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 2. Create rate limiting middleware


  - Implement rate limiter configuration using environment variables
  - Create general API rate limiter with configurable limits
  - Create authentication-specific rate limiter with stricter limits
  - Add proper error messages and response formatting
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3_

- [x] 3. Integrate rate limiting into application


  - Apply general rate limiter to all API routes in app.ts
  - Apply authentication rate limiter to auth routes
  - Ensure proper middleware order for rate limiting
  - _Requirements: 1.1, 1.3, 2.1_

- [ ] 4. Fix TypeScript issues in rate limiter implementation


  - Fix TypeScript errors in rateLimiter.ts related to req.rateLimit.resetTime
  - Add proper type definitions for express-rate-limit
  - Ensure proper error handling for undefined resetTime values
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ] 5. Fix and complete rate limiting tests


  - Fix TypeScript compilation errors in test files
  - Ensure all test cases properly validate rate limiting behavior
  - Test rate limit headers and error responses
  - Verify both general and auth rate limiters work correctly
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2_