// Author: Aditya | Module: Pipeline | CRM Platform v1.0

import prisma from '../../config/database.js';
import logger from '../../utils/logger.js';

const STAGE_ORDER = ['NEW_LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

/**
 * Get all leads grouped by pipeline stage
 */
export const getPipelineView = async (userId, userRole) => {
  const where = { isDeleted: false };

  if (userRole === 'SALES_EXECUTIVE') {
    where.assignedToId = userId;
  }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Group leads by stage
  const pipeline = {};
  for (const stage of STAGE_ORDER) {
    const stageLeads = leads.filter((l) => l.pipelineStage === stage);
    pipeline[stage] = {
      name: stage.replace(/_/g, ' '),
      count: stageLeads.length,
      estimatedValue: stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      leads: stageLeads,
    };
  }

  return pipeline;
};

/**
 * Move a lead between pipeline stages
 */
export const moveLeadInPipeline = async (leadId, fromStage, toStage, userId) => {
  if (!STAGE_ORDER.includes(toStage)) {
    const error = new Error(`Invalid pipeline stage: ${toStage}`);
    error.statusCode = 400;
    error.code = 'INVALID_STAGE';
    throw error;
  }

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, isDeleted: false },
  });

  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  if (fromStage && lead.pipelineStage !== fromStage) {
    const error = new Error(`Lead is not in stage ${fromStage}, currently in ${lead.pipelineStage}`);
    error.statusCode = 409;
    error.code = 'STAGE_MISMATCH';
    throw error;
  }

  const previousStage = lead.pipelineStage;

  // Update lead status based on stage
  const statusMap = {
    WON: 'won',
    LOST: 'lost',
  };

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      pipelineStage: toStage,
      status: statusMap[toStage] || 'active',
    },
    include: {
      assignedTo: { select: { id: true, name: true } },
    },
  });

  // Log the stage change
  await prisma.leadActivity.create({
    data: {
      leadId,
      userId,
      type: 'STAGE_CHANGE',
      description: `Pipeline stage changed from ${previousStage.replace(/_/g, ' ')} to ${toStage.replace(/_/g, ' ')}`,
      metadata: JSON.stringify({ from: previousStage, to: toStage }),
    },
  });

  logger.info(`Lead ${leadId} moved: ${previousStage} → ${toStage}`);
  return updated;
};

/**
 * Get pipeline statistics — conversion rates and time in stage
 */
export const getPipelineStats = async () => {
  // Get counts per stage
  const stageCounts = await prisma.lead.groupBy({
    by: ['pipelineStage'],
    where: { isDeleted: false },
    _count: { id: true },
    _sum: { estimatedValue: true },
  });

  // Build ordered stats
  const stats = STAGE_ORDER.map((stage) => {
    const found = stageCounts.find((s) => s.pipelineStage === stage);
    return {
      stage,
      name: stage.replace(/_/g, ' '),
      count: found?._count?.id || 0,
      totalValue: found?._sum?.estimatedValue || 0,
    };
  });

  // Calculate conversion rates between stages
  const conversionRates = [];
  for (let i = 0; i < stats.length - 2; i++) {
    // Exclude WON/LOST from sequential rates
    const from = stats[i];
    const to = stats[i + 1];
    conversionRates.push({
      from: from.stage,
      to: to.stage,
      rate: from.count > 0 ? ((to.count / from.count) * 100).toFixed(1) : '0.0',
    });
  }

  // Overall win rate
  const totalLeads = stats.reduce((sum, s) => sum + s.count, 0);
  const wonCount = stats.find((s) => s.stage === 'WON')?.count || 0;
  const overallWinRate = totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(1) : '0.0';

  // Average deal size for won deals
  const wonValue = stats.find((s) => s.stage === 'WON')?.totalValue || 0;
  const avgDealSize = wonCount > 0 ? (wonValue / wonCount).toFixed(2) : '0.00';

  return {
    stages: stats,
    conversionRates,
    overallWinRate,
    avgDealSize: parseFloat(avgDealSize),
    totalLeads,
    totalPipelineValue: stats
      .filter((s) => !['WON', 'LOST'].includes(s.stage))
      .reduce((sum, s) => sum + s.totalValue, 0),
  };
};

export default { getPipelineView, moveLeadInPipeline, getPipelineStats };
