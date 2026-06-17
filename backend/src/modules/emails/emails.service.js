// Author: Vineet | Module: Emails | CRM Platform v1.0

import prisma from '../../config/database.js';
import logger from '../../utils/logger.js';
import { sendEmail } from '../../utils/emailSender.js';

// ──────────────────────────────────────────────
// Email Templates
// ──────────────────────────────────────────────

export const getTemplates = async () => {
  return prisma.emailTemplate.findMany({
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const createTemplate = async (data, userId) => {
  const template = await prisma.emailTemplate.create({
    data: {
      name: data.name,
      subject: data.subject,
      body: data.body,
      type: data.type || 'CUSTOM',
      createdById: userId,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  });

  logger.success(`Email template created: ${template.name}`);
  return template;
};

export const updateTemplate = async (templateId, data) => {
  const template = await prisma.emailTemplate.update({
    where: { id: templateId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.subject && { subject: data.subject }),
      ...(data.body && { body: data.body }),
      ...(data.type && { type: data.type }),
    },
    include: { createdBy: { select: { id: true, name: true } } },
  });
  return template;
};

// ──────────────────────────────────────────────
// Email Campaigns
// ──────────────────────────────────────────────

export const getCampaigns = async () => {
  return prisma.emailCampaign.findMany({
    include: {
      template: { select: { id: true, name: true, subject: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { recipients: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createCampaign = async (data, userId) => {
  // Verify template exists
  const template = await prisma.emailTemplate.findUnique({ where: { id: data.templateId } });
  if (!template) {
    throw Object.assign(new Error('Template not found'), { statusCode: 404, code: 'TEMPLATE_NOT_FOUND' });
  }

  // Verify leads exist
  const leads = await prisma.lead.findMany({
    where: { id: { in: data.leadIds }, isDeleted: false },
    select: { id: true },
  });

  const campaign = await prisma.emailCampaign.create({
    data: {
      name: data.name,
      templateId: data.templateId,
      createdById: userId,
      recipientCount: leads.length,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      recipients: {
        create: leads.map((lead) => ({ leadId: lead.id })),
      },
    },
    include: {
      template: { select: { id: true, name: true, subject: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  logger.success(`Campaign created: ${campaign.name} (${leads.length} recipients)`);
  return campaign;
};

/**
 * Replace template variables for a specific lead
 */
const replaceTemplateVars = (text, lead, salesRep) => {
  return text
    .replace(/\{\{lead_name\}\}/g, lead.name || '')
    .replace(/\{\{company\}\}/g, lead.company || '')
    .replace(/\{\{sales_rep\}\}/g, salesRep || '')
    .replace(/\{\{email\}\}/g, lead.email || '');
};

/**
 * Send campaign emails
 */
export const sendCampaign = async (campaignId, userId) => {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      template: true,
      recipients: {
        include: {
          lead: { select: { id: true, name: true, company: true, email: true } },
        },
        where: { status: 'PENDING' },
      },
    },
  });

  if (!campaign) {
    throw Object.assign(new Error('Campaign not found'), { statusCode: 404, code: 'CAMPAIGN_NOT_FOUND' });
  }

  if (campaign.status === 'SENT') {
    throw Object.assign(new Error('Campaign already sent'), { statusCode: 400, code: 'ALREADY_SENT' });
  }

  const sender = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  const results = { sent: 0, failed: 0 };

  // Send in batches of 10
  const batchSize = 10;
  for (let i = 0; i < campaign.recipients.length; i += batchSize) {
    const batch = campaign.recipients.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (recipient) => {
        try {
          const subject = replaceTemplateVars(campaign.template.subject, recipient.lead, sender.name);
          const body = replaceTemplateVars(campaign.template.body, recipient.lead, sender.name);

          await sendEmail({
            to: recipient.lead.email,
            subject,
            html: body,
          });

          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { status: 'SENT', sentAt: new Date() },
          });

          results.sent++;
        } catch (err) {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { status: 'FAILED' },
          });
          results.failed++;
          logger.error(`Failed to send to ${recipient.lead.email}`, err);
        }
      })
    );
  }

  // Update campaign status
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { status: 'SENT', sentAt: new Date() },
  });

  logger.success(`Campaign sent: ${campaign.name} — ${results.sent} sent, ${results.failed} failed`);
  return results;
};

/**
 * Get campaign stats
 */
export const getCampaignStats = async (campaignId) => {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      template: { select: { name: true, subject: true } },
      recipients: {
        include: {
          lead: { select: { id: true, name: true, company: true, email: true } },
        },
      },
    },
  });

  if (!campaign) {
    throw Object.assign(new Error('Campaign not found'), { statusCode: 404, code: 'CAMPAIGN_NOT_FOUND' });
  }

  const statusCounts = {};
  for (const r of campaign.recipients) {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  }

  const sent = statusCounts.SENT || 0;
  const opened = statusCounts.OPENED || 0;

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      template: campaign.template,
      status: campaign.status,
      sentAt: campaign.sentAt,
    },
    stats: {
      totalRecipients: campaign.recipients.length,
      sent,
      opened,
      failed: statusCounts.FAILED || 0,
      pending: statusCounts.PENDING || 0,
      openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0',
    },
    recipients: campaign.recipients,
  };
};

/**
 * Track email open (pixel tracking)
 */
export const trackOpen = async (recipientId) => {
  try {
    await prisma.campaignRecipient.update({
      where: { id: recipientId },
      data: { status: 'OPENED', openedAt: new Date() },
    });

    // Update campaign open count
    const recipient = await prisma.campaignRecipient.findUnique({
      where: { id: recipientId },
      select: { campaignId: true },
    });

    if (recipient) {
      await prisma.emailCampaign.update({
        where: { id: recipient.campaignId },
        data: { openCount: { increment: 1 } },
      });
    }
  } catch (err) {
    // Silently fail for tracking
    logger.warn(`Open tracking failed for ${recipientId}`);
  }
};

export default { getTemplates, createTemplate, updateTemplate, getCampaigns, createCampaign, sendCampaign, getCampaignStats, trackOpen };
