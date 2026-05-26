import { Link } from "@tanstack/react-router";
import { Mail, MapPin, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="text-base font-semibold">Projeto de Extensão</h3>
          <p className="mt-3 text-sm text-primary-foreground/80">
            Iniciativa do curso de Gestão da Informação da Universidade Federal do Paraná, voltada
            à produção e disseminação de conhecimento na área.
          </p>
          <div className="mt-4 h-1 w-16 rounded-full bg-accent" />
        </div>

        <div>
          <h3 className="text-base font-semibold">Navegação</h3>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/sobre" className="hover:text-accent">Sobre o projeto</Link></li>
            <li><Link to="/equipe" className="hover:text-accent">Equipe</Link></li>
            <li><Link to="/blog" className="hover:text-accent">Blog</Link></li>
            <li><Link to="/contato" className="hover:text-accent">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold">UFPR</h3>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>Setor de Ciências Sociais Aplicadas — Av. Prefeito Lothário Meissner, 632, Curitiba — PR</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent" />
              <a href="mailto:contato@gi.ufpr.br" className="hover:text-accent">contato@gi.ufpr.br</a>
            </li>
            <li>
              <a
                href="https://www.ufpr.br"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-accent"
              >
                www.ufpr.br <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} Projeto de Extensão — Gestão da Informação · UFPR. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
