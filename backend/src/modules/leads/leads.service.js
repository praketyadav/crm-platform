// Author: Aditya | Module: Leads | CRM Platform v1.0

import prisma from '../../config/database.js';
import logger from '../../utils/logger.js';

/**
 * List leads with filters, search, and pagination
 */
export const getLeads = async ({
  status,
  stage,
  assignedTo,
  source,
  search,
  page = 1,
  limit = 20,
  userId,
  userRole,
}) => {
  const take = Math.min(parseInt(limit, 10) || 20, 100);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const where = { isDeleted: false };

  // Role-based filtering: Sales execs see only their leads
  if (userRole === 'SALES_EXECUTIVE') {
    where.assignedToId = userId;
  }

  if (status) where.status = status;
  if (stage) where.pipelineStage = stage;
  if (assignedTo) where.assignedToId = assignedTo;
  if (source) where.source = source;

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { company: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    leads,
    pagination: {
      page: Math.max(parseInt(page, 10) || 1, 1),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};

/**
 * Create a new lead
 */
export const createLead = async (data, userId) => {
  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      company: data.company,
      phone: data.phone || null,
      email: data.email,
      source: data.source || 'WEBSITE',
      assignedToId: data.assignedToId || userId,
      createdById: userId,
      pipelineStage: 'NEW_LEAD',
      estimatedValue: data.estimatedValue || 0,
      notes: data.notes || null,
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  // Auto-create activity
  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      userId,
      type: 'NOTE',
      description: `Lead created from source: ${lead.source}`,
    },
  });

  logger.success(`Lead created: ${lead.name} (${lead.company})`);
  return lead;
};

/**
 * Get a single lead with full details and activity timeline
 */
export const getLeadById = async (leadId) => {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, isDeleted: false },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      activities: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      followUps: {
        orderBy: { scheduledAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  return lead;
};

/**
 * Update a lead
 */
export const updateLead = async (leadId, data, userId) => {
  const existing = await prisma.lead.findFirst({
    where: { id: leadId, isDeleted: false },
  });

  if (!existing) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  const updateData = {};
  const changes = [];

  if (data.name !== undefined) updateData.name = data.name;
  if (data.company !== undefined) updateData.company = data.company;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.source !== undefined) updateData.source = data.source;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.estimatedValue !== undefined) updateData.estimatedValue = data.estimatedValue;

  // Track stage changes
  if (data.pipelineStage && data.pipelineStage !== existing.pipelineStage) {
    updateData.pipelineStage = data.pipelineStage;
    changes.push(
      `Stage changed from ${existing.pipelineStage} to ${data.pipelineStage}`
    );
  }

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: updateData,
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  // Log stage change activities
  for (const change of changes) {
    await prisma.leadActivity.create({
      data: {
        leadId,
        userId,
        type: 'STAGE_CHANGE',
        description: change,
      },
    });
  }

  logger.info(`Lead updated: ${lead.name} (${leadId})`);
  return lead;
};

/**
 * Soft delete a lead (Admin only)
 */
export const deleteLead = async (leadId, userId) => {
  const existing = await prisma.lead.findFirst({
    where: { id: leadId, isDeleted: false },
  });

  if (!existing) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { isDeleted: true, status: 'deleted' },
  });

  await prisma.leadActivity.create({
    data: {
      leadId,
      userId,
      type: 'NOTE',
      description: 'Lead deleted',
    },
  });

  logger.warn(`Lead soft-deleted: ${existing.name} (${leadId})`);
};

/**
 * Assign lead to a user
 */
export const assignLead = async (leadId, assignedToId, userId) => {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, isDeleted: false },
  });

  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: assignedToId },
    select: { id: true, name: true },
  });

  if (!targetUser) {
    const error = new Error('Target user not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { assignedToId },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId,
      userId,
      type: 'NOTE',
      description: `Lead assigned to ${targetUser.name}`,
    },
  });

  // Create notification for assigned user
  await prisma.notification.create({
    data: {
      userId: assignedToId,
      title: 'New Lead Assigned',
      body: `You have been assigned lead: ${lead.name} (${lead.company})`,
      type: 'LEAD_ASSIGNMENT',
    },
  });

  logger.info(`Lead ${leadId} assigned to ${targetUser.name}`);
  return updated;
};

/**
 * Get activity history for a lead
 */
export const getLeadActivities = async (leadId, page = 1, limit = 20) => {
  const take = Math.min(parseInt(limit, 10) || 20, 100);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const [activities, total] = await Promise.all([
    prisma.leadActivity.findMany({
      where: { leadId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.leadActivity.count({ where: { leadId } }),
  ]);

  return {
    activities,
    pagination: {
      page: Math.max(parseInt(page, 10) || 1, 1),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};

/**
 * Add a note to a lead
 */
export const addNote = async (leadId, note, userId) => {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, isDeleted: false },
  });

  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  const activity = await prisma.leadActivity.create({
    data: {
      leadId,
      userId,
      type: 'NOTE',
      description: note,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  logger.info(`Note added to lead ${leadId}`);
  return activity;
};

export default {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  getLeadActivities,
  addNote,
};
