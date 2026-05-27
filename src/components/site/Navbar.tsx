import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, BookOpen, LogOut, UserCircle, Shield, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserAvatar } from "./UserAvatar";

function RoleBadge({ role }: { role: "admin" | "super_admin" }) {
  const isSuper = role === "super_admin";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
      isSuper ? "bg-primary text-primary-foreground" : "bg-accent/30 text-accent-foreground"
    }`}>
      {isSuper ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
      {isSuper ? "Super Admin" : "Admin"}
    </span>
  );
}


const links = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre" },
  { to: "/equipe", label: "Equipe" },
  { to: "/blog", label: "Blog" },
  { to: "/contato", label: "Contato" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, profile, role, isAdmin, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();


  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">GI Extensão</p>
            <p className="text-[11px] text-muted-foreground">UFPR · Gestão da Informação</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {isSuperAdmin && (
                <Link to="/admin" className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-secondary">
                  Admin
                </Link>
              )}
              <Link to="/perfil" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary">
                <UserAvatar name={profile?.display_name} avatarUrl={profile?.avatar_url} size={28} />
                <span className="text-sm font-medium text-foreground">{profile?.display_name || "Perfil"}</span>
                {isAdmin && <RoleBadge role={isSuperAdmin ? "super_admin" : "admin"} />}
              </Link>
              <button onClick={handleSignOut} title="Sair"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 hover:bg-secondary hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </button>
            </>

          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">Entrar</Link>
              <Link to="/registro" className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Criar conta</Link>
            </>
          )}
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((l) => (
              <Link key={l.to} to={l.to}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-primary" }}
                activeOptions={{ exact: l.to === "/" }}
                onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {user ? (
              <>
                <Link to="/perfil" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-3 text-sm hover:bg-secondary">
                  <UserCircle className="h-4 w-4" /> Meu perfil
                </Link>
                <button onClick={() => { setOpen(false); handleSignOut(); }} className="flex items-center gap-2 rounded-md px-3 py-3 text-left text-sm hover:bg-secondary">
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-medium hover:bg-secondary">Entrar</Link>
                <Link to="/registro" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-medium text-primary hover:bg-secondary">Criar conta</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
