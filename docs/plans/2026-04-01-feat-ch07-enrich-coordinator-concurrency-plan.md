---
title: "feat: Enrich Ch.07 Coordinator & Concurrency — Three Missing Sections"
type: feat
date: 2026-04-01
chapter: "07-coordinator-concurrency.mdx"
source_files:
  - "src/query.ts (1729 lines)"
  - "src/services/tools/toolOrchestration.ts"
  - "src/services/tools/StreamingToolExecutor.ts"
  - "src/Tool.ts"
quality_target: "O'Reilly professional depth, Traditional Chinese"
---

# ✨ feat: Enrich Ch.07 Coordinator & Concurrency — Three Missing Sections

## Overview

Ch.07 (`07-coordinator-concurrency.mdx`) 已有 Master Query FSM、State 型別、StreamingToolExecutor、並行批次分區、Context Modifier、Sibling Abort、Coordinator Mode、Terminal Conditions、Continue 轉換路徑。

現有內容骨架完整但缺乏「為什麼」的深度：
1. 沒有解釋「為什麼需要這個 loop」——讀者可能以為這只是個普通的迴圈
2. Generator vs Callback 段落太短（只有 4 條 bullet），沒有 callback hell 對比和 backpressure 解說
3. 批次分區（partitionToolCalls）只有 mermaid 圖 + 示意 code，沒有 exclusive vs safe 的工具分類機制、實際 source 引用、或具體工具範例

目標：補充三個 O'Reilly 等級的段落，加入業界引用，用 Traditional Chinese 書寫。

---

## Problem Statement

讀者在讀完現有 Ch.07 後，能知道「有哪些狀態轉換」，但不能回答：
- 「為什麼 Claude Code 要用一個 `while (true)` 迴圈？不能用遞迴或 event-driven 嗎？」
- 「Generator 的 backpressure 到底是什麼？跟 callback 相比差在哪裡？」
- 「`ReadFile` 為什麼可以並行，`WriteFile` 為什麼不行？判斷邏輯在哪裡？」

---

## Source Code Findings (Verified)

### query.ts — 1729 行，核心 loop

```typescript
// line 307: the main while(true) loop
// eslint-disable-next-line no-constant-condition
while (true) {
  // line 311-321: destructure state at iteration start
  let { toolUseContext } = state
  const { messages, autoCompactTracking, ... } = state

  // line 337: yields immediately on each iteration start
  yield { type: 'stream_request_start' }

  // ... pre-compaction, API streaming, tool execution, post-stream decision
}
```

- `query()` 是外層 async generator（line 219-239），把 `yield* queryLoop()` 包起來
- `queryLoop()` 是內層 async generator（line 241-1728），包含 `while (true)`
- 每次迭代都從 `state` 解構，Continue sites 寫 `state = { ...newState }`

### toolOrchestration.ts — partitionToolCalls 實際實現

```typescript
// src/services/tools/toolOrchestration.ts, line 84-116
type Batch = { isConcurrencySafe: boolean; blocks: ToolUseBlock[] }

function partitionToolCalls(
  toolUseMessages: ToolUseBlock[],
  toolUseContext: ToolUseContext,
): Batch[] {
  return toolUseMessages.reduce((acc: Batch[], toolUse) => {
    const tool = findToolByName(toolUseContext.options.tools, toolUse.name)
    const parsedInput = tool?.inputSchema.safeParse(toolUse.input)
    const isConcurrencySafe = parsedInput?.success
      ? (() => {
          try {
            return Boolean(tool?.isConcurrencySafe(parsedInput.data))
          } catch {
            // fail-closed: treat as not safe
            return false
          }
        })()
      : false
    if (isConcurrencySafe && acc[acc.length - 1]?.isConcurrencySafe) {
      // merge into last batch (consecutive safe tools)
      acc[acc.length - 1]!.blocks.push(toolUse)
    } else {
      acc.push({ isConcurrencySafe, blocks: [toolUse] })
    }
    return acc
  }, [])
}
```

**執行邏輯（line 30-81）：**
- `isConcurrencySafe === true` → `runToolsConcurrently` (並行，使用 `all()` 工具函數)
- `isConcurrencySafe === false` → `runToolsSerially` (串行)

### Tool.ts — isConcurrencySafe 預設值

```typescript
// src/Tool.ts, line 750, 759
// Default is fail-closed: assume NOT safe
isConcurrencySafe: (_input?: unknown) => false,
```

- `FileReadTool.isConcurrencySafe() → true`（讀取，無副作用）
- `GlobTool.isConcurrencySafe() → true`（讀取，無副作用）
- `GrepTool.isConcurrencySafe() → true`（讀取，無副作用）
- `BashTool.isConcurrencySafe(input) → this.isReadOnly?.(input) ?? false`（動態判斷）
- 所有寫入工具（FileEditTool, WriteFileTool 等）→ `false`（使用預設 fail-closed）

### StreamingToolExecutor.ts — canExecuteTool 邏輯

```typescript
// line 129-135
private canExecuteTool(isConcurrencySafe: boolean): boolean {
  const executingTools = this.tools.filter(t => t.status === 'executing')
  return (
    executingTools.length === 0 ||
    (isConcurrencySafe && executingTools.every(t => t.isConcurrencySafe))
  )
}
```

**Sibling Abort 的精確語義（line 359-362）：**
只有 `BashTool` 的錯誤才觸發 `siblingAbortController.abort('sibling_error')`，Read/WebFetch 等獨立工具的失敗不取消兄弟工具。

---

## Sections to Add (Implementation Plan)

### Section A: 前置知識橋（章節最前端）

**位置：** frontmatter 之後，`## Master Query 狀態機` 之前

**內容：**

```markdown
這是全書的核心章節。前六章的所有機制——工具系統（Ch.02）、代理編排（Ch.03）、
權限（Ch.04）、Hook（Ch.05）、context 壓縮（Ch.06）——
在這裡被一個 1729 行的 `query.ts` 協調運作。
```

**大小：** 約 50 字

---

### Section B: ## 為什麼需要這個 Loop?（在前置知識橋之後）

**位置：** 前置知識橋 → 此 section → Master Query 狀態機

**結構（O'Reilly 5-part）：**

#### B1. Problem Statement
「一個 LLM 只能做一件事：接受輸入，輸出 token。它沒有持久記憶、無法等待非同步操作、也不能中途插入工具結果。」

#### B2. Context（背景條件）
- LLM statelessness：每次 API call 都是新的，無法「繼續思考」
- Tool execution 是 async：BashTool 可能跑 30 秒，LLM 不能在原地等
- 這兩個現實需要一個協調層

#### B3. Solution（`while (true)` 的正當性）
- Loop 是「LLM turn」與「async tool execution」之間的橋接
- 不是 trivial loop：需要處理 compression（context 超出限制時壓縮）、interruption（使用者按 Esc）、cost limits（token budget）、concurrency（多工具並行）
- CSP 映射：Claude Code 的 loop ≈ Hoare (1978) 的 sequential process，工具呼叫 ≈ channel communication

#### B4. Code Example（真實 source）
引用 `query.ts` line 307 的 `while (true)` + 每輪迭代的 `yield { type: 'stream_request_start' }` 的實際意義

#### B5. Consequence（Trade-off）
這個設計讓每一輪 LLM call 都可以觀察到前一輪的工具結果，代價是必須在每輪重新建構完整 system prompt（→ 這是 Ch.06 context compression 存在的原因）。

**業界引用：**

> *Communicating Sequential Processes* (C.A.R. Hoare, 1978, CACM):
> "A process is … a finite set of communications. … A communication is an event which … simultaneously synchronizes two processes."
>
> 對應關係：Claude Code 的 `queryLoop` 是 Hoare 意義下的 sequential process；
> 每次工具呼叫是 process 間的 communication event，必須「同步」（等待工具完成）後才能繼續下一次 LLM turn。
> 來源：https://dl.acm.org/doi/10.1145/359576.359585，1978-08

**大小：** 約 600-800 字

---

### Section C: ## Generator vs Callback：非同步協調的語言選擇（獨立新 section）

**位置：** 在現有「為什麼用 Generator 而不是 Callback？」段落之後（擴展，不取代）

**目前現有段落只有 4 條 bullet，需要大幅擴展。**

#### C1. Problem Statement
「如果用傳統 callback 來協調工具執行，程式碼會長什麼樣子？」

#### C2. Callback Hell 示意（pseudocode）

```typescript
// ❌ Callback 版本（pyramid of doom）
function runQueryWithCallbacks(params, onComplete) {
  callLLM(params, (response) => {
    if (response.hasTool) {
      executeTool(response.tool, (toolResult) => {
        callLLM({ ...params, messages: [..., toolResult] }, (response2) => {
          if (response2.hasTool) {
            executeTool(response2.tool, (toolResult2) => {
              // 深度無限增加…
              onComplete(response2)
            })
          } else {
            onComplete(response2)
          }
        })
      })
    } else {
      onComplete(response)
    }
  })
}
```

#### C3. Generator 版本（展示如何「展開金字塔」）
引用真實 `query.ts` 的 `yield` + `yield*` 模式，展示如何把上面的巢狀變成線性流程。

#### C4. Backpressure 解說
- **沒有 backpressure**：如果用 push-based（EventEmitter 等），LLM stream 可能每 10ms 發一個 token，消費者（UI 渲染、token 計數）可能跟不上，記憶體無界累積
- **Generator 的 pull**：消費者每次 `for await (const event of stream)` 才向生產者請求下一個 token，天然速率控制
- 引用 `getRemainingResults()` 的 `Promise.race` 模式作為實際實現

**業界引用（Rob Pike）：**

> Rob Pike, "Concurrency is Not Parallelism" (Go Blog, 2013):
> "Concurrency is about dealing with lots of things at once. Parallelism is about doing lots of things at once."
>
> Claude Code 的 generator-based 設計體現了 Pike 的 concurrency 觀念：
> `queryLoop` 用單一 generator 處理 LLM streaming + tool execution 的「多件事同時進行」，
> 而不需要多執行緒（parallelism）。實際的並行（`runToolsConcurrently`）只在 batch 內的安全工具之間出現。
> 來源：https://go.dev/blog/concurrency-is-not-parallelism，2013-01-16

**大小：** 約 700-900 字 + pseudocode

---

### Section D: ## Batch Partitioning：安全並行的資料驅動排程（大幅擴展現有節）

**位置：** 在現有「並行控制：批次分區策略」之後，或取代其 pseudocode 部分（保留 mermaid 圖，添加真實 source + 工具分類 + 具體範例）

#### D1. Problem Statement
「並行寫入 = 資料損壞。串行執行 = 浪費延遲。如何在兩者之間找到精確的切分點？」

#### D2. 工具分類機制（Tool Taxonomy）

| 工具 | `isConcurrencySafe` | 原因 |
|------|---------------------|------|
| `FileReadTool` | `true` | 唯讀，無副作用 |
| `GlobTool` | `true` | 唯讀，無副作用 |
| `GrepTool` | `true` | 唯讀，無副作用 |
| `BashTool` | 動態（`isReadOnly()` 判斷） | 取決於命令內容 |
| `FileEditTool` | `false`（預設 fail-closed） | 修改檔案系統 |
| `WriteFileTool` | `false` | 修改檔案系統 |
| MCP 工具（第三方） | `false`（預設） | 未知副作用 |

**Fail-closed 原則：** `Tool.ts` 的預設值是 `isConcurrencySafe: () => false`，任何未明確聲明的工具都被視為不安全。

#### D3. Concrete Example：[ReadFile, ReadFile, WriteFile, BashTool]

```
Input: [ReadFile(a.ts), ReadFile(b.ts), WriteFile(c.ts), BashTool("git status")]

partitionToolCalls 的處理過程：
  step 1: ReadFile(a.ts)  → isConcurrencySafe=true  → 新 batch: [{safe, [ReadFile(a)]}]
  step 2: ReadFile(b.ts)  → isConcurrencySafe=true  → 合併到最後一個 safe batch
           結果: [{safe, [ReadFile(a), ReadFile(b)]}]
  step 3: WriteFile(c.ts) → isConcurrencySafe=false → 新 batch（exclusive）
           結果: [{safe, [ReadFile(a), ReadFile(b)]}, {exclusive, [WriteFile(c)]}]
  step 4: BashTool("git status") → 動態判斷 isReadOnly → 假設是唯讀命令 → true
           但前一個 batch 是 exclusive（WriteFile），所以無法合併
           結果: [{safe, [...2 reads...]}, {exclusive, [WriteFile]}, {safe, [BashTool]}]

執行順序：
  Batch 1: ReadFile(a.ts) ‖ ReadFile(b.ts)    ← 並行（Promise.all 語義）
  Batch 2: WriteFile(c.ts)                     ← 串行（獨占執行）
  Batch 3: BashTool("git status")              ← 串行（因 WriteFile 之後，需隔離）
```

**注意：** BashTool 的 `isReadOnly` 是動態判斷，透過 `checkReadOnlyConstraints` 分析命令字串是否含寫入操作（如 `>`, `rm`, `mkdir` 等）。

#### D4. 真實 Source Code（`partitionToolCalls`）
引用 `toolOrchestration.ts` line 84-116 的完整實現（已在 Source Code Findings 中記錄）。

#### D5. Consequence（Trade-off）
「最大化了安全唯讀操作的並行度，同時對任何有副作用的操作保持保守。代價是：如果 BashTool 命令難以靜態分析，就被 fallback 到串行——這是正確性優先於效能的刻意選擇。」

**大小：** 約 600-800 字 + 表格 + 具體範例

---

### Section E: 承先啟後（章節結尾）

**位置：** `## 關鍵要點` 之後

```markdown
query loop 決定了 Claude Code 的執行節奏。
但 Claude Code 的能力不是固化的——
Skills 和 Plugins（Ch.08）讓使用者和第三方擴展它的工具集和行為。
```

**大小：** 約 40 字

---

## Acceptance Criteria

### Functional Requirements

- [ ] 前置知識橋出現在 frontmatter 之後、第一個 `##` heading 之前
- [ ] `## 為什麼需要這個 Loop?` 包含 LLM statelessness 解說 + `while(true)` 正當性 + CSP 引用
- [ ] Generator vs Callback 段落包含 callback hell pseudocode + generator 展開版本 + backpressure 解說
- [ ] Batch Partitioning 段落包含工具分類表 + [ReadFile, ReadFile, WriteFile, BashTool] 具體範例 + `partitionToolCalls` 真實 source
- [ ] 承先啟後出現在章節最後
- [ ] 所有 function/type 名稱使用真實 source code 名稱（`isConcurrencySafe`, `partitionToolCalls`, `runToolsConcurrently`, `runToolsSerially`）
- [ ] CSP 引用（Hoare 1978）和 Rob Pike 引用各包含 2+ 句原文
- [ ] 語言：Traditional Chinese (zh-TW)，技術術語和 function 名稱保持英文

### Non-Functional Requirements

- [ ] 不刪除或取代任何現有 section
- [ ] 新增內容與現有 mermaid 圖、Terminal Conditions 表格、Continue 轉換表格相容
- [ ] 每個段落以「反直覺的觀察」開頭（O'Reilly 風格）
- [ ] 字數：現有約 2000 字 → 新增後至少 3800 字

### Quality Gates

- [ ] 所有引用的 source code line numbers 真實可查
- [ ] `isConcurrencySafe` 預設值（`false`，fail-closed）已在文中解釋
- [ ] Batch 分析範例的分批結果與 `partitionToolCalls` 邏輯一致（consecutive safe → merge；exclusive → new batch；safe after exclusive → new batch）

---

## Implementation Notes

### 注意事項

1. **BashTool 的動態分類**：`BashTool.isConcurrencySafe(input)` 呼叫 `isReadOnly?.(input) ?? false`，後者透過 `checkReadOnlyConstraints` 動態分析命令字串。在具體範例中，需標注 `BashTool("git status")` 被判定為安全的原因。

2. **partitionToolCalls vs StreamingToolExecutor**：這兩個地方都實現了並行控制，但邏輯略有不同：
   - `toolOrchestration.ts::partitionToolCalls` — 靜態預先分批，用於 batch-mode 工具執行
   - `StreamingToolExecutor::canExecuteTool` — 動態佇列，用於 streaming 模式中工具即時到達時的排程
   Ch.07 現有內容已涵蓋 `StreamingToolExecutor`；新增段落應聚焦 `partitionToolCalls`（`toolOrchestration.ts`）。

3. **Sibling Abort 只對 Bash 工具生效**：`StreamingToolExecutor.ts` line 359 明確說明只有 `BASH_TOOL_NAME` 的錯誤才 abort siblings。這是刻意設計：BashTool 命令通常有隱式依賴鏈，而 ReadFile/WebFetch 等是獨立的。

4. **不重複現有內容**：現有的 Mermaid 圖（partitionToolCalls 示意）和 Context Modifier 段落保留不動；新 Section D 是對現有 pseudocode 的深度補充，而非替代。

---

## File Paths & References

### Internal Source Files

- `src/query.ts:219` — `query()` async generator 定義
- `src/query.ts:241` — `queryLoop()` async generator 定義
- `src/query.ts:307` — `while (true)` 主迴圈
- `src/services/tools/toolOrchestration.ts:84` — `Batch` 型別定義
- `src/services/tools/toolOrchestration.ts:91` — `partitionToolCalls()` 函數
- `src/services/tools/toolOrchestration.ts:118` — `runToolsSerially()`
- `src/services/tools/toolOrchestration.ts:152` — `runToolsConcurrently()`
- `src/services/tools/StreamingToolExecutor.ts:129` — `canExecuteTool()`
- `src/Tool.ts:750` — `isConcurrencySafe` 預設值（fail-closed）
- `src/tools/FileReadTool/FileReadTool.ts:373` — `isConcurrencySafe: () => true`
- `src/tools/BashTool/BashTool.tsx:434` — `isConcurrencySafe(input)` 動態實現

### External References

- **Hoare (1978)** — "Communicating Sequential Processes", CACM Vol. 21, No. 8
  URL: https://dl.acm.org/doi/10.1145/359576.359585
  引用：LLM turn as sequential process, tool call as channel communication

- **Rob Pike (2013)** — "Concurrency is Not Parallelism", Go Blog
  URL: https://go.dev/blog/concurrency-is-not-parallelism
  引用：Concurrency vs parallelism 的精確區分，與 Claude Code 的 generator 設計對應

### Target File

- `src/content/docs/chapters/07-coordinator-concurrency.mdx`

---

## Risk Analysis

| 風險 | 可能性 | 緩解策略 |
|------|--------|----------|
| 新增內容與現有 mermaid 圖重複 | 中 | Section D 的範例用文字/code block，不新增 mermaid 圖 |
| BashTool 動態分類的細節誤導讀者 | 低 | 加注：「動態判斷，取決於命令內容」 |
| CSP 引用過於學術，打斷閱讀節奏 | 中 | 引用放 callout block，正文先講 Claude Code 具體行為 |
| partitionToolCalls vs StreamingToolExecutor 混淆 | 中 | 加注釐清兩者的使用場景 |

---

## Word Count Estimate

| Section | 估計字數（中文字） |
|---------|----------------|
| 前置知識橋 | ~50 |
| 為什麼需要這個 Loop? | ~700 |
| Generator vs Callback（擴展） | ~800 |
| Batch Partitioning（深化） | ~700 |
| 承先啟後 | ~40 |
| **新增合計** | **~2,290** |
| 現有內容 | ~2,000 |
| **新總字數** | **~4,290** |
