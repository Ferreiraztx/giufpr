import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Pencil, Trash2, Bold, Italic, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { UserAvatar } from "./UserAvatar";

type CommentRow = {
  id: string;
  post_slug: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

type ProfileLite = { id: string; display_name: string; avatar_url: string | null };

type CommentWithMeta = CommentRow & {
  profile: ProfileLite | null;
  likeCount: number;
  likedByMe: boolean;
};

const MAX_LEN = 2000;

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function renderContent(text: string) {
  // Render **bold**, *italic*, [text](url). Plain-text first (no HTML injection).
  const nodes: Array<string | JSX.Element> = [];
  let i = 0;
  let key = 0;
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > i) nodes.push(text.slice(i, m.index));
    if (m[2] !== undefined) nodes.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[3] !== undefined) nodes.push(<em key={key++}>{m[3]}</em>);
    else if (m[4] !== undefined && m[5] !== undefined)
      nodes.push(
        <a key={key++} href={m[5]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {m[4]}
        </a>,
      );
    i = m.index + m[0].length;
  }
  if (i < text.length) nodes.push(text.slice(i));
  return nodes.map((n, idx) => (typeof n === "string" ? <span key={idx}>{n}</span> : n));
}

export function Comments({ postSlug }: { postSlug: string }) {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<CommentWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);

  const load = useCallback(async () => {
    const { data: comments } = await supabase
      .from("comments")
      .select("*")
      .eq("post_slug", postSlug)
      .order("created_at", { ascending: false });

    const rows = (comments ?? []) as CommentRow[];
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const commentIds = rows.map((r) => r.id);

    const [profilesRes, likesRes] = await Promise.all([
      userIds.length
        ? supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds)
        : Promise.resolve({ data: [] as ProfileLite[] }),
      commentIds.length
        ? supabase.from("comment_likes").select("comment_id, user_id").in("comment_id", commentIds)
        : Promise.resolve({ data: [] as { comment_id: string; user_id: string }[] }),
    ]);

    const profMap = new Map<string, ProfileLite>(
      ((profilesRes.data as ProfileLite[]) ?? []).map((p) => [p.id, p]),
    );
    const likes = (likesRes.data ?? []) as { comment_id: string; user_id: string }[];
    const likeCount = new Map<string, number>();
    const likedByMe = new Set<string>();
    for (const l of likes) {
      likeCount.set(l.comment_id, (likeCount.get(l.comment_id) ?? 0) + 1);
      if (user && l.user_id === user.id) likedByMe.add(l.comment_id);
    }

    setItems(
      rows.map((r) => ({
        ...r,
        profile: profMap.get(r.user_id) ?? null,
        likeCount: likeCount.get(r.id) ?? 0,
        likedByMe: likedByMe.has(r.id),
      })),
    );
    setLoading(false);
  }, [postSlug, user]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime new-comment indicator
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${postSlug}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `post_slug=eq.${postSlug}` },
        (payload) => {
          const row = payload.new as CommentRow;
          if (row.user_id === user?.id) {
            load();
          } else {
            setNewCount((c) => c + 1);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [postSlug, user?.id, load]);

  const total = items.length;
  const topLevel = useMemo(() => items.filter((c) => !c.parent_id), [items]);
  const repliesOf = useCallback(
    (id: string) => items.filter((c) => c.parent_id === id).sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)),
    [items],
  );

  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <MessageCircle className="h-5 w-5" /> Comentários
          <span className="rounded-full bg-secondary px-2 py-0.5 text-sm font-medium text-foreground/80">{total}</span>
        </h2>
        {newCount > 0 && (
          <button
            onClick={() => { setNewCount(0); load(); }}
            className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/30"
          >
            {newCount} novo(s) — atualizar
          </button>
        )}
      </div>

      <div className="mt-6">
        {user ? (
          <CommentForm postSlug={postSlug} parentId={null} onPosted={load} currentName={profile?.display_name} currentAvatar={profile?.avatar_url} />
        ) : (
          <div className="rounded-lg border border-border bg-secondary/40 px-4 py-5 text-sm">
            <Link to="/login" className="font-semibold text-primary hover:underline">Faça login</Link>{" "}
            para comentar nesta publicação.
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando comentários...</p>
        ) : topLevel.length === 0 ? (
          <p className="text-sm text-muted-foreground">Seja o primeiro a comentar.</p>
        ) : (
          topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={repliesOf(c.id)}
              postSlug={postSlug}
              onChanged={load}
            />
          ))
        )}
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  replies,
  postSlug,
  onChanged,
}: {
  comment: CommentWithMeta;
  replies: CommentWithMeta[];
  postSlug: string;
  onChanged: () => void;
}) {
  const { user, profile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [editVal, setEditVal] = useState(comment.content);
  const mine = user?.id === comment.user_id;

  const toggleLike = async () => {
    if (!user) return toast.error("Faça login para curtir.");
    if (comment.likedByMe) {
      await supabase.from("comment_likes").delete().eq("comment_id", comment.id).eq("user_id", user.id);
    } else {
      await supabase.from("comment_likes").insert({ comment_id: comment.id, user_id: user.id });
    }
    onChanged();
  };

  const handleDelete = async () => {
    if (!confirm("Excluir este comentário?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", comment.id);
    if (error) return toast.error(error.message);
    toast.success("Comentário excluído.");
    onChanged();
  };

  const handleEdit = async () => {
    const v = editVal.trim();
    if (!v) return toast.error("Comentário vazio.");
    const { error } = await supabase.from("comments").update({ content: v }).eq("id", comment.id);
    if (error) return toast.error(error.message);
    setEditing(false);
    toast.success("Comentário atualizado.");
    onChanged();
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <UserAvatar name={comment.profile?.display_name} avatarUrl={comment.profile?.avatar_url} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-semibold text-foreground">{comment.profile?.display_name || "Usuário"}</p>
            <p className="text-xs text-muted-foreground">{formatWhen(comment.created_at)}{comment.updated_at !== comment.created_at && " · editado"}</p>
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <textarea value={editVal} maxLength={MAX_LEN} onChange={(e) => setEditVal(e.target.value)} rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <button onClick={handleEdit} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Salvar</button>
                <button onClick={() => { setEditing(false); setEditVal(comment.content); }} className="rounded-md border border-border px-3 py-1.5 text-xs">Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
              {renderContent(comment.content)}
            </div>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <button onClick={toggleLike} className={`inline-flex items-center gap-1 hover:text-foreground ${comment.likedByMe ? "text-primary" : ""}`}>
              <Heart className={`h-3.5 w-3.5 ${comment.likedByMe ? "fill-current" : ""}`} />
              {comment.likeCount}
            </button>
            {user && (
              <button onClick={() => setReplying((v) => !v)} className="hover:text-foreground">Responder</button>
            )}
            {mine && !editing && (
              <>
                <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 hover:text-foreground"><Pencil className="h-3.5 w-3.5" /> Editar</button>
                <button onClick={handleDelete} className="inline-flex items-center gap-1 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /> Excluir</button>
              </>
            )}
          </div>

          {replying && user && (
            <div className="mt-3">
              <CommentForm
                postSlug={postSlug}
                parentId={comment.id}
                onPosted={() => { setReplying(false); onChanged(); }}
                currentName={profile?.display_name}
                currentAvatar={profile?.avatar_url}
                compact
              />
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-4 space-y-3 border-l-2 border-border pl-4">
              {replies.map((r) => (
                <CommentItem key={r.id} comment={r} replies={[]} postSlug={postSlug} onChanged={onChanged} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentForm({
  postSlug,
  parentId,
  onPosted,
  currentName,
  currentAvatar,
  compact,
}: {
  postSlug: string;
  parentId: string | null;
  onPosted: () => void;
  currentName?: string | null;
  currentAvatar?: string | null;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const wrap = (prefix: string, suffix: string) => {
    const el = document.activeElement as HTMLTextAreaElement | null;
    if (!el || el.tagName !== "TEXTAREA") {
      setValue((v) => v + prefix + suffix);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + prefix + value.slice(start, end) + suffix + value.slice(end);
    setValue(next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const content = value.trim();
    if (!content) return toast.error("Comentário não pode ficar vazio.");
    if (content.length > MAX_LEN) return toast.error("Comentário muito longo.");
    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      post_slug: postSlug,
      user_id: user.id,
      parent_id: parentId,
      content,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setValue("");
    toast.success(parentId ? "Resposta enviada!" : "Comentário publicado!");
    onPosted();
  };

  return (
    <form onSubmit={submit} className="flex gap-3">
      {!compact && <UserAvatar name={currentName} avatarUrl={currentAvatar} />}
      <div className="flex-1">
        <div className="mb-1.5 flex items-center gap-1">
          <button type="button" onClick={() => wrap("**", "**")} className="rounded p-1 hover:bg-secondary" title="Negrito"><Bold className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => wrap("*", "*")} className="rounded p-1 hover:bg-secondary" title="Itálico"><Italic className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => {
            const url = prompt("URL do link:");
            if (url) wrap("[", `](${url})`);
          }} className="rounded p-1 hover:bg-secondary" title="Link"><LinkIcon className="h-3.5 w-3.5" /></button>
        </div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={MAX_LEN}
          rows={compact ? 2 : 3}
          placeholder={parentId ? "Escreva sua resposta..." : "Escreva um comentário..."}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="mt-1.5 flex items-center justify-between">
          <span className={`text-xs ${value.length > MAX_LEN - 100 ? "text-destructive" : "text-muted-foreground"}`}>
            {value.length}/{MAX_LEN}
          </span>
          <button type="submit" disabled={submitting || !value.trim()}
            className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {submitting ? "Enviando..." : parentId ? "Responder" : "Comentar"}
          </button>
        </div>
      </div>
    </form>
  );
}
