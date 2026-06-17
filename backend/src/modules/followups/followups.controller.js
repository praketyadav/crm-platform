// Author: Vineet | Module: Follow-Ups | CRM Platform v1.0

import { getFollowUps, createFollowUp, updateFollowUp, deleteFollowUp, getCalendarEvents } from './followups.service.js';

export const list = async (req, res, next) => {
  try {
    const result = await getFollowUps({ ...req.query, userId: req.user.id, userRole: req.user.role });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const { leadId, scheduledAt } = req.body;
    if (!leadId || !scheduledAt) {
      return res.status(400).json({ success: false, error: 'leadId and scheduledAt are required', code: 'VALIDATION_ERROR' });
    }
    const followUp = await createFollowUp(req.body, req.user.id);
    res.status(201).json({ success: true, data: followUp });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const followUp = await updateFollowUp(req.params.id, req.body, req.user.id, req.user.role);
    res.json({ success: true, data: followUp });
  } catch (error) { next(error); }
};

export const remove = async (req, res, next) => {
  try {
    await deleteFollowUp(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: { message: 'Follow-up deleted' } });
  } catch (error) { next(error); }
};

export const calendar = async (req, res, next) => {
  try {
    const events = await getCalendarEvents(req.user.id, req.user.role, req.query.from, req.query.to);
    res.json({ success: true, data: events });
  } catch (error) { next(error); }
};

export default { list, create, update, remove, calendar };
