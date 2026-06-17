// Author: Vineet | Module: Utils | CRM Platform v1.0

import cron from 'node-cron';
import prisma from '../config/database.js';
import { sendEmail } from './emailSender.js';
import logger from './logger.js';

/**
 * Initialize all scheduled jobs
 */
export const initScheduler = () => {
  // Every 15 minutes: check for upcoming follow-ups and send reminders
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Scheduler: checking for upcoming follow-up reminders...');
    try {
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

      // Find follow-ups due in next 30 minutes with no reminder sent
      const upcomingFollowUps = await prisma.followUp.findMany({
        where: {
          status: 'PENDING',
          reminderSentAt: null,
          scheduledAt: {
            gte: now,
            lte: thirtyMinutesFromNow,
          },
        },
        include: {
          lead: { select: { name: true, company: true } },
          assignedTo: { select: { name: true, email: true } },
        },
      });

      for (const followUp of upcomingFollowUps) {
        try {
          // Send reminder email
          await sendEmail({
            to: followUp.assignedTo.email,
            subject: `Reminder: Follow-up with ${followUp.lead.name} in 30 minutes`,
            html: `
              <h3>Follow-Up Reminder</h3>
              <p>You have a follow-up scheduled with <strong>${followUp.lead.name}</strong> from <strong>${followUp.lead.company}</strong>.</p>
              <p><strong>Scheduled:</strong> ${followUp.scheduledAt.toLocaleString()}</p>
              ${followUp.notes ? `<p><strong>Notes:</strong> ${followUp.notes}</p>` : ''}
              <p>Don't miss it!</p>
            `,
          });

          // Mark reminder as sent
          await prisma.followUp.update({
            where: { id: followUp.id },
            data: { reminderSentAt: new Date() },
          });

          // Create notification
          await prisma.notification.create({
            data: {
              userId: followUp.assignedTo.email ? followUp.assignedToId : followUp.assignedToId,
              title: 'Follow-Up Reminder',
              body: `Follow-up with ${followUp.lead.name} (${followUp.lead.company}) in 30 minutes`,
              type: 'FOLLOW_UP_REMINDER',
            },
          });

          logger.success(`Reminder sent: ${followUp.lead.name} → ${followUp.assignedTo.email}`);
        } catch (err) {
          logger.error(`Failed to send reminder for follow-up ${followUp.id}`, err);
        }
      }

      // Also mark past pending follow-ups as MISSED
      await prisma.followUp.updateMany({
        where: {
          status: 'PENDING',
          scheduledAt: { lt: now },
        },
        data: { status: 'MISSED' },
      });
    } catch (err) {
      logger.error('Scheduler: follow-up reminder check failed', err);
    }
  });

  // Daily at 8AM: send digest email per sales exec
  cron.schedule('0 8 * * *', async () => {
    logger.info('Scheduler: sending daily digest emails...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const salesUsers = await prisma.user.findMany({
        where: { role: { in: ['SALES_EXECUTIVE', 'SALES_MANAGER'] } },
        select: { id: true, name: true, email: true },
      });

      for (const user of salesUsers) {
        const todaysFollowUps = await prisma.followUp.findMany({
          where: {
            assignedToId: user.id,
            status: 'PENDING',
            scheduledAt: { gte: today, lt: tomorrow },
          },
          include: {
            lead: { select: { name: true, company: true } },
          },
        });

        const missedFollowUps = await prisma.followUp.count({
          where: { assignedToId: user.id, status: 'MISSED' },
        });

        if (todaysFollowUps.length > 0 || missedFollowUps > 0) {
          const followUpList = todaysFollowUps
            .map((f) => `<li>${f.lead.name} (${f.lead.company}) — ${f.scheduledAt.toLocaleTimeString()}</li>`)
            .join('');

          await sendEmail({
            to: user.email,
            subject: `Daily Digest: ${todaysFollowUps.length} follow-ups today`,
            html: `
              <h3>Good morning, ${user.name}!</h3>
              <h4>Today's Follow-Ups (${todaysFollowUps.length})</h4>
              ${todaysFollowUps.length > 0 ? `<ul>${followUpList}</ul>` : '<p>No follow-ups scheduled for today.</p>'}
              ${missedFollowUps > 0 ? `<p style="color: red;">⚠️ You have ${missedFollowUps} missed follow-ups. Please review them.</p>` : ''}
              <p>Have a productive day!</p>
            `,
          });

          logger.success(`Daily digest sent to ${user.email}`);
        }
      }
    } catch (err) {
      logger.error('Scheduler: daily digest failed', err);
    }
  });

  logger.success('Scheduler initialized: follow-up reminders (15min) + daily digest (8AM)');
};

export default { initScheduler };
