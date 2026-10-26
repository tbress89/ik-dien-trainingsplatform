-- "Naar horloge": a training travels from the site to the Apple Watch app with a 4-digit code. The site
-- stores the training (as the watch needs it, see codebase/src/data/watch.ts) under a fresh code; the coach
-- types the code on the watch, which claims the training once. Run this once in the Supabase SQL editor
-- (or with the Supabase CLI) after 0002_feedback_and_usage.sql.
--
-- Like 0002, nothing here says who sent or fetched a training: no user id, no IP address. A code is valid
-- for 15 minutes and works once. 4 digits is a small space, so failed claims are rate-limited: guessing a
-- live code is too slow to be worth it, and the worst a guess yields is a training plan.

create table public.watch_handoff (
  code       text primary key check (code ~ '^[0-9]{4}$'),
  -- { version, date, team, theme, items: [...] }, as the watch app decodes it (TrainingPlan in watch/Engine).
  payload    jsonb not null,
  expires_at timestamptz not null
);

-- One row per failed claim, only kept for the rate limit below.
create table public.watch_claim_failures (
  at timestamptz not null default now()
);

-- No grants and no policies: the site and the watch only reach these tables through the functions below.
alter table public.watch_handoff enable row level security;
alter table public.watch_claim_failures enable row level security;

-- Stores a training and returns its code. Called by the site, with or without an account.
create or replace function public.create_watch_code(p_payload jsonb)
returns table (code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
-- The result columns (code, expires_at) share their names with the table's; in queries, mean the table.
#variable_conflict use_column
declare
  v_code text;
  v_expires timestamptz := now() + interval '15 minutes';
begin
  if p_payload is null
     or jsonb_typeof(p_payload) <> 'object'
     or p_payload->>'version' is distinct from '1'
     or jsonb_typeof(p_payload->'items') <> 'array'
     or jsonb_array_length(p_payload->'items') not between 1 and 40
     or octet_length(p_payload::text) > 32768 then
    raise exception 'invalid training';
  end if;

  delete from public.watch_handoff h where h.expires_at <= now();
  -- At most this many open codes, so the table can't be filled up (and 4 digits stay easy to hand out).
  if (select count(*) from public.watch_handoff) >= 2000 then
    raise exception 'too many open codes';
  end if;

  for i in 1..30 loop
    v_code := lpad(floor(random() * 10000)::int::text, 4, '0');
    insert into public.watch_handoff (code, payload, expires_at)
    values (v_code, p_payload, v_expires)
    on conflict do nothing;
    if found then
      return query select v_code, v_expires;
      return;
    end if;
  end loop;
  raise exception 'no free code';
end;
$$;

-- Returns the training for a code and removes it, or null when the code is unknown or expired. Called by
-- the watch with the anon key.
create or replace function public.claim_watch_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payload jsonb;
begin
  if p_code is null or p_code !~ '^[0-9]{4}$' then
    raise exception 'invalid code';
  end if;

  delete from public.watch_claim_failures f where f.at < now() - interval '1 minute';
  -- Shared by everyone (nothing identifies the caller): at 20 failed claims a minute, trying all 10,000
  -- codes takes hours while a code lives for 15 minutes.
  if (select count(*) from public.watch_claim_failures) >= 20 then
    raise exception 'too many attempts';
  end if;

  delete from public.watch_handoff h
  where h.code = p_code and h.expires_at > now()
  returning h.payload into v_payload;

  if v_payload is null then
    insert into public.watch_claim_failures default values;
  end if;
  return v_payload;
end;
$$;

revoke all on function public.create_watch_code(jsonb) from public;
revoke all on function public.claim_watch_code(text) from public;
grant execute on function public.create_watch_code(jsonb) to anon, authenticated;
grant execute on function public.claim_watch_code(text) to anon, authenticated;
