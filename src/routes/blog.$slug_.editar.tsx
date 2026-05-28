import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { categories, estimateReadingTime, getPostBySlug, type Post } from "@/lib/posts";

export const Route = createFileRoute("/blog/$slug_/editar")({
  component: EditPost,
  head: () => ({ meta: [{ title: "Editar post · GI UFPR" }] }),
});

function EditPost() {
  const { slug } = Route.useParams();
  const { user, isSuperAdmin, loading, roleLoading } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>(categories[0]);
  const [publishDate, setPublishDate] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getPostBySlug(slug).then((p) => {
      if (p) {
        setPost(p);
        setTitle(p.title);
        setExcerpt(p.excerpt);
        setContent(p.content);
        setCategory(p.category);
        const d = new Date(p.created_at);
        const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        setPublishDate(tz.toISOString().slice(0, 10));
      }
    }).finally(() => setFetching(false));
  }, [slug]);

  useEffect(() => {
    if (loading || fetching || roleLoading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (post && !isSuperAdmin && post.author_id !== user.id) {
      toast.error("Você não tem permissão para editar este post.");
      navigate({ to: "/blog/$slug", params: { slug } });
    }
  }, [loading, roleLoading, fetching, user, post, isSuperAdmin, navigate, slug]);

  if (loading || fetching || roleLoading || !post) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-muted-foreground">Carregando...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const createdAt = new Date(`${publishDate}T12:00:00-03:00`).toISOString();
    const { error } = await supabase.from("posts").update({
      title: title.trim(),
      excerpt: excerpt.trim() || content.slice(0, 160),
      content: content.trim(),
      category,
      reading_time: estimateReadingTime(content),
      created_at: createdAt,
    }).eq("id", post.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Post atualizado!");
    navigate({ to: "/blog/$slug", params: { slug: post.slug } });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="text-3xl font-bold text-foreground">Editar post</h1>
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
          <label className="block text-sm font-medium">Data de publicação</label>
          <input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} required
            className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Resumo</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} maxLength={280}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Conteúdo</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14} required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving}
            className="h-11 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          <button type="button" onClick={() => navigate({ to: "/blog/$slug", params: { slug: post.slug } })}
            className="h-11 rounded-md border border-border px-6 text-sm font-medium hover:bg-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
