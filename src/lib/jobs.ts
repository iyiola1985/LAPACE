import { createId, readUsers } from "@/lib/auth";
import { assertNoContactDetails } from "@/lib/contactGuard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type JobStatus = "open" | "hired" | "closed";

export type JobPost = {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  city: string;
  budget: string;
  service: string;
  status: JobStatus;
  hiredProId?: string;
  createdAt: string;
};

export type JobRow = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  city: string;
  budget: string;
  service: string;
  status: JobStatus;
  hired_pro_id: string | null;
  created_at: string;
  profiles?: { full_name: string } | { full_name: string }[] | null;
};

const JOBS_KEY = "lapace-jobs";

function readLocalJobs(): JobPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(JOBS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as JobPost[];
  } catch {
    return [];
  }
}

function writeLocalJobs(jobs: JobPost[]) {
  window.localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

function jobFromRow(row: JobRow): JobPost {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: profile?.full_name ?? "Client",
    title: row.title,
    description: row.description,
    city: row.city,
    budget: row.budget,
    service: row.service,
    status: row.status,
    hiredProId: row.hired_pro_id ?? undefined,
    createdAt: row.created_at,
  };
}

export async function listJobs(): Promise<JobPost[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readLocalJobs().sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1,
    );
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("*, profiles!jobs_client_id_fkey(full_name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as JobRow[] | null)?.map(jobFromRow) ?? [];
}

export async function getJob(id: string): Promise<JobPost | null> {
  const jobs = await listJobs();
  return jobs.find((job) => job.id === id) ?? null;
}

export async function createJob(input: {
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  city: string;
  budget: string;
  service: string;
}): Promise<JobPost> {
  assertNoContactDetails(
    `${input.title} ${input.description} ${input.city} ${input.budget}`,
  );
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const job: JobPost = {
      id: createId("job"),
      clientId: input.clientId,
      clientName: input.clientName,
      title: input.title.trim(),
      description: input.description.trim(),
      city: input.city.trim(),
      budget: input.budget.trim(),
      service: input.service,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    const all = readLocalJobs();
    all.unshift(job);
    writeLocalJobs(all);
    return job;
  }

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      client_id: input.clientId,
      title: input.title.trim(),
      description: input.description.trim(),
      city: input.city.trim(),
      budget: input.budget.trim(),
      service: input.service,
      status: "open",
    })
    .select("*, profiles!jobs_client_id_fkey(full_name)")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create job.");
  }

  return jobFromRow(data as JobRow);
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
  hiredProId?: string,
): Promise<JobPost | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const all = readLocalJobs();
    const index = all.findIndex((job) => job.id === id);
    if (index < 0) return null;
    all[index] = {
      ...all[index],
      status,
      hiredProId: hiredProId ?? all[index].hiredProId,
    };
    writeLocalJobs(all);
    return all[index];
  }

  const { data, error } = await supabase
    .from("jobs")
    .update({
      status,
      hired_pro_id: hiredProId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, profiles!jobs_client_id_fkey(full_name)")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update job.");
  }

  return jobFromRow(data as JobRow);
}

export function ensureDemoJobs() {
  if (typeof window === "undefined") return;
  if (getSupabaseBrowserClient()) return;
  if (readLocalJobs().length > 0) return;

  const client = readUsers().find(
    (entry) => entry.profile.email === "client@lapacealuminium.com",
  );
  if (!client) return;

  writeLocalJobs([
    {
      id: createId("job"),
      clientId: client.profile.id,
      clientName: client.profile.fullName,
      title: "Residential aluminum re-roof in Lekki",
      description:
        "Looking for a verified Lapace pro to replace a leaking corrugated roof on a 4-bedroom home.",
      city: "Lekki, Lagos",
      budget: "₦1.5m – ₦2.5m",
      service: "Residential",
      status: "open",
      createdAt: new Date().toISOString(),
    },
  ]);
}
