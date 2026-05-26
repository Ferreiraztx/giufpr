import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { UserAvatar } from "@/components/site/UserAvatar";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
  head: () => ({ meta: [{ title: "Meu perfil · GI UFPR" }] }),
});

function PerfilPage() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  if (loading || !user) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-muted-foreground">Carregando...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || user.email?.split("@")[0] || "Usuário",
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success("Perfil atualizado!");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground">Meu perfil</h1>

      <div className="mt-8 flex items-center gap-4">
        <UserAvatar name={displayName} avatarUrl={avatarUrl} size={64} />
        <div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome de exibição</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">URL da foto (opcional)</label>
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..."
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Bio (opcional)</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={300}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving}
            className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="h-10 rounded-md border border-border px-5 text-sm font-medium hover:bg-secondary">
            Sair
          </button>
        </div>
      </form>
    </div>
  );
}
