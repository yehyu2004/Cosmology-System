# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

**See also**: [AGENTS.md](./AGENTS.md) for coding standards and rules.

## Development Commands

```bash
# First-time setup
docker-compose up -d           # Start PostgreSQL
npm install                    # Install dependencies
npx prisma migrate dev         # Run migrations
npx prisma db seed             # Seed test data
npm run dev                    # Start dev server

# Database
npx prisma migrate dev --name <name>  # Create new migration
npx prisma generate                    # Regenerate Prisma client
npx prisma studio                      # Open database GUI

# Build & Production
npm run build                  # Build for production (prisma generate + migrate deploy + next build)
npm start                      # Start production server

# Linting & Type Check
npm run lint                   # Run Next.js linter
npx tsc --noEmit               # Type check without emitting
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 — Google OAuth only (@gapp.nthu.edu.tw)
- **AI**: OpenAI SDK for report grading assistance
- **Styling**: TailwindCSS + shadcn/ui components
- **Charts**: Plotly.js (react-plotly.js) for scientific simulations

### Project Structure

```
src/
  app/
    (auth)/          # Login page (Google OAuth, no registration)
    (main)/          # Authenticated pages with sidebar layout
    api/             # API routes organized by feature
      assignments/   # Assignment CRUD
      grading/       # Submission grading + AI assist
      submissions/   # Student report submissions
      upload/        # File upload
  components/
    ui/              # shadcn/ui components
    layout/          # Sidebar, Topbar
    simulations/     # 8 cosmology simulation components
  lib/
    auth.ts          # NextAuth v5 configuration (Google OAuth)
    prisma.ts        # Prisma client singleton
    ai.ts            # OpenAI grading helper
  data/
    serjeant-chapters.ts  # Textbook chapter/simulation data
prisma/
  schema.prisma      # Database schema (User, Assignment, Submission)
```

### Key Patterns

#### Authentication
- **Google OAuth only** — no credentials provider, no registration page
- Accounts auto-created on first Google login (default: STUDENT role)
- Use: `import { auth } from "@/lib/auth"` then `const session = await auth()`
- Session user: `{ id, name, email, image, role }`
- Roles: `STUDENT`, `TA`, `PROFESSOR`, `ADMIN`
- Domain restriction: @gapp.nthu.edu.tw only

#### Database & Prisma
- Use `npx prisma migrate dev --name <name>` for schema changes
- Prisma client singleton at `src/lib/prisma.ts`
- Models: `User`, `Assignment`, `Submission`
- One submission per student per assignment (`@@unique([assignmentId, userId])`)

#### Assignment System
- FILE_UPLOAD only — students upload PDF reports
- 2 reports per course (reportNumber: 1 or 2)
- Each assignment has a rubric for AI grading reference

#### AI-Assisted Grading
- Uses OpenAI to suggest scores and feedback for reports
- PDF text extracted server-side via `pdf-parse`
- TA reviews AI suggestions before finalizing grades
- Location: `src/lib/ai.ts` — `aiGradeReport()` function

#### Cosmology Simulations
- **Location**: `src/components/simulations/` (8 components)
- **Data**: `src/data/serjeant-chapters.ts` — textbook structure from Serjeant's "Observational Cosmology"
- **Pages**: `/simulations` (catalog) and `/simulations/[id]` (individual viewer)
- **Rendering**: Plotly.js for charts + Canvas for animations, loaded via `next/dynamic` with `{ ssr: false }`

#### Styling & Theming
- Dark mode via `next-themes` with `class` strategy
- Consistent dark mode mappings: `bg-white → dark:bg-gray-950`, `bg-gray-50 → dark:bg-gray-900`

### Important Implementation Details

#### File Uploads
- Stored locally in `public/uploads/` for development
- Before production: switch to Vercel Blob or S3

## Pre-Deployment Security TODOs

These MUST be resolved before deploying to production. Fix them when setting up the production environment.

### 1. Move uploads out of `public/` (CRITICAL)
Student PDFs in `public/uploads/` are served as unauthenticated static files — anyone with the URL can download them. Fix:
- Move upload directory from `public/uploads/` to a non-public location (e.g., `storage/uploads/`)
- Create an authenticated API route `src/app/api/files/[...path]/route.ts` that checks session + ownership before streaming the file
- OR migrate to Vercel Blob / S3 with signed URLs
- Update `src/app/api/upload/route.ts` (write path) and `src/app/api/grading/route.ts` (read path)
- Update all frontend `<a href={fileUrl}>` links to use the new authenticated route

### 2. Upgrade Next.js (HIGH)
`next@14.2.35` has 14 high-severity vulnerabilities (DoS via Image Optimizer, HTTP request deserialization). Upgrade to `next@15.5.10+` or latest. This may require updating `eslint-config-next` and other dependencies.

### 3. Clean PII from git history (MEDIUM)
Commits `c589026` and `4922bfb` contain hardcoded user IDs, email addresses, and a test JWT secret in deleted files (`tests/`, `prisma/seed.ts`). If this repo is public, rewrite history:
```bash
pip install git-filter-repo
git filter-repo --path tests/ --path prisma/seed.ts --invert-paths
git push --force
```

### 4. Add HSTS header in production (LOW)
Once HTTPS is confirmed, add to `next.config.mjs` headers:
```js
{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }
```

## Build & Deploy
Always run `npx tsc --noEmit` after making changes to catch type errors. Vercel deployments fail on type errors.

Build command: `prisma generate && prisma migrate deploy && next build`

## Git Commit Guidelines
- Prefix commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Include `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>` in commit messages
