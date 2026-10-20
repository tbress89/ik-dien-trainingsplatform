-- An email for every new row in feedback (0002), sent through Resend (https://resend.com) straight from the
-- database with pg_net, so there is no Edge Function to deploy. Run this once in the Supabase SQL editor after
-- 0002_feedback_and_usage.sql.
--
-- The API key and the address to mail stay out of this file: store them once in Supabase Vault (SQL editor):
--
--   select vault.create_secret('re_…', 'resend_api_key');
--   select vault.create_secret('you@example.com', 'feedback_email_to');
--
-- Without Resend's own domain check the mail must go to the address of your Resend account, from
-- onboarding@resend.dev. Without both secrets nothing is sent. Sending never blocks or fails the feedback
-- itself: pg_net posts in the background, and any error here is swallowed. Sent requests and their responses
-- show up in net._http_response for a few hours, which helps when a mail doesn't arrive.

create extension if not exists pg_net with schema extensions;

create or replace function public.mail_new_feedback()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text;
  mail_to text;
begin
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'resend_api_key';
  select decrypted_secret into mail_to from vault.decrypted_secrets where name = 'feedback_email_to';
  if api_key is null or mail_to is null then
    return new;
  end if;

  -- The form is open to anyone, so a flood of feedback shouldn't become a flood of mail: at most 20 per hour.
  -- The rows themselves are all kept.
  if (select count(*) from public.feedback where created_at > now() - interval '1 hour') > 20 then
    return new;
  end if;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || api_key, 'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'from', 'Trainingsplatform <onboarding@resend.dev>',
      'to', mail_to,
      'subject', 'Feedback op ' || new.exercise_id || coalesce(' (' || new.kind || ')', ''),
      -- Plain text, so nothing a coach types is rendered as HTML.
      'text', new.message
        || E'\n\n— Oefening: https://trainingen.ikdien.be/oefeningen/' || new.exercise_id
        || coalesce(E'\n— Versie: ' || new.version, '')
        || coalesce(E'\n— Soort: ' || new.kind, '')
    )
  );
  return new;
exception when others then
  raise warning 'feedback mail not sent: %', sqlerrm;
  return new;
end;
$$;

revoke all on function public.mail_new_feedback() from public, anon, authenticated;

create trigger mail_new_feedback
  after insert on public.feedback
  for each row execute function public.mail_new_feedback();
