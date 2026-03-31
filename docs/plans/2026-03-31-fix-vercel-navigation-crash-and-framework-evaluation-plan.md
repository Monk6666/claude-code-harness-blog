---
title: "fix: Vercel 翻頁崩潰修復與 Tech Book 框架評估"
type: fix
date: 2026-03-31
---

# Vercel 翻頁崩潰修復與 Tech Book 框架評估

## Overview

部署到 Vercel 後，章節間翻頁（client-side navigation）會在短暫延遲後顯示錯誤。根本原因是 `output: "export"` 靜態匯出模式下，Mermaid 動態載入與重複初始化導致 client-side 渲染崩潰。同時評估是否應遷移到更適合技術書籍的文檔框架。

## Problem Statement

### 症狀
- 首次載入頁面正常（靜態 HTML + hydration）
- 透過 sidebar 或「上一章/下一章」翻頁後，過一下就顯示 Next.js error boundary
- 問題在 Vercel 部署環境下發生

### 根因分析

**1. Mermaid 重複初始化（主因）**

`src/components/Content/MermaidDiagram.tsx:21-26` 在每次 `useEffect` 觸發時都呼叫 `mermaid.initialize()`：

```tsx
// 每次切換章節都會重新執行
const mermaid = (await import("mermaid")).default;
mermaid.initialize({  // ← mermaid 文件明確說明 initialize 只應呼叫一次
  startOnLoad: false,
  theme: theme === "dark" ? "dark" : "default",
});
```

Client-side navigation 時，舊 chapter 的 MermaidDiagram unmount → 新 chapter 的 MermaidDiagram mount → `useEffect` 再次呼叫 `mermaid.initialize()`。Mermaid 的內部狀態被重置，但 DOM 中可能殘留前一次 render 的 SVG 元素，造成 ID 衝突和渲染失敗。

**2. CodeBlockEnhancer DOM 操作殘留**

`src/components/Content/CodeBlock.tsx` 在 `useEffect` 中直接操作 DOM（`insertBefore`, `appendChild`），但沒有 cleanup function。Client-side navigation 時，React 會 reconcile 新的 RSC payload，但手動插入的 wrapper/header DOM 節點不在 React 的管轄範圍內，可能導致 DOM 結構不一致。

**3. RSC Payload 大小**

每個 chapter 的 `.txt` RSC payload 包含完整的 MDX 渲染結果（序列化的 React 元素樹）。內容重的章節 payload 較大，在 Vercel CDN 上 prefetch 可能逾時，造成 navigation 失敗。

### 架構根本問題

這個專案本質上是一個**靜態技術書籍**，但使用了完整的 Next.js 16 App Router + RSC 架構。這帶來不必要的複雜度：
- 手工打造 Sidebar、ChapterNav、TableOfContents、CodeBlock、MermaidDiagram 等元件
- Mermaid 必須用 `useEffect` + 動態 import 繞過 SSR 限制
- `rehype-pretty-code` + 手動 DOM 操作（CodeBlockEnhancer）實現程式碼區塊功能
- `next-themes` + `suppressHydrationWarning` 處理暗色模式
- 以上每一層都是潛在的 hydration mismatch 和 client-side crash 來源

## 方案 A：修復當前 Next.js 專案（Quick Fix）

### A1. 修復 Mermaid 單例初始化

將 `mermaid.initialize()` 改為只執行一次：

```tsx
// src/components/Content/MermaidDiagram.tsx
let mermaidInitialized = false;

async function getMermaid(theme: string) {
  const mermaid = (await import("mermaid")).default;
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
    });
    mermaidInitialized = true;
  }
  return mermaid;
}
```

### A2. CodeBlockEnhancer 加入 cleanup

```tsx
// src/components/Content/CodeBlock.tsx
useEffect(() => {
  const wrappers: HTMLElement[] = [];

  figures.forEach((fig) => {
    // ... create wrapper ...
    wrappers.push(wrapper);
  });

  return () => {
    // cleanup: unwrap figures
    wrappers.forEach((wrapper) => {
      const fig = wrapper.querySelector("figure");
      if (fig && wrapper.parentNode) {
        wrapper.parentNode.insertBefore(fig, wrapper);
        wrapper.remove();
      }
    });
  };
}, []);
```

### A3. 加入 Error Boundary 防止整頁崩潰

在 `ChapterPage` 的 MDX content 區域外包 React Error Boundary，讓 Mermaid 渲染失敗只影響該圖表，不會 crash 整個頁面。

### 方案 A 評估

- **優點**：改動小，可快速部署
- **缺點**：治標不治本。手工維護的元件越來越多，每個都是潛在崩潰點。未來加功能（搜尋、版本管理、i18n）都需要從頭造輪子

---

## 方案 B：遷移到文檔框架（推薦）

### 框架比較

| | Starlight (Astro) | Nextra 4 (Next.js) | Docusaurus 3.9 | VitePress |
|---|---|---|---|---|
| **遷移難度** | 中 | **低** | 中 | 高（需改 Vue） |
| **Mermaid 支援** | 社群插件 | 需手動 | **內建（最佳）** | 插件有相容性問題 |
| **JS bundle** | **12 kB** | 60 kB | 464 kB | 30 kB |
| **內建搜尋** | Pagefind | Pagefind | Algolia/AI | 本地搜尋 |
| **程式碼區塊** | **Expressive Code（最佳）** | Shiki | Prism/Shiki | Shiki |
| **中文支援** | 優秀 | 普通 | **優秀** | 優秀 |
| **Hydration 問題** | **不存在（零 JS）** | 可能 | 可能 | 可能 |
| **Vercel 部署** | 原生支援 | 原生支援 | 原生支援 | 原生支援 |

### 推薦：Starlight（Astro）

**為什麼 Starlight 最適合這個專案：**

1. **根治 hydration 問題**：內容頁面預設零 client-side JS。不存在 hydration mismatch，不可能有翻頁崩潰
2. **最佳效能**：12 kB JS bundle、LCP ~0.8s、TBT ~0ms。台灣讀者體驗極快
3. **所有你手工打造的功能都是內建的**：
   - Sidebar → 自動從檔案結構生成
   - ChapterNav（上/下一章）→ 內建
   - TableOfContents → 內建（"On this page" 側欄）
   - 暗色模式 → 內建
   - 搜尋 → 內建（Pagefind，零配置）
   - 程式碼區塊語言標示 + 複製按鈕 → 內建（Expressive Code）
4. **MDX 原生支援**：你的 11 個 `.mdx` 檔案可直接搬入 `src/content/docs/`，frontmatter 微調即可
5. **React 相容**：透過 `@astrojs/react` 整合，可漸進式移植 React 元件（例如 MermaidDiagram 改為 Astro island）
6. **i18n 最佳**：內建多語系 UI 翻譯，包含中文

### 遷移計畫

#### Phase 1：初始化 Starlight 專案

```bash
npm create astro@latest -- --template starlight
```

設定 `astro.config.mjs`：
- `locales: { root: { label: '繁體中文', lang: 'zh-TW' } }`
- `sidebar` 對應 11 章
- `@astrojs/react` 整合（for Mermaid island）

#### Phase 2：遷移內容（11 個 MDX 檔案）

- 搬移 `content/chapters/*.mdx` → `src/content/docs/chapters/*.mdx`
- 調整 frontmatter：`title`, `description`, `sidebar: { order: N }`
- 移除 `subtitle`, `tags` 等 Starlight 不使用的欄位（或保留為自訂欄位）

#### Phase 3：處理 Mermaid 圖表

兩種選項：
1. **Astro Mermaid 插件**：`astro-mermaid`，build 時渲染為靜態 SVG（無 client JS）
2. **Client Island**：保留 `MermaidDiagram` React 元件作為 `client:idle` island

推薦選項 1：build 時靜態渲染，完全消除 client-side 問題。

#### Phase 4：自訂樣式

- 覆寫 Starlight 的 CSS custom properties 對齊目前的視覺風格
- 程式碼區塊、表格等由 Starlight + Expressive Code 內建處理，無需自訂

#### Phase 5：部署

- Vercel 自動偵測 Astro 框架
- 零配置部署

### 遷移工作量估算

| 項目 | 工作量 |
|---|---|
| Starlight 專案初始化 + 配置 | 30 分鐘 |
| 11 個 MDX 檔案搬移 + frontmatter 調整 | 1 小時 |
| Mermaid 圖表處理 | 1 小時 |
| 樣式微調 | 30 分鐘 |
| 測試 + 部署 | 30 分鐘 |
| **總計** | **~3.5 小時** |

### 遷移後可刪除的程式碼

目前專案中以下所有手工元件都不再需要：

- `src/components/Layout/Shell.tsx` → Starlight 內建 layout
- `src/components/Layout/Sidebar.tsx` → Starlight 內建 sidebar
- `src/components/Layout/Header.tsx` → Starlight 內建 header
- `src/components/Layout/Footer.tsx` → Starlight 內建 footer
- `src/components/Content/ChapterNav.tsx` → Starlight 內建 pagination
- `src/components/Content/TableOfContents.tsx` → Starlight 內建 TOC
- `src/components/Content/CodeBlock.tsx` → Expressive Code 內建
- `src/components/Content/CopyButton.tsx` → Expressive Code 內建
- `src/components/Content/MermaidDiagram.tsx` → 靜態 SVG 或 island
- `src/components/Content/MermaidWrapper.tsx` → 不再需要
- `src/lib/remark-mermaid.ts` → 插件處理
- `src/lib/mdx.ts` → Starlight 內建 MDX pipeline
- `src/lib/chapters.ts` → Starlight content collections

**刪除 15 個自訂檔案，換取框架內建功能 + 零崩潰風險。**

---

## 決策建議

| 情境 | 建議 |
|---|---|
| 想最快修好翻頁問題 | 方案 A（~1 小時） |
| 想長期穩定且未來擴展 | **方案 B：遷移 Starlight（~3.5 小時，推薦）** |
| 想留在 Next.js 生態系 | 方案 B 備選：遷移 Nextra 4（~2 小時） |

## Acceptance Criteria

### 方案 A（Quick Fix）
- [ ] 翻頁後頁面不崩潰
- [ ] Mermaid 圖表在翻頁後正常渲染
- [ ] CodeBlockEnhancer 在翻頁後正常運作
- [ ] Error Boundary 防止單一元件崩潰影響整頁

### 方案 B（Starlight 遷移）
- [ ] 11 章內容完整遷移
- [ ] Mermaid 圖表正常顯示
- [ ] Sidebar、翻頁、TOC 正常運作
- [ ] 暗色/亮色模式正常
- [ ] Vercel 部署成功，所有頁面可存取
- [ ] 翻頁流暢，無任何崩潰

## References

### 當前專案關鍵檔案
- `src/components/Content/MermaidDiagram.tsx:21-26` — Mermaid 重複初始化問題
- `src/components/Content/CodeBlock.tsx:12-59` — DOM 操作無 cleanup
- `next.config.ts` — `output: "export"` 配置
- `src/app/chapters/[slug]/page.tsx` — Chapter 頁面元件

### 框架文件
- [Starlight 官方文檔](https://starlight.astro.build/)
- [Nextra 4 文檔](https://nextra.site/)
- [Docusaurus 文檔](https://docusaurus.io/)
- Next.js 16 靜態匯出文檔：`node_modules/next/dist/docs/01-app/02-guides/static-exports.md`

### 相關 Commits
- `875a026` — 加入 remark-gfm 和 trailingSlash
- `f4e7163` — 修復 hydration mismatch
- `d347bfc` — 修復 Mermaid chart prop undefined
