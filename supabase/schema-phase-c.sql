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
