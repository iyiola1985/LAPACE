-- Make pending + verified marketplace pros publicly readable (not rejected).
-- Safe to re-run.

drop policy if exists "Verified pros are publicly readable" on public.profiles;
drop policy if exists "Marketplace pros are publicly readable" on public.profiles;

create policy "Marketplace pros are publicly readable"
  on public.profiles for select
  using (
    role = 'pro'
    and pro_status in ('pending', 'verified')
  );

-- Portfolio images for pending + verified pros
drop policy if exists "Published portfolios are publicly readable"
  on public.pro_portfolio;

create policy "Published portfolios are publicly readable"
  on public.pro_portfolio for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = pro_id
        and p.role = 'pro'
        and p.pro_status in ('pending', 'verified')
    )
  );
