// Author: Vineet | Module: Utils | CRM Platform v1.0

import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from './logger.js';

let transporter = null;

/**
 * Get or create the email transporter
 * Uses Ethereal for development, Gmail SMTP for production
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (env.isDev() && (!env.smtpUser || !env.smtpPass)) {
    // Create Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.info(`Email: using Ethereal test account (${testAccount.user})`);
  } else {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: false,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
    logger.info('Email: using configured SMTP');
  }

  return transporter;
};

/**
 * Send an email
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: env.fromEmail,
      to,
      subject,
      html: html || undefined,
      text: text || undefined,
    });

    // Log Ethereal preview URL in development
    if (env.isDev()) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`Email preview: ${previewUrl}`);
      }
    }

    logger.success(`Email sent to ${to}: ${subject}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}`, error);
    throw error;
  }
};

export default { sendEmail };
