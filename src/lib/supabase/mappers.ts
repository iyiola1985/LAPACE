import type {
  AdminProfile,
  ClientProfile,
  ProProfile,
  ProService,
  UserProfile,
} from "@/lib/auth";
import type { QuoteBasketItem, QuoteRequest } from "@/lib/quotes";
import type { ProfileRow, QuoteRow } from "@/lib/supabase/types";

const PRO_SERVICE_SET = new Set<ProService>([
  "Residential",
  "Commercial",
  "Repair",
  "New Install",
  "Solar Ready",
]);

function asProServices(values: string[] | null | undefined): ProService[] {
  if (!values) return [];
  return values.filter((value): value is ProService =>
    PRO_SERVICE_SET.has(value as ProService),
  );
}

export function profileFromRow(row: ProfileRow): UserProfile {
  switch (row.role) {
    case "admin": {
      const profile: AdminProfile = {
        role: "admin",
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        city: row.city,
        avatarUrl: row.avatar_url ?? undefined,
        createdAt: row.created_at,
      };
      return profile;
    }
    case "pro": {
      const profile: ProProfile = {
        role: "pro",
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        companyName: row.company_name ?? "",
        city: row.city,
        services: asProServices(row.services),
        about: row.about ?? "",
        licenseNote: row.license_note ?? "",
        status: row.pro_status ?? "pending",
        avatarUrl: row.avatar_url ?? undefined,
        createdAt: row.created_at,
      };
      return profile;
    }
    case "client": {
      const profile: ClientProfile = {
        role: "client",
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        city: row.city,
        avatarUrl: row.avatar_url ?? undefined,
        createdAt: row.created_at,
      };
      return profile;
    }
    default: {
      const _exhaustive: never = row.role;
      throw new Error(`Unhandled profile role: ${String(_exhaustive)}`);
    }
  }
}

export function quoteFromRow(row: QuoteRow): QuoteRequest {
  const items = Array.isArray(row.items)
    ? (row.items as QuoteBasketItem[])
    : [];

  const status =
    row.status === "contacted" || row.status === "closed" ? row.status : "new";

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    notes: row.notes ?? "",
    items,
    status,
    createdAt: row.created_at,
  };
}
