"use client";

import { useEffect, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: number;
};

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.querySelector(".mdx-content");
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3");
    const items: Heading[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent || "",
      level: Number(el.tagName[1]),
    }));
    setHeadings(items);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block sticky top-20 w-56 shrink-0 max-h-[calc(100vh-6rem)] overflow-y-auto text-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
        On this page
      </div>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 12}px` }}>
            <a
              href={`#${h.id}`}
              className={`
                block py-0.5 leading-snug transition-colors no-underline text-xs
                ${
                  activeId === h.id
                    ? "text-[var(--accent)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }
              `}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
