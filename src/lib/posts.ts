export type Category = "Pesquisa" | "Eventos" | "Tutoriais" | "Notícias";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: Category;
  readingTime: string;
};

export const categories: Category[] = ["Pesquisa", "Eventos", "Tutoriais", "Notícias"];

export const posts: Post[] = [
  {
    slug: "lancamento-do-projeto",
    title: "Lançamento do projeto de extensão em Gestão da Informação",
    excerpt:
      "Apresentamos o projeto de extensão do curso de Gestão da Informação da UFPR, seus objetivos e a equipe envolvida.",
    content:
      "Este é o post de lançamento do nosso projeto de extensão. Aqui contaremos sobre os objetivos, metodologias e impactos esperados na comunidade acadêmica e externa.\n\nNos próximos meses publicaremos artigos, tutoriais e relatos de eventos relacionados à área de Gestão da Informação.",
    author: "Equipe do Projeto",
    date: "2026-03-12",
    category: "Notícias",
    readingTime: "3 min",
  },
  {
    slug: "organizacao-da-informacao-pessoal",
    title: "Organização da informação pessoal: princípios e ferramentas",
    excerpt:
      "Um panorama sobre como gerenciar arquivos, e-mails e referências bibliográficas de forma eficiente no dia a dia acadêmico.",
    content:
      "A organização da informação pessoal (Personal Information Management) é uma competência essencial para estudantes e pesquisadores. Neste artigo discutimos taxonomias, convenções de nomenclatura, sistemas de tags e ferramentas como Zotero, Obsidian e gerenciadores de arquivos.\n\nApresentamos também boas práticas adaptadas ao contexto brasileiro e às demandas do curso de GI da UFPR.",
    author: "Clara",
    date: "2026-04-02",
    category: "Tutoriais",
    readingTime: "6 min",
  },
  {
    slug: "seminario-gestao-conhecimento",
    title: "Seminário sobre Gestão do Conhecimento — inscrições abertas",
    excerpt:
      "Convidamos a comunidade acadêmica para o seminário que reúne pesquisadores e profissionais da área.",
    content:
      "O seminário acontecerá no Setor de Ciências Sociais Aplicadas da UFPR e contará com mesas-redondas, oficinas e apresentação de trabalhos de extensão.\n\nInscrições gratuitas e abertas ao público em geral.",
    author: "Eduardo",
    date: "2026-04-20",
    category: "Eventos",
    readingTime: "2 min",
  },
  {
    slug: "dados-abertos-no-brasil",
    title: "Dados abertos no Brasil: um olhar a partir da Gestão da Informação",
    excerpt:
      "Reflexões sobre o papel dos profissionais de GI no ecossistema de dados abertos governamentais.",
    content:
      "Os dados abertos são insumo fundamental para transparência, controle social e inovação. Neste artigo analisamos portais, padrões de metadados e desafios de qualidade e curadoria no contexto brasileiro.",
    author: "Julia",
    date: "2026-05-08",
    category: "Pesquisa",
    readingTime: "8 min",
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
