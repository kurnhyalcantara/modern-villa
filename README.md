# Modern Villa Booking Platform

A villa booking platform with wallet system, reviews, admin dashboard, and real-time availability — built with Next.js, Supabase, Prisma, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase PostgreSQL + Prisma ORM 7
- **Auth**: Supabase Auth + `@supabase/ssr`
- **UI**: Tailwind CSS v4 + shadcn/ui + Lucide icons
- **Validation**: Zod v4

---

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

---

## Setup

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd modern-villa
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set the following:

```env
# Transaction pooler (port 6543) — used by the app at runtime
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"

# Session pooler (port 5432) — used by Prisma CLI for migrations
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# Supabase service role key (Settings → API → service_role)
SUPABASE_SERVICE_ROLE_KEY=

# Supabase public keys (Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Where to find these values**: Supabase Dashboard → Settings → Database → Connection string (for URLs) and Settings → API (for keys).

### 3. Run database migrations

```bash
npm run db:migrate
```

Enter a name for the migration when prompted (e.g. `init`).

### 4. Seed the database

```bash
npm run db:seed
```

This creates the following seed data:

| Role  | Email                  | Password    |
| ----- | ---------------------- | ----------- |
| Admin | admin@modernvilla.com  | admin123    |
| User  | sarah.jones@email.com  | password123 |
| User  | michael.chen@email.com | password123 |
| User  | emma.wilson@email.com  | password123 |
| User  | david.park@email.com   | password123 |

Also creates 6 villas, bookings, reviews, payments, deposits, withdrawals, and notifications.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Script                | Description                                   |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Start dev server with Turbopack               |
| `npm run build`       | Production build                              |
| `npm run start`       | Start production server                       |
| `npm run lint`        | Run ESLint                                    |
| `npm run lint:fix`    | Run ESLint with auto-fix                      |
| `npm run format`      | Format all files with Prettier                |
| `npm run type-check`  | TypeScript type check                         |
| `npm run db:migrate`  | Create and apply a new migration              |
| `npm run db:push`     | Push schema changes without migration history |
| `npm run db:seed`     | Seed the database with sample data            |
| `npm run db:generate` | Regenerate Prisma client                      |
| `npm run db:studio`   | Open Prisma Studio (database GUI)             |

---

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── admin/        # Admin dashboard
│   ├── api/          # API route handlers
│   └── dashboard/    # User dashboard
├── components/       # Shared UI components
│   ├── layout/       # Navbar, footer
│   └── ui/           # shadcn/ui components
├── features/         # Feature modules (auth, booking, admin)
├── constants/        # App-wide constants
└── generated/        # Prisma generated client (gitignored)

prisma/
├── schema.prisma     # Database schema
├── migrations/       # Migration files + seed.ts
└── prisma.config.ts  # Prisma 7 config (URLs, seed command)
```
