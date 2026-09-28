-- What counts as a slow first reply depends on the brand: Boxwell promises 4 business hours,
-- a skincare brand can take a day. Stored per brand instead of a constant in the app.
-- Wall-clock minutes for now; business hours would need a per-brand calendar.
alter table public.brands
  add column response_target_minutes int not null default 1440
    check (response_target_minutes > 0);
