import { createFileRoute } from "@tanstack/react-router";
import { Mail, Linkedin } from "lucide-react";

export const Route = createFileRoute("/equipe")({
  component: Equipe,
});

const team = [
  {
    name: "Clara",
    role: "Pesquisa e curadoria de conteúdo",
    bio: "Estudante de Gestão da Informação interessada em organização do conhecimento, taxonomias e ferramentas de gestão pessoal de informação.",
    initials: "CL",
  }
];

function Equipe() {
  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Equipe</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
            Quem está por trás do projeto.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Clara a integrante do curso de Gestão da Informação da UFPR conduz este projeto de
            extensão, articulando pesquisa, comunicação e engajamento com a comunidade.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {team.map((m) => (
            <article
              key={m.name}
              className="flex flex-col rounded-xl border border-border bg-card p-6 text-center"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                {m.initials}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">{m.name}</h3>
              <p className="mt-1 text-sm font-medium text-accent-foreground">
                <span className="rounded bg-accent/20 px-2 py-0.5">{m.role}</span>
              </p>
              <p className="mt-4 text-sm text-muted-foreground">{m.bio}</p>
              <div className="mt-5 flex justify-center gap-2 text-muted-foreground">
                <a href={`mailto:${m.name.toLowerCase()}@ufpr.br`} className="rounded-md border border-border p-2 hover:text-primary" aria-label={`E-mail de ${m.name}`}>
                  <Mail className="h-4 w-4" />
                </a>
                <a href="#" className="rounded-md border border-border p-2 hover:text-primary" aria-label={`LinkedIn de ${m.name}`}>
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
