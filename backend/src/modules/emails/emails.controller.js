// Author: Vineet | Module: Emails | CRM Platform v1.0

import { getTemplates, createTemplate, updateTemplate, getCampaigns, createCampaign, sendCampaign, getCampaignStats, trackOpen } from './emails.service.js';

export const listTemplates = async (req, res, next) => {
  try {
    const templates = await getTemplates();
    res.json({ success: true, data: templates });
  } catch (error) { next(error); }
};

export const addTemplate = async (req, res, next) => {
  try {
    const { name, subject, body } = req.body;
    if (!name || !subject || !body) {
      return res.status(400).json({ success: false, error: 'name, subject, and body are required', code: 'VALIDATION_ERROR' });
    }
    const template = await createTemplate(req.body, req.user.id);
    res.status(201).json({ success: true, data: template });
  } catch (error) { next(error); }
};

export const editTemplate = async (req, res, next) => {
  try {
    const template = await updateTemplate(req.params.id, req.body);
    res.json({ success: true, data: template });
  } catch (error) { next(error); }
};

export const listCampaigns = async (req, res, next) => {
  try {
    const campaigns = await getCampaigns();
    res.json({ success: true, data: campaigns });
  } catch (error) { next(error); }
};

export const addCampaign = async (req, res, next) => {
  try {
    const { name, templateId, leadIds } = req.body;
    if (!name || !templateId || !leadIds?.length) {
      return res.status(400).json({ success: false, error: 'name, templateId, and leadIds are required', code: 'VALIDATION_ERROR' });
    }
    const campaign = await createCampaign(req.body, req.user.id);
    res.status(201).json({ success: true, data: campaign });
  } catch (error) { next(error); }
};

export const send = async (req, res, next) => {
  try {
    const results = await sendCampaign(req.params.id, req.user.id);
    res.json({ success: true, data: results });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const data = await getCampaignStats(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const trackOpenPixel = async (req, res) => {
  await trackOpen(req.params.recipientId);
  // Return 1x1 transparent GIF
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.writeHead(200, { 'Content-Type': 'image/gif', 'Content-Length': pixel.length, 'Cache-Control': 'no-store' });
  res.end(pixel);
};

export default { listTemplates, addTemplate, editTemplate, listCampaigns, addCampaign, send, stats, trackOpenPixel };
