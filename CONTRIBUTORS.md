# Contributors

## CRM Platform Team

| Name | Role | GitHub | Modules Owned |
|------|------|--------|---------------|
| **Aditya Shrivastava** | Tech Lead & Architect | [@adishri2005](https://github.com/adishri2005) | Auth, Leads, App Entry, Seed, Infrastructure |
| **Praket Yadav** | AI & Backend Engineer | — | AI Integration (NVIDIA Nemotron), Lead Scoring, Email Gen |
| **Vineet Yadav** | Backend Engineer | — | Follow-Ups, Email Campaigns, Scheduler, EmailSender |
| **Namami Pandey** | Data & Analytics Engineer | — | Analytics, Dashboard Stats, Team Performance |
| **Ajar Gupta** | Frontend Engineer | — | React UI, Design System, Layout, All Pages |

## Module Ownership Map

```
backend/
  ├── src/
  │   ├── config/         → Aditya
  │   ├── middleware/      → Aditya
  │   ├── utils/
  │   │   ├── logger.js         → Aditya
  │   │   ├── emailSender.js    → Vineet
  │   │   └── scheduler.js      → Vineet
  │   ├── modules/
  │   │   ├── auth/        → Aditya
  │   │   ├── leads/       → Aditya
  │   │   ├── pipeline/    → Aditya
  │   │   ├── ai/          → Praket
  │   │   ├── followups/   → Vineet
  │   │   ├── emails/      → Vineet
  │   │   └── analytics/   → Namami
  │   └── app.js           → Aditya
  └── prisma/
      ├── schema.prisma    → Aditya
      └── seed.js          → Aditya

frontend/
  ├── src/
  │   ├── components/
  │   │   ├── layout/      → Ajar
  │   │   ├── pipeline/    → Ajar
  │   │   ├── ai/          → Praket
  │   │   ├── analytics/   → Namami
  │   │   ├── followups/   → Vineet (logic) / Ajar (UI)
  │   │   └── emails/      → Vineet (logic) / Ajar (UI)
  │   ├── pages/           → Ajar
  │   ├── store/           → Ajar
  │   └── services/        → Ajar
  └── Design System        → Ajar
```

## Contribution Stats

| Contributor | Files Created | Lines of Code |
|-------------|:------------:|:-------------:|
| Aditya | 14 | ~1,500 |
| Praket | 6 | ~900 |
| Vineet | 11 | ~1,200 |
| Namami | 6 | ~650 |
| Ajar | 25 | ~2,800 |
| **Total** | **62** | **~7,050** |
