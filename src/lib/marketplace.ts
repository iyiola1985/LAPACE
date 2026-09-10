import type { ProProfile, ProService } from "@/lib/auth";
import {
  getProfessional,
  professionals,
  type ProFilter,
  type Professional,
} from "@/lib/data";
import { listProProfiles } from "@/lib/admin";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { profileFromRow } from "@/lib/supabase/mappers";
import type { ProfileRow } from "@/lib/supabase/types";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80";

function asFilters(services: ProService[]): ProFilter[] {
  return services.filter((service): service is ProFilter =>
    [
      "Residential",
      "Commercial",
      "Repair",
      "New Install",
      "Solar Ready",
    ].includes(service),
  );
}

export function professionalFromProProfile(pro: ProProfile): Professional {
  const filters = asFilters(pro.services);
  return {
    id: pro.id,
    name: pro.companyName || pro.fullName,
    specialty:
      filters.length > 0
        ? `${filters.join(" · ")} specialist`
        : "Roofing professional",
    rating: 5,
    reviews: 0,
    verified: pro.status === "verified",
    certified: pro.status === "verified",
    filters: filters.length > 0 ? filters : ["Residential"],
    tags: pro.services,
    about: pro.about || "Lapace marketplace roofing professional.",
    avatar: pro.avatarUrl || DEFAULT_AVATAR,
    projects: 0,
    satisfaction: 100,
    yearsOnLapace: 1,
    credentials: [
      {
        title: "Lapace Verified",
        subtitle: "Approved marketplace pro",
        icon: "verified",
      },
      {
        title: "Message on Lapace",
        subtitle: "Chat inside the app. Phone and email stay private.",
        icon: "chat",
      },
      {
        title: "Service area",
        subtitle: pro.city || "Nigeria",
        icon: "location_on",
      },
    ],
    portfolio: [],
  };
}

async function listVerifiedFromSupabase(): Promise<Professional[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "pro")
    .eq("pro_status", "verified")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    (data as ProfileRow[] | null)
      ?.map(profileFromRow)
      .filter((profile): profile is ProProfile => profile.role === "pro")
      .map(professionalFromProProfile) ?? []
  );
}

export async function listMarketplacePros(): Promise<Professional[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const verified = await listVerifiedFromSupabase();
    // Keep the marketplace usable until Lapace verifies real contractors.
    if (verified.length === 0) return professionals;
    return verified;
  }

  const registered = (await listProProfiles())
    .filter((pro) => pro.status === "verified")
    .map(professionalFromProProfile);

  const seedIds = new Set(professionals.map((pro) => pro.id));
  const extras = registered.filter((pro) => !seedIds.has(pro.id));
  return [...professionals, ...extras];
}

export async function getMarketplacePro(
  id: string,
): Promise<Professional | null> {
  const seeded = getProfessional(id);
  if (seeded) return seeded;

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "pro")
      .eq("pro_status", "verified")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const profile = profileFromRow(data as ProfileRow);
    return profile.role === "pro" ? professionalFromProProfile(profile) : null;
  }

  const registered = (await listProProfiles()).find(
    (pro) => pro.id === id && pro.status === "verified",
  );
  return registered ? professionalFromProProfile(registered) : null;
}

export async function countVerifiedPros(): Promise<number> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return (await listProProfiles()).filter((pro) => pro.status === "verified")
      .length;
  }
  return (await listVerifiedFromSupabase()).length;
}
