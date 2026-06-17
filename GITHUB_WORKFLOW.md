# GitHub Workflow Guide — CRM Platform

## Branch Strategy

```
main (production)
 ├── develop (integration)
 │    ├── feature/auth-module        (Aditya)
 │    ├── feature/leads-pipeline     (Aditya)
 │    ├── feature/ai-integration     (Praket)
 │    ├── feature/followups-emails   (Vineet)
 │    ├── feature/analytics          (Namami)
 │    └── feature/frontend-ui        (Ajar)
 └── hotfix/* (emergency patches)
```

## Commit Convention

All commits follow this pattern:
```
[Author] type(scope): description
```

### Types
- `feat` — New feature
- `fix` — Bug fix
- `refactor` — Code restructuring
- `docs` — Documentation only
- `test` — Adding or updating tests
- `chore` — Build, CI, tooling

### Examples
```bash
git commit --author="Aditya <aditya@crm-platform.dev>" -m "[Aditya] feat(auth): implement JWT authentication with refresh tokens"
git commit --author="Praket <praket@crm-platform.dev>" -m "[Praket] feat(ai): add lead scoring with NVIDIA Nemotron"
git commit --author="Vineet <vineet@crm-platform.dev>" -m "[Vineet] feat(email): implement campaign batch sender"
git commit --author="Namami <namami@crm-platform.dev>" -m "[Namami] feat(analytics): add revenue forecast endpoint"
git commit --author="Ajar <ajar@crm-platform.dev>" -m "[Ajar] feat(ui): build Kanban board with drag-and-drop"
```

## Pull Request Process

1. Create branch from `develop`
2. Implement feature with passing tests
3. Create PR with description and screenshots
4. Require 1 approval from team lead
5. Squash merge into `develop`
6. Release: merge `develop` → `main` via PR

## Code Review Checklist

- [ ] RBAC middleware applied on all protected routes
- [ ] Input validation on controller layer
- [ ] Error handling with proper status codes
- [ ] Prisma queries use `isDeleted: false` for soft-deleted leads
- [ ] Frontend route guards match backend RBAC
- [ ] No hardcoded credentials or API keys
- [ ] Author tag present in file header comment

## CI/CD Pipeline

On every push to `main` or `develop`:
1. **Lint** — ESLint checks
2. **Test** — Unit + integration tests
3. **Build** — Vite production build
4. **Deploy** — Docker Compose on VPS (main only)
