import type { ProProfile, ProService } from "@/lib/auth";
import {
  getProfessional,
  professionals,
  type ProFilter,
  type Professional,
} from "@/lib/data";
import { listProProfiles } from "@/lib/admin";
import {
  listPortfolio,
  type PortfolioItem,
  type PortfolioRow,
} from "@/lib/portfolio";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { profileFromRow } from "@/lib/supabase/mappers";
import type { ProfileRow } from "@/lib/supabase/types";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80";

const MARKETPLACE_STATUSES = ["pending", "verified"] as const;

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

function isMarketplaceStatus(
  status: ProProfile["status"],
): status is (typeof MARKETPLACE_STATUSES)[number] {
  return status === "pending" || status === "verified";
}

export function professionalFromProProfile(
  pro: ProProfile,
  portfolio: PortfolioItem[] = [],
): Professional {
  const filters = asFilters(pro.services);
  const isCertified = pro.status === "verified";
  const isVetted =
    pro.status === "pending" || pro.status === "verified";

  return {
    id: pro.id,
    name: pro.companyName || pro.fullName,
    specialty:
      filters.length > 0
        ? `${filters.join(" · ")} specialist`
        : "Roofing professional",
    location: pro.city || "Nigeria",
    rating: 5,
    reviews: 0,
    verified: isVetted,
    certified: isCertified,
    filters: filters.length > 0 ? filters : ["Residential"],
    tags: pro.services,
    about: pro.about || "Lapace marketplace roofing professional.",
    avatar: pro.avatarUrl || DEFAULT_AVATAR,
    projects: 0,
    satisfaction: 100,
    yearsOnLapace: 1,
    credentials: [
      ...(isVetted
        ? [
            {
              title: "Vetted",
              subtitle: isCertified
                ? "Application reviewed by Lapace"
                : "Application received — awaiting admin approval",
              icon: "verified",
            },
          ]
        : []),
      ...(isCertified
        ? [
            {
              title: "Lapace Certified",
              subtitle: "Approved by Lapace Admin",
              icon: "workspace_premium",
            },
          ]
        : []),
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
    portfolio: portfolio.map((item) => ({
      title: item.title || "Roofing project",
      subtitle: item.description || "Completed project",
      image: item.imageUrl,
    })),
  };
}

async function listMarketplaceFromSupabase(): Promise<Professional[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "pro")
    .in("pro_status", [...MARKETPLACE_STATUSES])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const profiles =
    (data as ProfileRow[] | null)
      ?.map(profileFromRow)
      .filter((profile): profile is ProProfile => profile.role === "pro") ?? [];

  if (profiles.length === 0) return [];

  const { data: portfolioData, error: portfolioError } = await supabase
    .from("pro_portfolio")
    .select("*")
    .in(
      "pro_id",
      profiles.map((profile) => profile.id),
    )
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (portfolioError) throw new Error(portfolioError.message);

  const portfolioByPro = new Map<string, PortfolioItem[]>();
  for (const row of (portfolioData as PortfolioRow[] | null) ?? []) {
    const item: PortfolioItem = {
      id: row.id,
      proId: row.pro_id,
      imageUrl: row.image_url,
      storagePath: row.storage_path,
      title: row.title,
      description: row.description,
      position: row.position,
      createdAt: row.created_at,
    };
    const current = portfolioByPro.get(item.proId) ?? [];
    current.push(item);
    portfolioByPro.set(item.proId, current);
  }

  return profiles.map((profile) =>
    professionalFromProProfile(
      profile,
      portfolioByPro.get(profile.id) ?? [],
    ),
  );
}

export async function listMarketplacePros(): Promise<Professional[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const live = await listMarketplaceFromSupabase();
    // Keep seed listings until real registrations exist.
    if (live.length === 0) return professionals;

    const seedIds = new Set(professionals.map((pro) => pro.id));
    const liveOnly = live.filter((pro) => !seedIds.has(pro.id));
    // Live registrations first (pending + certified), then sample seed pros.
    return [...liveOnly, ...professionals];
  }

  const registered = (await listProProfiles())
    .filter((pro) => isMarketplaceStatus(pro.status))
    .map((pro) => professionalFromProProfile(pro));

  const seedIds = new Set(professionals.map((pro) => pro.id));
  const extras = registered.filter((pro) => !seedIds.has(pro.id));
  return [...extras, ...professionals];
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
      .in("pro_status", [...MARKETPLACE_STATUSES])
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const profile = profileFromRow(data as ProfileRow);
    if (profile.role !== "pro") return null;

    const portfolio = await listPortfolio(profile.id);
    return professionalFromProProfile(profile, portfolio);
  }

  const registered = (await listProProfiles()).find(
    (pro) => pro.id === id && isMarketplaceStatus(pro.status),
  );
  return registered ? professionalFromProProfile(registered) : null;
}

/** Count of pending + verified pros listed on the marketplace. */
export async function countVerifiedPros(): Promise<number> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return (await listProProfiles()).filter((pro) =>
      isMarketplaceStatus(pro.status),
    ).length;
  }
  return (await listMarketplaceFromSupabase()).length;
}
