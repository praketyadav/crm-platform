// Author: Aditya | Module: Auth | CRM Platform v1.0

import { Router } from 'express';
import { register, login, refresh, logout, me, getUsers } from './auth.controller.js';
import authMiddleware from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/refresh', refresh);

// Protected routes
router.post('/register', authMiddleware, requireRole('ADMIN'), register);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);
router.get('/users', authMiddleware, getUsers);

export default router;
