// Author: Aditya | Module: Pipeline | CRM Platform v1.0

import { getPipelineView, moveLeadInPipeline, getPipelineStats } from './pipeline.service.js';

/**
 * GET /api/pipeline
 */
export const getView = async (req, res, next) => {
  try {
    const pipeline = await getPipelineView(req.user.id, req.user.role);
    res.json({ success: true, data: pipeline });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/pipeline/move
 */
export const moveLead = async (req, res, next) => {
  try {
    const { leadId, fromStage, toStage } = req.body;

    if (!leadId || !toStage) {
      return res.status(400).json({
        success: false,
        error: 'leadId and toStage are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const lead = await moveLeadInPipeline(leadId, fromStage, toStage, req.user.id);
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/pipeline/stats
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await getPipelineStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export default { getView, moveLead, getStats };
