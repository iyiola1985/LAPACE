export type UserRole = "client" | "pro";

export type ProStatus = "pending" | "verified" | "rejected";

export type ProService =
  | "Residential"
  | "Commercial"
  | "Repair"
  | "New Install"
  | "Solar Ready";

export type ClientProfile = {
  role: "client";
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  avatarUrl?: string;
  createdAt: string;
};

export type ProProfile = {
  role: "pro";
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  city: string;
  services: ProService[];
  about: string;
  licenseNote: string;
  status: ProStatus;
  avatarUrl?: string;
  createdAt: string;
};

export type UserProfile = ClientProfile | ProProfile;

export type StoredUser = {
  profile: UserProfile;
  password: string;
};

export const PRO_SERVICES: ProService[] = [
  "Residential",
  "Commercial",
  "Repair",
  "New Install",
  "Solar Ready",
];

export const USERS_KEY = "lapace-users";
export const SESSION_KEY = "lapace-session";

export function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

export function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function readSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}

export function writeSessionEmail(email: string | null) {
  if (email) {
    window.localStorage.setItem(SESSION_KEY, email);
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

export function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return readUsers().find(
    (user) => user.profile.email.toLowerCase() === normalized,
  );
}

export function dashboardPathFor(profile: UserProfile) {
  return profile.role === "pro" ? "/pro/dashboard" : "/dashboard";
}
