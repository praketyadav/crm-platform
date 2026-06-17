// Author: Namami | Module: Analytics | CRM Platform v1.0

import prisma from '../../config/database.js';

/**
 * Dashboard summary stats
 */
export const getDashboardStats = async (userId, userRole) => {
  const baseWhere = { isDeleted: false };
  if (userRole === 'SALES_EXECUTIVE') baseWhere.assignedToId = userId;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalLeads, leadsThisWeek, wonLeads, totalActiveLeads, activeCampaigns] = await Promise.all([
    prisma.lead.count({ where: baseWhere }),
    prisma.lead.count({ where: { ...baseWhere, createdAt: { gte: weekAgo } } }),
    prisma.lead.count({ where: { ...baseWhere, pipelineStage: 'WON' } }),
    prisma.lead.count({ where: { ...baseWhere, pipelineStage: { notIn: ['WON', 'LOST'] } } }),
    prisma.emailCampaign.count({ where: { status: { not: 'SENT' } } }),
  ]);

  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0';

  // Pipeline value (non-won/lost leads)
  const pipelineValue = await prisma.lead.aggregate({
    where: { ...baseWhere, pipelineStage: { notIn: ['WON', 'LOST'] } },
    _sum: { estimatedValue: true },
  });

  // Top 5 AI-scored leads
  const topScoredLeads = await prisma.lead.findMany({
    where: { ...baseWhere, score: { not: null }, pipelineStage: { notIn: ['WON', 'LOST'] } },
    select: {
      id: true, name: true, company: true, score: true, pipelineStage: true,
      assignedTo: { select: { name: true } },
    },
    orderBy: { score: 'desc' },
    take: 5,
  });

  // Recent activities
  const recentActivities = await prisma.leadActivity.findMany({
    include: {
      lead: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    totalLeads,
    leadsThisWeek,
    conversionRate: parseFloat(conversionRate),
    activeCampaigns,
    totalActiveLeads,
    pipelineValue: pipelineValue._sum.estimatedValue || 0,
    topScoredLeads,
    recentActivities,
  };
};

/**
 * Pipeline funnel data
 */
export const getPipelineFunnel = async () => {
  const stages = ['NEW_LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

  const counts = await prisma.lead.groupBy({
    by: ['pipelineStage'],
    where: { isDeleted: false },
    _count: { id: true },
    _sum: { estimatedValue: true },
  });

  const funnel = stages.map((stage, idx) => {
    const found = counts.find((c) => c.pipelineStage === stage);
    const count = found?._count?.id || 0;
    const value = found?._sum?.estimatedValue || 0;

    let dropOff = null;
    if (idx > 0 && idx < stages.length - 1) {
      const prevStage = stages[idx - 1];
      const prevCount = counts.find((c) => c.pipelineStage === prevStage)?._count?.id || 0;
      dropOff = prevCount > 0 ? (((prevCount - count) / prevCount) * 100).toFixed(1) : '0.0';
    }

    return {
      stage,
      name: stage.replace(/_/g, ' '),
      count,
      value,
      dropOffPercent: dropOff,
    };
  });

  return funnel;
};

/**
 * Leads by source
 */
export const getLeadSources = async () => {
  const sources = await prisma.lead.groupBy({
    by: ['source'],
    where: { isDeleted: false },
    _count: { id: true },
  });

  const total = sources.reduce((sum, s) => sum + s._count.id, 0);

  return sources.map((s) => ({
    source: s.source,
    count: s._count.id,
    percentage: total > 0 ? ((s._count.id / total) * 100).toFixed(1) : '0.0',
  }));
};

/**
 * Team performance stats
 */
export const getTeamPerformance = async () => {
  const users = await prisma.user.findMany({
    where: { role: { in: ['SALES_EXECUTIVE', 'SALES_MANAGER'] } },
    select: {
      id: true,
      name: true,
      role: true,
      assignedLeads: {
        where: { isDeleted: false },
        select: { id: true, pipelineStage: true, estimatedValue: true, score: true },
      },
      activities: {
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { id: true },
      },
      followUps: {
        select: { status: true },
      },
    },
  });

  return users.map((user) => {
    const totalLeads = user.assignedLeads.length;
    const wonLeads = user.assignedLeads.filter((l) => l.pipelineStage === 'WON').length;
    const activeLeads = user.assignedLeads.filter((l) => !['WON', 'LOST'].includes(l.pipelineStage)).length;
    const totalValue = user.assignedLeads
      .filter((l) => l.pipelineStage === 'WON')
      .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    const avgScore = user.assignedLeads.filter((l) => l.score).length > 0
      ? Math.round(user.assignedLeads.filter((l) => l.score).reduce((sum, l) => sum + l.score, 0) / user.assignedLeads.filter((l) => l.score).length)
      : null;

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      totalLeads,
      activeLeads,
      wonLeads,
      conversionRate: totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0',
      totalRevenue: totalValue,
      activitiesLast30Days: user.activities.length,
      followUpsCompleted: user.followUps.filter((f) => f.status === 'DONE').length,
      followUpsMissed: user.followUps.filter((f) => f.status === 'MISSED').length,
      avgLeadScore: avgScore,
    };
  }).sort((a, b) => b.wonLeads - a.wonLeads);
};

/**
 * Revenue forecast based on negotiation stage leads
 */
export const getRevenueForecast = async () => {
  const negotiationLeads = await prisma.lead.findMany({
    where: { isDeleted: false, pipelineStage: 'NEGOTIATION' },
    select: { id: true, name: true, company: true, estimatedValue: true, score: true },
  });

  // Get historical avg deal size
  const wonDeals = await prisma.lead.aggregate({
    where: { isDeleted: false, pipelineStage: 'WON' },
    _avg: { estimatedValue: true },
    _count: { id: true },
    _sum: { estimatedValue: true },
  });

  const avgDealSize = wonDeals._avg.estimatedValue || 0;
  const totalInNegotiation = negotiationLeads.reduce((sum, l) => sum + (l.estimatedValue || avgDealSize), 0);

  // Weighted forecast using AI scores
  const weightedForecast = negotiationLeads.reduce((sum, l) => {
    const weight = (l.score || 50) / 100;
    return sum + (l.estimatedValue || avgDealSize) * weight;
  }, 0);

  return {
    negotiationLeads: negotiationLeads.length,
    totalPotentialRevenue: totalInNegotiation,
    weightedForecast: Math.round(weightedForecast * 100) / 100,
    avgDealSize: Math.round(avgDealSize * 100) / 100,
    historicalWonDeals: wonDeals._count.id || 0,
    historicalRevenue: wonDeals._sum.estimatedValue || 0,
    leads: negotiationLeads,
  };
};

/**
 * Activity timeline — activities per day over last 30 days
 */
export const getActivityTimeline = async (userId, userRole) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const where = { createdAt: { gte: thirtyDaysAgo } };
  if (userRole === 'SALES_EXECUTIVE') where.userId = userId;

  const activities = await prisma.leadActivity.findMany({
    where,
    select: { createdAt: true, type: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by day
  const dayMap = {};
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
    const key = date.toISOString().split('T')[0];
    dayMap[key] = { date: key, total: 0, calls: 0, emails: 0, notes: 0, stageChanges: 0 };
  }

  for (const activity of activities) {
    const key = activity.createdAt.toISOString().split('T')[0];
    if (dayMap[key]) {
      dayMap[key].total++;
      if (activity.type === 'CALL') dayMap[key].calls++;
      else if (activity.type === 'EMAIL') dayMap[key].emails++;
      else if (activity.type === 'NOTE') dayMap[key].notes++;
      else if (activity.type === 'STAGE_CHANGE') dayMap[key].stageChanges++;
    }
  }

  return Object.values(dayMap);
};

export default { getDashboardStats, getPipelineFunnel, getLeadSources, getTeamPerformance, getRevenueForecast, getActivityTimeline };
