-- Review queue and review submission.

-- Unreviewed replies from the last 7 days on brands the current user leads.
-- security_invoker: the view runs with the caller's rights, so RLS on replies, reviews,
-- brands and profiles still applies. Without it the view would run as its owner and leak.
create view public.review_queue
with (security_invoker = true) as
select
  r.id,
  r.brand_id,
  b.name       as brand_name,
  b.slug       as brand_slug,
  b.response_target_minutes,
  r.specialist_id,
  p.full_name  as specialist_name,
  r.channel,
  r.customer_name,
  r.subject,
  r.received_at,
  r.sent_at,
  -- How many of this specialist's replies were reviewed in the last 30 days (on brands
  -- visible to the caller). The queue shows the least-reviewed people first, so a lead
  -- reading five a day spreads attention instead of re-reading the same person.
  (
    select count(*)
    from public.reviews v
    join public.replies r2 on r2.id = v.reply_id
    where r2.specialist_id = r.specialist_id
      and v.created_at > now() - interval '30 days'
  )::int as specialist_recent_reviews
from public.replies r
join public.brands b on b.id = r.brand_id
join public.profiles p on p.id = r.specialist_id
where public.is_brand_lead(r.brand_id)
  and r.sent_at >= now() - interval '7 days'
  and not exists (select 1 from public.reviews v where v.reply_id = r.id);

grant select on public.review_queue to authenticated;

-- Save a review and its tags in one transaction.
-- security invoker on purpose: every insert goes through the same RLS policies as a direct
-- insert would (lead of the brand, reviewer = caller, tags of that brand). This function adds
-- atomicity, not privileges.
create function public.submit_review(
  p_reply_id    uuid,
  p_score       int,
  p_comment     text,
  p_is_exemplar boolean,
  p_tag_ids     uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_brand_id  uuid;
  v_review_id uuid;
begin
  select r.brand_id into v_brand_id
  from public.replies r
  where r.id = p_reply_id;

  if v_brand_id is null then
    -- Either it does not exist or RLS hides it: same answer, no hint which.
    raise exception 'reply not found' using errcode = 'P0002';
  end if;

  insert into public.reviews (reply_id, brand_id, reviewer_id, score, comment, is_exemplar)
  values (p_reply_id, v_brand_id, (select auth.uid()), p_score, coalesce(p_comment, ''), p_is_exemplar)
  returning id into v_review_id;

  insert into public.review_tag_links (review_id, tag_id)
  select v_review_id, t
  from unnest(coalesce(p_tag_ids, '{}')) as t;

  return v_review_id;
end;
$$;

revoke execute on function public.submit_review(uuid, int, text, boolean, uuid[]) from public, anon;
grant execute on function public.submit_review(uuid, int, text, boolean, uuid[]) to authenticated;
