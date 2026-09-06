# LAPACE Roofing Marketplace

MVP web app for Lapace Aluminium marketplace (pros, materials, quotes, auth).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's included

- Home, pros directory, materials catalog, quote basket
- Client vs Pro registration + login (localStorage demo auth)
- Profile photo crop/zoom editor
- Client + Pro dashboards
- **Admin ops** at `/admin` (pro approve/reject + quote inbox)
- Supabase schema ready in `supabase/schema.sql`

## Demo admin login

On first load the app seeds:

- Email: `admin@lapacealuminium.com`
- Password: `admin123`

Then open `/admin`.

Override admin emails with `NEXT_PUBLIC_ADMIN_EMAILS` in `.env.local`.

## Supabase setup (Phase A → production)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` → `.env.local` and fill URL + anon key
3. Run `supabase/schema.sql` in the SQL editor
4. Promote your admin user after signup:

```sql
update public.profiles set role = 'admin' where email = 'admin@lapacealuminium.com';
```

Until env vars are set, the app keeps using browser localStorage (good for demos).

## Still next

- Wire auth/quotes fully to Supabase (replace localStorage)
- Email/WhatsApp notifications
- Job board + messaging
- Payments (Paystack/Flutterwave)
- Materials CMS
