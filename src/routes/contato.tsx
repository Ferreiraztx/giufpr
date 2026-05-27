import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contato")({
  component: Contato,
});

function Contato() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", assunto: "", mensagem: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: integrar com backend / serviço de e-mail futuramente.
    console.log("Mensagem de contato:", form);
    setSent(true);
    setForm({ nome: "", email: "", assunto: "", mensagem: "" });
  };

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contato</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
            Fale com o projeto.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Dúvidas, parcerias ou sugestões de pauta? Envie uma mensagem — respondemos pelo e-mail
            institucional do projeto.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold text-foreground">E-mail</h3>
            <a href="mailto:contato@gi.ufpr.br" className="mt-1 block text-sm text-muted-foreground hover:text-primary">
              mathxtzferreira@gmail.com
            </a>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold text-foreground">Endereço</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Setor de Ciências Sociais Aplicadas — UFPR<br />
              Av. Prefeito Lothário Meissner, 632 — Jardim Botânico, Curitiba — PR
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 md:p-8">
          {sent && (
            <div className="mb-6 flex items-start gap-3 rounded-md border border-accent/40 bg-accent/10 p-4 text-sm text-accent-foreground">
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
              <span>Mensagem enviada! Em breve retornaremos o seu contato.</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" id="nome">
              <input
                id="nome"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </Field>
            <Field label="E-mail" id="email">
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Assunto" id="assunto">
              <input
                id="assunto"
                required
                value={form.assunto}
                onChange={(e) => setForm({ ...form, assunto: e.target.value })}
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Mensagem" id="mensagem">
              <textarea
                id="mensagem"
                required
                rows={6}
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                className="w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              />
            </Field>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Enviar mensagem <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
