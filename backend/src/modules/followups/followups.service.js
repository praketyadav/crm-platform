// Author: Vineet | Module: Follow-Ups | CRM Platform v1.0

import prisma from '../../config/database.js';
import logger from '../../utils/logger.js';

/**
 * List follow-ups with filters
 */
export const getFollowUps = async ({ status, assignedTo, from, to, page = 1, limit = 20, userId, userRole }) => {
  const take = Math.min(parseInt(limit, 10) || 20, 100);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const where = {};

  if (userRole === 'SALES_EXECUTIVE') {
    where.assignedToId = userId;
  } else if (assignedTo) {
    where.assignedToId = assignedTo;
  }

  if (status) where.status = status;
  if (from) where.scheduledAt = { ...(where.scheduledAt || {}), gte: new Date(from) };
  if (to) where.scheduledAt = { ...(where.scheduledAt || {}), lte: new Date(to) };

  const [followUps, total] = await Promise.all([
    prisma.followUp.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true, company: true, pipelineStage: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      skip,
      take,
    }),
    prisma.followUp.count({ where }),
  ]);

  return {
    followUps,
    pagination: {
      page: Math.max(parseInt(page, 10) || 1, 1),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};

/**
 * Schedule a follow-up
 */
export const createFollowUp = async (data, userId) => {
  const lead = await prisma.lead.findFirst({
    where: { id: data.leadId, isDeleted: false },
  });

  if (!lead) {
    throw Object.assign(new Error('Lead not found'), { statusCode: 404, code: 'LEAD_NOT_FOUND' });
  }

  const followUp = await prisma.followUp.create({
    data: {
      leadId: data.leadId,
      assignedToId: data.assignedToId || userId,
      scheduledAt: new Date(data.scheduledAt),
      notes: data.notes || null,
    },
    include: {
      lead: { select: { id: true, name: true, company: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  // Create activity
  await prisma.leadActivity.create({
    data: {
      leadId: data.leadId,
      userId,
      type: 'NOTE',
      description: `Follow-up scheduled for ${new Date(data.scheduledAt).toLocaleDateString()}`,
    },
  });

  logger.success(`Follow-up scheduled: ${lead.name} on ${data.scheduledAt}`);
  return followUp;
};

/**
 * Update a follow-up
 */
export const updateFollowUp = async (followUpId, data, userId, userRole) => {
  const existing = await prisma.followUp.findUnique({ where: { id: followUpId } });

  if (!existing) {
    throw Object.assign(new Error('Follow-up not found'), { statusCode: 404, code: 'FOLLOWUP_NOT_FOUND' });
  }

  if (userRole === 'SALES_EXECUTIVE' && existing.assignedToId !== userId) {
    throw Object.assign(new Error('You can only update your own follow-ups'), { statusCode: 403, code: 'FORBIDDEN' });
  }

  const updateData = {};
  if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt);
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.status) {
    updateData.status = data.status;
    if (data.status === 'DONE') {
      await prisma.leadActivity.create({
        data: {
          leadId: existing.leadId,
          userId,
          type: 'CALL',
          description: 'Follow-up completed',
        },
      });
    }
  }

  const followUp = await prisma.followUp.update({
    where: { id: followUpId },
    data: updateData,
    include: {
      lead: { select: { id: true, name: true, company: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  return followUp;
};

/**
 * Delete a follow-up
 */
export const deleteFollowUp = async (followUpId, userId, userRole) => {
  const existing = await prisma.followUp.findUnique({ where: { id: followUpId } });

  if (!existing) {
    throw Object.assign(new Error('Follow-up not found'), { statusCode: 404, code: 'FOLLOWUP_NOT_FOUND' });
  }

  if (userRole === 'SALES_EXECUTIVE' && existing.assignedToId !== userId) {
    throw Object.assign(new Error('You can only delete your own follow-ups'), { statusCode: 403, code: 'FORBIDDEN' });
  }

  await prisma.followUp.delete({ where: { id: followUpId } });
  logger.info(`Follow-up deleted: ${followUpId}`);
};

/**
 * Get calendar events
 */
export const getCalendarEvents = async (userId, userRole, from, to) => {
  const where = {};

  if (userRole === 'SALES_EXECUTIVE') {
    where.assignedToId = userId;
  }

  if (from) where.scheduledAt = { ...(where.scheduledAt || {}), gte: new Date(from) };
  if (to) where.scheduledAt = { ...(where.scheduledAt || {}), lte: new Date(to) };

  const followUps = await prisma.followUp.findMany({
    where,
    include: {
      lead: { select: { id: true, name: true, company: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return followUps.map((f) => ({
    id: f.id,
    title: `${f.lead.name} (${f.lead.company})`,
    start: f.scheduledAt,
    end: new Date(new Date(f.scheduledAt).getTime() + 30 * 60 * 1000), // 30 min duration
    leadId: f.lead.id,
    status: f.status,
    notes: f.notes,
    assignedTo: f.assignedTo,
  }));
};

export default { getFollowUps, createFollowUp, updateFollowUp, deleteFollowUp, getCalendarEvents };
