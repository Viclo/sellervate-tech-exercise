# Decisions

## Product

**The real problem.** Reply quality *is* the product for the brand, and today it is checked by skimming an inbox and pinging on Slack. That leaves no record, so you cannot coach from it and you cannot answer "are we getting better?". The notes point three ways (reviewing, proof, coaching), but proof and coaching both need a stream of consistent reviews first. So I read it as a **reviewing problem**, with a thin slice of proof on top.

**What I built first.** The loop Marta uses every morning: a queue of unreviewed replies on the brands she leads, a review screen with the brand's procedures next to the reply ("I can tell in three replies whether someone read the procedures"), an anchored 1-5 scale, severity-weighted tags and a note, then "save and open next". Then the other end of the loop: Dani reading his own scores and notes. Then a brand page with the number Marta wants to show each quarter, what keeps going wrong and replies marked as examples.

**Decisions inside that.**
- **Anchored scale** ("1 would lose the account" … "5 model reply"): an average is only comparable across leads and weeks if every number means the same thing.
- **Severity on tags:** wrong tone is annoying, wrong product info loses the account. They should not count the same.
- **Queue order:** least-reviewed specialist first. Five reviews a day otherwise drift to the same people.
- **Response target per brand** (Boxwell 4 h, Lumen 24 h) instead of one global threshold.

**Left out, on purpose.** A full coaching library (only the "worth showing to new joiners" flag), editing a review, helpdesk ingestion, calibration between leads, client-facing exports, real auth, tests.

**Where a model would earn its place.** Not scoring. Ordering the sample: flag the replies most likely to break a brand procedure so the five Marta reads are the five that matter. Before I trusted it I would want a few hundred reviews per brand, measured agreement between Marta and Nuria on the same replies (if humans disagree, the model has no target), and its precision checked against them on replies they reviewed blind. This tool is what produces that dataset, so it comes first.

**What I would ask before V2.** Do rubrics change over time (then scores need a rubric version)? Should two leads ever review the same reply? Does the brand ever see this directly? Is the 7-day queue window right, and is "yesterday" per timezone?

## Architecture

**Shape.** One Next.js app (Server Components to read, Server Actions to write) talking to Supabase with the anon key and the user's session. No separate API: nothing here needs one yet.

**Data model.** `brands`, `profiles`, `brand_memberships (user, brand, role)`, `replies`, `review_tags` (global or per brand), `reviews`, `review_tag_links`.
- Roles and severities are `text + check`, not enums, so they are cheap to change.
- `reviews.brand_id` is denormalised for simple policies and aggregates, with a composite FK to `replies(id, brand_id)` so it can never disagree with its reply.
- `replies (source, external_id)` is unique so a future helpdesk import is idempotent. `specialist_id` references the person, not the membership, so history survives someone leaving a brand.
- One review per reply in V1.

**Authorisation.** Enforced in Postgres with RLS, because PostgREST is reachable by anyone holding the anon key: a check that lived only in Next.js would not protect anything.
- Every table has RLS. Membership helpers are `security definer` functions that only return booleans.
- The queue is a `security_invoker` view.
- `submit_review` is a security-invoker function, so it adds atomicity, not privileges.
- Only score, comment and exemplar are updatable.
- `anon` has no grants, including on future tables.
- The app layer only shapes navigation and returns 404 for anything not visible. The README has curl commands that prove it outside the UI.

**Real authentication would add** SSO (or Supabase magic links) instead of the switcher, provisioning of memberships from an admin screen or an HR source, and removing the shared demo password. The policies would not change, since they already key on `auth.uid()`.

**What breaks first as this grows.**
- Aggregates are computed in the app from raw reviews. That needs a daily rollup table or a materialised view per brand and week.
- The queue's per-row subquery for "recent reviews per specialist" needs the same treatment.
- Rubric changes would silently make old averages incomparable.

## AI

**Tools.** Claude in Cowork, connected to the repo folder: for planning (reading the brief, choosing the reading, the roadmap) and as the agent writing code, migrations and PR descriptions. I ran git, pnpm and Supabase locally, read every diff in VS Code before committing, and wrote every PR review myself.

**How.** Small branches, one goal each. The agent wrote a `CLAUDE.md` with non-negotiable security rules and followed it. Every migration was run against Postgres as each role (lead, other lead, specialist, anon) before the PR was opened.

**Where the agent was right.**
- Read the docs bundled with Next.js 16 and used `proxy.ts` instead of the deprecated `middleware`.
- Made the queue view `security_invoker`.
- Put tags and the review in one transaction, so a rejected tag cannot leave half a review.

**Where I overrode it.**
- In PR #2 the `anon` revoke only covered existing tables. Later migrations would get Supabase's default grants back. I asked for `alter default privileges`.
- In PR #5 the "slow reply" threshold was a global 24 h constant. Boxwell's own procedures say 4 hours, so I asked for a per-brand target.
- iCloud created duplicate copies of files written from two sides. I cleaned them before committing.

**A prompt I am pleased with:** the security section of `CLAUDE.md`, because it turned "remember to check tenant isolation" into rules the agent applied without being asked:

```
- RLS enabled on every table. Row Level Security is the source of truth for who sees what.
- Never use the service role key in apps/web.
- Every view uses `with (security_invoker = true)`.
- security definer functions only return booleans and set search_path = ''.
- Identity (reviewer_id, user_id) always comes from the session, never from form input.
- Asking for another brand's resource returns 404, not 403.
```

## Status

**Finished.** Stubbed login with real sessions, RLS on everything, review queue, review screen, specialist view, brand overview, seed with 12 hand-written replies and 8 weeks of history.

**Half done.**
- Coaching: only a flag, and it does not separate good examples from bad ones.
- Editing a review: the policy exists, the UI does not.
- `/me` averages the last 50 reviews without saying so.

**Never touched.** Helpdesk ingestion, calibration between leads, dark mode, mobile polish, automated tests.

**Order I would pick it up.**
1. RLS tests with pgTAP.
2. Edit a review.
3. Split the examples library into good and bad, with the reasoning.
4. Rollups for brand stats.
5. Ingestion worker keyed on `(source, external_id)`.

**Tests.** First I would test the RLS policies with pgTAP, per role, because a cross-brand leak is the most expensive bug this app can have. It was not hour five because I verified the same cases by hand against Postgres and with curl, and the product had to stand up end to end first.

**What I would flag hardest in somebody else's PR:** the user switcher. Anyone who can reach the app can sign in as anyone, using a shared password committed in the seed and README. On a deployed app that is a blocker. I left it because the brief asked for stubbed login, and signing in as real Supabase users keeps `auth.uid()`, and therefore every RLS policy, honest.
