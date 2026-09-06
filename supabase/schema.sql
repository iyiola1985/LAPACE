-- Lapace Roofing Marketplace — Supabase schema (Phase B)
-- Run this in the Supabase SQL Editor after creating a project.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('client', 'pro', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pro_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'client',
  full_name text not null,
  email text not null unique,
  phone text not null default '',
  city text not null default '',
  company_name text,
  services text[] default '{}',
  about text default '',
  license_note text default '',
  pro_status public.pro_status,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  notes text default '',
  items jsonb not null default '[]'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);
create index if not exists profiles_role_status_idx
  on public.profiles (role, pro_status);

alter table public.profiles enable row level security;
alter table public.quote_requests enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := coalesce(new.raw_user_meta_data->>'role', 'client');
  resolved_role public.user_role := 'client';
begin
  if meta_role in ('client', 'pro', 'admin') then
    resolved_role := meta_role::public.user_role;
  end if;

  insert into public.profiles (
    id,
    role,
    full_name,
    email,
    phone,
    city,
    company_name,
    services,
    about,
    license_note,
    pro_status
  )
  values (
    new.id,
    resolved_role,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'city', ''),
    new.raw_user_meta_data->>'company_name',
    coalesce(
      array(
        select jsonb_array_elements_text(
          coalesce(new.raw_user_meta_data->'services', '[]'::jsonb)
        )
      ),
      '{}'::text[]
    ),
    coalesce(new.raw_user_meta_data->>'about', ''),
    coalesce(new.raw_user_meta_data->>'license_note', ''),
    case when resolved_role = 'pro' then 'pending'::public.pro_status else null end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "Profiles are readable by owner and admins" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;

create policy "Profiles are readable by owner and admins"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Anyone authenticated can create quote requests" on public.quote_requests;
drop policy if exists "Anyone can create quote requests" on public.quote_requests;
drop policy if exists "Owners and admins can read quote requests" on public.quote_requests;
drop policy if exists "Admins can update quote requests" on public.quote_requests;

create policy "Anyone can create quote requests"
  on public.quote_requests for insert
  with check (true);

create policy "Owners and admins can read quote requests"
  on public.quote_requests for select
  using (
    public.is_admin()
    or user_id = auth.uid()
    or email = (select email from public.profiles where id = auth.uid())
  );

create policy "Admins can update quote requests"
  on public.quote_requests for update
  using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;
grant insert on public.quote_requests to anon, authenticated;
grant select, update on public.quote_requests to authenticated;

-- After first admin signs up via Auth, promote them:
-- update public.profiles set role = 'admin' where email = 'admin@lapacealuminium.com';
-- Append Phase C: verified pros (public), jobs, messaging
-- Safe to re-run after Phase B schema.

drop policy if exists "Verified pros are publicly readable" on public.profiles;
create policy "Verified pros are publicly readable"
  on public.profiles for select
  using (role = 'pro' and pro_status = 'verified');

do $$ begin
  create type public.job_status as enum ('open', 'hired', 'closed');
exception when duplicate_object then null;
end $$;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  city text not null default '',
  budget text not null default '',
  service text not null default 'Residential',
  status public.job_status not null default 'open',
  hired_pro_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs (id) on delete set null,
  client_id uuid not null references public.profiles (id) on delete cascade,
  pro_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists conversations_pair_job_idx
  on public.conversations (client_id, pro_id, coalesce(job_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists jobs_status_created_idx on public.jobs (status, created_at desc);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.jobs enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Authenticated can read jobs" on public.jobs;
drop policy if exists "Clients can create jobs" on public.jobs;
drop policy if exists "Clients and hired pros can update jobs" on public.jobs;

create policy "Authenticated can read jobs"
  on public.jobs for select
  using (auth.uid() is not null);

create policy "Clients can create jobs"
  on public.jobs for insert
  with check (auth.uid() = client_id);

create policy "Clients and hired pros can update jobs"
  on public.jobs for update
  using (auth.uid() = client_id or auth.uid() = hired_pro_id or public.is_admin());

drop policy if exists "Participants can read conversations" on public.conversations;
drop policy if exists "Participants can create conversations" on public.conversations;
drop policy if exists "Participants can update conversations" on public.conversations;

create policy "Participants can read conversations"
  on public.conversations for select
  using (auth.uid() = client_id or auth.uid() = pro_id or public.is_admin());

create policy "Participants can create conversations"
  on public.conversations for insert
  with check (auth.uid() = client_id or auth.uid() = pro_id);

create policy "Participants can update conversations"
  on public.conversations for update
  using (auth.uid() = client_id or auth.uid() = pro_id or public.is_admin());

drop policy if exists "Participants can read messages" on public.messages;
drop policy if exists "Participants can send messages" on public.messages;

create policy "Participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.client_id = auth.uid() or c.pro_id = auth.uid() or public.is_admin())
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.client_id = auth.uid() or c.pro_id = auth.uid())
    )
  );

grant select, insert, update on public.jobs to authenticated;
grant select, insert, update on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
