// Author: Praket | Module: AI | CRM Platform v1.0

import { Router } from 'express';
import {
  analyzeLeadHandler,
  generateEmailHandler,
  scoreLeadHandler,
  scoreAllLeadsHandler,
  getHistoryHandler,
} from './ai.controller.js';
import authMiddleware from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.use(authMiddleware);

router.post('/analyze-lead', analyzeLeadHandler);
router.post('/generate-email', generateEmailHandler);
router.post('/score-lead', scoreLeadHandler);
router.post('/score-all-leads', requireRole('ADMIN'), scoreAllLeadsHandler);
router.get('/history', getHistoryHandler);

export default router;
