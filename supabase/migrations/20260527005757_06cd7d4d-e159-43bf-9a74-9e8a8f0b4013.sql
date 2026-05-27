
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_highest_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role WHEN 'super_admin' THEN 1 WHEN 'admin' THEN 2 ELSE 3 END
  LIMIT 1
$$;

-- user_roles policies
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin manages roles insert" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin manages roles update" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin manages roles delete" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Backfill existing users with 'user' role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- Posts table
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Notícias',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'Equipe do Projeto',
  reading_time text NOT NULL DEFAULT '3 min',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Admins create posts" ON public.posts FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
    AND author_id = auth.uid()
  );
CREATE POLICY "Authors or super admin update" ON public.posts FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR (author_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "Authors or super admin delete" ON public.posts FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR (author_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
  );

CREATE TRIGGER posts_touch_updated_at
BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed initial posts (author_id NULL = system/seed)
INSERT INTO public.posts (slug, title, excerpt, content, category, author_name, reading_time, created_at) VALUES
('lancamento-do-projeto', 'Lançamento do projeto de extensão em Gestão da Informação',
 'Apresentamos o projeto de extensão do curso de Gestão da Informação da UFPR, seus objetivos e a equipe envolvida.',
 E'Este é o post de lançamento do nosso projeto de extensão. Aqui contaremos sobre os objetivos, metodologias e impactos esperados na comunidade acadêmica e externa.\n\nNos próximos meses publicaremos artigos, tutoriais e relatos de eventos relacionados à área de Gestão da Informação.',
 'Notícias', 'Equipe do Projeto', '3 min', '2026-03-12'),
('organizacao-da-informacao-pessoal', 'Organização da informação pessoal: princípios e ferramentas',
 'Um panorama sobre como gerenciar arquivos, e-mails e referências bibliográficas de forma eficiente no dia a dia acadêmico.',
 E'A organização da informação pessoal (Personal Information Management) é uma competência essencial para estudantes e pesquisadores. Neste artigo discutimos taxonomias, convenções de nomenclatura, sistemas de tags e ferramentas como Zotero, Obsidian e gerenciadores de arquivos.\n\nApresentamos também boas práticas adaptadas ao contexto brasileiro e às demandas do curso de GI da UFPR.',
 'Tutoriais', 'Clara', '6 min', '2026-04-02'),
('seminario-gestao-conhecimento', 'Seminário sobre Gestão do Conhecimento — inscrições abertas',
 'Convidamos a comunidade acadêmica para o seminário que reúne pesquisadores e profissionais da área.',
 E'O seminário acontecerá no Setor de Ciências Sociais Aplicadas da UFPR e contará com mesas-redondas, oficinas e apresentação de trabalhos de extensão.\n\nInscrições gratuitas e abertas ao público em geral.',
 'Eventos', 'Eduardo', '2 min', '2026-04-20'),
('dados-abertos-no-brasil', 'Dados abertos no Brasil: um olhar a partir da Gestão da Informação',
 'Reflexões sobre o papel dos profissionais de GI no ecossistema de dados abertos governamentais.',
 E'Os dados abertos são insumo fundamental para transparência, controle social e inovação. Neste artigo analisamos portais, padrões de metadados e desafios de qualidade e curadoria no contexto brasileiro.',
 'Pesquisa', 'Julia', '8 min', '2026-05-08')
ON CONFLICT (slug) DO NOTHING;
