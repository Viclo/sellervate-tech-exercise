-- Seed data for local development and review. Everything here is invented.
--
-- People (password for everyone: reply-review-demo, used only by the local user switcher)
--   Marta  lead        Voltra, Boxwell
--   Nuria  lead        Lumen
--   Dani   specialist  Voltra, Boxwell
--   Laura  specialist  Boxwell, Lumen
--   Pablo  specialist  Voltra, Lumen
--
-- Replies: 12 hand-written replies sent "yesterday" and not yet reviewed (the review queue),
-- plus ~8 weeks of reviewed history generated from the same replies so averages and trends
-- mean something. All dates are relative to now(), so the queue is never empty.

select setseed(0.42);

-- ---------------------------------------------------------------- users
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, email_change_token_current,
  recovery_token, phone_change, phone_change_token, reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  extensions.crypt('reply-review-demo', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', u.full_name), now(), now(),
  '', '', '', '', '', '', '', ''
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, 'marta@sellervate.test', 'Marta Ruiz'),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'nuria@sellervate.test', 'Nuria Vidal'),
  ('b0000000-0000-4000-8000-000000000001'::uuid, 'dani@sellervate.test',  'Dani Ortega'),
  ('b0000000-0000-4000-8000-000000000002'::uuid, 'laura@sellervate.test', 'Laura Méndez'),
  ('b0000000-0000-4000-8000-000000000003'::uuid, 'pablo@sellervate.test', 'Pablo Serrano')
) as u (id, email, full_name);

insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id::text, u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users u;

insert into public.profiles (id, full_name)
select id, raw_user_meta_data ->> 'full_name' from auth.users;

-- ---------------------------------------------------------------- brands
insert into public.brands (id, slug, name, voice_summary, procedures) values
('c0000000-0000-4000-8000-000000000001', 'voltra', 'Voltra',
 'Electric scooters. Friendly and technical: diagnose first, explain in plain words, one clear next step.',
$md$1. **Diagnose before offering a return or refund.** Ask for model, firmware version and error code, or a short video. Half of the complaints are usage issues.
2. **Check the order history and warranty date** before promising anything.
3. Voltra scooters are **IP54 (splash resistant), not waterproof.** Never say otherwise. Never tell a customer to open the battery.
4. Offer a return only if troubleshooting fails, or if the unit was dead on arrival within 14 days.
5. Sign off as: *Ride safe, <first name> · Voltra Support*$md$),
('c0000000-0000-4000-8000-000000000002', 'boxwell', 'Boxwell',
 'B2B packaging supplier. Fast, exact, three lines. No small talk.',
$md$1. **Reply within 4 business hours.**
2. **Always confirm SKU, quantity and delivery date** in the reply.
3. **Three lines maximum** plus signature. No emojis, no marketing.
4. Check the order in the ERP before confirming any date.
5. Invoice or VAT changes go to billing@boxwell.test, and you tell the customer you did it.$md$),
('c0000000-0000-4000-8000-000000000003', 'lumen', 'Lumen',
 'Skincare, direct to consumer. Warm and reassuring, careful with every claim.',
$md$1. **No medical claims.** Never say a product treats, cures or is safe for a condition or pregnancy. Refer to a doctor.
2. For a skin reaction: tell them to stop using it, offer a refund or replacement, and **do not ask for the product back.**
3. **Check the order history** (subscription status, last shipment) before changing anything.
4. Use the customer's first name. Warm, no jargon.$md$);

insert into public.brand_memberships (user_id, brand_id, role) values
('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'lead'),
('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'lead'),
('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000003', 'lead'),
('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'specialist'),
('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'specialist'),
('b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', 'specialist'),
('b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000003', 'specialist'),
('b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'specialist'),
('b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003', 'specialist');

-- ---------------------------------------------------------------- tags
insert into public.review_tags (brand_id, code, label, severity) values
(null, 'too_slow',                'Too slow',                              'minor'),
(null, 'wrong_tone',              'Wrong tone for the brand',              'minor'),
(null, 'answered_other_question', 'Answered a different question',         'major'),
(null, 'wont_stop_recontact',     'Correct, but they will write again',    'major'),
(null, 'no_order_history_check',  'Did not check the order history',       'major'),
(null, 'wrong_product_info',      'Wrong information about the product',   'critical'),
('c0000000-0000-4000-8000-000000000001', 'refund_before_diagnosis', 'Refund before diagnosis', 'major'),
('c0000000-0000-4000-8000-000000000002', 'too_long',               'Longer than three lines', 'minor'),
('c0000000-0000-4000-8000-000000000002', 'missing_order_details',  'Missing SKU, quantity or date', 'major'),
('c0000000-0000-4000-8000-000000000003', 'medical_claim',          'Medical or safety claim', 'critical');

-- ---------------------------------------------------------------- reply templates
-- base_score and tags are what the team lead would say about the reply as written.
create temporary table seed_templates (
  code text primary key,
  brand_slug text,
  specialist_email text,
  base_score int,
  exemplar boolean,
  delay interval,
  channel text,
  customer_name text,
  subject text,
  customer_message text,
  reply_body text,
  tags text[],
  review_comment text
);

insert into seed_templates values
-- Voltra ---------------------------------------------------------------
('V1', 'voltra', 'dani@sellervate.test', 5, true, interval '2 hours', 'email', 'Hugo Martín',
 'Scooter will not turn on, E10 on the display',
$t$Hi, my S2 charged all night and this morning it won't turn on. The display flashes E10 for a second and goes dark. I use it to get to work, so I need a solution fast or I'd like to return it.$t$,
$t$Hi Hugo,

Sorry about this morning, E10 is the battery management system protecting the battery, and in most cases it clears in a couple of minutes:

1. Unplug the charger and check its LED: it should turn green when disconnected. If it stays red, the charger is the problem, not the scooter.
2. Hold the power button for 10 seconds to reset the controller, then turn it on normally.
3. If E10 comes back, send me a 10 second video of the display right after you press power.

I checked your order: you bought it on 14 July, so you are fully covered by the warranty whatever the video shows. If the reset doesn't fix it, I'll arrange a replacement battery straight away.

Ride safe, Dani · Voltra Support$t$,
'{}', 'Textbook. Diagnosis first, checked warranty, one clear next step. Using this one with new joiners.'),

('V2', 'voltra', 'pablo@sellervate.test', 1, false, interval '3 hours', 'email', 'Irene Castro',
 'Brakes squeaking and it stopped in the rain',
$t$Hello, the rear brake on my S2 squeaks a lot, and yesterday it stopped completely while I was riding in the rain. It started again after an hour at home. Is this normal?$t$,
$t$Hi Irene!

So sorry for the trouble!! I've gone ahead and issued a full refund, you'll get a return label by email, just send it back to us.

The S2 is fully waterproof so the rain definitely shouldn't have caused this, it must be a defective unit.

Thanks!$t$,
'{refund_before_diagnosis,wrong_product_info,no_order_history_check}',
'Refund with zero diagnosis, and the S2 is IP54, not waterproof. That sentence is how we lose the account. The squeak is a 2-minute brake adjustment.'),

('V3', 'voltra', 'dani@sellervate.test', 3, false, interval '5 hours', 'chat', 'Sergio Lozano',
 'Range dropped from 40 km to 25 km',
$t$When I bought it I was getting almost 40 km per charge. Now I barely get 25. It's 8 months old. Is the battery failing?$t$,
$t$Range depends on temperature, tyre pressure, rider weight and speed mode. 25 km is within spec for winter conditions. Regards, Voltra Support$t$,
'{wrong_tone,wont_stop_recontact}',
'Technically correct, but cold and no next step. Tell him the tyre pressure to check and how to run a battery health test, or he writes again next week.'),

('V4', 'voltra', 'pablo@sellervate.test', 4, false, interval '1 hour', 'email', 'Lucía Prieto',
 'Where is my spare tyre?',
$t$I ordered a spare front tyre ten days ago and haven't received anything. Order VS-20931.$t$,
$t$Hi Lucía,

I checked order VS-20931: the tyre left our warehouse on the 18th, but the courier held it because the address is missing the flat number. I've added "3ºB" from your previous order and asked them to redeliver tomorrow. Tracking: VX8812004ES.

Ride safe, Pablo · Voltra Support$t$,
'{}', 'Good: checked the order and fixed the actual problem. Should have confirmed the flat number with her instead of assuming.'),

-- Boxwell --------------------------------------------------------------
('B1', 'boxwell', 'laura@sellervate.test', 5, true, interval '40 minutes', 'email', 'Tomás Gil (Frutas del Sur)',
 'PO 4471 delivery date',
$t$Hi, when does PO 4471 arrive? 2,000 x BX-3020 mailer boxes. We need them for Thursday's shipment.$t$,
$t$PO 4471: 2,000 x BX-3020, confirmed in the ERP.
Leaves our warehouse Tuesday, delivered Wednesday before 14:00.
Tracking will follow on dispatch.

Laura · Boxwell$t$,
'{}', 'Exactly what Boxwell wants. Three lines, SKU, quantity, date.'),

('B2', 'boxwell', 'dani@sellervate.test', 2, false, interval '3 hours', 'email', 'Marisa León (Café Norte)',
 'Order status',
$t$Status of our order of kraft bags please, order BW-7781.$t$,
$t$Hi Marisa!! 😊

Thanks so much for reaching out and for being such a loyal Boxwell customer, we really appreciate you! I totally understand how important it is to have your bags on time, especially with the busy season coming up for coffee shops.

I've had a look and your order is being prepared by our amazing warehouse team and should be with you very soon! Let me know if there's anything else at all I can help with, and have a lovely day! ☕

Dani$t$,
'{too_long,wrong_tone,missing_order_details}',
'Seven lines, two emojis and no date. For Boxwell "very soon" is not an answer. Same specialist is great on Voltra, this is a context switch problem.'),

('B3', 'boxwell', 'laura@sellervate.test', 3, false, interval '28 hours', 'email', 'Jorge Pardo (Mueblería Pardo)',
 'Invoice copy and new VAT number',
$t$Can you send me a copy of invoice F-2231? Also, our company changed its VAT number, the new one is B-88213457, please use it from now on.$t$,
$t$Invoice F-2231 attached.

Laura · Boxwell$t$,
'{too_slow,answered_other_question}',
'Replied the next day, and the VAT change was ignored. The next invoice will be wrong. Forward to billing and say so.'),

('B4', 'boxwell', 'dani@sellervate.test', 4, false, interval '2 hours', 'email', 'Elena Sanz (Velas Sanz)',
 'Quote for printed boxes',
$t$Quote for 500 printed boxes, 20x20x10, one colour logo?$t$,
$t$BX-2020-P, 500 units, 1-colour print: 612 EUR + VAT, 12 working days after artwork approval.
Artwork template attached.

Dani · Boxwell$t$,
'{}', 'Correct and short. Could state delivery terms, minor.'),

-- Lumen ----------------------------------------------------------------
('L1', 'lumen', 'pablo@sellervate.test', 5, true, interval '1 hour', 'email', 'Carmen Ibáñez',
 'Redness after using the vitamin C serum',
$t$I started the Glow C serum three days ago and my cheeks are red and itchy. Is this normal? Should I keep going?$t$,
$t$Hi Carmen,

I'm sorry, that sounds uncomfortable. Please stop using the serum for now, and if the redness doesn't settle in a day or two, it's worth checking with your doctor or pharmacist.

You don't need to send anything back. I've refunded the serum in full (you'll see it in 3 to 5 days), and I've paused your next shipment so nothing arrives without you deciding.

Take care, and write to me any time.
Pablo · Lumen$t$,
'{}', 'Exactly the procedure: stop, doctor, refund without return, checked the subscription. Warm without overpromising.'),

('L2', 'lumen', 'laura@sellervate.test', 2, false, interval '4 hours', 'chat', 'Beatriz Soler',
 'Can I use the night cream while pregnant?',
$t$Hi, I'm 3 months pregnant. Is the Renew night cream safe to keep using?$t$,
$t$Hi Beatriz, congratulations! Yes, Renew is completely safe during pregnancy, all our ingredients are natural. Enjoy! Laura$t$,
'{medical_claim,wrong_product_info}',
'Renew contains retinol. We never make safety claims, refer to a doctor. This is the reply that loses the account.'),

('L3', 'lumen', 'laura@sellervate.test', 4, false, interval '2 hours', 'email', 'Andrea Molina',
 'Skip next month',
$t$Can I skip next month's box? I still have plenty.$t$,
$t$Hi Andrea,

Done: your October box is skipped and your next one ships on 12 November. Nothing else changes.

Laura · Lumen$t$,
'{}', 'Checked the subscription, clear. A bit dry for Lumen, use her name warmly and offer to adjust frequency.'),

('L4', 'lumen', 'pablo@sellervate.test', 3, false, interval '6 hours', 'email', 'Raúl Navarro',
 'Is the cleanser vegan?',
$t$Is the Calm cleanser vegan? My partner doesn't use anything with animal ingredients.$t$,
$t$Hi Raúl, thanks for your message! Orders ship within 2 working days and delivery is free over 35 EUR. Pablo · Lumen$t$,
'{answered_other_question,wont_stop_recontact}',
'Answered a shipping question nobody asked. He will write again.');

-- ---------------------------------------------------------------- yesterday: the review queue
insert into public.replies (
  brand_id, specialist_id, source, external_id, channel, customer_name, subject,
  customer_message, reply_body, received_at, sent_at
)
select b.id, u.id, 'seed', 'queue-' || t.code, t.channel, t.customer_name, t.subject,
       t.customer_message, t.reply_body,
       (date_trunc('day', now()) - interval '1 day' + interval '8 hours'
         + (row_number() over (order by t.code)) * interval '35 minutes') - t.delay,
       date_trunc('day', now()) - interval '1 day' + interval '8 hours'
         + (row_number() over (order by t.code)) * interval '35 minutes'
from seed_templates t
join public.brands b on b.slug = t.brand_slug
join auth.users u on u.email = t.specialist_email;

-- ---------------------------------------------------------------- 8 weeks of reviewed history
-- 4 replies per brand per week. Voltra improves over time, Boxwell is flat,
-- Lumen dips in the last two weeks: something for the brand overview to show.
do $$
declare
  w int;
  n int;
  b record;
  t seed_templates%rowtype;
  spec uuid;
  v_lead uuid;
  v_body text;
  sent timestamptz;
  s int;
  adj int;
  noise float;
  v_reply uuid;
  v_review uuid;
  v_comment text;
begin
  for b in select id, slug from public.brands order by slug loop
    select m.user_id into v_lead
    from public.brand_memberships m
    where m.brand_id = b.id and m.role = 'lead';

    for w in 1..8 loop
      for n in 1..4 loop
        select * into t from seed_templates
        where brand_slug = b.slug
        -- weighted by base score: most replies that go out are fine, a few are not
        order by -ln(random()) / (base_score * base_score) limit 1;

        -- rotate between the brand's specialists
        select m.user_id into spec
        from public.brand_memberships m
        where m.brand_id = b.id and m.role = 'specialist'
        order by random() limit 1;

        -- keep the signature consistent with who actually sent it
        select replace(t.reply_body,
                       (select split_part(p.full_name, ' ', 1) from public.profiles p
                        join auth.users u on u.id = p.id where u.email = t.specialist_email),
                       (select split_part(p.full_name, ' ', 1) from public.profiles p where p.id = spec))
          into v_body;

        sent := date_trunc('day', now()) - (w * 7 - n) * interval '1 day'
                + interval '9 hours' + (random() * 8) * interval '1 hour';

        adj := case b.slug
                 when 'voltra' then -((w - 1) / 3)          -- older weeks score lower
                 when 'lumen'  then case when w <= 2 then -1 else 0 end
                 else 0
               end;
        noise := random();
        s := greatest(1, least(5, t.base_score + adj
               + case when noise < 0.2 then -1 when noise > 0.85 then 1 else 0 end));

        insert into public.replies (
          brand_id, specialist_id, source, external_id, channel, customer_name, subject,
          customer_message, reply_body, received_at, sent_at
        ) values (
          b.id, spec, 'seed', format('hist-%s-w%s-%s', b.slug, w, n), t.channel,
          t.customer_name, t.subject, t.customer_message, v_body, sent - t.delay, sent
        ) returning id into v_reply;

        v_comment := case
          when s = t.base_score then t.review_comment
          when s >= 4 then 'Good. Follows the brand procedure, small things to polish.'
          when s = 3 then 'Correct but generic, does not sound like this brand.'
          else 'Missed the brand procedure. Worth a 1:1.'
        end;

        insert into public.reviews (reply_id, brand_id, reviewer_id, score, comment, is_exemplar, created_at, updated_at)
        values (v_reply, b.id, v_lead, s, v_comment,
                (t.exemplar and s = 5 and n = 1) or (t.base_score = 1 and s = 1 and w = 3),
                sent + interval '1 day', sent + interval '1 day')
        returning id into v_review;

        if s <= 3 then
          insert into public.review_tag_links (review_id, tag_id)
          select v_review, rt.id
          from public.review_tags rt
          where rt.code = any (
                  case when cardinality(t.tags) > 0 then t.tags
                       else array['wont_stop_recontact'] end)
            and (rt.brand_id is null or rt.brand_id = b.id);
        end if;
      end loop;
    end loop;
  end loop;
end $$;
