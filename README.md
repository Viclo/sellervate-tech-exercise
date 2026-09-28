# Reply Review

Internal tool for Sellervate team leads to review support replies that already went out: score them against the brand's procedures, leave a note the specialist reads back, and show each brand a trend instead of a sentence.

Why it is shaped this way, what was cut and what is unfinished: see [DECISIONS.md](./DECISIONS.md).

## Run it locally (under a minute after Docker images are cached)

Requirements: Node 22+ (supabase-js deprecates Node 20), pnpm 9+, Docker running.

```bash
pnpm install
pnpm db:start     # local Supabase via the CLI (first run pulls Docker images)
pnpm db:reset     # applies migrations and the seed
pnpm env:local    # writes apps/web/.env.local from the running Supabase
pnpm dev          # http://localhost:3000
```

Supabase Studio: http://localhost:54323. Stop everything with `pnpm db:stop`.

## Seed data and switching role

Login is stubbed: `/switch` (also "Switch user" in the header) lists the seeded people. Pick one and you are signed in as that real Supabase user, so every query runs under their session and RLS.

| Person | Role | Brands |
|---|---|---|
| Marta Ruiz | Team lead | Voltra, Boxwell |
| Nuria Vidal | Team lead | Lumen |
| Dani Ortega | Specialist | Voltra, Boxwell |
| Laura Méndez | Specialist | Boxwell, Lumen |
| Pablo Serrano | Specialist | Voltra, Lumen |

- 3 brands with different voices and written procedures: Voltra (scooters, diagnose first), Boxwell (B2B packaging, three lines), Lumen (skincare, no medical claims).
- 12 hand-written replies sent "yesterday" and not reviewed: the review queue. Worth opening: *Brakes squeaking and it stopped in the rain* (Voltra) and *Can I use the night cream while pregnant?* (Lumen).
- 8 weeks of reviewed history so averages and trends mean something. Dates are relative to `now()`, so the queue is never empty.

A good path: Marta → Review queue → review a few (Save and open next) → Brands → Voltra. Then switch to Dani → My reviews.

## Checking authorisation from outside the app

Authorisation is enforced by Postgres RLS, so it also holds when you skip the UI and call the Supabase API directly. As Dani (specialist on Voltra and Boxwell), ask for Lumen's replies:

```bash
source apps/web/.env.local
TOKEN=$(curl -s "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"email":"dani@sellervate.test","password":"reply-review-demo"}' | sed -E 's/.*"access_token":"([^"]+)".*/\1/')

# Lumen replies: returns []
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/replies?select=id,subject&brand_id=eq.c0000000-0000-4000-8000-000000000003" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $TOKEN"

# Reviewing his own latest reply as a specialist: rejected by row-level security
REPLY=$(curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/replies?select=id&order=sent_at.desc&limit=1" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $TOKEN" | sed -E 's/.*"id":"([^"]+)".*/\1/')
curl -s -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/submit_review" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"p_reply_id\":\"$REPLY\",\"p_score\":5,\"p_comment\":\"\",\"p_is_exemplar\":false,\"p_tag_ids\":[]}"
```

## Repo layout

```
apps/web/                 Next.js 16 (App Router, TypeScript, Tailwind v4 + daisyUI 5)
  src/app/(app)/          queue, replies/[id], me, brands
  src/app/switch/         stubbed login
  src/lib/reviews/        queries (all run as the user) and stats
supabase/migrations/      schema, RLS, review queue view, submit_review
supabase/seed.sql         invented data
docs/prompts/             AI session notes
CLAUDE.md                 working agreement the agent follows
```

Boilerplate: `create-next-app@16.3.6` (App Router, Tailwind, ESLint, src dir).

## Design notes

- Type: Inter for the interface, Source Serif 4 for the replies being judged, because reading somebody's writing is the core task. Scale 12.5 / 15 / 18 / 21.6 / 26 px (1.2 ratio on a 15 px body).
- Colour: warm paper and cool ink neutrals, a single steel-blue accent for navigation and primary actions. Semantic colour only carries meaning: the 1-5 score scale (always shown with the number) and tag severity (minor, major, critical).
- Loading, error, empty and not-found states are designed, and "not found" and "not yours" look the same on purpose.

## Time spent

About 6 hours: ~55 min reading the brief and planning, the rest building (6 PRs) and writing the docs. Details in DECISIONS.md.
