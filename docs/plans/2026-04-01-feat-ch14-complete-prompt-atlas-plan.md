---
title: "feat: Add Ch.14 — Prompt 全景圖：Tool Prompts 與服務 Prompts 完整解析"
type: feat
date: 2026-04-01
---

# feat: Add Ch.14 — Prompt 全景圖 (Complete Prompt Atlas)

## 評估結論：新增章節 vs. 補充現有內容

### 結論：✅ 新增 Ch.14（不補入現有章節）

| 面向 | 說明 |
|------|------|
| Ch.11 已有的內容 | Prompt 組裝架構、快取分層、5 層覆蓋優先順序、Section 系統工程設計 |
| Ch.13 已有的內容 | System prompt 所有 17 個 Section 逐節解析、靜態 vs. 動態邊界 |
| **完全缺少的內容** | **Tool-level prompts**（每個工具的 `prompt.ts`）與 **Service-level prompts**（compact、memory、coordinator）— 這是 Claude Code prompt 系統的另外半壁江山 |

Ch.11/13 涵蓋的是「system prompt 如何設計」，但 Claude Code 的 prompt 世界遠不只是 system prompt。每個工具都有自己的 prompt（注入 tools array），每個背景服務也有獨立的 prompt 引導 Claude 完成子任務。這些內容是獨立的架構主題，塞入 Ch.11 或 Ch.13 會破壞其原有的敘事焦點。

**Ch.14 是自然的最後一章**：從「系統如何運作」到「完整的 prompt 長什麼樣」，給讀者一個完整的閉環。

---

## Overview

新增一章 `14-prompt-atlas.mdx`，副標題「Prompt 全景圖 — Claude Code 所有 Prompt 的完整解析」。

本章是整本書的「prompt 字典」：不再是架構分析，而是把 Claude Code 原始碼中每個重要 prompt 的**實際文字**攤開來，讓讀者看清 Anthropic 工程師如何下指令、如何思考 prompt 設計的粒度。

## Problem Statement / Motivation

讀者在讀完 Ch.11（架構）和 Ch.13（system prompt 逐節）之後，仍然會有一個疑問：

> 「那 Bash tool 的 prompt 到底寫了什麼？Agent tool 如何告訴 Claude 什麼時候要 fork？compact 時用了什麼 prompt？」

這些資訊都藏在 `src/tools/*/prompt.ts` 和 `src/services/*/prompt.ts` 裡，但從未被整理成可讀的文章。這正是本章的價值。

## Proposed Solution

### 章節結構（7 個主要段落）

#### 14.1 Prompt 地圖：Claude Code 的完整 Prompt 版圖

用一張總覽圖說明 Claude Code 有哪些類型的 prompt：

```
System Prompt（Ch.13 已解析）
  └── buildEffectiveSystemPrompt()
      ├── Static sections（可快取）
      └── Dynamic sections（即時注入）

Tool Descriptions（本章重點）
  ├── BashTool/prompt.ts
  ├── AgentTool/prompt.ts
  ├── SkillTool/prompt.ts
  ├── FileEditTool/prompt.ts
  ├── FileReadTool/prompt.ts
  ├── TodoWriteTool/prompt.ts
  └── GrepTool/prompt.ts

Service Prompts（本章重點）
  ├── compact/prompt.ts（Context 壓縮）
  ├── memdir/teamMemPrompts.ts（Memory）
  ├── extractMemories/prompts.ts（記憶抽取）
  ├── autoDream/consolidationPrompt.ts（記憶整合）
  ├── SessionMemory/prompts.ts（Session 筆記）
  └── coordinator/coordinatorMode.ts（協調器）
```

#### 14.2 BashTool Prompt 全文解析

這是最複雜的 tool prompt，值得整節解析。

**完整文字呈現 + 逐段注解：**
- `getSimplePrompt()` 的完整輸出
- 各段的設計意圖：為什麼要有 git safety protocol？為什麼用 HEREDOC commit message？
- 沙盒模式如何動態注入網路/檔案系統限制

**原始碼位置：** `src/tools/BashTool/prompt.ts`

#### 14.3 AgentTool Prompt — 告訴 Claude 何時 Fork

AgentTool 的 prompt 是「meta-prompt」：它告訴 Claude 如何使用 Agent tool、何時該用、如何撰寫子 agent 的 prompt。

**展示內容：**
- `getPrompt()` 完整輸出（含動態 agent 列表）
- "When to fork" 判斷框架的設計邏輯
- `shouldInjectAgentListInMessages()` 的延遲注入策略
- 與 SkillTool prompt 的互補關係

**原始碼位置：** `src/tools/AgentTool/prompt.ts`

#### 14.4 TodoWriteTool Prompt — 工作管理哲學

TodoWriteTool 的 prompt 包含大量「when to use / when NOT to use」範例，是 Anthropic 對「什麼時候該拆解任務」這個問題的官方答案。

**展示內容：**
- 完整 `PROMPT` 常數文字
- `activeForm` vs. `content` 狀態設計
- 為什麼 TodoWrite 有「絕對不要」的使用情境

**原始碼位置：** `src/tools/TodoWriteTool/prompt.ts`

#### 14.5 Compact Prompt — Context 壓縮的指令設計

`getCompactPrompt()` 和 `getPartialCompactPrompt()` 是為「讓 Claude 自我總結」而設計的 prompt，包含防止工具調用的硬性指令。

**展示內容：**
- `NO_TOOLS_PREAMBLE` + `NO_TOOLS_TRAILER` 設計模式（防止 Claude 在壓縮時呼叫工具）
- `BASE_COMPACT_PROMPT` vs. `PARTIAL_COMPACT_PROMPT` 的差異
- `formatCompactSummary()` 如何剝離 `<analysis>` 標籤後再插回 context

**原始碼位置：** `src/services/compact/prompt.ts`

#### 14.6 Memory Prompts — 三層記憶系統的 Prompt 設計

三種記憶相關 prompt 的完整呈現：

1. **`teamMemPrompts.ts`** — `buildCombinedMemoryPrompt()`：注入 system prompt 的 Memory Section，說明 4 種記憶類型和兩步驟存取流程
2. **`extractMemories/prompts.ts`** — 背景記憶抽取 subagent 的完整 prompt
3. **`autoDream/consolidationPrompt.ts`** — 夜間記憶整合的「dream」prompt，最有哲學感的 prompt

**原始碼位置：** `src/memdir/teamMemPrompts.ts`, `src/services/extractMemories/prompts.ts`, `src/services/autoDream/consolidationPrompt.ts`

#### 14.7 Coordinator Prompt — 多 Agent 協調的指揮官指令

`getCoordinatorSystemPrompt()` 是 Coordinator 模式下完全替換預設 system prompt 的指令集，描述協調器的角色、工具和 XML 通訊格式。

**展示內容：**
- 完整 coordinator prompt 文字
- `<task-notification>` XML 格式的設計決策
- Coordinator vs. 普通 Agent 的 prompt 差異對比

**原始碼位置：** `src/coordinator/coordinatorMode.ts`

---

## Technical Considerations

- 本章是**閱讀型**內容，不需要新增 React component
- 所有 prompt 文字應以 code block 呈現，保留原始格式
- 部分 prompt 包含 template literal（`{{variable}}`），需說明其動態注入機制
- 章節長度預估：~8,000-12,000 字（O'Reilly quality），適合 Starlight 的長頁格式
- 需要同步更新 `index.mdx` 的 homepage CardGrid（目前 Ch.12/13 也遺漏了）

## Acceptance Criteria

- [x] 新增 `src/content/docs/chapters/14-prompt-atlas.mdx`，sidebar `order: 14`
- [x] 完整呈現 BashTool、AgentTool、TodoWriteTool prompt 的全文（含逐段注解）
- [x] 完整呈現 compact prompt、memory prompts、coordinator prompt
- [x] 每節有明確的「設計意圖」解析，不只是貼程式碼
- [x] 更新 `index.mdx` 的 CardGrid，補上 Ch.12、Ch.13、Ch.14 的 LinkCard
- [x] Ch.01 的書籍路線圖表格更新（加入 Ch.14 一行）

## Bonus: 修復現有 Bug

研究過程中發現：
- **Ch.12 和 Ch.13 缺少 homepage CardGrid entry** — 需補上兩個 LinkCard
- **Ch.01 路線圖表格只到 Ch.13** — 需新增 Ch.14 一行

建議在同一個 PR 中一起修復。

## Dependencies & Risks

- **風險：** Prompt 文字可能較長，Starlight 需要良好的 code block 滾動支援 → 可用 `<details>` collapsible 包覆超長內容
- **依賴：** 需要 `claude-code-src/src` 原始碼可讀取（已確認可存取）
- **授權：** 原始碼來源為 Anthropic，引用片段屬教育/研究用途，符合 fair use

## References & Research

### 原始碼位置

- System prompt 主入口：`src/constants/prompts.ts` — `getSystemPrompt()`
- 分發路由：`src/utils/systemPrompt.ts` — `buildEffectiveSystemPrompt()`
- Section 系統：`src/constants/systemPromptSections.ts`
- BashTool prompt：`src/tools/BashTool/prompt.ts`
- AgentTool prompt：`src/tools/AgentTool/prompt.ts`
- SkillTool prompt：`src/tools/SkillTool/prompt.ts`
- FileEditTool prompt：`src/tools/FileEditTool/prompt.ts`
- FileReadTool prompt：`src/tools/FileReadTool/prompt.ts`
- TodoWriteTool prompt：`src/tools/TodoWriteTool/prompt.ts`
- GrepTool prompt：`src/tools/GrepTool/prompt.ts`
- Compact prompt：`src/services/compact/prompt.ts`
- Memory prompt（system injection）：`src/memdir/teamMemPrompts.ts`
- Memory extraction prompt：`src/services/extractMemories/prompts.ts`
- Dream consolidation：`src/services/autoDream/consolidationPrompt.ts`
- Session memory：`src/services/SessionMemory/prompts.ts`
- Coordinator prompt：`src/coordinator/coordinatorMode.ts`

### 現有章節（勿重複）

- Ch.11 `11-prompt-engineering.mdx` — prompt 組裝工程架構
- Ch.13 `13-system-prompt.mdx` — system prompt 17 個 Section 逐節解析
