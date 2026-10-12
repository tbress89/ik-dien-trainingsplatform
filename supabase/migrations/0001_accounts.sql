-- Accounts for the Kon. Ik Dien FC trainingsplatform: saved exercises and saved trainings per user.
-- Run this once in the Supabase SQL editor (or with the Supabase CLI). Row-level security is the only
-- thing protecting the data, because the frontend talks to the database directly with the public anon key.

create table public.favorites (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exercise_id text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create table public.trainings (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id         text not null,
  -- { date, team, theme, duration, plan }, as stored in the browser; empty for a deleted training.
  data       jsonb not null default '{}'::jsonb,
  -- Last save (ms since epoch); the newest save wins when devices disagree.
  saved_at   bigint not null,
  -- Tombstone (ms since epoch): set when the training was deleted, so other devices drop it too.
  deleted_at bigint,
  primary key (user_id, id)
);

-- Newer Supabase projects don't grant table access automatically; RLS below still limits rows to the owner.
grant select, insert, update, delete on public.favorites, public.trainings to authenticated;

alter table public.favorites enable row level security;
alter table public.trainings enable row level security;

create policy "own favorites" on public.favorites
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "own trainings" on public.trainings
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- "Account verwijderen": removes the caller's auth user; the cascades remove all their rows.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
