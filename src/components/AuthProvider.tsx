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
  isAdminUser,
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
import { ensureDemoJobs } from "@/lib/jobs";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { profileFromRow } from "@/lib/supabase/mappers";
import type { ProfileRow } from "@/lib/supabase/types";

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

type AuthResult = { ok: true } | { ok: false; error: string };
type LoginResult =
  | { ok: true; profile: UserProfile }
  | { ok: false; error: string };

type AuthContextValue = {
  user: UserProfile | null;
  ready: boolean;
  isAdmin: boolean;
  usingSupabase: boolean;
  registerClient: (input: RegisterClientInput) => Promise<AuthResult>;
  registerPro: (input: RegisterProInput) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<AuthResult>;
  dashboardPath: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfileById(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return profileFromRow(data as ProfileRow);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const usingSupabase = isSupabaseConfigured();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function bootstrap() {
      if (!usingSupabase) {
        ensureDemoAccounts();
        ensureDemoJobs();
        const email = readSessionEmail();
        if (email) {
          const stored = findUserByEmail(email);
          if (stored) {
            setUser(stored.profile);
          } else {
            writeSessionEmail(null);
          }
        }
        if (!cancelled) setReady(true);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (!cancelled) setReady(true);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user && !cancelled) {
        const profile = await fetchProfileById(session.user.id);
        if (profile && !cancelled) setUser(profile);
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        if (!nextSession?.user) {
          if (!cancelled) setUser(null);
          return;
        }
        const profile = await fetchProfileById(nextSession.user.id);
        if (!cancelled) setUser(profile);
      });

      unsubscribe = () => subscription.unsubscribe();
      if (!cancelled) setReady(true);
    }

    void bootstrap();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [usingSupabase]);

  const registerClient = useCallback(
    async (input: RegisterClientInput): Promise<AuthResult> => {
      const email = input.email.trim().toLowerCase();

      if (usingSupabase) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          return { ok: false, error: "Supabase is not configured." };
        }

        const signupRole = isAdminEmail(email) ? "admin" : "client";
        const { data, error } = await supabase.auth.signUp({
          email,
          password: input.password,
          options: {
            data: {
              role: signupRole,
              full_name: input.fullName.trim(),
              phone: input.phone.trim(),
              city: input.city.trim(),
            },
          },
        });

        if (error) return { ok: false, error: error.message };
        if (!data.user) {
          return { ok: false, error: "Could not create account." };
        }

        // Ensure profile fields even if trigger already ran.
        await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            role: signupRole,
            full_name: input.fullName.trim(),
            email,
            phone: input.phone.trim(),
            city: input.city.trim(),
          });

        const profile = await fetchProfileById(data.user.id);
        if (profile) setUser(profile);
        return { ok: true };
      }

      if (findUserByEmail(email)) {
        return {
          ok: false,
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
      return { ok: true };
    },
    [usingSupabase],
  );

  const registerPro = useCallback(
    async (input: RegisterProInput): Promise<AuthResult> => {
      const email = input.email.trim().toLowerCase();

      if (usingSupabase) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          return { ok: false, error: "Supabase is not configured." };
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password: input.password,
          options: {
            data: {
              role: "pro",
              full_name: input.fullName.trim(),
              phone: input.phone.trim(),
              city: input.city.trim(),
              company_name: input.companyName.trim(),
              services: input.services,
              about: input.about.trim(),
              license_note: input.licenseNote.trim(),
            },
          },
        });

        if (error) return { ok: false, error: error.message };
        if (!data.user) {
          return { ok: false, error: "Could not create pro account." };
        }

        await supabase.from("profiles").upsert({
          id: data.user.id,
          role: "pro",
          full_name: input.fullName.trim(),
          email,
          phone: input.phone.trim(),
          city: input.city.trim(),
          company_name: input.companyName.trim(),
          services: input.services,
          about: input.about.trim(),
          license_note: input.licenseNote.trim(),
          pro_status: "pending",
        });

        const profile = await fetchProfileById(data.user.id);
        if (profile) setUser(profile);
        return { ok: true };
      }

      if (findUserByEmail(email)) {
        return {
          ok: false,
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
      return { ok: true };
    },
    [usingSupabase],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      if (usingSupabase) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          return { ok: false, error: "Supabase is not configured." };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error || !data.user) {
          return { ok: false, error: "Invalid email or password." };
        }

        const profile = await fetchProfileById(data.user.id);
        if (!profile) {
          return {
            ok: false,
            error: "Account profile is missing. Contact Lapace support.",
          };
        }

        setUser(profile);
        return { ok: true, profile };
      }

      ensureDemoAccounts();
      const stored = findUserByEmail(email);
      if (!stored || stored.password !== password) {
        return { ok: false, error: "Invalid email or password." };
      }
      writeSessionEmail(stored.profile.email);
      setUser(stored.profile);
      return { ok: true, profile: stored.profile };
    },
    [usingSupabase],
  );

  const logout = useCallback(async () => {
    if (usingSupabase) {
      const supabase = getSupabaseBrowserClient();
      await supabase?.auth.signOut();
    }
    writeSessionEmail(null);
    setUser(null);
  }, [usingSupabase]);

  const updateAvatar = useCallback(
    async (avatarUrl: string): Promise<AuthResult> => {
      if (usingSupabase) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase || !user) {
          return { ok: false, error: "You must be logged in." };
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) return { ok: false, error: error.message };

        const updated = { ...user, avatarUrl } as UserProfile;
        setUser(updated);
        return { ok: true };
      }

      const email = readSessionEmail();
      if (!email) {
        return { ok: false, error: "You must be logged in." };
      }

      const users = readUsers();
      const index = users.findIndex(
        (entry) => entry.profile.email.toLowerCase() === email.toLowerCase(),
      );
      if (index < 0) {
        return { ok: false, error: "Account not found." };
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
      return { ok: true };
    },
    [usingSupabase, user],
  );

  const value = useMemo(
    () => ({
      user,
      ready,
      isAdmin: isAdminUser(user),
      usingSupabase,
      registerClient,
      registerPro,
      login,
      logout,
      updateAvatar,
      dashboardPath: user ? dashboardPathFor(user) : null,
    }),
    [
      user,
      ready,
      usingSupabase,
      registerClient,
      registerPro,
      login,
      logout,
      updateAvatar,
    ],
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
