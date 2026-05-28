import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { categories, estimateReadingTime, slugify } from "@/lib/posts";

export const Route = createFileRoute("/blog/novo")({
  component: NewPost,
  head: () => ({ meta: [{ title: "Novo post · GI UFPR" }] }),
});

function NewPost() {
  const { user, profile, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>(categories[0]);
  const [publishDate, setPublishDate] = useState<string>(() => {
    const d = new Date();
    const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tz.toISOString().slice(0, 10);
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/blog" });
  }, [loading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !content.trim()) return toast.error("Título e conteúdo são obrigatórios.");
    setSaving(true);
    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const { error } = await supabase.from("posts").insert({
      slug,
      title: title.trim(),
      excerpt: excerpt.trim() || content.slice(0, 160),
      content: content.trim(),
      category,
      author_id: user.id,
      author_name: profile?.display_name || user.email?.split("@")[0] || "Autor",
      reading_time: estimateReadingTime(content),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Post publicado!");
    navigate({ to: "/blog/$slug", params: { slug } });
  };

  if (loading || !user || !isAdmin) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="text-3xl font-bold text-foreground">Novo post</h1>
      <p className="mt-2 text-sm text-muted-foreground">Compartilhe uma nova publicação no blog do projeto.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required
            className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Resumo (opcional)</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} maxLength={280}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Conteúdo</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14} required
            placeholder="Use duas quebras de linha para separar parágrafos."
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving}
            className="h-11 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {saving ? "Publicando..." : "Publicar"}
          </button>
          <button type="button" onClick={() => navigate({ to: "/blog" })}
            className="h-11 rounded-md border border-border px-6 text-sm font-medium hover:bg-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
