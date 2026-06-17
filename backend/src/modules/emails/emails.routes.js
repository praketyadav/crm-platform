// Author: Vineet | Module: Emails | CRM Platform v1.0

import { Router } from 'express';
import { listTemplates, addTemplate, editTemplate, listCampaigns, addCampaign, send, stats, trackOpenPixel } from './emails.controller.js';
import authMiddleware from '../../middleware/auth.js';
import { requireAnyRole } from '../../middleware/rbac.js';

const router = Router();

// Public tracking pixel (no auth)
router.get('/track/:recipientId', trackOpenPixel);

// Protected routes
router.use(authMiddleware);

// Templates
router.get('/templates', listTemplates);
router.post('/templates', requireAnyRole(['ADMIN', 'SALES_MANAGER']), addTemplate);
router.put('/templates/:id', requireAnyRole(['ADMIN', 'SALES_MANAGER']), editTemplate);

// Campaigns
router.get('/campaigns', requireAnyRole(['ADMIN', 'SALES_MANAGER']), listCampaigns);
router.post('/campaigns', requireAnyRole(['ADMIN', 'SALES_MANAGER']), addCampaign);
router.post('/campaigns/:id/send', requireAnyRole(['ADMIN', 'SALES_MANAGER']), send);
router.get('/campaigns/:id/stats', requireAnyRole(['ADMIN', 'SALES_MANAGER']), stats);

export default router;
