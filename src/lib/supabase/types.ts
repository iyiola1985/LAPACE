export type ProfileRow = {
  id: string;
  role: "client" | "pro" | "admin";
  full_name: string;
  email: string;
  phone: string;
  city: string;
  company_name: string | null;
  services: string[] | null;
  about: string | null;
  license_note: string | null;
  pro_status: "pending" | "verified" | "rejected" | null;
  avatar_url: string | null;
  created_at: string;
};

export type QuoteRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  notes: string | null;
  items: unknown;
  status: string;
  created_at: string;
};
