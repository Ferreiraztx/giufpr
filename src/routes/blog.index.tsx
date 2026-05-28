import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { listPosts, categories, formatDate, type Category, type Post } from "../lib/posts";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/blog/")({
  component: Blog,
});

function Blog() {
  const { isAdmin } = useAuth();
  const [active, setActive] = useState<Category | "Todos">("Todos");
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPosts().then(setPosts).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchCat = active === "Todos" || p.category === active;
      const matchQ =
        q.trim() === "" ||
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [active, q, posts]);

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Blog</p>
              <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
                Publicações do projeto.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Artigos, tutoriais, notícias e relatos de eventos produzidos pela equipe do projeto.
              </p>
            </div>
            {isAdmin && (
              <Link
                to="/blog/novo"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Novo Post
              </Link>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["Todos", ...categories] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                    active === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground/80 hover:border-primary/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar publicações..."
                className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        {loading ? (
          <p className="py-20 text-center text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">Nenhuma publicação encontrada.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="inline-flex w-fit rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                  {p.category}
                </span>
                <h2 className="mt-3 text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
                  {p.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{p.author_name}</span>
                  <span>{formatDate(p.created_at)} · {p.reading_time} de leitura</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
