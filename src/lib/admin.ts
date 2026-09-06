import {
  createId,
  getAdminEmails,
  readUsers,
  writeUsers,
  type ProProfile,
  type ProStatus,
} from "@/lib/auth";

export type QuoteBasketItem = {
  id: string;
  name: string;
  kind: "material" | "pro";
};

export type QuoteRequest = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  items: QuoteBasketItem[];
  status: "new" | "contacted" | "closed";
  createdAt: string;
};

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

export function submitQuoteRequest(input: {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  items: QuoteBasketItem[];
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

export function updateQuoteStatus(
  id: string,
  status: QuoteRequest["status"],
) {
  const all = readQuoteRequests();
  const next = all.map((request) =>
    request.id === id ? { ...request, status } : request,
  );
  writeQuoteRequests(next);
  return next;
}

export function listProProfiles(): ProProfile[] {
  return readUsers()
    .map((user) => user.profile)
    .filter((profile): profile is ProProfile => profile.role === "pro");
}

export function setProStatus(proId: string, status: ProStatus) {
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

export function ensureDemoAdmin() {
  if (typeof window === "undefined") return;
  const adminEmail = getAdminEmails()[0];
  const users = readUsers();
  const index = users.findIndex(
    (user) => user.profile.email.toLowerCase() === adminEmail,
  );

  if (index >= 0) {
    // Keep demo password reliable for local testing.
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

export function ensureDemoClient() {
  if (typeof window === "undefined") return;
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
          users[index].profile.role === "client"
            ? users[index].profile.fullName || "Demo Client"
            : "Demo Client",
        email: DEMO_CLIENT_EMAIL,
        phone:
          users[index].profile.role === "client"
            ? users[index].profile.phone || "08000000000"
            : "08000000000",
        city:
          users[index].profile.role === "client"
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

export function ensureDemoAccounts() {
  ensureDemoAdmin();
  ensureDemoClient();
}
