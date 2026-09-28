-- Core schema for Reply Review.
-- Conventions: no Postgres enums (text + check instead, cheap to evolve),
-- uuid keys, timestamptz everywhere.

-- Brands a team lead or specialist can be attached to.
create table public.brands (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name          text not null,
  voice_summary text not null default '',
  -- Brand procedures shown next to a reply while reviewing it (markdown).
  procedures    text not null default '',
  created_at    timestamptz not null default now()
);

-- One row per auth user. Auth is stubbed in this exercise, but identities are real Supabase users.
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null,
  created_at timestamptz not null default now()
);

-- Who works on which brand, and as what. A person can lead one brand and be a specialist on another.
create table public.brand_memberships (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  brand_id   uuid not null references public.brands (id) on delete cascade,
  role       text not null check (role in ('lead', 'specialist')),
  created_at timestamptz not null default now(),
  primary key (user_id, brand_id)
);

create index brand_memberships_brand_role_idx on public.brand_memberships (brand_id, role);

-- A reply that already went out through the brand's helpdesk. Read-only from the app.
create table public.replies (
  id               uuid primary key default gen_random_uuid(),
  brand_id         uuid not null references public.brands (id),
  -- References the profile, not the membership: a specialist leaving a brand
  -- must not block (or cascade into) the history of what they sent.
  specialist_id    uuid not null references public.profiles (id),
  -- Where the reply came from. 'seed' today; a helpdesk ingestion job later.
  source           text not null default 'manual',
  external_id      text not null,
  channel          text not null,
  customer_name    text not null,
  subject          text not null,
  customer_message text not null,
  reply_body       text not null,
  received_at      timestamptz not null,
  sent_at          timestamptz not null,
  created_at       timestamptz not null default now(),
  constraint replies_sent_after_received check (sent_at >= received_at),
  -- Idempotent ingestion: re-importing the same helpdesk ticket is a no-op.
  constraint replies_source_external_id_key unique (source, external_id),
  -- Target for the composite FK in reviews, so a review's brand can never drift from its reply's brand.
  constraint replies_id_brand_id_key unique (id, brand_id)
);

create index replies_brand_sent_idx on public.replies (brand_id, sent_at desc);
create index replies_specialist_sent_idx on public.replies (specialist_id, sent_at desc);

-- What can be "off" about a reply. brand_id null = applies to every brand.
create table public.review_tags (
  id         uuid primary key default gen_random_uuid(),
  brand_id   uuid references public.brands (id) on delete cascade,
  code       text not null check (code ~ '^[a-z0-9_]+$'),
  label      text not null,
  -- Wrong tone is annoying, wrong product info loses the account: not all misses weigh the same.
  severity   text not null check (severity in ('minor', 'major', 'critical')),
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  constraint review_tags_brand_code_key unique nulls not distinct (brand_id, code)
);

-- A team lead's judgement on one reply. One review per reply in V1.
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  reply_id    uuid not null unique,
  -- Denormalised from the reply so RLS and per-brand aggregates stay simple;
  -- the composite FK below guarantees it matches the reply.
  brand_id    uuid not null,
  reviewer_id uuid not null references public.profiles (id),
  score       smallint not null check (score between 1 and 5),
  comment     text not null default '',
  -- Good or bad example worth showing a new joiner.
  is_exemplar boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint reviews_reply_brand_fkey foreign key (reply_id, brand_id)
    references public.replies (id, brand_id) on delete cascade
);

create index reviews_brand_created_idx on public.reviews (brand_id, created_at desc);

create table public.review_tag_links (
  review_id uuid not null references public.reviews (id) on delete cascade,
  tag_id    uuid not null references public.review_tags (id),
  primary key (review_id, tag_id)
);

create index review_tag_links_tag_idx on public.review_tag_links (tag_id);

-- Keep updated_at honest.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();
