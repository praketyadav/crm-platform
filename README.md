# Author: Aditya | Module: Documentation | CRM Platform v1.0

```
   ██████╗██████╗ ███╗   ███╗    ██████╗ ██╗      █████╗ ████████╗███████╗ ██████╗ ██████╗ ███╗   ███╗
  ██╔════╝██╔══██╗████╗ ████║    ██╔══██╗██║     ██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██╔══██╗████╗ ████║
  ██║     ██████╔╝██╔████╔██║    ██████╔╝██║     ███████║   ██║   █████╗  ██║   ██║██████╔╝██╔████╔██║
  ██║     ██╔══██╗██║╚██╔╝██║    ██╔═══╝ ██║     ██╔══██║   ██║   ██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║
  ╚██████╗██║  ██║██║ ╚═╝ ██║    ██║     ███████╗██║  ██║   ██║   ██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║
   ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝    ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝
```

> **AI-Powered CRM & Sales Management Platform** — Enterprise-grade, zero-cost, open-source

[![CI](https://github.com/adishri2005/crm-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/adishri2005/crm-platform/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-6C63FF.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)

---

## ✨ Features

| Category | Features |
|----------|----------|
| 🎯 **Lead Management** | Full CRUD, search, filtering, assignment, activity timeline, soft delete |
| 🔀 **Sales Pipeline** | Interactive Kanban board with drag-and-drop, stage tracking, conversion stats |
| 🤖 **AI-Powered Insights** | Lead scoring (0–100), lead analysis, email generation via NVIDIA Nemotron AI |
| 📧 **Email Campaigns** | Template builder with variables, bulk send, open tracking, scheduling |
| 📅 **Follow-Up System** | Calendar view, reminders, auto-notifications, daily digest emails |
| 📊 **Analytics Dashboard** | Sales charts, conversion funnel, team performance, revenue forecast |
| 🔐 **Auth & RBAC** | JWT auth with refresh tokens, role-based access (Admin/Manager/Exec) |
| 👥 **Team Management** | User management, team assignment, performance tracking |
| 🔔 **Notifications** | In-app notifications for follow-up reminders and system events |
| 🐳 **DevOps Ready** | Docker Compose, GitHub Actions CI/CD, Render + Vercel deployment |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js 20 LTS, Express.js, JavaScript ES2022 |
| **Database** | PostgreSQL (Neon.tech free tier / Docker) |
| **ORM** | Prisma |
| **Authentication** | JWT (jsonwebtoken) + bcrypt |
| **AI Engine** | NVIDIA Nemotron (`nemotron-3-ultra-550b-a55b`) via OpenAI-compatible API |
| **Email** | Nodemailer + Gmail SMTP |
| **Scheduler** | node-cron |
| **Frontend** | React 18 (Vite), Tailwind CSS, Zustand |
| **Charts** | Recharts |
| **Calendar** | React Big Calendar |
| **Drag & Drop** | @hello-pangea/dnd |
| **Forms** | React Hook Form + Zod |
| **CI/CD** | GitHub Actions → Render.com + Vercel |

**💰 Total Cost: $0** — Every component uses free-tier or open-source tooling.

---

## 📋 Prerequisites

- **Node.js 20 LTS** ([download](https://nodejs.org))
- **PostgreSQL 15+** — via one of:
  - [Neon.tech](https://neon.tech) free tier (recommended, zero setup)
  - Docker (`docker-compose up -d`)
- **NVIDIA API Key** — [build.nvidia.com](https://build.nvidia.com) (for AI features, free credits on signup)
- **Gmail App Password** — (optional, for email sending)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/adishri2005/crm-platform.git
cd crm-platform
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT secrets, NVIDIA API key
```

### 3. Setup Database
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start Backend
```bash
npm run dev
# Server starts on http://localhost:3000
```

### 5. Setup Frontend (new terminal)
```bash
cd frontend
npm install
```

### 6. Start Frontend
```bash
npm run dev
# App opens on http://localhost:5173
```

### 7. Login with seed credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@crm.com | Admin@123 |
| Sales Manager | manager@crm.com | Manager@123 |
| Sales Executive | exec@crm.com | Exec@123 |

---

## 🐳 Docker Quick Start

```bash
# Start PostgreSQL + Backend
docker-compose up -d

# Run migrations & seed
cd backend
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | ✅ | Admin | Create user |
| POST | `/api/auth/login` | ❌ | — | Login, get tokens |
| POST | `/api/auth/refresh` | ❌ | — | Refresh access token |
| POST | `/api/auth/logout` | ✅ | Any | Invalidate refresh token |
| GET | `/api/auth/me` | ✅ | Any | Get current user |

### Leads
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/leads` | ✅ | Any | List with filters & pagination |
| POST | `/api/leads` | ✅ | Any | Create lead |
| GET | `/api/leads/:id` | ✅ | Any | Get lead + activities |
| PUT | `/api/leads/:id` | ✅ | Own/Manager/Admin | Update lead |
| DELETE | `/api/leads/:id` | ✅ | Admin | Soft delete lead |
| POST | `/api/leads/:id/assign` | ✅ | Manager/Admin | Assign to user |
| GET | `/api/leads/:id/activities` | ✅ | Any | Activity history |
| POST | `/api/leads/:id/notes` | ✅ | Any | Add note |

### Pipeline
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/pipeline` | ✅ | Any | Leads grouped by stage |
| PUT | `/api/pipeline/move` | ✅ | Any | Move lead between stages |
| GET | `/api/pipeline/stats` | ✅ | Manager/Admin | Conversion stats |

### Follow-Ups
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/followups` | ✅ | Any | List with filters |
| POST | `/api/followups` | ✅ | Any | Schedule follow-up |
| PUT | `/api/followups/:id` | ✅ | Own/Admin | Update follow-up |
| DELETE | `/api/followups/:id` | ✅ | Own/Admin | Cancel follow-up |
| GET | `/api/followups/calendar` | ✅ | Any | Calendar events |

### Email Campaigns
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/email-templates` | ✅ | Any | List templates |
| POST | `/api/email-templates` | ✅ | Manager/Admin | Create template |
| PUT | `/api/email-templates/:id` | ✅ | Manager/Admin | Update template |
| GET | `/api/campaigns` | ✅ | Manager/Admin | List campaigns |
| POST | `/api/campaigns` | ✅ | Manager/Admin | Create campaign |
| POST | `/api/campaigns/:id/send` | ✅ | Manager/Admin | Send/schedule campaign |
| GET | `/api/campaigns/:id/stats` | ✅ | Manager/Admin | Campaign stats |

### Analytics
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/analytics/dashboard` | ✅ | Any | Dashboard stats |
| GET | `/api/analytics/pipeline-funnel` | ✅ | Manager/Admin | Funnel data |
| GET | `/api/analytics/lead-sources` | ✅ | Manager/Admin | Source breakdown |
| GET | `/api/analytics/team-performance` | ✅ | Manager/Admin | Per-user stats |
| GET | `/api/analytics/revenue-forecast` | ✅ | Manager/Admin | Revenue projection |
| GET | `/api/analytics/activity-timeline` | ✅ | Any | 30-day activity |

### AI (NVIDIA Nemotron)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/ai/analyze-lead` | ✅ | Any | AI lead analysis |
| POST | `/api/ai/generate-email` | ✅ | Any | AI email generation |
| POST | `/api/ai/score-lead` | ✅ | Any | AI lead scoring |
| POST | `/api/ai/score-all-leads` | ✅ | Admin | Bulk scoring |

---

## 👥 Team

| Name | Role | Ownership |
|------|------|-----------|
| **Aditya** | Tech Lead / Backend Architect | Backend API, Auth, DB Schema, DevOps, CI/CD |
| **Praket** | AI/ML Engineer | Lead Scoring, Email Generator, AI Assistant, Score Widget |
| **Ajar** | Frontend Engineer | React UI, Dashboards, Kanban Board, Layout System |
| **Vineet** | Full-Stack (Integration) | Email Campaigns, Calendar, Follow-ups, Notifications |
| **Namami** | Backend + Analytics | Analytics Engine, Reporting, RBAC, Team Management |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ by Team CRM Platform</p>
