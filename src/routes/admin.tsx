import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Shield, ShieldCheck, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { UserAvatar } from "@/components/site/UserAvatar";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Administração · GI UFPR" }] }),
});

type UserRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: AppRole;
};

function rolePriority(r: AppRole) {
  return r === "super_admin" ? 3 : r === "admin" ? 2 : 1;
}

function roleLabel(r: AppRole) {
  return r === "super_admin" ? "Super Admin" : r === "admin" ? "Admin" : "Usuário";
}

function AdminPage() {
  const { user, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isSuperAdmin)) navigate({ to: "/" });
  }, [loading, user, isSuperAdmin, navigate]);

  const loadUsers = async () => {
    setFetching(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const byUser = new Map<string, AppRole>();
    (roles ?? []).forEach((r: { user_id: string; role: AppRole }) => {
      const cur = byUser.get(r.user_id);
      if (!cur || rolePriority(r.role) > rolePriority(cur)) byUser.set(r.user_id, r.role);
    });
    const rows: UserRow[] = (profiles ?? []).map((p) => ({
      id: p.id,
      display_name: p.display_name || "Sem nome",
      avatar_url: p.avatar_url,
      role: byUser.get(p.id) ?? "user",
    }));
    rows.sort((a, b) => rolePriority(b.role) - rolePriority(a.role) || a.display_name.localeCompare(b.display_name));
    setUsers(rows);
    setFetching(false);
  };

  useEffect(() => { if (isSuperAdmin) loadUsers(); }, [isSuperAdmin]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return users.filter((u) => u.display_name.toLowerCase().includes(s));
  }, [q, users]);

  const setRole = async (targetUser: UserRow, newRole: AppRole) => {
    if (targetUser.role === newRole) return;
    if (targetUser.id === user?.id && newRole !== "super_admin") {
      if (!confirm("Você está alterando sua própria função e perderá acesso ao painel. Continuar?")) return;
    } else {
      if (!confirm(`Definir ${targetUser.display_name} como ${roleLabel(newRole)}?`)) return;
    }
    // Remove existing roles for this user, then insert the new one
    const del = await supabase.from("user_roles").delete().eq("user_id", targetUser.id);
    if (del.error) return toast.error(del.error.message);
    const ins = await supabase.from("user_roles").insert({ user_id: targetUser.id, role: newRole });
    if (ins.error) return toast.error(ins.error.message);
    toast.success("Função atualizada.");
    loadUsers();
  };

  if (loading || !user || !isSuperAdmin) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administração</h1>
          <p className="text-sm text-muted-foreground">Gerencie funções e permissões dos usuários.</p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar usuário por nome..."
            className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <button onClick={loadUsers} className="h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-secondary">
          Atualizar
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {fetching ? (
          <p className="p-8 text-center text-muted-foreground">Carregando usuários...</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">Nenhum usuário encontrado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <UserAvatar name={u.display_name} avatarUrl={u.avatar_url} size={40} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {u.display_name}
                      {u.id === user.id && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                    </p>
                    <span className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      u.role === "super_admin" ? "bg-primary text-primary-foreground"
                      : u.role === "admin" ? "bg-accent/30 text-accent-foreground"
                      : "bg-secondary text-foreground/70"
                    }`}>
                      {u.role === "super_admin" ? <ShieldCheck className="h-3 w-3" />
                        : u.role === "admin" ? <Shield className="h-3 w-3" />
                        : <UserIcon className="h-3 w-3" />}
                      {roleLabel(u.role)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => setRole(u, e.target.value as AppRole)}
                    className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  {u.role !== "user" && (
                    <button onClick={() => setRole(u, "user")}
                      className="h-9 rounded-md border border-destructive/40 px-3 text-xs font-medium text-destructive hover:bg-destructive/10">
                      Revogar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
