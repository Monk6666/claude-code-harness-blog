import Link from "next/link";
import type { ChapterMeta } from "@/lib/chapters";

export function ChapterNav({
  prev,
  next,
}: {
  prev: ChapterMeta | null;
  next: ChapterMeta | null;
}) {
  return (
    <nav className="flex justify-between items-stretch gap-4 mt-12 pt-8 border-t border-[var(--border)]">
      {prev ? (
        <Link
          href={`/chapters/${prev.slug}`}
          className="flex-1 group p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-colors no-underline"
        >
          <div className="text-xs text-[var(--muted-foreground)] mb-1">
            ← 上一章
          </div>
          <div className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors">
            {prev.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/chapters/${next.slug}`}
          className="flex-1 group p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-colors no-underline text-right"
        >
          <div className="text-xs text-[var(--muted-foreground)] mb-1">
            下一章 →
          </div>
          <div className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors">
            {next.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
