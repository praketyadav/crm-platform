// Author: Aditya | Module: Pipeline | CRM Platform v1.0

import { Router } from 'express';
import { getView, moveLead, getStats } from './pipeline.controller.js';
import authMiddleware from '../../middleware/auth.js';
import { requireAnyRole } from '../../middleware/rbac.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getView);
router.put('/move', moveLead);
router.get('/stats', requireAnyRole(['ADMIN', 'SALES_MANAGER']), getStats);

export default router;
