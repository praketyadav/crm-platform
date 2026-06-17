// Author: Namami | Module: Analytics | CRM Platform v1.0

import { getDashboardStats, getPipelineFunnel, getLeadSources, getTeamPerformance, getRevenueForecast, getActivityTimeline } from './analytics.service.js';

export const dashboard = async (req, res, next) => {
  try {
    const data = await getDashboardStats(req.user.id, req.user.role);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const pipelineFunnel = async (req, res, next) => {
  try {
    const data = await getPipelineFunnel();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const leadSources = async (req, res, next) => {
  try {
    const data = await getLeadSources();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const teamPerformance = async (req, res, next) => {
  try {
    const data = await getTeamPerformance();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const revenueForecast = async (req, res, next) => {
  try {
    const data = await getRevenueForecast();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const activityTimeline = async (req, res, next) => {
  try {
    const data = await getActivityTimeline(req.user.id, req.user.role);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export default { dashboard, pipelineFunnel, leadSources, teamPerformance, revenueForecast, activityTimeline };
