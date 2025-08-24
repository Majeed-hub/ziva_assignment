import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { specs, swaggerUi } from './config/swagger';
import { generalRateLimit } from './middleware/rateLimiter';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', generalRateLimit);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Library Management System API',
}));

// Routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Library Management System API is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;