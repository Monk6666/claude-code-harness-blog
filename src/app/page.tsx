import { getAllChapters } from "@/lib/chapters";
import { ChapterCard } from "@/components/UI/Card";

export default function HomePage() {
  const chapters = getAllChapters();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="mb-16">
        <div className="inline-block px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium mb-4">
          Deep Dive Tutorial
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
          Claude Code
          <br />
          <span className="text-[var(--accent)]">Harness Engineering</span>
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] leading-relaxed max-w-2xl mb-8">
          深度剖析 Claude Code 如何透過精密的工具系統、代理編排、權限分層、Hook
          擴展與狀態管理等機制，將 LLM 從「聊天機器人」轉化為「自主工程代理」。
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center">
              📖
            </span>
            <div>
              <div className="font-semibold">{chapters.length} 章</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                完整教學
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center">
              🏗️
            </span>
            <div>
              <div className="font-semibold">10 子系統</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                架構解析
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center">
              📐
            </span>
            <div>
              <div className="font-semibold">Mermaid 架構圖</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                視覺化解說
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Overview */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-2">架構總覽</h2>
        <p className="text-[var(--muted-foreground)] mb-6">
          Claude Code 的 Harness Engineering 架構由以下核心子系統組成：
        </p>
        <div className="p-6 rounded-xl bg-[var(--muted)] border border-[var(--border)] font-mono text-sm leading-loose overflow-x-auto">
          <pre className="whitespace-pre text-[var(--foreground)]">{`┌─────────────────────────────────────────────────────┐
│                   Query Loop                        │
│            (主迴圈 / 串流工具執行)                      │
├────────┬──────────┬──────────┬───────────┬──────────┤
│  Tool  │  Agent   │Permission│   Hook    │ Context  │
│ System │ Orchestr.│  System  │  System   │   Mgmt   │
│        │          │          │           │          │
│ 工具定義│ 代理編排  │ 分層權限  │ 生命週期   │ 上下文   │
│ 驗證執行│ Cache共享 │ ML分類器  │ 擴展點    │ 快取壓縮  │
├────────┴──────────┴──────────┴───────────┴──────────┤
│  Skills  │ Plugins/MCP │ State Mgmt │ Task System   │
│  技能    │ 插件/協議    │ 狀態管理    │ 任務系統     │
└─────────────────────────────────────────────────────┘`}</pre>
        </div>
      </section>

      {/* Chapter Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-2">章節目錄</h2>
        <p className="text-[var(--muted-foreground)] mb-6">
          從基礎概念到進階設計模式，循序漸進地理解整個系統。
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {chapters.map((chapter) => (
            <ChapterCard key={chapter.slug} chapter={chapter} />
          ))}
        </div>
      </section>
    </div>
  );
}
