# Project Structure

## Root
```
src/
├── ai/                  # Genkit AI configuration and flows
│   ├── genkit.ts        # AI instance (singleton, model config)
│   ├── dev.ts           # Genkit dev server entry point
│   └── flows/           # One file per AI flow, exported as 'use server'
├── app/                 # Next.js App Router
│   ├── layout.tsx       # Root layout (Navbar, Toaster, fonts)
│   ├── page.tsx         # Home page (server component, fetches via Prisma)
│   ├── globals.css      # Global styles + CSS variables (theme tokens)
│   ├── product/[id]/    # Product detail page
│   ├── sell/            # Seller listing form
│   ├── checkout/        # Checkout flow
│   ├── messages/        # Messaging UI
│   ├── profile/         # User profile
│   └── lib/             # App-level static data (placeholder images)
├── components/
│   ├── ui/              # shadcn/ui primitives — do not modify directly
│   ├── layout/          # Shared layout components (Navbar, etc.)
│   ├── home/            # Home page client components
│   ├── messages/        # Messaging client components
│   └── product/         # Product-related components (ProductCard, etc.)
├── hooks/               # Custom React hooks
└── lib/                 # Shared utilities
    ├── prisma.ts        # Prisma singleton (server-only)
    ├── utils.ts         # cn() helper and general utils
    └── placeholder-images.ts
prisma/
├── schema.prisma        # Database schema
└── seed.js              # Seed script
```

## Key Conventions

### Server vs Client components
- Pages (`app/**/page.tsx`) are server components by default — fetch data with Prisma directly
- Interactive components get `"use client"` and live in `src/components/`
- Pattern: server page fetches data → passes serialized props to a `*PageClient.tsx` client component

### Data fetching
- Always use the `prisma` singleton from `src/lib/prisma.ts`
- Never import Prisma client directly — it is `server-only`
- Serialize Prisma results before passing to client components (e.g. convert `Decimal` to `number`)

### Components
- UI primitives live in `src/components/ui/` — use them, don't rewrite them
- Feature components are grouped by domain under `src/components/<domain>/`
- Use `cn()` from `src/lib/utils.ts` for conditional class merging

### Path aliases
- `@/*` maps to `src/*` — always use this alias, never relative `../../` imports

### AI Flows
- Each flow file in `src/ai/flows/` must have `'use server'` at the top
- Export the public async function, the Zod schemas/types, and keep the flow definition internal
- Use `z` imported from `genkit` (not directly from `zod`) for schema definitions in flows

### Styling
- Use Tailwind utility classes; avoid inline styles
- Use CSS variable-based tokens (`bg-background`, `text-foreground`, `text-accent`, etc.) — defined in `globals.css`
- Accent color (`bg-accent`) for primary CTAs
- Skeleton components for all loading states
