import { Router } from 'express';
import authRoutes from './auth';
import bookRoutes from './book';
import borrowRoutes from './borrow';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/', borrowRoutes); // Mount borrow routes at root level

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Library Management System API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00.000Z
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Library Management System API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;