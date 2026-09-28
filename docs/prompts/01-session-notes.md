# Session notes

Tool: Claude in Cowork, connected to the repo folder. I ran git, pnpm and Supabase locally and reviewed every diff in VS Code.

1. **Planning (~55 min).** Read the brief with the agent, listed every explicit requirement and the hidden ones in the meeting notes (procedures next to the reply, per-brand criteria, severity, leads scoped by brand, "don't make ingestion impossible"). Chose the reviewing reading with a thin proof slice, RLS as the authorisation layer and local Supabase.
2. **#1 scaffold (~75 min).** create-next-app 16, pnpm workspace, Supabase CLI as a devDependency, unused Supabase services disabled.
3. **#2 schema + RLS(~21 min).** Tested per role on Postgres before opening the PR. My review found the anon revoke did not cover future tables; fixed in a follow-up commit.
4. **#3 seed (~14 min).** Asked for replies that read like real brands, one obviously bad, dates relative to now().
5. **#4 session + design system (~26 min).** The agent read the bundled Next.js 16 docs and used `proxy.ts`.
6. **#5 queue + review screen (~41 min).** My review asked for a per-brand response target instead of a global constant; follow-up commits on the same branch.
7. **#6 specialist feedback + brand overview (~19 min).** Merged the two planned PRs into one to stay inside six hours.
8. **#7 test flows (~24 min).**
8. **Docs (~25 min).** README and DECISIONS written with the agent, edited by me.
