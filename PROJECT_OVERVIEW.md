# Vessia Racing — Project Overview

Racing league management platform for a sim-racing team, built with Next.js (App Router) and Supabase. This file is a fast-orientation map of the codebase — see [`docs/`](./docs) for setup guides and SQL schemas.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database/Backend**: Supabase (PostgreSQL), accessed via `supabaseAdmin` (service role) and `supabase` (anon) clients
- **Auth**: Custom JWT (`jsonwebtoken`) stored in an `authToken` cookie + bcrypt password hashing — no NextAuth/Clerk
- **Styling**: Tailwind CSS v4
- **Storage**: Vercel Blob for image uploads (profile pictures, gallery, events), with base64 fallback
- **Icons**: Font Awesome (`@fortawesome/react-fontawesome`)
- **External integration**: iRacing OAuth2 (PKCE) to sync live driver stats
- **Deployment**: Vercel (see `vercel.json`, `.github/workflows/vercel-deploy.yml`)

## Directory Map

```
src/
├── app/
│   ├── page.tsx          # Homepage (725 lines — largest page, likely landing/dashboard)
│   ├── layout.tsx        # Root layout, metadata, fonts
│   ├── login/ register/  # Auth pages
│   ├── profile/          # User profile (view/edit, picture upload)
│   ├── drivers/          # Driver roster page
│   ├── events/           # Events listing/detail
│   ├── gallery/          # Photo gallery (with categories)
│   ├── achievements/     # Achievements/accomplishments
│   ├── results/          # Race results
│   ├── admin/            # Admin dashboard (users, roles, driver linking)
│   └── api/              # All backend logic lives here (see below)
├── components/
│   ├── Navbar.tsx        # Main site nav (322 lines)
│   └── MobileWarning.tsx # Mobile viewport banner/gate
├── lib/
│   ├── auth.ts           # JWT sign/verify, password hashing, requireAuth/requireAdmin guards
│   ├── supabase.ts       # Supabase client + admin client setup
│   ├── database.ts       # Small DB helper (4 lines)
│   ├── iracing.ts        # iRacing API client (stats fetching)
│   └── iracing-oauth.ts  # iRacing OAuth2/PKCE flow
└── types/
    └── index.ts          # Shared DB types: User, Driver, League, LeagueDriver, PointsHistory, DecodedToken
```

## API Routes (`src/app/api/`)

| Area | Routes |
|---|---|
| **Auth** | `auth/login`, `auth/register`, `auth/logout`, `auth/me`, `auth/iracing/authorize`, `auth/iracing/callback`, `auth/iracing/disconnect` |
| **Admin** | `admin/users`, `admin/users/[userId]`, `.../role`, `.../driver`, `.../experience` |
| **Drivers** | `drivers`, `drivers/[userId]`, `drivers/[userId]/iracing-stats`, `drivers/reorder` |
| **Leagues** | `leagues`, `leagues/[id]`, `.../drivers`, `.../drivers/[driverId]`, `.../points`, `.../points/[driverId]`, `.../reset`, `.../undo` |
| **Events** | `events`, `events/[id]`, `events/latest` |
| **Gallery** | `gallery`, `gallery/[id]`, `gallery/upload`, `gallery/categories`, `.../create`, `.../[id]`, `.../reorder` |
| **Achievements** | `achievements`, `achievements/[id]`, `achievements/homepage`, `achievements/[id]/homepage` |
| **Profile** | `profile/update`, `profile/upload-image` |
| **Misc** | `upload` (generic), `cron/refresh-iracing-stats` (scheduled sync), `debug-env`, `test-env`, `test-iracing` (dev/debug endpoints) |

## Auth Model

- Registration/login issue a JWT (`generateToken`) containing `{ userId, email, role }`, expiry 7 days, stored in `authToken` cookie.
- `requireAuth(request)` throws if no valid token; `requireAdmin(request)` additionally re-checks the user's `role` live from Supabase (not just the JWT claim) before granting admin access.
- Roles: `admin` | `user`. Users can optionally be linked to a `driver_id`/`is_driver` flag.

## Domain Model (from `types/index.ts` + admin routes)

- **User** — account, role, optional link to a Driver
- **Driver** — name, team, points/races per league
- **League** — named competition, has driver membership + points
- **LeagueDriver** — join table: points, races_completed per driver per league
- **PointsHistory** — audit trail of point changes (supports admin "undo")
- **Achievements**, **Gallery/GalleryCategories**, **Events** — supplementary content modules, each with their own admin CRUD + homepage-feature flag

## iRacing Integration

- OAuth2 with PKCE (`lib/iracing-oauth.ts`) — user connects/disconnects their iRacing account from profile settings.
- `lib/iracing.ts` fetches live stats (license, safety rating, category standings) from the iRacing API.
- `api/cron/refresh-iracing-stats` is a scheduled job (see `CRON_SECRET` env var) to periodically refresh cached stats.

## Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
BLOB_READ_WRITE_TOKEN            # Vercel Blob
JWT_SECRET                       # required — app throws at import time if missing
IRACING_CLIENT_ID / IRACING_CLIENT_SECRET / IRACING_REDIRECT_URI
CRON_SECRET                      # protects the stats-refresh cron endpoint
```

## Database

SQL schema/migrations live in `docs/*.sql` (run in Supabase SQL editor, roughly in this order):
`database-setup.sql` → `supabase-schema.sql` → `achievements-setup.sql`, `drivers-order-setup.sql`, `gallery-setup.sql`, `gallery-categories-setup.sql`, `iracing-integration-setup.sql`, `events-migration.sql`.

## Running Locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
npm run lint
```

## Notable Conventions / Gotchas

- Many recent commits (`git log`) are in Norwegian (bokmål) — the team/UI copy mixes Norwegian and English; expect Norwegian in commit messages and possibly some UI strings.
- Image uploads prefer Vercel Blob but fall back to base64 data URLs (see events image upload fix in history) — check for blob-token availability before assuming Blob is configured.
- `debug-env`, `test-env`, `test-iracing` routes under `api/` are dev/debug scaffolding, not production features — don't treat them as part of the public API surface.
- Admin checks always re-verify role against the DB (not just the JWT) — if you add a new privileged route, follow the `requireAdmin` pattern rather than trusting the token's `role` claim alone.
