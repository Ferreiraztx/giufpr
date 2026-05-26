import { createFileRoute } from "@tanstack/react-router";
import { Target, Lightbulb, Handshake, BookMarked } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  component: Sobre,
});

function Sobre() {
  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Sobre o projeto</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
            Gestão da Informação para a comunidade.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Este projeto de extensão nasceu no curso de Gestão da Informação da UFPR com o objetivo
            de aproximar a produção acadêmica das demandas reais de organizações, profissionais e
            cidadãos que lidam com informação no dia a dia.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">Objetivos</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {[
            { Icon: Target, title: "Disseminar conhecimento", desc: "Publicar artigos, tutoriais e reflexões acessíveis sobre Gestão da Informação." },
            { Icon: Lightbulb, title: "Estimular a pesquisa", desc: "Conectar estudantes a temas atuais como dados abertos, curadoria digital e organização do conhecimento." },
            { Icon: Handshake, title: "Aproximar comunidade e universidade", desc: "Promover diálogos com profissionais, organizações e cidadãos." },
            { Icon: BookMarked, title: "Documentar boas práticas", desc: "Construir um acervo de referências úteis para o ensino e a prática profissional." },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold text-foreground">Relevância</h2>
        <p className="mt-4 text-muted-foreground">
          Num cenário marcado pelo excesso de dados e pela necessidade de transparência, a Gestão da
          Informação oferece métodos, ferramentas e princípios para organizar, recuperar e
          comunicar informação de maneira ética e eficaz. Esta extensão amplia o alcance dessas
          práticas para além da sala de aula.
        </p>

        <div className="mt-10 rounded-xl border border-accent/40 bg-accent/10 p-6">
          <p className="text-sm font-semibold text-accent-foreground">Vinculação institucional</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Curso de Gestão da Informação — Setor de Ciências Sociais Aplicadas — Universidade
            Federal do Paraná (UFPR).
          </p>
        </div>
      </section>
    </>
  );
}
