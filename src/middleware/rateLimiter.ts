import rateLimit from 'express-rate-limit';

// General API rate limiter
export const generalRateLimit = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
    message: {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        const resetTime = req.rateLimit?.resetTime?.getTime() || Date.now();
        const retryAfter = Math.round(resetTime / 1000);
        res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter,
        });
    },
});

// Authentication endpoints rate limiter (stricter)
export const authRateLimit = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '900000'), // 15 minutes default
    max: parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || '5'), // 5 requests per window
    message: {
        error: 'Too Many Requests',
        message: 'Too many authentication attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const resetTime = req.rateLimit?.resetTime?.getTime() || Date.now();
        const retryAfter = Math.round(resetTime / 1000);
        res.status(429).json({
            error: 'Too Many Requests',
            message: 'Too many authentication attempts. Please try again later.',
            retryAfter,
        });
    },
});