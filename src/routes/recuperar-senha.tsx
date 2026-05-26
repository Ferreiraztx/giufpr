import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/recuperar-senha")({
  component: RecuperarSenhaPage,
  head: () => ({ meta: [{ title: "Recuperar senha · GI UFPR" }] }),
});

function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Se o e-mail existir, enviamos instruções.");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground">Recuperar senha</h1>
      <p className="mt-2 text-sm text-muted-foreground">Informe seu e-mail e enviaremos um link para redefinir a senha.</p>
      <form onSubmit={handle} className="mt-8 space-y-4">
        <input type="email" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
        <button type="submit" disabled={loading}
          className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {loading ? "Enviando..." : "Enviar link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="text-primary hover:underline">Voltar ao login</Link>
      </p>
    </div>
  );
}
