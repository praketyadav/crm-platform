// Author: Namami | Module: Analytics | CRM Platform v1.0

import { Router } from 'express';
import { dashboard, pipelineFunnel, leadSources, teamPerformance, revenueForecast, activityTimeline } from './analytics.controller.js';
import authMiddleware from '../../middleware/auth.js';
import { requireAnyRole } from '../../middleware/rbac.js';

const router = Router();
router.use(authMiddleware);

router.get('/dashboard', dashboard);
router.get('/pipeline-funnel', requireAnyRole(['ADMIN', 'SALES_MANAGER']), pipelineFunnel);
router.get('/lead-sources', requireAnyRole(['ADMIN', 'SALES_MANAGER']), leadSources);
router.get('/team-performance', requireAnyRole(['ADMIN', 'SALES_MANAGER']), teamPerformance);
router.get('/revenue-forecast', requireAnyRole(['ADMIN', 'SALES_MANAGER']), revenueForecast);
router.get('/activity-timeline', activityTimeline);

export default router;
