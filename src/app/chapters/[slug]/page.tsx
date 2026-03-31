import { notFound } from "next/navigation";
import { getAllChapterSlugs, getChapterBySlug, getAdjacentChapters } from "@/lib/chapters";
import { renderMDX } from "@/lib/mdx";
import { ChapterNav } from "@/components/Content/ChapterNav";
import { TableOfContents } from "@/components/Content/TableOfContents";
import { CodeBlockEnhancer } from "@/components/Content/CodeBlock";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const slugs = getAllChapterSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const chapter = getChapterBySlug(slug);
    return {
      title: `${chapter.title} — ${chapter.subtitle}`,
      description: chapter.description,
      openGraph: {
        title: chapter.title,
        description: chapter.description,
      },
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let chapter;
  try {
    chapter = getChapterBySlug(slug);
  } catch {
    notFound();
  }

  const { content } = await renderMDX(chapter.content);
  const { prev, next } = getAdjacentChapters(slug);

  return (
    <div className="flex gap-8 max-w-4xl mx-auto px-6 py-10">
      <article className="flex-1 min-w-0">
        {/* Chapter header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium">
              Chapter {chapter.order}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {chapter.estimatedReadingTime} min read
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {chapter.title}
          </h1>
          <p className="text-lg font-mono text-[var(--muted-foreground)]">
            {chapter.subtitle}
          </p>
          {chapter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {chapter.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* MDX content */}
        <div className="mdx-content">
          {content}
          <CodeBlockEnhancer />
        </div>

        {/* Chapter navigation */}
        <ChapterNav prev={prev} next={next} />
      </article>

      <TableOfContents />
    </div>
  );
}
