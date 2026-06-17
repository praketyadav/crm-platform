// Author: Aditya | Module: Database Seed | CRM Platform v1.0

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding database...\n');

  // ──────────────────────────────────────────────
  // 1. Create Users
  // ──────────────────────────────────────────────

  const adminPassword = await bcrypt.hash('Admin@123', SALT_ROUNDS);
  const managerPassword = await bcrypt.hash('Manager@123', SALT_ROUNDS);
  const execPassword = await bcrypt.hash('Exec@123', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: {},
    create: {
      name: 'Aditya Shrivastava',
      email: 'admin@crm.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@crm.com' },
    update: {},
    create: {
      name: 'Praket Yadav',
      email: 'manager@crm.com',
      password: managerPassword,
      role: 'SALES_MANAGER',
    },
  });

  const exec = await prisma.user.upsert({
    where: { email: 'exec@crm.com' },
    update: {},
    create: {
      name: 'Ajar Gupta',
      email: 'exec@crm.com',
      password: execPassword,
      role: 'SALES_EXECUTIVE',
    },
  });

  // Create team
  const team = await prisma.team.upsert({
    where: { managerId: manager.id },
    update: {},
    create: {
      name: 'Alpha Sales Team',
      managerId: manager.id,
    },
  });

  // Assign team
  await prisma.user.updateMany({
    where: { id: { in: [manager.id, exec.id] } },
    data: { teamId: team.id },
  });

  console.log('✅ Users created: admin@crm.com, manager@crm.com, exec@crm.com');

  // ──────────────────────────────────────────────
  // 2. Create 20 Sample Leads
  // ──────────────────────────────────────────────

  const leadData = [
    { name: 'Sarah Johnson', company: 'TechNova Solutions', email: 'sarah@technova.com', phone: '+1-555-0101', source: 'WEBSITE', pipelineStage: 'NEGOTIATION', estimatedValue: 45000, assignedToId: exec.id },
    { name: 'Michael Chen', company: 'CloudPeak Industries', email: 'mchen@cloudpeak.io', phone: '+1-555-0102', source: 'REFERRAL', pipelineStage: 'PROPOSAL', estimatedValue: 82000, assignedToId: exec.id },
    { name: 'Emily Rodriguez', company: 'DataStream Corp', email: 'emily@datastream.com', phone: '+1-555-0103', source: 'COLD_CALL', pipelineStage: 'QUALIFIED', estimatedValue: 28000, assignedToId: exec.id },
    { name: 'James Wilson', company: 'Apex Digital', email: 'jwilson@apexdigital.com', phone: '+1-555-0104', source: 'EMAIL', pipelineStage: 'NEW_LEAD', estimatedValue: 15000, assignedToId: manager.id },
    { name: 'Priya Patel', company: 'InnoVerse Labs', email: 'priya@innoverse.io', phone: '+1-555-0105', source: 'SOCIAL', pipelineStage: 'WON', estimatedValue: 67000, assignedToId: exec.id },
    { name: 'Robert Kim', company: 'NexGen Pharma', email: 'rkim@nexgen.com', phone: '+1-555-0106', source: 'REFERRAL', pipelineStage: 'NEGOTIATION', estimatedValue: 125000, assignedToId: manager.id },
    { name: 'Amanda Foster', company: 'Quantum Finance', email: 'afoster@quantumfin.com', phone: '+1-555-0107', source: 'WEBSITE', pipelineStage: 'QUALIFIED', estimatedValue: 35000, assignedToId: exec.id },
    { name: 'David Park', company: 'SkyBridge Logistics', email: 'dpark@skybridge.com', phone: '+1-555-0108', source: 'COLD_CALL', pipelineStage: 'LOST', estimatedValue: 52000, assignedToId: exec.id },
    { name: 'Jessica Martinez', company: 'GreenTech Energy', email: 'jmartinez@greentech.com', phone: '+1-555-0109', source: 'WEBSITE', pipelineStage: 'PROPOSAL', estimatedValue: 92000, assignedToId: manager.id },
    { name: 'Christopher Lee', company: 'UrbanPulse Media', email: 'clee@urbanpulse.com', phone: '+1-555-0110', source: 'SOCIAL', pipelineStage: 'NEW_LEAD', estimatedValue: 18000, assignedToId: exec.id },
    { name: 'Rachel Thompson', company: 'MedCore Systems', email: 'rthompson@medcore.com', phone: '+1-555-0111', source: 'REFERRAL', pipelineStage: 'WON', estimatedValue: 110000, assignedToId: manager.id },
    { name: 'Daniel Brown', company: 'AeroVista Tech', email: 'dbrown@aerovista.com', phone: '+1-555-0112', source: 'EMAIL', pipelineStage: 'QUALIFIED', estimatedValue: 40000, assignedToId: exec.id },
    { name: 'Lisa Nguyen', company: 'BioSync Health', email: 'lnguyen@biosync.com', phone: '+1-555-0113', source: 'COLD_CALL', pipelineStage: 'NEW_LEAD', estimatedValue: 22000, assignedToId: manager.id },
    { name: 'Mark Taylor', company: 'CyberShield Security', email: 'mtaylor@cybershield.io', phone: '+1-555-0114', source: 'WEBSITE', pipelineStage: 'NEGOTIATION', estimatedValue: 75000, assignedToId: exec.id },
    { name: 'Sophia Anderson', company: 'FlexiWare Solutions', email: 'sanderson@flexiware.com', phone: '+1-555-0115', source: 'REFERRAL', pipelineStage: 'PROPOSAL', estimatedValue: 58000, assignedToId: manager.id },
    { name: 'Kevin White', company: 'OceanView Properties', email: 'kwhite@oceanview.com', phone: '+1-555-0116', source: 'SOCIAL', pipelineStage: 'LOST', estimatedValue: 200000, assignedToId: exec.id },
    { name: 'Natalie Davis', company: 'SparkAI Analytics', email: 'ndavis@sparkai.com', phone: '+1-555-0117', source: 'WEBSITE', pipelineStage: 'WON', estimatedValue: 95000, assignedToId: exec.id },
    { name: 'Ryan Garcia', company: 'VeloCity Transport', email: 'rgarcia@velocity.com', phone: '+1-555-0118', source: 'EMAIL', pipelineStage: 'QUALIFIED', estimatedValue: 31000, assignedToId: manager.id },
    { name: 'Hannah Clark', company: 'EcoBuild Construction', email: 'hclark@ecobuild.com', phone: '+1-555-0119', source: 'COLD_CALL', pipelineStage: 'NEW_LEAD', estimatedValue: 48000, assignedToId: exec.id },
    { name: 'Alex Turner', company: 'PivotPoint Consulting', email: 'aturner@pivotpoint.com', phone: '+1-555-0120', source: 'REFERRAL', pipelineStage: 'NEGOTIATION', estimatedValue: 63000, assignedToId: manager.id },
  ];

  const leads = [];
  for (let i = 0; i < leadData.length; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const lead = await prisma.lead.create({
      data: {
        ...leadData[i],
        status: leadData[i].pipelineStage === 'WON' ? 'won' : leadData[i].pipelineStage === 'LOST' ? 'lost' : 'active',
        createdById: admin.id,
        score: Math.floor(Math.random() * 60) + 30,
        scoreUpdatedAt: new Date(),
        createdAt,
      },
    });
    leads.push(lead);
  }

  console.log(`✅ ${leads.length} leads created`);

  // ──────────────────────────────────────────────
  // 3. Create Follow-Ups
  // ──────────────────────────────────────────────

  const followUpData = [
    { leadIdx: 0, assignedToId: exec.id, daysFromNow: 1, status: 'PENDING', notes: 'Discuss contract terms' },
    { leadIdx: 1, assignedToId: exec.id, daysFromNow: 3, status: 'PENDING', notes: 'Send updated proposal' },
    { leadIdx: 2, assignedToId: exec.id, daysFromNow: -2, status: 'DONE', notes: 'Qualification call completed' },
    { leadIdx: 3, assignedToId: manager.id, daysFromNow: 5, status: 'PENDING', notes: 'Initial discovery meeting' },
    { leadIdx: 5, assignedToId: manager.id, daysFromNow: -1, status: 'MISSED', notes: 'Contract review meeting' },
    { leadIdx: 6, assignedToId: exec.id, daysFromNow: 7, status: 'PENDING', notes: 'Demo presentation' },
    { leadIdx: 8, assignedToId: manager.id, daysFromNow: -5, status: 'DONE', notes: 'Proposal walkthrough completed' },
    { leadIdx: 11, assignedToId: exec.id, daysFromNow: 2, status: 'PENDING', notes: 'Technical requirements discussion' },
    { leadIdx: 13, assignedToId: exec.id, daysFromNow: -3, status: 'MISSED', notes: 'Pricing negotiation call' },
    { leadIdx: 19, assignedToId: manager.id, daysFromNow: 4, status: 'PENDING', notes: 'Stakeholder alignment meeting' },
  ];

  for (const f of followUpData) {
    const scheduledAt = new Date(Date.now() + f.daysFromNow * 24 * 60 * 60 * 1000);
    await prisma.followUp.create({
      data: {
        leadId: leads[f.leadIdx].id,
        assignedToId: f.assignedToId,
        scheduledAt,
        status: f.status,
        notes: f.notes,
      },
    });
  }

  console.log('✅ 10 follow-ups created');

  // ──────────────────────────────────────────────
  // 4. Create Email Templates
  // ──────────────────────────────────────────────

  await prisma.emailTemplate.createMany({
    data: [
      {
        name: 'Initial Follow-Up',
        subject: 'Great connecting with you, {{lead_name}}!',
        body: `<p>Hi {{lead_name}},</p>
<p>Thank you for your time today. I enjoyed learning about {{company}} and your current challenges.</p>
<p>As discussed, I've put together some thoughts on how we can help streamline your operations. I'd love to schedule a follow-up to dive deeper into the specifics.</p>
<p>Would you be available for a 30-minute call this week?</p>
<p>Best regards,<br/>{{sales_rep}}<br/>CRM Platform Team</p>`,
        type: 'FOLLOWUP',
        createdById: admin.id,
      },
      {
        name: 'Proposal Delivery',
        subject: 'Your Custom Proposal from CRM Platform — {{company}}',
        body: `<p>Hi {{lead_name}},</p>
<p>As promised, please find attached our tailored proposal for {{company}}.</p>
<p>Key highlights:</p>
<ul>
<li>Customized implementation plan aligned with your goals</li>
<li>ROI projections based on your current metrics</li>
<li>Flexible pricing options to fit your budget</li>
</ul>
<p>I'd recommend we schedule a call to walk through the details together. Please let me know a time that works for you.</p>
<p>Looking forward to partnering with {{company}}!</p>
<p>Best regards,<br/>{{sales_rep}}</p>`,
        type: 'PROPOSAL',
        createdById: admin.id,
      },
      {
        name: 'Gentle Reminder',
        subject: 'Quick follow-up — {{lead_name}}',
        body: `<p>Hi {{lead_name}},</p>
<p>I wanted to circle back on our last conversation. I understand things get busy at {{company}}, so I just wanted to check if you had any questions about our proposal.</p>
<p>I'm happy to schedule a quick call or answer any questions over email — whatever is most convenient for you.</p>
<p>Looking forward to hearing from you!</p>
<p>Best,<br/>{{sales_rep}}</p>`,
        type: 'REMINDER',
        createdById: admin.id,
      },
    ],
  });

  console.log('✅ 3 email templates created');

  // ──────────────────────────────────────────────
  // 5. Create Lead Activities
  // ──────────────────────────────────────────────

  const activityTypes = ['CALL', 'EMAIL', 'NOTE', 'STAGE_CHANGE'];
  const activityDescriptions = {
    CALL: ['Initial discovery call', 'Follow-up call — discussed pricing', 'Technical deep-dive call', 'Contract review call'],
    EMAIL: ['Sent introductory email', 'Shared product documentation', 'Sent proposal via email', 'Follow-up email after meeting'],
    NOTE: ['Lead seems very interested in premium tier', 'Decision maker identified: VP of Engineering', 'Budget confirmed for Q2', 'Competitor also pitching — need to differentiate'],
    STAGE_CHANGE: ['Moved from New Lead to Qualified', 'Moved from Qualified to Proposal', 'Moved from Proposal to Negotiation', 'Deal closed — Won!'],
  };

  for (let i = 0; i < 15; i++) {
    const leadIdx = Math.floor(Math.random() * leads.length);
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const descriptions = activityDescriptions[type];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const daysAgo = Math.floor(Math.random() * 60);

    await prisma.leadActivity.create({
      data: {
        leadId: leads[leadIdx].id,
        userId: [admin.id, manager.id, exec.id][Math.floor(Math.random() * 3)],
        type,
        description,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ 15 lead activities created');

  console.log('\n🎉 Seed complete!\n');
  console.log('Login credentials:');
  console.log('  Admin:          admin@crm.com / Admin@123');
  console.log('  Sales Manager:  manager@crm.com / Manager@123');
  console.log('  Sales Exec:     exec@crm.com / Exec@123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
