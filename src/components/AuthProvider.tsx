"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createId,
  dashboardPathFor,
  findUserByEmail,
  isAdminEmail,
  readSessionEmail,
  readUsers,
  writeSessionEmail,
  writeUsers,
  type ClientProfile,
  type ProProfile,
  type ProService,
  type UserProfile,
} from "@/lib/auth";
import { ensureDemoAccounts } from "@/lib/admin";

type RegisterClientInput = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  password: string;
};

type RegisterProInput = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  city: string;
  services: ProService[];
  about: string;
  licenseNote: string;
  password: string;
};

type AuthContextValue = {
  user: UserProfile | null;
  ready: boolean;
  isAdmin: boolean;
  registerClient: (
    input: RegisterClientInput,
  ) => { ok: true } | { ok: false; error: string };
  registerPro: (
    input: RegisterProInput,
  ) => { ok: true } | { ok: false; error: string };
  login: (
    email: string,
    password: string,
  ) => { ok: true; profile: UserProfile } | { ok: false; error: string };
  logout: () => void;
  updateAvatar: (
    avatarUrl: string,
  ) => { ok: true } | { ok: false; error: string };
  dashboardPath: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureDemoAccounts();
    const email = readSessionEmail();
    if (email) {
      const stored = findUserByEmail(email);
      if (stored) {
        setUser(stored.profile);
      } else {
        writeSessionEmail(null);
      }
    }
    setReady(true);
  }, []);

  const registerClient = useCallback((input: RegisterClientInput) => {
    const email = input.email.trim().toLowerCase();
    if (findUserByEmail(email)) {
      return {
        ok: false as const,
        error: "An account with this email already exists.",
      };
    }

    const profile: ClientProfile = {
      role: "client",
      id: createId("client"),
      fullName: input.fullName.trim(),
      email,
      phone: input.phone.trim(),
      city: input.city.trim(),
      createdAt: new Date().toISOString(),
    };

    const users = readUsers();
    users.push({ profile, password: input.password });
    writeUsers(users);
    writeSessionEmail(email);
    setUser(profile);
    return { ok: true as const };
  }, []);

  const registerPro = useCallback((input: RegisterProInput) => {
    const email = input.email.trim().toLowerCase();
    if (findUserByEmail(email)) {
      return {
        ok: false as const,
        error: "An account with this email already exists.",
      };
    }

    const profile: ProProfile = {
      role: "pro",
      id: createId("pro"),
      fullName: input.fullName.trim(),
      email,
      phone: input.phone.trim(),
      companyName: input.companyName.trim(),
      city: input.city.trim(),
      services: input.services,
      about: input.about.trim(),
      licenseNote: input.licenseNote.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const users = readUsers();
    users.push({ profile, password: input.password });
    writeUsers(users);
    writeSessionEmail(email);
    setUser(profile);
    return { ok: true as const };
  }, []);

  const login = useCallback((email: string, password: string) => {
    const stored = findUserByEmail(email);
    if (!stored || stored.password !== password) {
      return { ok: false as const, error: "Invalid email or password." };
    }
    writeSessionEmail(stored.profile.email);
    setUser(stored.profile);
    return { ok: true as const, profile: stored.profile };
  }, []);

  const logout = useCallback(() => {
    writeSessionEmail(null);
    setUser(null);
  }, []);

  const updateAvatar = useCallback((avatarUrl: string) => {
    const email = readSessionEmail();
    if (!email) {
      return { ok: false as const, error: "You must be logged in." };
    }

    const users = readUsers();
    const index = users.findIndex(
      (entry) => entry.profile.email.toLowerCase() === email.toLowerCase(),
    );
    if (index < 0) {
      return { ok: false as const, error: "Account not found." };
    }

    const updatedProfile = {
      ...users[index].profile,
      avatarUrl,
    } as UserProfile;

    users[index] = {
      ...users[index],
      profile: updatedProfile,
    };
    writeUsers(users);
    setUser(updatedProfile);
    return { ok: true as const };
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isAdmin: isAdminEmail(user?.email),
      registerClient,
      registerPro,
      login,
      logout,
      updateAvatar,
      dashboardPath: user ? dashboardPathFor(user) : null,
    }),
    [user, ready, registerClient, registerPro, login, logout, updateAvatar],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
