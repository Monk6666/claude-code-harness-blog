export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 px-6">
      <div className="max-w-4xl mx-auto text-center text-sm text-[var(--muted-foreground)]">
        <p className="mb-2">
          Claude Code Harness Engineering Tutorial &mdash; 深入剖析 AI
          編程代理的工程架構
        </p>
        <p>
          Built with{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Next.js
          </a>{" "}
          &bull; Deployed on{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Vercel
          </a>{" "}
          &bull; Source analysis of{" "}
          <a
            href="https://github.com/anthropics/claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Claude Code
          </a>
        </p>
      </div>
    </footer>
  );
}
