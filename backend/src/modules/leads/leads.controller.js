// Author: Aditya | Module: Leads | CRM Platform v1.0

import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  getLeadActivities,
  addNote,
} from './leads.service.js';

/**
 * GET /api/leads
 */
export const list = async (req, res, next) => {
  try {
    const result = await getLeads({
      ...req.query,
      userId: req.user.id,
      userRole: req.user.role,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/leads
 */
export const create = async (req, res, next) => {
  try {
    const { name, company, email } = req.body;

    if (!name || !company || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name, company, and email are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const lead = await createLead(req.body, req.user.id);
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/:id
 */
export const getById = async (req, res, next) => {
  try {
    const lead = await getLeadById(req.params.id);
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/leads/:id
 */
export const update = async (req, res, next) => {
  try {
    // Ownership check for SALES_EXECUTIVE
    if (req.user.role === 'SALES_EXECUTIVE') {
      const existing = await getLeadById(req.params.id);
      if (existing.assignedToId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update leads assigned to you',
          code: 'FORBIDDEN',
        });
      }
    }

    const lead = await updateLead(req.params.id, req.body, req.user.id);
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/leads/:id
 */
export const remove = async (req, res, next) => {
  try {
    await deleteLead(req.params.id, req.user.id);
    res.json({ success: true, data: { message: 'Lead deleted successfully' } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/leads/:id/assign
 */
export const assign = async (req, res, next) => {
  try {
    const { assignedToId } = req.body;
    if (!assignedToId) {
      return res.status(400).json({
        success: false,
        error: 'assignedToId is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const lead = await assignLead(req.params.id, assignedToId, req.user.id);
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leads/:id/activities
 */
export const activities = async (req, res, next) => {
  try {
    const result = await getLeadActivities(
      req.params.id,
      req.query.page,
      req.query.limit
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/leads/:id/notes
 */
export const createNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({
        success: false,
        error: 'Note content is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const activity = await addNote(req.params.id, note, req.user.id);
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

export default { list, create, getById, update, remove, assign, activities, createNote };
