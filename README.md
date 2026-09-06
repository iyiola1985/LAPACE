# LAPACE Roofing Marketplace

MVP web app for Lapace Aluminium marketplace (pros, materials, quotes, jobs, messaging).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's included

- Marketplace of verified pros (seed + approved registrations)
- Client vs Pro registration + login
- Job board (clients post, pros browse & message)
- In-app messaging + hire from chat
- Quotes basket, admin verification, profile photo cropper
- Supabase-ready schema (`supabase/schema.sql`) with localStorage fallback

## Local demo logins (no Supabase env)

- Client: `client@lapacealuminium.com` / `client123`
- Pro (verified): `pro@lapacealuminium.com` / `pro123`
- Admin: `admin@lapacealuminium.com` / `admin123`

## Try the new flows

1. Log in as **client** → Post a job at `/jobs/new` → open `/messages` when a pro replies  
2. Log in as **pro** → `/jobs` → Message Client → chat at `/messages`  
3. From `/pros`, open a profile → **Message Pro**  
4. In a job-linked chat, client can **Hire this Pro**

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` → `.env.local` (and Vercel env) with URL + anon key
3. Run the full `supabase/schema.sql` in the SQL editor
4. Register users, approve pros in `/admin`, promote admin:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

## Still next

- Email/WhatsApp notifications
- Payments (Paystack/Flutterwave)
- Materials CMS
