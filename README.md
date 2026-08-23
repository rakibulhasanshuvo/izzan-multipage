# izzan

Next.js e-commerce storefront (Next.js 16, Prisma + PostgreSQL, NextAuth admin, Redis rate limiting).

## Requirements

- Node.js >= 20 (Next.js 16 / Prisma 6)
- PostgreSQL 16
- (Optional) Redis for shared rate limiting; falls back to in-memory per instance

## Getting Started

1. Copy `.env.example` to `.env` and fill in real values (secrets: `openssl rand -base64 32`).

2. Start PostgreSQL.

   **Option A — Docker Compose (recommended):**

   ```bash
   docker compose up -d postgres redis
   # Postgres is exposed loopback-only on 127.0.0.1:5432
   ```

   **Option B — native PostgreSQL:** install PostgreSQL locally and create a role/database matching `.env`:

   ```sql
   CREATE ROLE izzan LOGIN PASSWORD '<POSTGRES_PASSWORD>' SUPERUSER;
   CREATE DATABASE izzan OWNER izzan;
   ```

3. Apply migrations and seed:

   ```bash
   npx prisma migrate deploy   # applies prisma/migrations
   npx prisma db seed          # products, CMS content, admin user (bcrypt from INITIAL_ADMIN_PASSWORD)
   ```

4. Run the app:

   ```bash
   npm run dev     # development
   npm run build && npm run start  # production
   ```

Health endpoint: `GET /api/health` returns `200 {"status":"ok","db":"ok"}` when the database is reachable.

## Database notes

- The Prisma migration history was **re-baselined** for PostgreSQL (`20260823000000_postgres_init`).
  There is **no automatic data migration** from the legacy SQLite `dev.db` — moving old data requires a one-off ETL script.
- `npm run db:push` exists for throwaway schema experiments only; never use it on an environment managed by migrations.
- `prisma/seed.mjs` deletes existing products before seeding (`deleteMany`). Dev convenience only — do not point at production.
- Backups: `scripts/backup.sh` / `backup.ps1` dump from the `docker compose` Postgres container when running,
  otherwise fall back to a host-local `pg_dump`. Both require `BACKUP_PASSPHRASE` (output is AES-256-CBC encrypted).
