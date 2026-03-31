import Link from "next/link";
import type { ChapterMeta } from "@/lib/chapters";

export function ChapterCard({ chapter }: { chapter: ChapterMeta }) {
  return (
    <Link
      href={`/chapters/${chapter.slug}`}
      className="group block p-5 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:shadow-lg no-underline"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="shrink-0 w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-sm font-bold">
          {chapter.order}
        </span>
        <h3 className="text-base font-semibold group-hover:text-[var(--accent)] transition-colors leading-snug">
          {chapter.title}
        </h3>
      </div>
      {chapter.subtitle && (
        <p className="text-xs font-mono text-[var(--muted-foreground)] mb-2">
          {chapter.subtitle}
        </p>
      )}
      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-3 line-clamp-2">
        {chapter.description}
      </p>
      <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
        <span>{chapter.estimatedReadingTime} min read</span>
        <div className="flex gap-1.5">
          {chapter.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
