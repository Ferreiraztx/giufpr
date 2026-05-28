import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Database, Library, Network, Users } from "lucide-react";
import { listPosts, formatDate, type Post } from "../lib/posts";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [recent, setRecent] = useState<Post[]>([]);
  useEffect(() => { listPosts().then((p) => setRecent(p.slice(0, 3))).catch(() => {}); }, []);


  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-[0.12]" aria-hidden>
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Projeto de Extensão · UFPR
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Gestão da Informação que conecta pessoas, dados e conhecimento.
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/80 md:text-lg">
              Iniciativa do curso de Gestão da Informação da Universidade Federal do Paraná
              dedicada a compartilhar pesquisas, tutoriais e eventos com a comunidade acadêmica
              e profissional.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-105"
              >
                Ler o blog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"
              >
                Sobre o projeto
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              {[
                { Icon: Database, label: "Curadoria de dados" },
                { Icon: Library, label: "Organização do conhecimento" },
                { Icon: Network, label: "Redes de informação" },
                { Icon: Users, label: "Extensão universitária" },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-5 backdrop-blur"
                >
                  <Icon className="h-6 w-6 text-accent" />
                  <p className="mt-3 text-sm font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-foreground/80">
              <span className="rounded bg-accent px-2 py-0.5 text-accent-foreground">Sobre</span>
            </p>
            <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
              Um projeto pensado para a comunidade.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Promovemos diálogo entre estudantes, docentes e a sociedade por meio de
              publicações, oficinas e eventos. Acreditamos que a Gestão da Informação é uma
              área-chave para enfrentar os desafios contemporâneos de dados, transparência e
              acesso ao conhecimento.
            </p>
            <Link
              to="/sobre"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Conheça os objetivos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { n: "01", t: "Integrante" },
              { n: "10+", t: "Publicações previstas" },
              { n: "04", t: "Eixos temáticos" },
              { n: "UFPR", t: "Setor de Ciências Sociais Aplicadas" },
            ].map((s) => (
              <div key={s.t} className="rounded-xl border border-border bg-card p-6">
                <p className="text-3xl font-bold text-primary">{s.n}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent posts */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Últimas publicações</h2>
              <p className="mt-2 text-muted-foreground">
                Atualizações recentes do blog do projeto.
              </p>
            </div>
            <Link
              to="/blog"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Ver todas →
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {recent.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="inline-flex w-fit rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                  {p.category}
                </span>
                <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {formatDate(p.created_at)} · {p.reading_time} de leitura
                </p>

              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
