# Working agreement

- One branch per task, one goal per PR. Keep PRs under ~400 changed lines (seed data excluded).
- Open the PR with a description: what, why, what the reviewer should look at, what was left out.
- Never push to main. Never squash or rebase. Address review comments in new commits on the same branch.

# Repo layout

- pnpm workspace. The app lives in `apps/web` (Next.js App Router, TypeScript strict, Tailwind v4 + daisyUI 5).
- Supabase (local, via the CLI) lives in `supabase/` at the repo root.
- Next.js 16 has breaking changes versus older versions: read `apps/web/AGENTS.md` and the docs in `apps/web/node_modules/next/dist/docs/` before using an API you are unsure about.

# Stack rules

- Schema changes only via new files in `supabase/migrations`. Never edit a migration once it is merged.
- Reads in Server Components, writes in Server Actions validated with zod.
- Data access through `@supabase/ssr` with the anon key and the user's session.

# Security rules (non-negotiable)

- RLS enabled on every table. Row Level Security is the source of truth for who sees what.
- Never use the service role key in `apps/web`. It is only for seeding and future ingestion workers.
- Every view uses `with (security_invoker = true)`.
- `security definer` functions only return booleans and set `search_path = ''`.
- Identity (reviewer_id, user_id) always comes from the session, never from form input.
- Asking for another brand's resource returns 404, not 403.

# Data

- No Postgres enums: use text + check constraints or lookup tables.
- Seed dates are relative to `now()` so "yesterday" always has data.
