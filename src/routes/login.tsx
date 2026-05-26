import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar · GI UFPR" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/" });
  };

  const handleGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) toast.error("Não foi possível entrar com Google.");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground">Entrar</h1>
      <p className="mt-2 text-sm text-muted-foreground">Acesse sua conta para comentar e participar das discussões.</p>

      <form onSubmit={handleLogin} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground">E-mail</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Senha</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
        </div>
        <button type="submit" disabled={loading}
          className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button onClick={handleGoogle}
        className="h-10 w-full rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary">
        Continuar com Google
      </button>

      <div className="mt-6 flex justify-between text-sm">
        <Link to="/recuperar-senha" className="text-primary hover:underline">Esqueci minha senha</Link>
        <Link to="/registro" className="text-primary hover:underline">Criar conta</Link>
      </div>
    </div>
  );
}
