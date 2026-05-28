import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, User, Pencil, Trash2 } from "lucide-react";
import { getPostBySlug, formatDate, type Post } from "../lib/posts";
import { Comments } from "@/components/site/Comments";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog/$slug")({
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostBySlug(slug).then((p) => {
      if (!p) throw notFound();
      setPost(p);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-16 text-muted-foreground">Carregando...</div>;
  if (!post) return <div className="mx-auto max-w-3xl px-4 py-16">Post não encontrado.</div>;

  const canEdit = isSuperAdmin || (user?.id && post.author_id === user.id);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) return toast.error(error.message);
    toast.success("Post excluído");
    navigate({ to: "/blog" });
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="flex items-center justify-between">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar ao blog
        </Link>
        {canEdit && (
          <div className="flex gap-2">
            <Link to="/blog/$slug/editar" params={{ slug: post.slug }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary">
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Link>
            <button onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </button>
          </div>
        )}
      </div>

      <span className="mt-6 inline-flex rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
        {post.category}
      </span>
      <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground md:text-4xl">{post.title}</h1>

      <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author_name}</span>
        <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(post.created_at)}</span>
        <span className="inline-flex items-center gap-1.5" title="Tempo estimado de leitura"><Clock className="h-4 w-4" /> {post.reading_time} de leitura</span>
      </div>

      <div className="my-8 h-px w-full bg-border" />

      <div className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        {post.content.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <Comments postSlug={post.slug} />
    </article>
  );
}
