import { createId, readUsers, type UserProfile } from "@/lib/auth";
import { assertVerifiedPro } from "@/lib/access";
import { assertNoContactDetails } from "@/lib/contactGuard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type WorkPostType = "pro_work" | "pro_to_pro";
export type WorkAudience = "clients" | "pros" | "both";
export type WorkPostStatus =
  | "open"
  | "hired"
  | "in_progress"
  | "completed"
  | "closed";

export type WorkPost = {
  id: string;
  proId: string;
  proName: string;
  postType: WorkPostType;
  audience: WorkAudience;
  title: string;
  description: string;
  city: string;
  budget: string;
  service: string;
  status: WorkPostStatus;
  hiredPartyId?: string;
  createdAt: string;
};

type WorkPostRow = {
  id: string;
  pro_id: string;
  post_type: WorkPostType;
  audience: WorkAudience;
  title: string;
  description: string;
  city: string;
  budget: string;
  service: string;
  status: WorkPostStatus;
  hired_party_id: string | null;
  created_at: string;
  profiles?: { full_name: string; company_name: string | null } | null;
};

const WORK_KEY = "lapace-work-posts";

function readLocal(): WorkPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WORK_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkPost[];
  } catch {
    return [];
  }
}

function writeLocal(items: WorkPost[]) {
  window.localStorage.setItem(WORK_KEY, JSON.stringify(items));
}

function displayProName(
  fullName?: string | null,
  companyName?: string | null,
) {
  return companyName || fullName || "Pro company";
}

function fromRow(row: WorkPostRow): WorkPost {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    proId: row.pro_id,
    proName: displayProName(profile?.full_name, profile?.company_name),
    postType: row.post_type,
    audience: row.audience,
    title: row.title,
    description: row.description,
    city: row.city,
    budget: row.budget,
    service: row.service,
    status: row.status,
    hiredPartyId: row.hired_party_id ?? undefined,
    createdAt: row.created_at,
  };
}

export async function listWorkPosts(): Promise<WorkPost[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readLocal().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  const { data, error } = await supabase
    .from("work_posts")
    .select("*, profiles!work_posts_pro_id_fkey(full_name, company_name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as WorkPostRow[] | null)?.map(fromRow) ?? [];
}

export async function getWorkPost(id: string): Promise<WorkPost | null> {
  const posts = await listWorkPosts();
  return posts.find((post) => post.id === id) ?? null;
}

export async function createWorkPost(input: {
  poster: UserProfile;
  postType: WorkPostType;
  audience: WorkAudience;
  title: string;
  description: string;
  city: string;
  budget: string;
  service: string;
}): Promise<WorkPost> {
  assertVerifiedPro(input.poster);
  assertNoContactDetails(
    `${input.title} ${input.description} ${input.city} ${input.budget}`,
  );

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const post: WorkPost = {
      id: createId("work"),
      proId: input.poster.id,
      proName:
        input.poster.role === "pro"
          ? input.poster.companyName || input.poster.fullName
          : input.poster.fullName,
      postType: input.postType,
      audience: input.audience,
      title: input.title.trim(),
      description: input.description.trim(),
      city: input.city.trim(),
      budget: input.budget.trim(),
      service: input.service,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    const all = readLocal();
    all.unshift(post);
    writeLocal(all);
    return post;
  }

  const { data, error } = await supabase
    .from("work_posts")
    .insert({
      pro_id: input.poster.id,
      post_type: input.postType,
      audience: input.audience,
      title: input.title.trim(),
      description: input.description.trim(),
      city: input.city.trim(),
      budget: input.budget.trim(),
      service: input.service,
      status: "open",
    })
    .select("*, profiles!work_posts_pro_id_fkey(full_name, company_name)")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create work post.");
  }

  return fromRow(data as WorkPostRow);
}

export async function updateWorkPostStatus(
  id: string,
  status: WorkPostStatus,
  hiredPartyId?: string,
): Promise<WorkPost | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const all = readLocal();
    const index = all.findIndex((post) => post.id === id);
    if (index < 0) return null;
    all[index] = {
      ...all[index],
      status,
      hiredPartyId: hiredPartyId ?? all[index].hiredPartyId,
    };
    writeLocal(all);
    return all[index];
  }

  const { data, error } = await supabase
    .from("work_posts")
    .update({
      status,
      hired_party_id: hiredPartyId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, profiles!work_posts_pro_id_fkey(full_name, company_name)")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update work post.");
  }

  return fromRow(data as WorkPostRow);
}

export function canRespondToWorkPost(
  post: WorkPost,
  user: UserProfile | null | undefined,
) {
  if (!user || post.status !== "open") return false;
  if (user.id === post.proId) return false;

  switch (post.audience) {
    case "clients":
      return user.role === "client";
    case "pros":
      return user.role === "pro" && user.status === "verified";
    case "both":
      return (
        user.role === "client" ||
        (user.role === "pro" && user.status === "verified")
      );
    default: {
      const _exhaustive: never = post.audience;
      return Boolean(_exhaustive);
    }
  }
}

export function ensureDemoWorkPosts() {
  if (typeof window === "undefined") return;
  if (getSupabaseBrowserClient()) return;
  if (readLocal().length > 0) return;

  const pro = readUsers().find(
    (entry) =>
      entry.profile.role === "pro" &&
      entry.profile.status === "verified",
  );
  if (!pro || pro.profile.role !== "pro") return;

  writeLocal([
    {
      id: createId("work"),
      proId: pro.profile.id,
      proName: pro.profile.companyName || pro.profile.fullName,
      postType: "pro_work",
      audience: "both",
      title: "Crew capacity available for aluminum re-roof",
      description:
        "Verified Lapace pro has a 6-person crew free next week for residential aluminum installs in Lagos.",
      city: "Lagos",
      budget: "₦800k – ₦1.2m",
      service: "Residential",
      status: "open",
      createdAt: new Date().toISOString(),
    },
  ]);
}
