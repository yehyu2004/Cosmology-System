# Cosmo

A teaching assistant platform for a graduate-level Observational Cosmology course at NTHU. Graduate students write reports connecting anime/science fiction to real cosmology, and TAs grade them with AI assistance.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 — Google OAuth (@gapp.nthu.edu.tw)
- **AI Grading**: OpenAI GPT-5.2 with structured rubric
- **Styling**: TailwindCSS + shadcn/ui
- **Charts**: Plotly.js for cosmology simulations

## Getting Started

```bash
# Prerequisites: Docker, Node.js 18+

# 1. Start PostgreSQL
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in: DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OPENAI_API_KEY, NEXTAUTH_SECRET

# 4. Run database migrations and seed
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev
```

## Features

### Assignment & Submission System
- TAs/professors create assignments with customizable rubrics
- Students upload PDF reports (one submission per student per assignment)
- "Return to student" workflow — TAs can return submissions for revision, students see a notification and can re-upload
- Students see grade status badges (score or "Pending") on the assignments list
- File uploads stored in `public/uploads/` (development) — switch to Vercel Blob or S3 for production

### AI-Assisted Grading
Reports are graded by GPT-5.2 with a structured rubric tailored to anime-cosmology reports:

| Category | Points | Focus |
|----------|--------|-------|
| Anime Introduction | 10 | Plot summary, themes, genuine familiarity |
| Cosmology-Anime Connection | 30 | Specific cosmological concepts tied to scenes |
| Cosmological Concepts | 30 | Real science explained accurately, beyond anime |
| References | 10 | Credible sources, proper citations |
| Writing Quality | 20 | Structure, flow, grammar |

The AI grader uses a professor persona — knowledgeable, direct, constructive. It also checks for proper use of significant figures in any numerical values. TAs review all AI suggestions before finalizing grades.

The rubric and grading standards are defined in `src/lib/grading-rubric.ts` and can be customized per assignment.

### Grade Export
Staff can export grades as CSV from the grading page — per-assignment or across all assignments. Includes student name, email, student ID, score, and timestamps.

### Cosmology Simulations
Eight interactive simulations based on Serjeant's *Observational Cosmology* textbook, rendered with Plotly.js and Canvas.

### Collapsible Sidebar & Theme Toggle
- Desktop sidebar collapses to a narrow icon rail for more workspace
- Built-in dark/light mode toggle in the sidebar

### Role-Based Access
- **STUDENT**: View assignments, submit reports, see grades and feedback
- **TA**: Grade submissions, create assignments, AI grading tools, view user list, export grades
- **PROFESSOR**: All TA capabilities plus user management
- **ADMIN**: Full access, user management with role changes, impersonation, user deletion

### User Management
- TAs and professors can view the user list; only admins can change roles or impersonate
- Role-hierarchical user deletion — you can only delete users with a lower role than yours
- Cascade deletes ensure no orphaned records when a user is removed

### Loading & Error States
- Skeleton loading screens for all routes (Next.js Suspense boundaries)
- Error boundary with retry for the main layout
- Respects `prefers-reduced-motion` for accessibility

## Project Structure

```
src/
  app/
    (auth)/              # Google OAuth login
    (main)/              # Authenticated pages (sidebar layout)
      assignments/       # Assignment list, detail, create
      dashboard/         # Student/TA dashboard
      grading/           # Grading interface
      grades/            # Student grades view
      admin/             # User management panel
      settings/          # User settings
      simulations/       # Interactive cosmology simulations
    api/                 # API routes
      assignments/       # Assignment CRUD
      grading/           # Submission grading + AI + CSV export
      submissions/       # Student submissions
      upload/            # File upload
      users/             # User management + deletion
  components/
    ui/                  # shadcn/ui components
    layout/              # Sidebar, Topbar
    simulations/         # Cosmology simulation components
  lib/
    auth.ts              # NextAuth v5 config
    prisma.ts            # Prisma client singleton
    ai.ts                # OpenAI grading integration
    grading-rubric.ts    # Default rubric, scoring guidelines, AI prompt
    pdf-to-images.ts     # Server-side PDF to JPEG conversion
  data/
    serjeant-chapters.ts # Textbook chapter/simulation data
prisma/
  schema.prisma          # Database schema (User, Assignment, Submission)
```

## Development

```bash
npm run dev                          # Start dev server
npm run build                        # Production build
npm run lint                         # Lint
npx tsc --noEmit                     # Type check
npx prisma studio                    # Database GUI
npx prisma migrate dev --name <name> # New migration
```

## Deployment

Build command: `prisma generate && prisma migrate deploy && next build`

Type errors will fail the Vercel build — always run `npx tsc --noEmit` before pushing.
