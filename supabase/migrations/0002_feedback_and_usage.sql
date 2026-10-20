-- Feedback from coaches and anonymous usage counts. Run this once in the Supabase SQL editor (or with the
-- Supabase CLI) after 0001_accounts.sql. Neither table stores who sent or viewed something: no user id, no
-- IP address, no cookies. Read both in the Supabase dashboard (table editor or SQL editor); the site itself
-- can only write to them.

-- "Opmerking of fout melden" on an exercise page. Anyone can send one, also without an account.
create table public.feedback (
  id          uuid primary key default gen_random_uuid(),
  exercise_id text not null check (char_length(exercise_id) between 1 and 80),
  -- The variant that was open (e.g. "2. Met verdediger"); null for an exercise without variants.
  version     text check (char_length(version) <= 200),
  kind        text check (kind in ('tekening', 'uitleg', 'idee', 'andere')),
  message     text not null check (char_length(message) between 1 and 2000),
  created_at  timestamptz not null default now()
);

-- Insert only: no select, update or delete for the site, so nobody can read other people's feedback.
grant insert on public.feedback to anon, authenticated;

alter table public.feedback enable row level security;

create policy "anyone can send feedback" on public.feedback
  for insert to anon, authenticated
  with check (true);

-- Usage counts per day: how often an exercise page was opened ('oefening', item = exercise id) and how
-- often a training was given ('geven', item = 'eigen' or 'gedeeld'). Only totals, nothing per visitor.
create table public.usage_counts (
  day   date not null default current_date,
  kind  text not null check (kind in ('oefening', 'geven')),
  item  text not null check (item ~ '^[a-z0-9-]{1,80}$'),
  count bigint not null default 0,
  primary key (day, kind, item)
);

-- No grants and no policies: the site only reaches this table through count_usage below.
alter table public.usage_counts enable row level security;

create or replace function public.count_usage(p_kind text, p_item text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_kind is null or p_kind not in ('oefening', 'geven') or p_item is null or p_item !~ '^[a-z0-9-]{1,80}$' then
    raise exception 'invalid usage count';
  end if;
  insert into public.usage_counts (day, kind, item, count)
  values (current_date, p_kind, p_item, 1)
  on conflict (day, kind, item) do update set count = public.usage_counts.count + 1;
end;
$$;

revoke all on function public.count_usage(text, text) from public;
grant execute on function public.count_usage(text, text) to anon, authenticated;
