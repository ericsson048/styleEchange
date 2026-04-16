# Tech Stack

## Framework & Runtime
- Next.js 15 (App Router) with React 19
- TypeScript 5 (strict mode)
- Node.js

## Database
- PostgreSQL via Prisma 7 ORM
- Prisma adapter: `@prisma/adapter-pg` (connection pooling with `pg`)
- Prisma client is a singleton in `src/lib/prisma.ts` (server-only)

## AI
- Genkit 1.x with `@genkit-ai/google-genai` plugin
- Model: `googleai/gemini-2.5-flash`
- Flows defined in `src/ai/flows/`, exported as `'use server'` async functions
- AI instance configured in `src/ai/genkit.ts`
- Zod used for input/output schema definitions in flows

## UI
- Tailwind CSS 3 with `tailwindcss-animate`
- shadcn/ui components (Radix UI primitives) in `src/components/ui/`
- `lucide-react` for icons
- `class-variance-authority` + `clsx` + `tailwind-merge` for class management
- `react-hook-form` + `zod` for forms
- `recharts` for charts
- `embla-carousel-react` for carousels

## Auth / Services
- Firebase SDK present (likely for auth or storage)

## Common Commands

```bash
# Development
npm run dev              # Next.js dev server on port 3000
npm run genkit:dev       # Genkit dev UI + flow runner
npm run genkit:watch     # Genkit with file watching

# Build & Type Check
npm run build            # Production build
npm run typecheck        # tsc --noEmit (no build errors enforced in next.config.ts)
npm run lint             # ESLint via Next.js

# Database
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:push      # Push schema without migration (prototyping)
npm run prisma:studio    # Open Prisma Studio GUI
npm run db:seed          # Seed database (runs prisma/seed.js)
```

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `GOOGLE_GENAI_API_KEY` — Google AI API key for Genkit/Gemini
