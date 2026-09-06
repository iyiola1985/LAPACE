-- Lapace Roofing Marketplace — Supabase schema (Phase A)
-- Run this in Supabase SQL Editor after creating a project.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('client', 'pro', 'admin');
create type public.pro_status as enum ('pending', 'verified', 'rejected');

create table public.profiles (
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

create table public.quote_requests (
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

create index quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index profiles_role_status_idx on public.profiles (role, pro_status);

alter table public.profiles enable row level security;
alter table public.quote_requests enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create policy "Profiles are readable by owner and admins"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Anyone authenticated can create quote requests"
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

-- After first admin signs up via Auth, promote them:
-- update public.profiles set role = 'admin' where email = 'admin@lapacealuminium.com';
