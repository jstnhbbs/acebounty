# Deploying Ace Bounty to Vercel + Turso

This app runs locally with **SQLite** (file) and in production with **Turso** (hosted libSQL) on **Vercel**. The database client chooses the adapter from environment variables so the same codebase works in both environments.

## Local / test (unchanged)

- Use `.env` with `DATABASE_URL="file:./dev.db"` only (no `TURSO_*`).
- Run `npm run dev`, `npx prisma migrate dev`, `npm run db:seed` as usual.
- Nothing in this deploy setup affects your current local workflow.

---

## 1. Create a Turso database

1. Install the Turso CLI (one-time):
   ```bash
   brew install tursodatabase/tap/turso
   ```
2. Log in (opens browser):
   ```bash
   turso auth login
   ```
3. Create a database (pick a [region](https://docs.turso.tech/help/regions) near you):
   ```bash
   turso db create acebounty --region ord
   ```
4. Get the database URL and an auth token:
   ```bash
   turso db show acebounty --url
   turso db tokens create acebounty
   ```
   Save both; you’ll add them to Vercel.

---

## 2. Apply schema to Turso

Turso doesn’t run Prisma migrations directly. Apply the schema once using either method.

**Option A – Turso CLI (recommended)**

From the project root, run the migration SQL against Turso (replace the path with your migration folder if different):

```bash
turso db shell acebounty < prisma/migrations/20260220042744_init/migration.sql
```

If you add more migrations later, run each `prisma/migrations/<name>/migration.sql` in order.

**Option B – Prisma migrate deploy (if you set DATABASE_URL for Turso)**

Some setups use a `libsql://` URL and token for migrations. If your Prisma version and Turso support it, you can set `DATABASE_URL` and `TURSO_AUTH_TOKEN` and run:

```bash
export DATABASE_URL="libsql://your-db-name-your-org.turso.io"
export TURSO_AUTH_TOKEN="your-token"
npx prisma migrate deploy
```

Otherwise, use Option A.

---

## 3. (Optional) Seed production

To seed the Turso database once:

```bash
export TURSO_DATABASE_URL="libsql://your-db-name-your-org.turso.io"
export TURSO_AUTH_TOKEN="your-token"
npm run db:seed
```

The seed script uses the same `src/lib/db` client, so it will connect to Turso when these env vars are set.

---

## 4. Deploy to Vercel

1. Push the repo to GitHub and [import it in Vercel](https://vercel.com/new).
2. In the project, go to **Settings → Environment Variables** and add:

   | Name                 | Value                    | Environments   |
   |----------------------|--------------------------|----------------|
   | `TURSO_DATABASE_URL` | `libsql://...` (from step 1) | Production (and Preview if you want) |
   | `TURSO_AUTH_TOKEN`   | Token from step 1        | Production (and Preview if you want) |
   | `AUTH_SECRET`        | e.g. `openssl rand -base64 32` | Production     |
   | `ADMIN_EMAIL`        | Your admin email         | Production     |
   | `ADMIN_PASSWORD`     | Your admin password      | Production     |

   Do **not** set `DATABASE_URL` in Vercel. The app uses Turso when `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set.

3. Build command: **`npm run build`** (default). No need to run migrations in the build; schema is applied in step 2.
4. Deploy: push to the connected branch; Vercel will build and deploy.

---

## 5. How the app chooses the database

- **No `TURSO_*` set (e.g. local):** Uses `DATABASE_URL` with the SQLite file adapter (`@prisma/adapter-better-sqlite3`). Your current test environment is unchanged.
- **`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` set (e.g. Vercel):** Uses the Turso/libSQL adapter (`@prisma/adapter-libsql`) for production.

All logic lives in `src/lib/db.ts`; no code paths are hardcoded to one database.

---

## Summary

| Environment | Database   | Env vars |
|-------------|------------|----------|
| Local       | SQLite file | `DATABASE_URL="file:./dev.db"` only |
| Vercel      | Turso      | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |

Schema is applied to Turso once (step 2). After that, deploy to Vercel and configure the env vars above.
