// Author: Aditya | Module: App Entry | CRM Platform v1.0

import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import { initScheduler } from './utils/scheduler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import leadsRoutes from './modules/leads/leads.routes.js';
import pipelineRoutes from './modules/pipeline/pipeline.routes.js';
import followupsRoutes from './modules/followups/followups.routes.js';
import emailsRoutes from './modules/emails/emails.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';

const app = express();

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────

app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.request(req.method, req.originalUrl, res.statusCode, Date.now() - start);
  });
  next();
});

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/followups', followupsRoutes);
app.use('/api/emails', emailsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ──────────────────────────────────────────────
// Server Start
// ──────────────────────────────────────────────

const PORT = env.port;

app.listen(PORT, () => {
  logger.success(`
  ╔══════════════════════════════════════════╗
  ║   CRM Platform API Server               ║
  ║   Running on: http://localhost:${PORT}      ║
  ║   Environment: ${env.nodeEnv.padEnd(24)}║
  ╚══════════════════════════════════════════╝
  `);

  // Initialize scheduled jobs
  initScheduler();
});

export default app;
