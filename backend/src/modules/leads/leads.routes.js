// Author: Aditya | Module: Leads | CRM Platform v1.0

import { Router } from 'express';
import {
  list,
  create,
  getById,
  update,
  remove,
  assign,
  activities,
  createNote,
} from './leads.controller.js';
import authMiddleware from '../../middleware/auth.js';
import { requireRole, requireAnyRole } from '../../middleware/rbac.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', requireRole('ADMIN'), remove);
router.post('/:id/assign', requireAnyRole(['ADMIN', 'SALES_MANAGER']), assign);
router.get('/:id/activities', activities);
router.post('/:id/notes', createNote);

export default router;
