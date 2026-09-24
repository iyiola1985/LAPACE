-- Pro portfolio images and Storage policies.
-- Safe to run after the main schema.

create table if not exists public.pro_portfolio (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references public.profiles (id) on delete cascade,
  image_url text not null,
  storage_path text not null unique,
  title text not null default '',
  description text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists pro_portfolio_pro_position_idx
  on public.pro_portfolio (pro_id, position, created_at);

alter table public.pro_portfolio enable row level security;

drop policy if exists "Published portfolios are publicly readable"
  on public.pro_portfolio;
drop policy if exists "Pros can add own portfolio"
  on public.pro_portfolio;
drop policy if exists "Pros can update own portfolio"
  on public.pro_portfolio;
drop policy if exists "Pros can delete own portfolio"
  on public.pro_portfolio;

create policy "Published portfolios are publicly readable"
  on public.pro_portfolio for select
  using (
    pro_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.profiles p
      where p.id = pro_id
        and p.role = 'pro'
        and p.pro_status in ('pending', 'verified')
    )
  );

create policy "Pros can add own portfolio"
  on public.pro_portfolio for insert
  with check (
    pro_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'pro'
    )
  );

create policy "Pros can update own portfolio"
  on public.pro_portfolio for update
  using (pro_id = auth.uid() or public.is_admin())
  with check (pro_id = auth.uid() or public.is_admin());

create policy "Pros can delete own portfolio"
  on public.pro_portfolio for delete
  using (pro_id = auth.uid() or public.is_admin());

grant select on public.pro_portfolio to anon, authenticated;
grant insert, update, delete on public.pro_portfolio to authenticated;
grant all on public.pro_portfolio to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'pro-portfolios',
  'pro-portfolios',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio images are publicly readable"
  on storage.objects;
drop policy if exists "Pros can upload own portfolio images"
  on storage.objects;
drop policy if exists "Pros can update own portfolio images"
  on storage.objects;
drop policy if exists "Pros can delete own portfolio images"
  on storage.objects;

create policy "Portfolio images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'pro-portfolios');

create policy "Pros can upload own portfolio images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'pro-portfolios'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.role = 'pro'
    )
  );

create policy "Pros can update own portfolio images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'pro-portfolios'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'pro-portfolios'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Pros can delete own portfolio images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'pro-portfolios'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
