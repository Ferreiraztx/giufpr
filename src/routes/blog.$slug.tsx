import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { getPost, formatDate } from "../lib/posts";

export const Route = createFileRoute("/blog/$slug")({
  component: PostPage,
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
});

function PostPage() {
  const { post } = Route.useLoaderData();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao blog
      </Link>

      <span className="mt-6 inline-flex rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
        {post.category}
      </span>
      <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground md:text-4xl">
        {post.title}
      </h1>

      <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</span>
        <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(post.date)}</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.readingTime}</span>
      </div>

      <div className="my-8 h-px w-full bg-border" />

      <div className="space-y-5 text-base leading-relaxed text-foreground/90">
        <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        {post.content.split("\n\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}
