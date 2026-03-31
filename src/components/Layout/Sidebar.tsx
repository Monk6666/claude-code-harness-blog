"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ChapterMeta } from "@/lib/chapters";

export function Sidebar({
  chapters,
  isOpen,
  onClose,
}: {
  chapters: ChapterMeta[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-14 bottom-0 left-0 z-40 w-72 border-r border-[var(--border)]
          bg-[var(--background)] overflow-y-auto transition-transform duration-200
          md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0 md:block
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="p-4">
          <div className="mb-4">
            <Link
              href="/"
              onClick={onClose}
              className={`
                block px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline
                ${pathname === "/" ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"}
              `}
            >
              Overview
            </Link>
          </div>

          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Chapters
          </div>

          <ul className="space-y-1">
            {chapters.map((chapter) => {
              const isActive = pathname === `/chapters/${chapter.slug}`;
              return (
                <li key={chapter.slug}>
                  <Link
                    href={`/chapters/${chapter.slug}`}
                    onClick={onClose}
                    className={`
                      flex items-start gap-2 px-3 py-2 rounded-lg text-sm transition-colors no-underline
                      ${
                        isActive
                          ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                      }
                    `}
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-mono mt-0.5">
                      {chapter.order}
                    </span>
                    <span className="leading-snug">{chapter.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
