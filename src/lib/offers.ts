import {
  createId,
  readUsers,
  type UserProfile,
} from "@/lib/auth";
import { assertVerifiedPro } from "@/lib/access";
import { assertNoContactDetails } from "@/lib/contactGuard";
import { getJob, updateJobStatus } from "@/lib/jobs";
import { openConversation } from "@/lib/messages";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getWorkPost,
  updateWorkPostStatus,
} from "@/lib/workPosts";

export type OfferStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "withdrawn"
  | "completed"
  | "cancelled";

export type DealStatus = "active" | "completed" | "cancelled";

export type MarketplaceOffer = {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromName: string;
  toName: string;
  jobId?: string;
  workPostId?: string;
  amountMin?: number;
  amountMax?: number;
  currency: string;
  timeline: string;
  notes: string;
  status: OfferStatus;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
};

export type MarketplaceDeal = {
  id: string;
  offerId: string;
  jobId?: string;
  workPostId?: string;
  partyAId: string;
  partyBId: string;
  partyAName: string;
  partyBName: string;
  amountMin?: number;
  amountMax?: number;
  currency: string;
  timeline: string;
  notes: string;
  status: DealStatus;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

type OfferRow = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  job_id: string | null;
  work_post_id: string | null;
  amount_min: number | null;
  amount_max: number | null;
  currency: string;
  timeline: string;
  notes: string;
  status: OfferStatus;
  conversation_id: string | null;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
  from_profile?: { full_name: string; company_name: string | null } | null;
  to_profile?: { full_name: string; company_name: string | null } | null;
};

type DealRow = {
  id: string;
  offer_id: string;
  job_id: string | null;
  work_post_id: string | null;
  party_a_id: string;
  party_b_id: string;
  amount_min: number | null;
  amount_max: number | null;
  currency: string;
  timeline: string;
  notes: string;
  status: DealStatus;
  conversation_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  party_a?: { full_name: string; company_name: string | null } | null;
  party_b?: { full_name: string; company_name: string | null } | null;
};

const OFFERS_KEY = "lapace-offers";
const DEALS_KEY = "lapace-deals";

function readLocalOffers(): MarketplaceOffer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OFFERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MarketplaceOffer[];
  } catch {
    return [];
  }
}

function writeLocalOffers(items: MarketplaceOffer[]) {
  window.localStorage.setItem(OFFERS_KEY, JSON.stringify(items));
}

function readLocalDeals(): MarketplaceDeal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DEALS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MarketplaceDeal[];
  } catch {
    return [];
  }
}

function writeLocalDeals(items: MarketplaceDeal[]) {
  window.localStorage.setItem(DEALS_KEY, JSON.stringify(items));
}

function partyName(
  fullName?: string | null,
  companyName?: string | null,
  fallback = "User",
) {
  return companyName || fullName || fallback;
}

function offerFromRow(row: OfferRow): MarketplaceOffer {
  const from = Array.isArray(row.from_profile)
    ? row.from_profile[0]
    : row.from_profile;
  const to = Array.isArray(row.to_profile) ? row.to_profile[0] : row.to_profile;
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    fromName: partyName(from?.full_name, from?.company_name, "Sender"),
    toName: partyName(to?.full_name, to?.company_name, "Recipient"),
    jobId: row.job_id ?? undefined,
    workPostId: row.work_post_id ?? undefined,
    amountMin: row.amount_min ?? undefined,
    amountMax: row.amount_max ?? undefined,
    currency: row.currency,
    timeline: row.timeline,
    notes: row.notes,
    status: row.status,
    conversationId: row.conversation_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    respondedAt: row.responded_at ?? undefined,
  };
}

function dealFromRow(row: DealRow): MarketplaceDeal {
  const a = Array.isArray(row.party_a) ? row.party_a[0] : row.party_a;
  const b = Array.isArray(row.party_b) ? row.party_b[0] : row.party_b;
  return {
    id: row.id,
    offerId: row.offer_id,
    jobId: row.job_id ?? undefined,
    workPostId: row.work_post_id ?? undefined,
    partyAId: row.party_a_id,
    partyBId: row.party_b_id,
    partyAName: partyName(a?.full_name, a?.company_name, "Party A"),
    partyBName: partyName(b?.full_name, b?.company_name, "Party B"),
    amountMin: row.amount_min ?? undefined,
    amountMax: row.amount_max ?? undefined,
    currency: row.currency,
    timeline: row.timeline,
    notes: row.notes,
    status: row.status,
    conversationId: row.conversation_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
  };
}

function formatMoney(offer: Pick<MarketplaceOffer, "amountMin" | "amountMax" | "currency">) {
  const currency = offer.currency || "NGN";
  if (offer.amountMin == null && offer.amountMax == null) return "Amount TBD";
  if (offer.amountMin != null && offer.amountMax != null) {
    return `${currency} ${offer.amountMin.toLocaleString()} – ${offer.amountMax.toLocaleString()}`;
  }
  const value = offer.amountMin ?? offer.amountMax ?? 0;
  return `${currency} ${value.toLocaleString()}`;
}

export function formatOfferAmount(offer: MarketplaceOffer) {
  return formatMoney(offer);
}

export function formatDealAmount(deal: MarketplaceDeal) {
  return formatMoney(deal);
}

async function resolveRecipientForJob(
  jobId: string,
  fromUser: UserProfile,
): Promise<{ toUserId: string; toName: string }> {
  const job = await getJob(jobId);
  if (!job) throw new Error("Job not found.");
  if (job.status !== "open") throw new Error("This job is no longer open.");
  if (fromUser.id === job.clientId) {
    throw new Error("Job owners receive offers; they do not send them on their own job.");
  }
  assertVerifiedPro(fromUser);
  return { toUserId: job.clientId, toName: job.clientName };
}

async function resolveRecipientForWorkPost(
  workPostId: string,
  fromUser: UserProfile,
): Promise<{ toUserId: string; toName: string }> {
  const workPost = await getWorkPost(workPostId);
  if (!workPost) throw new Error("Work post not found.");
  if (workPost.status !== "open") {
    throw new Error("This work post is no longer open.");
  }
  if (fromUser.id === workPost.proId) {
    throw new Error("You cannot offer on your own work post.");
  }
  if (fromUser.role === "pro") {
    assertVerifiedPro(fromUser);
  } else if (fromUser.role !== "client") {
    throw new Error("Only clients and verified pros can respond to work posts.");
  }
  return { toUserId: workPost.proId, toName: workPost.proName };
}

export async function createOffer(input: {
  fromUser: UserProfile;
  jobId?: string;
  workPostId?: string;
  amountMin?: number;
  amountMax?: number;
  currency?: string;
  timeline: string;
  notes: string;
}): Promise<MarketplaceOffer> {
  if (!input.jobId && !input.workPostId) {
    throw new Error("Offer must target a job or work post.");
  }
  if (input.jobId && input.workPostId) {
    throw new Error("Offer cannot target both a job and a work post.");
  }

  assertNoContactDetails(`${input.timeline} ${input.notes}`);

  const recipient = input.jobId
    ? await resolveRecipientForJob(input.jobId, input.fromUser)
    : await resolveRecipientForWorkPost(input.workPostId!, input.fromUser);

  const now = new Date().toISOString();
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    const offer: MarketplaceOffer = {
      id: createId("offer"),
      fromUserId: input.fromUser.id,
      toUserId: recipient.toUserId,
      fromName:
        input.fromUser.role === "pro"
          ? input.fromUser.companyName || input.fromUser.fullName
          : input.fromUser.fullName,
      toName: recipient.toName,
      jobId: input.jobId,
      workPostId: input.workPostId,
      amountMin: input.amountMin,
      amountMax: input.amountMax,
      currency: input.currency ?? "NGN",
      timeline: input.timeline.trim(),
      notes: input.notes.trim(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    const all = readLocalOffers();
    all.unshift(offer);
    writeLocalOffers(all);
    return offer;
  }

  const { data, error } = await supabase
    .from("offers")
    .insert({
      from_user_id: input.fromUser.id,
      to_user_id: recipient.toUserId,
      job_id: input.jobId ?? null,
      work_post_id: input.workPostId ?? null,
      amount_min: input.amountMin ?? null,
      amount_max: input.amountMax ?? null,
      currency: input.currency ?? "NGN",
      timeline: input.timeline.trim(),
      notes: input.notes.trim(),
      status: "pending",
    })
    .select(
      "*, from_profile:profiles!offers_from_user_id_fkey(full_name, company_name), to_profile:profiles!offers_to_user_id_fkey(full_name, company_name)",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create offer.");
  }

  return offerFromRow(data as OfferRow);
}

export async function listOffersForUser(
  userId: string,
  includeAll = false,
): Promise<MarketplaceOffer[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readLocalOffers()
      .filter(
        (offer) =>
          includeAll ||
          offer.fromUserId === userId ||
          offer.toUserId === userId,
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  let query = supabase
    .from("offers")
    .select(
      "*, from_profile:profiles!offers_from_user_id_fkey(full_name, company_name), to_profile:profiles!offers_to_user_id_fkey(full_name, company_name)",
    );

  if (!includeAll) {
    query = query.or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as OfferRow[] | null)?.map(offerFromRow) ?? [];
}

export async function listOffersForListing(input: {
  jobId?: string;
  workPostId?: string;
}): Promise<MarketplaceOffer[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readLocalOffers()
      .filter((offer) =>
        input.jobId
          ? offer.jobId === input.jobId
          : offer.workPostId === input.workPostId,
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  let query = supabase
    .from("offers")
    .select(
      "*, from_profile:profiles!offers_from_user_id_fkey(full_name, company_name), to_profile:profiles!offers_to_user_id_fkey(full_name, company_name)",
    );

  query = input.jobId
    ? query.eq("job_id", input.jobId)
    : query.eq("work_post_id", input.workPostId!);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as OfferRow[] | null)?.map(offerFromRow) ?? [];
}

export async function listDealsForUser(
  userId: string,
  includeAll = false,
): Promise<MarketplaceDeal[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readLocalDeals()
      .filter(
        (deal) =>
          includeAll || deal.partyAId === userId || deal.partyBId === userId,
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  let query = supabase
    .from("deals")
    .select(
      "*, party_a:profiles!deals_party_a_id_fkey(full_name, company_name), party_b:profiles!deals_party_b_id_fkey(full_name, company_name)",
    );

  if (!includeAll) {
    query = query.or(`party_a_id.eq.${userId},party_b_id.eq.${userId}`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DealRow[] | null)?.map(dealFromRow) ?? [];
}

async function declineSiblingOffers(
  offer: MarketplaceOffer,
  exceptId: string,
) {
  const siblings = await listOffersForListing({
    jobId: offer.jobId,
    workPostId: offer.workPostId,
  });
  const pending = siblings.filter(
    (item) => item.id !== exceptId && item.status === "pending",
  );

  const supabase = getSupabaseBrowserClient();
  const now = new Date().toISOString();

  if (!supabase) {
    const all = readLocalOffers().map((item) =>
      pending.some((pendingOffer) => pendingOffer.id === item.id)
        ? {
            ...item,
            status: "declined" as const,
            updatedAt: now,
            respondedAt: now,
          }
        : item,
    );
    writeLocalOffers(all);
    return;
  }

  for (const sibling of pending) {
    await supabase
      .from("offers")
      .update({
        status: "declined",
        updated_at: now,
        responded_at: now,
      })
      .eq("id", sibling.id)
      .eq("status", "pending");
  }
}

export async function respondToOffer(input: {
  offerId: string;
  actor: UserProfile;
  action: "accept" | "decline" | "withdraw";
}): Promise<{ offer: MarketplaceOffer; deal?: MarketplaceDeal }> {
  const supabase = getSupabaseBrowserClient();
  const now = new Date().toISOString();

  let offer: MarketplaceOffer | undefined;

  if (!supabase) {
    const all = readLocalOffers();
    offer = all.find((item) => item.id === input.offerId);
  } else {
    const { data, error } = await supabase
      .from("offers")
      .select(
        "*, from_profile:profiles!offers_from_user_id_fkey(full_name, company_name), to_profile:profiles!offers_to_user_id_fkey(full_name, company_name)",
      )
      .eq("id", input.offerId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) offer = offerFromRow(data as OfferRow);
  }

  if (!offer) throw new Error("Offer not found.");
  if (offer.status !== "pending") {
    throw new Error("This offer is no longer pending.");
  }

  if (input.action === "withdraw") {
    if (offer.fromUserId !== input.actor.id) {
      throw new Error("Only the sender can withdraw an offer.");
    }
  } else if (offer.toUserId !== input.actor.id) {
    throw new Error("Only the recipient can accept or decline this offer.");
  }

  const nextStatus: OfferStatus =
    input.action === "accept"
      ? "accepted"
      : input.action === "decline"
        ? "declined"
        : "withdrawn";

  if (!supabase) {
    const all = readLocalOffers().map((item) =>
      item.id === offer!.id
        ? {
            ...item,
            status: nextStatus,
            updatedAt: now,
            respondedAt: now,
          }
        : item,
    );
    writeLocalOffers(all);
    offer = all.find((item) => item.id === input.offerId)!;
  } else {
    const { data, error } = await supabase
      .from("offers")
      .update({
        status: nextStatus,
        updated_at: now,
        responded_at: now,
      })
      .eq("id", offer.id)
      .select(
        "*, from_profile:profiles!offers_from_user_id_fkey(full_name, company_name), to_profile:profiles!offers_to_user_id_fkey(full_name, company_name)",
      )
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? "Could not update offer.");
    }
    offer = offerFromRow(data as OfferRow);
  }

  if (input.action !== "accept") {
    return { offer };
  }

  await declineSiblingOffers(offer, offer.id);

  let mode: "client_pro" | "pro_pro" = "client_pro";
  let clientId = offer.toUserId;
  let proId = offer.fromUserId;
  let clientName = offer.toName;
  let proName = offer.fromName;

  if (offer.workPostId) {
    const workPost = await getWorkPost(offer.workPostId);
    if (!workPost) throw new Error("Work post not found.");

    const ownerId = workPost.proId;
    const responderId =
      offer.fromUserId === ownerId ? offer.toUserId : offer.fromUserId;
    const responderIsPro = await isRemotePro(responderId);

    if (responderIsPro) {
      mode = "pro_pro";
      clientId = ownerId;
      proId = responderId;
      clientName = workPost.proName;
      proName =
        offer.fromUserId === responderId ? offer.fromName : offer.toName;
    } else {
      mode = "client_pro";
      clientId = responderId;
      proId = ownerId;
      clientName =
        offer.fromUserId === responderId ? offer.fromName : offer.toName;
      proName = workPost.proName;
    }

    await updateWorkPostStatus(offer.workPostId, "hired", responderId);
  } else if (offer.jobId) {
    mode = "client_pro";
    const job = await getJob(offer.jobId);
    if (!job) throw new Error("Job not found.");
    clientId = job.clientId;
    proId = offer.fromUserId;
    clientName = job.clientName;
    proName = offer.fromName;
    await updateJobStatus(offer.jobId, "hired", proId);
  }

  const conversation = await openConversation({
    clientId,
    clientName,
    proId,
    proName,
    jobId: offer.jobId,
    workPostId: offer.workPostId,
    mode,
    senderId: input.actor.id,
    initialMessage: `Offer accepted on Lapace. Amount: ${formatOfferAmount(offer)}. Timeline: ${offer.timeline || "TBD"}. Keep all conversation and updates on this chat.`,
  });
  const conversationId = conversation.id;

  const deal: MarketplaceDeal = {
    id: createId("deal"),
    offerId: offer.id,
    jobId: offer.jobId,
    workPostId: offer.workPostId,
    partyAId: offer.toUserId,
    partyBId: offer.fromUserId,
    partyAName: offer.toName,
    partyBName: offer.fromName,
    amountMin: offer.amountMin,
    amountMax: offer.amountMax,
    currency: offer.currency,
    timeline: offer.timeline,
    notes: offer.notes,
    status: "active",
    conversationId,
    createdAt: now,
    updatedAt: now,
  };

  if (!supabase) {
    const deals = readLocalDeals();
    deals.unshift(deal);
    writeLocalDeals(deals);

    const offers = readLocalOffers().map((item) =>
      item.id === offer!.id ? { ...item, conversationId } : item,
    );
    writeLocalOffers(offers);
    offer = { ...offer, conversationId };
    return { offer, deal };
  }

  const { data: dealRow, error: dealError } = await supabase
    .from("deals")
    .insert({
      offer_id: offer.id,
      job_id: offer.jobId ?? null,
      work_post_id: offer.workPostId ?? null,
      party_a_id: deal.partyAId,
      party_b_id: deal.partyBId,
      amount_min: deal.amountMin ?? null,
      amount_max: deal.amountMax ?? null,
      currency: deal.currency,
      timeline: deal.timeline,
      notes: deal.notes,
      status: "active",
      conversation_id: conversationId,
    })
    .select(
      "*, party_a:profiles!deals_party_a_id_fkey(full_name, company_name), party_b:profiles!deals_party_b_id_fkey(full_name, company_name)",
    )
    .single();

  if (dealError || !dealRow) {
    throw new Error(dealError?.message ?? "Could not create deal.");
  }

  await supabase
    .from("offers")
    .update({ conversation_id: conversationId, updated_at: now })
    .eq("id", offer.id);

  return {
    offer: { ...offer, conversationId },
    deal: dealFromRow(dealRow as DealRow),
  };
}

async function isRemotePro(userId: string): Promise<boolean> {
  const local = readUsers().find((u) => u.profile.id === userId)?.profile;
  if (local?.role === "pro") return local.status === "verified";

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  const { data } = await supabase
    .from("profiles")
    .select("role, pro_status")
    .eq("id", userId)
    .maybeSingle();
  return data?.role === "pro" && data.pro_status === "verified";
}

export async function updateDealStatus(
  dealId: string,
  status: DealStatus,
  actor: UserProfile,
): Promise<MarketplaceDeal> {
  const supabase = getSupabaseBrowserClient();
  const now = new Date().toISOString();

  if (!supabase) {
    const all = readLocalDeals();
    const index = all.findIndex((deal) => deal.id === dealId);
    if (index < 0) throw new Error("Deal not found.");
    const deal = all[index];
    if (deal.partyAId !== actor.id && deal.partyBId !== actor.id) {
      throw new Error("Only deal participants can update status.");
    }
    all[index] = {
      ...deal,
      status,
      updatedAt: now,
      completedAt: status === "completed" ? now : deal.completedAt,
    };
    writeLocalDeals(all);
    return all[index];
  }

  const { data: existing, error: lookupError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (!existing) throw new Error("Deal not found.");
  if (
    existing.party_a_id !== actor.id &&
    existing.party_b_id !== actor.id &&
    actor.role !== "admin"
  ) {
    throw new Error("Only deal participants can update status.");
  }

  const { data, error } = await supabase
    .from("deals")
    .update({
      status,
      updated_at: now,
      completed_at: status === "completed" ? now : null,
    })
    .eq("id", dealId)
    .select(
      "*, party_a:profiles!deals_party_a_id_fkey(full_name, company_name), party_b:profiles!deals_party_b_id_fkey(full_name, company_name)",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update deal.");
  }

  const deal = dealFromRow(data as DealRow);
  if (deal.jobId && status === "completed") {
    await updateJobStatus(deal.jobId, "completed");
  }
  if (deal.workPostId && status === "completed") {
    await updateWorkPostStatus(deal.workPostId, "completed");
  }
  return deal;
}
