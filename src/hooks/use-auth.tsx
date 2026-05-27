import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
};

export type AppRole = "user" | "admin" | "super_admin";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  roleLoading: boolean;
  refreshProfile: () => Promise<void>;
  refreshRole: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function rank(r: AppRole) {
  return r === "super_admin" ? 3 : r === "admin" ? 2 : 1;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole>("user");
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, bio")
      .eq("id", userId)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  };

  const loadRole = async (userId: string) => {
    setRoleLoading(true);
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (data ?? []).map((r) => r.role as AppRole);
    if (roles.length === 0) {
      setRole("user");
    } else {
      const highest = roles.reduce((a, b) => (rank(b) > rank(a) ? b : a), "user" as AppRole);
      setRole(highest);
    }
    setRoleLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setTimeout(() => { loadProfile(s.user.id); loadRole(s.user.id); }, 0);
      } else {
        setProfile(null);
        setRole("user");
        setRoleLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadProfile(data.session.user.id);
        loadRole(data.session.user.id);
      } else {
        setRoleLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    role,
    isAdmin: role === "admin" || role === "super_admin",
    isSuperAdmin: role === "super_admin",
    loading,
    roleLoading,
    refreshProfile: async () => { if (session?.user) await loadProfile(session.user.id); },
    refreshRole: async () => { if (session?.user) await loadRole(session.user.id); },
    signOut: async () => { await supabase.auth.signOut(); },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
