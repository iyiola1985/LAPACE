import { createId, readUsers, type UserProfile } from "@/lib/auth";
import {
  PENDING_PRO_MESSAGE,
  REJECTED_PRO_MESSAGE,
  UNVERIFIED_PRO_BLOCK,
} from "@/lib/access";
import { assertNoContactDetails } from "@/lib/contactGuard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type ConversationMode = "client_pro" | "pro_pro";

export type Conversation = {
  id: string;
  jobId?: string;
  workPostId?: string;
  mode: ConversationMode;
  clientId: string;
  proId: string;
  clientName: string;
  proName: string;
  lastMessage?: string;
  updatedAt: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

type ConversationRow = {
  id: string;
  job_id: string | null;
  work_post_id?: string | null;
  mode?: ConversationMode | null;
  client_id: string;
  pro_id: string;
  created_at: string;
  updated_at: string;
  client?: { full_name: string; company_name: string | null } | null;
  pro?: { full_name: string; company_name: string | null } | null;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

const CONV_KEY = "lapace-conversations";
const MSG_KEY = "lapace-messages";

function readLocalConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CONV_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Conversation[]).map((item) => ({
      ...item,
      mode: item.mode ?? "client_pro",
    }));
  } catch {
    return [];
  }
}

function writeLocalConversations(items: Conversation[]) {
  window.localStorage.setItem(CONV_KEY, JSON.stringify(items));
}

function readLocalMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MSG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function writeLocalMessages(items: ChatMessage[]) {
  window.localStorage.setItem(MSG_KEY, JSON.stringify(items));
}

function displayName(
  fullName: string,
  companyName?: string | null,
  fallback = "User",
) {
  return companyName || fullName || fallback;
}

function conversationFromRow(row: ConversationRow): Conversation {
  return {
    id: row.id,
    jobId: row.job_id ?? undefined,
    workPostId: row.work_post_id ?? undefined,
    mode: row.mode === "pro_pro" ? "pro_pro" : "client_pro",
    clientId: row.client_id,
    proId: row.pro_id,
    clientName: displayName(
      row.client?.full_name ?? "Client",
      row.mode === "pro_pro" ? row.client?.company_name : null,
    ),
    proName: displayName(
      row.pro?.full_name ?? "Pro",
      row.pro?.company_name,
      "Pro",
    ),
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

async function loadProfile(userId: string): Promise<UserProfile | null> {
  const local = readUsers().find((entry) => entry.profile.id === userId);
  if (local) return local.profile;

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;

  const role = data.role as UserProfile["role"];
  if (role === "pro") {
    return {
      role: "pro",
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      companyName: data.company_name ?? "",
      city: data.city,
      services: [],
      about: data.about ?? "",
      licenseNote: data.license_note ?? "",
      status: data.pro_status ?? "pending",
      createdAt: data.created_at,
    };
  }
  if (role === "admin") {
    return {
      role: "admin",
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      createdAt: data.created_at,
    };
  }
  return {
    role: "client",
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    city: data.city,
    createdAt: data.created_at,
  };
}

async function assertCanOpenConversation(input: {
  clientId: string;
  proId: string;
  mode: ConversationMode;
  senderId: string;
}) {
  const [clientProfile, proProfile, sender] = await Promise.all([
    loadProfile(input.clientId),
    loadProfile(input.proId),
    loadProfile(input.senderId),
  ]);

  if (!proProfile || proProfile.role !== "pro") {
    throw new Error("Messages require a registered pro company.");
  }
  if (proProfile.status === "pending") throw new Error(PENDING_PRO_MESSAGE);
  if (proProfile.status === "rejected") throw new Error(REJECTED_PRO_MESSAGE);
  if (proProfile.status !== "verified") throw new Error(UNVERIFIED_PRO_BLOCK);

  if (input.mode === "pro_pro") {
    if (!clientProfile || clientProfile.role !== "pro") {
      throw new Error("Pro-to-pro chats require two verified companies.");
    }
    if (clientProfile.status !== "verified") {
      throw new Error(UNVERIFIED_PRO_BLOCK);
    }
  } else if (!clientProfile || clientProfile.role !== "client") {
    throw new Error("Client–pro chats require a client account.");
  }

  if (sender?.role === "pro" && sender.status !== "verified") {
    if (sender.status === "pending") throw new Error(PENDING_PRO_MESSAGE);
    if (sender.status === "rejected") throw new Error(REJECTED_PRO_MESSAGE);
    throw new Error(UNVERIFIED_PRO_BLOCK);
  }
}

export async function listConversationsForUser(
  userId: string,
  includeAll = false,
): Promise<Conversation[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const messages = readLocalMessages();
    return readLocalConversations()
      .filter(
        (item) =>
          includeAll || item.clientId === userId || item.proId === userId,
      )
      .map((item) => {
        const last = messages
          .filter((message) => message.conversationId === item.id)
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
        return {
          ...item,
          lastMessage: last?.body,
          updatedAt: last?.createdAt ?? item.updatedAt,
        };
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  let query = supabase
    .from("conversations")
    .select(
      "*, client:profiles!conversations_client_id_fkey(full_name, company_name), pro:profiles!conversations_pro_id_fkey(full_name, company_name)",
    );

  if (!includeAll) {
    query = query.or(`client_id.eq.${userId},pro_id.eq.${userId}`);
  }

  const { data, error } = await query.order("updated_at", {
    ascending: false,
  });

  if (error) throw new Error(error.message);

  const conversations =
    (data as ConversationRow[] | null)?.map(conversationFromRow) ?? [];

  const withPreview = await Promise.all(
    conversations.map(async (conversation) => {
      const { data: latest } = await supabase
        .from("messages")
        .select("body, created_at")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        ...conversation,
        lastMessage: latest?.body,
        updatedAt: latest?.created_at ?? conversation.updatedAt,
      };
    }),
  );

  return withPreview.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getConversation(
  id: string,
): Promise<Conversation | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readLocalConversations().find((item) => item.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(
      "*, client:profiles!conversations_client_id_fkey(full_name, company_name), pro:profiles!conversations_pro_id_fkey(full_name, company_name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return conversationFromRow(data as ConversationRow);
}

export async function listMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readLocalMessages()
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (
    (data as MessageRow[] | null)?.map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      body: row.body,
      createdAt: row.created_at,
    })) ?? []
  );
}

export async function openConversation(input: {
  clientId: string;
  clientName: string;
  proId: string;
  proName: string;
  jobId?: string;
  workPostId?: string;
  mode?: ConversationMode;
  initialMessage?: string;
  senderId: string;
}): Promise<Conversation> {
  const mode: ConversationMode = input.mode ?? "client_pro";
  await assertCanOpenConversation({
    clientId: input.clientId,
    proId: input.proId,
    mode,
    senderId: input.senderId,
  });

  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    const existing = readLocalConversations().find((item) => {
      const samePair =
        mode === "pro_pro"
          ? (item.clientId === input.clientId && item.proId === input.proId) ||
            (item.clientId === input.proId && item.proId === input.clientId)
          : item.clientId === input.clientId && item.proId === input.proId;
      return (
        samePair &&
        (item.jobId ?? "") === (input.jobId ?? "") &&
        (item.workPostId ?? "") === (input.workPostId ?? "") &&
        (item.mode ?? "client_pro") === mode
      );
    });

    if (existing) {
      if (input.initialMessage) {
        await sendMessage({
          conversationId: existing.id,
          senderId: input.senderId,
          body: input.initialMessage,
        });
      }
      return existing;
    }

    const conversation: Conversation = {
      id: createId("conv"),
      jobId: input.jobId,
      workPostId: input.workPostId,
      mode,
      clientId: input.clientId,
      proId: input.proId,
      clientName: input.clientName,
      proName: input.proName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = readLocalConversations();
    all.unshift(conversation);
    writeLocalConversations(all);

    if (input.initialMessage) {
      await sendMessage({
        conversationId: conversation.id,
        senderId: input.senderId,
        body: input.initialMessage,
      });
    }

    return conversation;
  }

  const supabaseClient = supabase;

  async function findExistingConversation() {
    const select =
      "*, client:profiles!conversations_client_id_fkey(full_name, company_name), pro:profiles!conversations_pro_id_fkey(full_name, company_name)";

    if (mode === "pro_pro" && !input.jobId && !input.workPostId) {
      const { data, error } = await supabaseClient
        .from("conversations")
        .select(select)
        .eq("mode", "pro_pro")
        .is("job_id", null)
        .is("work_post_id", null)
        .or(
          `and(client_id.eq.${input.clientId},pro_id.eq.${input.proId}),and(client_id.eq.${input.proId},pro_id.eq.${input.clientId})`,
        )
        .maybeSingle();
      return { data, error };
    }

    let query = supabaseClient
      .from("conversations")
      .select(select)
      .eq("client_id", input.clientId)
      .eq("pro_id", input.proId);

    query = input.jobId
      ? query.eq("job_id", input.jobId)
      : query.is("job_id", null);

    query = input.workPostId
      ? query.eq("work_post_id", input.workPostId)
      : query.is("work_post_id", null);

    return query.maybeSingle();
  }

  const { data: existing, error: lookupError } =
    await findExistingConversation();
  if (lookupError) {
    throw new Error(lookupError.message);
  }

  let conversation: Conversation;
  if (existing) {
    conversation = conversationFromRow(existing as ConversationRow);
  } else {
    const { data, error } = await supabaseClient
      .from("conversations")
      .insert({
        client_id: input.clientId,
        pro_id: input.proId,
        job_id: input.jobId ?? null,
        work_post_id: input.workPostId ?? null,
        mode,
      })
      .select(
        "*, client:profiles!conversations_client_id_fkey(full_name, company_name), pro:profiles!conversations_pro_id_fkey(full_name, company_name)",
      )
      .single();

    if (error?.code === "23505") {
      const { data: concurrent, error: retryError } =
        await findExistingConversation();
      if (retryError || !concurrent) {
        throw new Error(
          retryError?.message ?? "Could not reopen the conversation.",
        );
      }
      conversation = conversationFromRow(concurrent as ConversationRow);
    } else if (error || !data) {
      throw new Error(error?.message ?? "Could not start conversation.");
    } else {
      conversation = conversationFromRow(data as ConversationRow);
    }
  }

  if (input.initialMessage) {
    await sendMessage({
      conversationId: conversation.id,
      senderId: input.senderId,
      body: input.initialMessage,
    });
  }

  return conversation;
}

export async function sendMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<ChatMessage> {
  const body = input.body.trim();
  if (!body) throw new Error("Message cannot be empty.");
  assertNoContactDetails(body);

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const message: ChatMessage = {
      id: createId("msg"),
      conversationId: input.conversationId,
      senderId: input.senderId,
      body,
      createdAt: new Date().toISOString(),
    };
    const messages = readLocalMessages();
    messages.push(message);
    writeLocalMessages(messages);

    const conversations = readLocalConversations().map((item) =>
      item.id === input.conversationId
        ? { ...item, updatedAt: message.createdAt, lastMessage: body }
        : item,
    );
    writeLocalConversations(conversations);
    return message;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      body,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not send message.");
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.conversationId);

  const row = data as MessageRow;
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export function resolveParticipantName(
  conversation: Conversation,
  userId: string,
) {
  if (userId === conversation.clientId) return conversation.clientName;
  if (userId === conversation.proId) return conversation.proName;
  const user = readUsers().find((entry) => entry.profile.id === userId);
  return user?.profile.fullName ?? "User";
}
