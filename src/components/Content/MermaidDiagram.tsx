"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        setLoading(true);
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === "dark" ? "dark" : "default",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        });

        if (cancelled || !containerRef.current) return;

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, chart.trim());

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
          setLoading(false);

          // Check overflow for mobile scroll hint
          requestAnimationFrame(() => {
            if (wrapperRef.current) {
              const isOverflowing =
                wrapperRef.current.scrollWidth >
                wrapperRef.current.clientWidth;
              wrapperRef.current.classList.toggle(
                "is-overflowing",
                isOverflowing
              );
            }
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Diagram render failed");
          setLoading(false);
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, theme]);

  if (error) {
    return (
      <div className="mermaid-container" style={{ flexDirection: "column" }}>
        <pre className="text-sm text-red-500 text-left whitespace-pre-wrap m-0 border-none bg-transparent">
          {chart}
        </pre>
        <p className="text-xs text-[var(--muted-foreground)] mt-2">
          Diagram render error: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="mermaid-container" ref={wrapperRef}>
      <div ref={containerRef}>
        {loading && (
          <div className="mermaid-skeleton">
            <div className="mermaid-skeleton-bar" style={{ width: "60%" }} />
            <div className="mermaid-skeleton-bar" style={{ width: "80%" }} />
            <div className="mermaid-skeleton-bar" style={{ width: "40%" }} />
            <span>Loading diagram...</span>
          </div>
        )}
      </div>
    </div>
  );
}
