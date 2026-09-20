-- Lapace marketplace deals, work posts, offers + verified-pro gates.
-- Run in the Supabase SQL editor after schema.sql / contact-guard.sql / portfolio.sql.

-- Extended job statuses
do $$ begin
  alter type public.job_status add value if not exists 'in_progress';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type public.job_status add value if not exists 'completed';
exception when duplicate_object then null;
end $$;

-- Optional rejection note on profiles
alter table public.profiles
  add column if not exists rejection_reason text;

create or replace function public.is_verified_pro(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid
      and p.role = 'pro'
      and p.pro_status = 'verified'
  );
$$;

do $$ begin
  create type public.work_post_type as enum ('pro_work', 'pro_to_pro');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.work_audience as enum ('clients', 'pros', 'both');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.offer_status as enum (
    'pending',
    'accepted',
    'declined',
    'withdrawn',
    'completed',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.deal_status as enum (
    'active',
    'completed',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.conversation_mode as enum ('client_pro', 'pro_pro');
exception when duplicate_object then null;
end $$;

create table if not exists public.work_posts (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references public.profiles (id) on delete cascade,
  post_type public.work_post_type not null default 'pro_work',
  audience public.work_audience not null default 'both',
  title text not null,
  description text not null default '',
  city text not null default '',
  budget text not null default '',
  service text not null default 'Residential',
  status public.job_status not null default 'open',
  hired_party_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_posts_status_created_idx
  on public.work_posts (status, created_at desc);
create index if not exists work_posts_pro_idx
  on public.work_posts (pro_id, created_at desc);

alter table public.conversations
  add column if not exists mode public.conversation_mode not null default 'client_pro';
alter table public.conversations
  add column if not exists work_post_id uuid references public.work_posts (id) on delete set null;

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete cascade,
  work_post_id uuid references public.work_posts (id) on delete cascade,
  amount_min numeric,
  amount_max numeric,
  currency text not null default 'NGN',
  timeline text not null default '',
  notes text not null default '',
  status public.offer_status not null default 'pending',
  conversation_id uuid references public.conversations (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint offers_listing_check check (
    (job_id is not null and work_post_id is null)
    or (job_id is null and work_post_id is not null)
  )
);

create index if not exists offers_to_user_idx on public.offers (to_user_id, status, created_at desc);
create index if not exists offers_from_user_idx on public.offers (from_user_id, status, created_at desc);
create index if not exists offers_job_idx on public.offers (job_id, status);
create index if not exists offers_work_post_idx on public.offers (work_post_id, status);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null unique references public.offers (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  work_post_id uuid references public.work_posts (id) on delete set null,
  party_a_id uuid not null references public.profiles (id) on delete cascade,
  party_b_id uuid not null references public.profiles (id) on delete cascade,
  amount_min numeric,
  amount_max numeric,
  currency text not null default 'NGN',
  timeline text not null default '',
  notes text not null default '',
  status public.deal_status not null default 'active',
  conversation_id uuid references public.conversations (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists deals_party_a_idx on public.deals (party_a_id, created_at desc);
create index if not exists deals_party_b_idx on public.deals (party_b_id, created_at desc);

alter table public.work_posts enable row level security;
alter table public.offers enable row level security;
alter table public.deals enable row level security;

-- Work posts: verified pros create; readable by authenticated
drop policy if exists "Authenticated can read work posts" on public.work_posts;
drop policy if exists "Verified pros can create work posts" on public.work_posts;
drop policy if exists "Owners and hired parties can update work posts" on public.work_posts;

create policy "Authenticated can read work posts"
  on public.work_posts for select
  using (auth.uid() is not null);

create policy "Verified pros can create work posts"
  on public.work_posts for insert
  with check (
    auth.uid() = pro_id
    and public.is_verified_pro(auth.uid())
  );

create policy "Owners and hired parties can update work posts"
  on public.work_posts for update
  using (
    auth.uid() = pro_id
    or auth.uid() = hired_party_id
    or public.is_admin()
  );

-- Offers
drop policy if exists "Participants can read offers" on public.offers;
drop policy if exists "Authenticated can create offers" on public.offers;
drop policy if exists "Participants can update offers" on public.offers;

create policy "Participants can read offers"
  on public.offers for select
  using (
    auth.uid() = from_user_id
    or auth.uid() = to_user_id
    or public.is_admin()
  );

create policy "Authenticated can create offers"
  on public.offers for insert
  with check (
    auth.uid() = from_user_id
    and (
      public.is_verified_pro(from_user_id)
      or exists (
        select 1 from public.profiles p
        where p.id = from_user_id and p.role = 'client'
      )
    )
  );

create policy "Participants can update offers"
  on public.offers for update
  using (
    auth.uid() = from_user_id
    or auth.uid() = to_user_id
    or public.is_admin()
  );

-- Deals
drop policy if exists "Participants can read deals" on public.deals;
drop policy if exists "Participants can create deals" on public.deals;
drop policy if exists "Participants can update deals" on public.deals;

create policy "Participants can read deals"
  on public.deals for select
  using (
    auth.uid() = party_a_id
    or auth.uid() = party_b_id
    or public.is_admin()
  );

create policy "Participants can create deals"
  on public.deals for insert
  with check (
    auth.uid() = party_a_id
    or auth.uid() = party_b_id
    or public.is_admin()
  );

create policy "Participants can update deals"
  on public.deals for update
  using (
    auth.uid() = party_a_id
    or auth.uid() = party_b_id
    or public.is_admin()
  );

-- Tighten conversation creation: pro side must be verified
drop policy if exists "Participants can create conversations" on public.conversations;
create policy "Participants can create conversations"
  on public.conversations for insert
  with check (
    (auth.uid() = client_id or auth.uid() = pro_id)
    and public.is_verified_pro(pro_id)
    and (
      mode = 'client_pro'
      or (mode = 'pro_pro' and public.is_verified_pro(client_id))
    )
  );

-- Contact guard for work posts
create or replace function public.reject_work_post_contact_info()
returns trigger
language plpgsql
as $$
begin
  if public.contains_contact_info(
    coalesce(new.title, '') || ' ' || coalesce(new.description, '') || ' '
      || coalesce(new.city, '') || ' ' || coalesce(new.budget, '')
  ) then
    raise exception 'Phone numbers and emails are not allowed in work posts. Keep contact inside Lapace chat.';
  end if;
  return new;
end;
$$;

drop trigger if exists work_posts_reject_contact on public.work_posts;
create trigger work_posts_reject_contact
  before insert or update on public.work_posts
  for each row execute function public.reject_work_post_contact_info();

create or replace function public.reject_offer_contact_info()
returns trigger
language plpgsql
as $$
begin
  if public.contains_contact_info(
    coalesce(new.timeline, '') || ' ' || coalesce(new.notes, '') || ' '
      || coalesce(new.currency, '')
  ) then
    raise exception 'Phone numbers and emails are not allowed in offers. Keep contact inside Lapace chat.';
  end if;
  return new;
end;
$$;

drop trigger if exists offers_reject_contact on public.offers;
create trigger offers_reject_contact
  before insert or update on public.offers
  for each row execute function public.reject_offer_contact_info();

grant select, insert, update on public.work_posts to authenticated;
grant select, insert, update on public.offers to authenticated;
grant select, insert, update on public.deals to authenticated;
