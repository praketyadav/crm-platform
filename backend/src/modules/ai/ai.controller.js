// Author: Praket | Module: AI | CRM Platform v1.0

import { analyzeLead, generateEmail, scoreLead, scoreAllLeads, getAIHistory } from './ai.service.js';

/**
 * POST /api/ai/analyze-lead
 */
export const analyzeLeadHandler = async (req, res, next) => {
  try {
    const { leadId } = req.body;
    if (!leadId) {
      return res.status(400).json({
        success: false,
        error: 'leadId is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const analysis = await analyzeLead(leadId, req.user.id);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/generate-email
 */
export const generateEmailHandler = async (req, res, next) => {
  try {
    const { leadId, emailType, context } = req.body;

    if (!leadId || !emailType) {
      return res.status(400).json({
        success: false,
        error: 'leadId and emailType are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const validTypes = ['FOLLOWUP', 'PROPOSAL', 'REMINDER'];
    if (!validTypes.includes(emailType)) {
      return res.status(400).json({
        success: false,
        error: `emailType must be one of: ${validTypes.join(', ')}`,
        code: 'VALIDATION_ERROR',
      });
    }

    const email = await generateEmail(leadId, emailType, context, req.user.id);
    res.json({ success: true, data: email });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/score-lead
 */
export const scoreLeadHandler = async (req, res, next) => {
  try {
    const { leadId } = req.body;
    if (!leadId) {
      return res.status(400).json({
        success: false,
        error: 'leadId is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const score = await scoreLead(leadId, req.user.id);
    res.json({ success: true, data: score });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/score-all-leads (Admin only)
 */
export const scoreAllLeadsHandler = async (req, res, next) => {
  try {
    const results = await scoreAllLeads(req.user.id);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/history
 */
export const getHistoryHandler = async (req, res, next) => {
  try {
    const result = await getAIHistory(req.user.id, req.query.page, req.query.limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export default {
  analyzeLeadHandler,
  generateEmailHandler,
  scoreLeadHandler,
  scoreAllLeadsHandler,
  getHistoryHandler,
};
