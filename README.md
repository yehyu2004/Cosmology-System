# Cosmology TA Platform

A teaching assistant platform for an Observational Cosmology course at NTHU. Students write reports connecting anime/science fiction to real cosmology, and TAs grade them with AI assistance.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 — Google OAuth (@gapp.nthu.edu.tw)
- **AI Grading**: OpenAI GPT-4o with structured rubric
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
- File uploads stored in `public/uploads/` (development) — switch to Vercel Blob or S3 for production

### AI-Assisted Grading
Reports are graded by GPT-4o with a structured rubric tailored to anime-cosmology reports:

| Category | Points | Focus |
|----------|--------|-------|
| Anime Introduction | 15 | Plot summary, setting, genuine familiarity |
| Cosmology in the Anime | 25 | Specific cosmological concepts identified in the anime |
| Cosmological Concepts Learned | 40 | Real science beyond the anime, depth and accuracy |
| References | 10 | 2-3+ cosmology/astronomy sources |
| Writing Quality | 10 | Clarity, flow, structure |

The AI grader uses an MIT professor persona — knowledgeable, direct, constructive. It also checks for proper use of significant figures in any numerical values. TAs review all AI suggestions before finalizing grades.

The rubric and grading standards are defined in `src/lib/grading-rubric.ts` and can be customized per assignment.

### Cosmology Simulations
Eight interactive simulations based on Serjeant's *Observational Cosmology* textbook, rendered with Plotly.js and Canvas.

### Role-Based Access
- **STUDENT**: View assignments, submit reports, see grades
- **TA**: Grade submissions, create assignments, AI grading tools
- **PROFESSOR / ADMIN**: Full access, user management

## Project Structure

```
src/
  app/
    (auth)/              # Google OAuth login
    (main)/              # Authenticated pages (sidebar layout)
      assignments/       # Assignment list, detail, create
      dashboard/         # Student/TA dashboard
      grading/           # Grading interface
      admin/             # Admin panel
      settings/          # User settings
    api/                 # API routes
      assignments/       # Assignment CRUD
      grading/           # Submission grading + AI
      submissions/       # Student submissions
      upload/            # File upload
  components/
    ui/                  # shadcn/ui components
    layout/              # Sidebar, Topbar
    simulations/         # Cosmology simulation components
  lib/
    auth.ts              # NextAuth v5 config
    prisma.ts            # Prisma client singleton
    ai.ts                # OpenAI grading integration
    grading-rubric.ts    # Default rubric, scoring guidelines, AI prompt
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
