// Author: Vineet | Module: Follow-Ups | CRM Platform v1.0

import { Router } from 'express';
import { list, create, update, remove, calendar } from './followups.controller.js';
import authMiddleware from '../../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/calendar', calendar);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
