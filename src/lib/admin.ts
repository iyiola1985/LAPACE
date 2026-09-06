import {
  createId,
  getAdminEmails,
  readUsers,
  writeUsers,
  type ProProfile,
  type ProStatus,
} from "@/lib/auth";
import type { QuoteBasketItem, QuoteRequest } from "@/lib/quotes";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { profileFromRow, quoteFromRow } from "@/lib/supabase/mappers";
import type { ProfileRow, QuoteRow } from "@/lib/supabase/types";

export type { QuoteBasketItem, QuoteRequest } from "@/lib/quotes";

export const QUOTES_KEY = "lapace-quote-requests";

export { getAdminEmails, isAdminEmail } from "@/lib/auth";

export function readQuoteRequests(): QuoteRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUOTES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QuoteRequest[];
  } catch {
    return [];
  }
}

export function writeQuoteRequests(requests: QuoteRequest[]) {
  window.localStorage.setItem(QUOTES_KEY, JSON.stringify(requests));
}

function submitQuoteLocal(input: {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  items: QuoteBasketItem[];
  userId?: string | null;
}) {
  const request: QuoteRequest = {
    id: createId("quote"),
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    notes: input.notes.trim(),
    items: input.items,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const all = readQuoteRequests();
  all.unshift(request);
  writeQuoteRequests(all);
  return request;
}

export async function submitQuoteRequest(input: {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  items: QuoteBasketItem[];
  userId?: string | null;
}): Promise<QuoteRequest> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return submitQuoteLocal(input);
  }

  const { data, error } = await supabase
    .from("quote_requests")
    .insert({
      user_id: input.userId ?? null,
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      notes: input.notes.trim(),
      items: input.items,
      status: "new",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not save quote request.");
  }

  return quoteFromRow(data as QuoteRow);
}

export async function listQuoteRequests(): Promise<QuoteRequest[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readQuoteRequests();
  }

  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as QuoteRow[] | null)?.map(quoteFromRow) ?? [];
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteRequest["status"],
): Promise<QuoteRequest[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const all = readQuoteRequests();
    const next = all.map((request) =>
      request.id === id ? { ...request, status } : request,
    );
    writeQuoteRequests(next);
    return next;
  }

  const { error } = await supabase
    .from("quote_requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return listQuoteRequests();
}

export async function listProProfiles(): Promise<ProProfile[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readUsers()
      .map((user) => user.profile)
      .filter((profile): profile is ProProfile => profile.role === "pro");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "pro")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    (data as ProfileRow[] | null)
      ?.map(profileFromRow)
      .filter((profile): profile is ProProfile => profile.role === "pro") ?? []
  );
}

export async function setProStatus(proId: string, status: ProStatus) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const users = readUsers();
    const index = users.findIndex(
      (user) => user.profile.role === "pro" && user.profile.id === proId,
    );
    if (index < 0) return null;

    const profile = users[index].profile as ProProfile;
    const updated: ProProfile = { ...profile, status };
    users[index] = { ...users[index], profile: updated };
    writeUsers(users);
    return updated;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ pro_status: status, updated_at: new Date().toISOString() })
    .eq("id", proId)
    .eq("role", "pro")
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update pro status.");
  }

  const profile = profileFromRow(data as ProfileRow);
  return profile.role === "pro" ? profile : null;
}

export function ensureDemoAdmin() {
  if (typeof window === "undefined" || isSupabaseConfigured()) return;
  const adminEmail = getAdminEmails()[0];
  const users = readUsers();
  const index = users.findIndex(
    (user) => user.profile.email.toLowerCase() === adminEmail,
  );

  if (index >= 0) {
    users[index] = {
      ...users[index],
      password: "admin123",
      profile: {
        ...users[index].profile,
        fullName: users[index].profile.fullName || "Lapace Admin",
        email: adminEmail,
      },
    };
    writeUsers(users);
    return;
  }

  users.push({
    password: "admin123",
    profile: {
      role: "client",
      id: createId("admin"),
      fullName: "Lapace Admin",
      email: adminEmail,
      phone: "09155625372",
      city: "Lagos",
      createdAt: new Date().toISOString(),
    },
  });
  writeUsers(users);
}

export const DEMO_CLIENT_EMAIL = "client@lapacealuminium.com";
export const DEMO_CLIENT_PASSWORD = "client123";
export const DEMO_PRO_EMAIL = "pro@lapacealuminium.com";
export const DEMO_PRO_PASSWORD = "pro123";

export function ensureDemoClient() {
  if (typeof window === "undefined" || isSupabaseConfigured()) return;
  const users = readUsers();
  const index = users.findIndex(
    (user) => user.profile.email.toLowerCase() === DEMO_CLIENT_EMAIL,
  );

  if (index >= 0) {
    users[index] = {
      ...users[index],
      password: DEMO_CLIENT_PASSWORD,
      profile: {
        role: "client",
        id: users[index].profile.id,
        fullName:
          users[index].profile.role === "client" ||
          users[index].profile.role === "admin"
            ? users[index].profile.fullName || "Demo Client"
            : "Demo Client",
        email: DEMO_CLIENT_EMAIL,
        phone:
          users[index].profile.role === "client" ||
          users[index].profile.role === "admin"
            ? users[index].profile.phone || "08000000000"
            : "08000000000",
        city:
          users[index].profile.role === "client" ||
          users[index].profile.role === "admin"
            ? users[index].profile.city || "Lagos"
            : "Lagos",
        createdAt: users[index].profile.createdAt,
        avatarUrl: users[index].profile.avatarUrl,
      },
    };
    writeUsers(users);
    return;
  }

  users.push({
    password: DEMO_CLIENT_PASSWORD,
    profile: {
      role: "client",
      id: createId("client"),
      fullName: "Demo Client",
      email: DEMO_CLIENT_EMAIL,
      phone: "08000000000",
      city: "Lagos",
      createdAt: new Date().toISOString(),
    },
  });
  writeUsers(users);
}

export function ensureDemoPro() {
  if (typeof window === "undefined" || isSupabaseConfigured()) return;
  const users = readUsers();
  const index = users.findIndex(
    (user) => user.profile.email.toLowerCase() === DEMO_PRO_EMAIL,
  );

  if (index >= 0) {
    const existing = users[index].profile;
    users[index] = {
      ...users[index],
      password: DEMO_PRO_PASSWORD,
      profile: {
        role: "pro",
        id: existing.id,
        fullName:
          existing.role === "pro" ? existing.fullName : "Demo Roofer",
        email: DEMO_PRO_EMAIL,
        phone: existing.role === "pro" ? existing.phone : "08111111111",
        companyName:
          existing.role === "pro"
            ? existing.companyName
            : "Demo Roofing Co.",
        city: existing.role === "pro" ? existing.city : "Lagos",
        services:
          existing.role === "pro"
            ? existing.services
            : ["Residential", "Repair", "New Install"],
        about:
          existing.role === "pro"
            ? existing.about
            : "Verified demo contractor for Lapace marketplace testing.",
        licenseNote:
          existing.role === "pro"
            ? existing.licenseNote
            : "Demo license on file",
        status: "verified",
        avatarUrl: existing.avatarUrl,
        createdAt: existing.createdAt,
      },
    };
    writeUsers(users);
    return;
  }

  users.push({
    password: DEMO_PRO_PASSWORD,
    profile: {
      role: "pro",
      id: createId("pro"),
      fullName: "Demo Roofer",
      email: DEMO_PRO_EMAIL,
      phone: "08111111111",
      companyName: "Demo Roofing Co.",
      city: "Lagos",
      services: ["Residential", "Repair", "New Install"],
      about: "Verified demo contractor for Lapace marketplace testing.",
      licenseNote: "Demo license on file",
      status: "verified",
      createdAt: new Date().toISOString(),
    },
  });
  writeUsers(users);
}

export function ensureDemoAccounts() {
  ensureDemoAdmin();
  ensureDemoClient();
  ensureDemoPro();
}
