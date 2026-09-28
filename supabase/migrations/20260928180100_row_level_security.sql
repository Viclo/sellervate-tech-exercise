-- Authorisation lives here. The app talks to Postgres with the anon key and the user's
-- session, and PostgREST is reachable by anyone holding that key, so these policies are
-- the only thing that actually decides who sees what.

-- Anonymous callers get nothing, regardless of policies.
revoke all on all tables in schema public from anon;

-- Membership helpers. security definer so policies on brand_memberships can use them
-- without recursing into their own policy. They only ever return a boolean.
create function public.is_brand_member(p_brand_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.brand_memberships m
    where m.brand_id = p_brand_id
      and m.user_id = (select auth.uid())
  );
$$;

create function public.is_brand_lead(p_brand_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.brand_memberships m
    where m.brand_id = p_brand_id
      and m.user_id = (select auth.uid())
      and m.role = 'lead'
  );
$$;

revoke execute on function public.is_brand_member(uuid) from public, anon;
revoke execute on function public.is_brand_lead(uuid) from public, anon;
grant execute on function public.is_brand_member(uuid) to authenticated;
grant execute on function public.is_brand_lead(uuid) to authenticated;

alter table public.brands            enable row level security;
alter table public.profiles          enable row level security;
alter table public.brand_memberships enable row level security;
alter table public.replies           enable row level security;
alter table public.review_tags       enable row level security;
alter table public.reviews           enable row level security;
alter table public.review_tag_links  enable row level security;

-- brands: you see the brands you work on.
create policy brands_select on public.brands
  for select to authenticated
  using (public.is_brand_member(id));

-- brand_memberships: your own rows, plus every membership of a brand you lead.
create policy brand_memberships_select on public.brand_memberships
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_brand_lead(brand_id));

-- profiles: yourself, people on a brand you lead, and whoever reviewed your replies
-- (the reviews subquery is itself filtered by the reviews policy).
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1 from public.brand_memberships m
      where m.user_id = profiles.id and public.is_brand_lead(m.brand_id)
    )
    or exists (
      select 1 from public.reviews r
      where r.reviewer_id = profiles.id
    )
  );

-- replies: leads see their brands' replies; specialists see only what they wrote.
-- No insert/update/delete policies: replies come from seeding or a future ingestion
-- worker using the service role, never from the app.
create policy replies_select on public.replies
  for select to authenticated
  using (
    public.is_brand_lead(brand_id)
    or specialist_id = (select auth.uid())
  );

-- review_tags: global tags plus the tags of brands you work on.
create policy review_tags_select on public.review_tags
  for select to authenticated
  using (brand_id is null or public.is_brand_member(brand_id));

-- reviews: leads see their brands' reviews; specialists see reviews of their own replies.
create policy reviews_select on public.reviews
  for select to authenticated
  using (
    public.is_brand_lead(brand_id)
    or exists (
      select 1 from public.replies r
      where r.id = reviews.reply_id
        and r.specialist_id = (select auth.uid())
    )
  );

-- Only a lead of the brand can review, and only as themselves.
create policy reviews_insert on public.reviews
  for insert to authenticated
  with check (
    public.is_brand_lead(brand_id)
    and reviewer_id = (select auth.uid())
  );

-- The reviewer can revise their own review while they still lead the brand.
create policy reviews_update on public.reviews
  for update to authenticated
  using (public.is_brand_lead(brand_id) and reviewer_id = (select auth.uid()))
  with check (public.is_brand_lead(brand_id) and reviewer_id = (select auth.uid()));

-- And only the judgement itself is editable, not what it points at or who wrote it.
revoke update on public.reviews from authenticated;
grant update (score, comment, is_exemplar) on public.reviews to authenticated;

-- review_tag_links: visible whenever the review is visible.
create policy review_tag_links_select on public.review_tag_links
  for select to authenticated
  using (exists (select 1 from public.reviews r where r.id = review_tag_links.review_id));

-- Tag a review you wrote, on a brand you lead, with a tag that belongs to that brand (or is global).
create policy review_tag_links_insert on public.review_tag_links
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.reviews r
      join public.review_tags t on t.id = review_tag_links.tag_id
      where r.id = review_tag_links.review_id
        and r.reviewer_id = (select auth.uid())
        and public.is_brand_lead(r.brand_id)
        and t.active
        and (t.brand_id is null or t.brand_id = r.brand_id)
    )
  );

create policy review_tag_links_delete on public.review_tag_links
  for delete to authenticated
  using (
    exists (
      select 1 from public.reviews r
      where r.id = review_tag_links.review_id
        and r.reviewer_id = (select auth.uid())
        and public.is_brand_lead(r.brand_id)
    )
  );
