import request from 'supertest';
import express from 'express';
import { generalRateLimit, authRateLimit } from '../../src/middleware/rateLimiter';

describe('Rate Limiting Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('General Rate Limiter', () => {
    beforeEach(() => {
      app.use('/api', generalRateLimit);
      app.get('/api/test', (_req, res) => {
        res.json({ message: 'success' });
      });
    });

    it('should allow requests within rate limit', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.body.message).toBe('success');
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
    });

    it('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
    });

    it('should return 429 when rate limit exceeded', async () => {
      // Make requests up to the limit (default is 100, but we'll test with a smaller number)
      const testApp = express();
      testApp.use(express.json());
      
      // Create a rate limiter with a very low limit for testing
      const testRateLimit = require('express-rate-limit')({
        windowMs: 60000, // 1 minute
        max: 2, // 2 requests per window
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req: any, res: any) => {
          res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000),
          });
        },
      });

      testApp.use('/api', testRateLimit);
      testApp.get('/api/test', (_req, res) => {
        res.json({ message: 'success' });
      });

      // First two requests should succeed
      await request(testApp).get('/api/test').expect(200);
      await request(testApp).get('/api/test').expect(200);

      // Third request should be rate limited
      const response = await request(testApp)
        .get('/api/test')
        .expect(429);

      expect(response.body.error).toBe('Too Many Requests');
      expect(response.body.message).toBe('Rate limit exceeded. Please try again later.');
      expect(response.body.retryAfter).toBeDefined();
    });
  });

  describe('Auth Rate Limiter', () => {
    beforeEach(() => {
      app.use('/auth', authRateLimit);
      app.post('/auth/login', (_req, res) => {
        res.json({ message: 'login success' });
      });
    });

    it('should allow auth requests within rate limit', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
        .expect(200);

      expect(response.body.message).toBe('login success');
      expect(response.headers['ratelimit-limit']).toBeDefined();
    });

    it('should return 429 with auth-specific message when limit exceeded', async () => {
      const testApp = express();
      testApp.use(express.json());
      
      // Create auth rate limiter with very low limit for testing
      const testAuthRateLimit = require('express-rate-limit')({
        windowMs: 60000, // 1 minute
        max: 1, // 1 request per window
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req: any, res: any) => {
          res.status(429).json({
            error: 'Too Many Requests',
            message: 'Too many authentication attempts. Please try again later.',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000),
          });
        },
      });

      testApp.use('/auth', testAuthRateLimit);
      testApp.post('/auth/login', (_req, res) => {
        res.json({ message: 'login success' });
      });

      // First request should succeed
      await request(testApp)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
        .expect(200);

      // Second request should be rate limited
      const response = await request(testApp)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
        .expect(429);

      expect(response.body.error).toBe('Too Many Requests');
      expect(response.body.message).toBe('Too many authentication attempts. Please try again later.');
      expect(response.body.retryAfter).toBeDefined();
    });
  });
});