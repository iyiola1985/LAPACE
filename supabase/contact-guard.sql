-- Block phone numbers and emails in chat and job posts.
-- Run this in the Supabase SQL editor after schema.sql.

create or replace function public.normalize_contact_text(value text)
returns text
language sql
immutable
as $$
  select regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(lower(coalesce(value, '')), '[\s._,;:|/\\-]+', ' ', 'g'),
          '\m(at)\M', '@', 'g'
        ),
        '\m(dot|dt)\M', '.', 'g'
      ),
      '[^a-z0-9@.]+', '', 'g'
    ),
    '\.{2,}', '.', 'g'
  );
$$;

create or replace function public.contains_contact_info(value text)
returns boolean
language plpgsql
immutable
as $$
declare
  normalized text := public.normalize_contact_text(value);
  digits text := regexp_replace(coalesce(value, ''), '\D', '', 'g');
begin
  if normalized ~ '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}' then
    return true;
  end if;

  if coalesce(value, '') ~ '@' then
    return true;
  end if;

  if digits ~ '(234|0)?[789][01]\d{8}' and length(digits) between 8 and 15 then
    return true;
  end if;

  if length(digits) between 10 and 15 then
    return true;
  end if;

  return false;
end;
$$;

create or replace function public.reject_contact_info()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'messages' and public.contains_contact_info(new.body) then
    raise exception 'Phone numbers and emails are not allowed. Keep the conversation in Lapace chat.';
  end if;

  if tg_table_name = 'jobs' and public.contains_contact_info(
    coalesce(new.title, '') || ' ' || coalesce(new.description, '') || ' ' || coalesce(new.city, '') || ' ' || coalesce(new.budget, '')
  ) then
    raise exception 'Phone numbers and emails are not allowed in job posts. Keep contact inside Lapace chat.';
  end if;

  return new;
end;
$$;

drop trigger if exists messages_reject_contact on public.messages;
create trigger messages_reject_contact
  before insert or update on public.messages
  for each row execute function public.reject_contact_info();

drop trigger if exists jobs_reject_contact on public.jobs;
create trigger jobs_reject_contact
  before insert or update on public.jobs
  for each row execute function public.reject_contact_info();
