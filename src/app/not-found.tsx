import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-[var(--accent)] mb-4">404</h1>
      <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-[var(--muted-foreground)] mb-6">
        找不到這個頁面，可能是連結已失效或頁面已移除。
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity no-underline"
      >
        回到首頁
      </Link>
    </div>
  );
}
