// Author: Praket | Module: AI | CRM Platform v1.0

import OpenAI from 'openai';
import prisma from '../../config/database.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

// ──────────────────────────────────────────────
// NVIDIA Nemotron Client (OpenAI-compatible)
// ──────────────────────────────────────────────

let client = null;

const getClient = () => {
  if (!client) {
    if (!env.nvidiaApiKey) {
      throw Object.assign(new Error('NVIDIA API key not configured'), {
        statusCode: 503,
        code: 'AI_NOT_CONFIGURED',
      });
    }
    client = new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: env.nvidiaApiKey,
    });
  }
  return client;
};

/**
 * Make a structured AI call to NVIDIA Nemotron and parse JSON response
 */
const callAI = async (systemPrompt, userPrompt, maxTokens = 4096) => {
  const nvidia = getClient();

  const completion = await nvidia.chat.completions.create({
    model: 'nvidia/nemotron-3-ultra-550b-a55b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.6,
    top_p: 0.9,
    max_tokens: maxTokens,
  });

  const responseText = completion.choices[0]?.message?.content || '';
  const tokensUsed =
    (completion.usage?.prompt_tokens || 0) + (completion.usage?.completion_tokens || 0);

  let parsed;
  try {
    // Strip possible markdown code fences and thinking tags
    let cleaned = responseText
      .replace(/<think>[\s\S]*?<\/think>/g, '') // Remove thinking blocks
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Find the first JSON object in the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    logger.error('Failed to parse AI JSON response', parseError);
    logger.warn('Raw AI response: ' + responseText.substring(0, 500));
    throw Object.assign(new Error('AI returned invalid JSON response'), {
      statusCode: 502,
      code: 'AI_PARSE_ERROR',
    });
  }

  return { parsed, tokensUsed, rawResponse: responseText };
};

// ──────────────────────────────────────────────
// 7a. Lead Analysis
// ──────────────────────────────────────────────

export const analyzeLead = async (leadId, userId) => {
  // Fetch lead + last 10 activities
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, isDeleted: false },
    include: {
      assignedTo: { select: { name: true } },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true } } },
      },
      followUps: {
        select: { status: true },
      },
    },
  });

  if (!lead) {
    throw Object.assign(new Error('Lead not found'), {
      statusCode: 404,
      code: 'LEAD_NOT_FOUND',
    });
  }

  // Compute contextual signals
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const followUpsCompleted = lead.followUps.filter((f) => f.status === 'DONE').length;
  const followUpsMissed = lead.followUps.filter((f) => f.status === 'MISSED').length;

  const activitiesFormatted = lead.activities
    .map(
      (a) =>
        `[${a.createdAt.toISOString().split('T')[0]}] ${a.type}: ${a.description} (by ${a.user.name})`
    )
    .join('\n');

  const systemPrompt = `You are an expert CRM sales analyst. Analyze leads and provide actionable insights.
Always respond in valid JSON only — no markdown, no preamble, no explanation outside the JSON.`;

  const userPrompt = `Analyze this lead:
Name: ${lead.name}, Company: ${lead.company}, Stage: ${lead.pipelineStage}, Source: ${lead.source}
Assigned to: ${lead.assignedTo?.name || 'Unassigned'}
Estimated Value: $${lead.estimatedValue || 0}
Activities (last 10):
${activitiesFormatted || 'No activities yet'}
Days since created: ${daysSinceCreated}, Follow-ups completed: ${followUpsCompleted}, Follow-ups missed: ${followUpsMissed}

Respond with this exact JSON structure:
{
  "probability": "HIGH|MEDIUM|LOW",
  "summary": "2-3 sentence analysis",
  "recommended_action": "specific next step",
  "urgency": "IMMEDIATE|THIS_WEEK|THIS_MONTH",
  "risk_factors": ["list of risk factors"],
  "strengths": ["list of strengths"]
}`;

  const { parsed, tokensUsed } = await callAI(systemPrompt, userPrompt);

  // Save AI interaction
  await prisma.aIInteraction.create({
    data: {
      userId,
      leadId,
      type: 'LEAD_ANALYSIS',
      input: userPrompt,
      output: JSON.stringify(parsed),
      tokensUsed,
    },
  });

  logger.success(`Lead analyzed: ${lead.name} — ${parsed.probability} probability`);
  return parsed;
};

// ──────────────────────────────────────────────
// 7b. Email Generator
// ──────────────────────────────────────────────

export const generateEmail = async (leadId, emailType, context, userId) => {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, isDeleted: false },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  });

  if (!lead) {
    throw Object.assign(new Error('Lead not found'), {
      statusCode: 404,
      code: 'LEAD_NOT_FOUND',
    });
  }

  // Get current user name for signature
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const lastActivity = lead.activities[0];
  const lastInteractionStr = lastActivity
    ? `${lastActivity.type} on ${lastActivity.createdAt.toISOString().split('T')[0]}: ${lastActivity.description}`
    : 'No previous interactions';

  const systemPrompt = `You are an expert B2B sales copywriter. Write professional, personalized sales emails.
Respond ONLY with a JSON object — no markdown, no explanation, no text outside the JSON.`;

  const userPrompt = `Generate a ${emailType} email for:
Lead: ${lead.name} from ${lead.company}, Stage: ${lead.pipelineStage}
Last interaction: ${lastInteractionStr}
Additional context: ${context || 'None provided'}
Sales rep: ${currentUser.name}

Respond with this exact JSON:
{
  "subject": "compelling subject line",
  "body": "full email body with proper greeting and sign-off"
}`;

  const { parsed, tokensUsed } = await callAI(systemPrompt, userPrompt);

  await prisma.aIInteraction.create({
    data: {
      userId,
      leadId,
      type: 'EMAIL_GENERATION',
      input: userPrompt,
      output: JSON.stringify(parsed),
      tokensUsed,
    },
  });

  logger.success(`Email generated for lead: ${lead.name} (${emailType})`);
  return parsed;
};

// ──────────────────────────────────────────────
// 7c. Lead Scoring Agent
// ──────────────────────────────────────────────

export const scoreLead = async (leadId, userId) => {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, isDeleted: false },
    include: {
      activities: { orderBy: { createdAt: 'desc' } },
      followUps: true,
      campaignRecipients: true,
    },
  });

  if (!lead) {
    throw Object.assign(new Error('Lead not found'), {
      statusCode: 404,
      code: 'LEAD_NOT_FOUND',
    });
  }

  // Compute scoring signals
  const now = Date.now();
  const daysSinceCreated = Math.floor(
    (now - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Days in current stage
  const lastStageChange = lead.activities.find((a) => a.type === 'STAGE_CHANGE');
  const daysInStage = lastStageChange
    ? Math.floor(
        (now - new Date(lastStageChange.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    : daysSinceCreated;

  // Activities in last 7 days
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const activitiesLast7Days = lead.activities.filter(
    (a) => new Date(a.createdAt) >= sevenDaysAgo
  ).length;

  const followUpsCompleted = lead.followUps.filter((f) => f.status === 'DONE').length;
  const followUpsMissed = lead.followUps.filter((f) => f.status === 'MISSED').length;
  const emailsOpened = lead.campaignRecipients.filter((r) => r.status === 'OPENED').length;

  // Count forward stage progressions
  const stageOrder = ['NEW_LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'];
  const stageChanges = lead.activities.filter((a) => a.type === 'STAGE_CHANGE');
  let stagesProgressed = 0;
  for (const change of stageChanges) {
    try {
      const meta = JSON.parse(change.metadata || '{}');
      if (
        meta.from &&
        meta.to &&
        stageOrder.indexOf(meta.to) > stageOrder.indexOf(meta.from)
      ) {
        stagesProgressed++;
      }
    } catch {
      // skip unparseable metadata
    }
  }

  const signals = {
    daysInStage,
    activitiesLast7Days,
    followUpsCompleted,
    followUpsMissed,
    emailsOpened,
    stagesProgressed,
    source: lead.source,
    daysSinceCreated,
    currentStage: lead.pipelineStage,
    estimatedValue: lead.estimatedValue || 0,
    totalActivities: lead.activities.length,
  };

  const systemPrompt = `You are a lead scoring AI. Analyze sales signals and output a conversion probability score.
Respond ONLY with valid JSON — no markdown, no explanation, no text outside the JSON.`;

  const userPrompt = `Score this lead based on these signals:
- Days in current stage (${signals.currentStage}): ${signals.daysInStage}
- Activities in last 7 days: ${signals.activitiesLast7Days}
- Total activities: ${signals.totalActivities}
- Follow-ups completed: ${signals.followUpsCompleted}
- Follow-ups missed: ${signals.followUpsMissed}
- Emails opened: ${signals.emailsOpened}
- Forward stage progressions: ${signals.stagesProgressed}
- Lead source: ${signals.source} (REFERRAL is strongest, then WEBSITE, then COLD_CALL)
- Days since created: ${signals.daysSinceCreated} (older leads without progress score lower)
- Estimated deal value: $${signals.estimatedValue}

Respond with this exact JSON:
{
  "score": <number 0-100>,
  "confidence": "HIGH|MEDIUM|LOW",
  "reasoning": "brief explanation of the score",
  "key_factors": ["top 3 factors influencing the score"]
}`;

  const { parsed, tokensUsed } = await callAI(systemPrompt, userPrompt);

  // Validate score range
  const score = Math.max(0, Math.min(100, parseInt(parsed.score, 10) || 0));

  // Update lead score
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      score,
      scoreUpdatedAt: new Date(),
    },
  });

  // Log activity
  await prisma.leadActivity.create({
    data: {
      leadId,
      userId,
      type: 'SCORE_UPDATE',
      description: `AI Score updated to ${score}/100 (${parsed.confidence} confidence)`,
      metadata: JSON.stringify(parsed),
    },
  });

  // Save AI interaction
  await prisma.aIInteraction.create({
    data: {
      userId,
      leadId,
      type: 'LEAD_SCORING',
      input: JSON.stringify(signals),
      output: JSON.stringify(parsed),
      tokensUsed,
    },
  });

  logger.success(`Lead scored: ${lead.name} — ${score}/100 (${parsed.confidence})`);
  return { ...parsed, score };
};

// ──────────────────────────────────────────────
// 7d. Bulk Scoring (Admin only)
// ──────────────────────────────────────────────

export const scoreAllLeads = async (userId) => {
  const leads = await prisma.lead.findMany({
    where: {
      isDeleted: false,
      pipelineStage: { notIn: ['WON', 'LOST'] },
    },
    select: { id: true, name: true },
  });

  const results = { scored: 0, total: leads.length, errors: [] };

  for (const lead of leads) {
    try {
      await scoreLead(lead.id, userId);
      results.scored++;
      logger.info(`Bulk scoring: ${results.scored}/${results.total} — ${lead.name}`);

      // Rate limit: 2-second delay between calls
      if (results.scored < results.total) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      results.errors.push({ leadId: lead.id, name: lead.name, error: error.message });
      logger.error(`Bulk scoring failed for ${lead.name}`, error);
    }
  }

  logger.success(`Bulk scoring complete: ${results.scored}/${results.total}`);
  return results;
};

/**
 * Get AI interaction history for a user
 */
export const getAIHistory = async (userId, page = 1, limit = 20) => {
  const take = Math.min(parseInt(limit, 10) || 20, 50);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const [interactions, total] = await Promise.all([
    prisma.aIInteraction.findMany({
      where: { userId },
      include: {
        lead: { select: { id: true, name: true, company: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.aIInteraction.count({ where: { userId } }),
  ]);

  return {
    interactions,
    pagination: {
      page: Math.max(parseInt(page, 10) || 1, 1),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};

export default { analyzeLead, generateEmail, scoreLead, scoreAllLeads, getAIHistory };
