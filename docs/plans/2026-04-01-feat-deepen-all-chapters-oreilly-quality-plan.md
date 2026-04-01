---
title: "feat: Deepen All Chapters to O'Reilly / Lilian Weng Quality"
type: feat
date: 2026-04-01
chapters: "11 existing + 2 new = 13 total"
source_verified: false
quality_target: "O'Reilly professional depth + Lilian Weng analytical clarity"
---

# Deepen All 13 Chapters — WHY / HOW / WHAT + Industry References

## Overview

目前 blog 的骨架完整、state machine 圖準確、source code 引用真實。
缺的是「肉」：WHY（為什麼要這樣設計）、HOW（一步一步怎麼執行）、以及對齊業界知識的深度解說。

目標：讀者讀完後，對 Claude Code 的每個 subsystem 有
**工程師級別的理解**，不是使用者手冊，而是像讀 O'Reilly 的《Linux Kernel Development》或 Lilian Weng 的 agent survey 一樣——
理解設計決策背後的取捨、理解為什麼其他方案行不通。

新增：
- **Ch.12 — Feature Inventory**：解鎖 Claude Code 所有隱藏功能、CLI 參數、環境變數
- **Ch.13 — System Prompt Deep Dive**：完整解析 Claude Code 的 system prompt 架構與實際內容

---

## Meta-Requirements（適用全部 13 個章節）

### A. 每章執行前必須完成「Chapter Research Package」

在開始寫任何章節的內容之前，必須先準備以下研究包：

```
Chapter Research Package (需記錄在 docs/plans/research/ 目錄)
├── 1. 現有內容盤點   — 讀取 .mdx 文件，列出所有 section + 每 section 的散文字數
├── 2. Source Code 對齊 — 讀取對應的 source files，記錄所有 type/function 名稱
├── 3. 業界參考內容   — 必須來自以下可信來源（見下方列表）
└── 4. 缺口分析       — 對比現有內容和 source code，列出 WHY/HOW/WHAT 缺口
```

**業界參考來源白名單（只接受這些來源，拒絕 AI 垃圾文）：**

| 類型 | 可信來源 |
|------|---------|
| AI Agent 架構 | Lilian Weng 個人 blog (lilianweng.github.io)、Anthropic Research Blog、OpenAI Research Blog |
| 系統設計 | USENIX OSDI/SOSP 論文、Google/Meta/Microsoft 工程 blog |
| 並行/排程 | MIT 6.S081 (Operating Systems)、CMU 15-213、CSAPP (CS:APP 3e) |
| LLM Engineering | Hugging Face Blog、Andrej Karpathy YouTube/Blog、DeepMind Blog |
| 軟體工程 | Martin Fowler bliki、Dan Abramov (overreacted.io)、高品質 ACM/IEEE 論文 |
| 安全 | USENIX Security 論文、Anthropic Alignment science blog |

**每個 reference 必須包含：**
- 原文節錄（> 2 句直接引用）
- 與 chapter 內容的對應關係（「這段解釋了為什麼 Claude Code 選擇 X 而不是 Y」）
- 來源 URL + 發表日期

### B. 章節間「承先啟後」連結

每個章節必須有：

**1. 章節開頭的「前置知識橋」**（1-2 句，不是 checklist）

```markdown
本章需要你對 Ch.02 的 Tool 執行生命週期有基本認識 ——
特別是 `PermissionDecision` 型別在 `tool.checkPermissions()` 中的角色。
如果你跳過了 Ch.02，建議先讀「三條平行審批路徑」那一節。
```

**2. 章節結尾的「延伸連結」**（1-2 句）

```markdown
下一章（Ch.05 Hook System）會展示權限層的一個具體擴展點：
pre_tool 和 post_tool hook 如何讓外部腳本參與權限決策，
而不需要修改 permission system 的核心代碼。
```

**3. 全書導讀表**（只在 Ch.01 出現一次）

一個表格，說明每章和其他章的依賴關係，幫助讀者決定閱讀順序。

### C. O'Reilly 書籍視覺規範

**每個主要技術概念的散文結構：**

```
1. Problem Statement（1 句）—— 沒有這個機制，什麼東西會壞掉？
2. Context（1-2 句）—— 背景條件是什麼？
3. Solution（3-5 句）—— 具體怎麼解決的？
4. Code Example —— 真實的 type/function，不是虛構的
5. Consequence（1-2 句）—— 這個選擇帶來了什麼代價？
```

**數字要具體，不用形容詞：**
- ❌ 「節省大量 token 費用」
- ✅ 「cache 命中將 50k tokens 的費用降低到等效 5k token（90% 折扣）」

**Trade-off 必須顯性化：**
- ❌ 「這個設計更優雅」
- ✅ 「這個設計犧牲了子代理的 system prompt 客製化彈性，換取了 85-90% 的 cache hit rate」

**每章末尾的「延伸閱讀」section（選擇性）：**
- 2-3 個外部連結，來自業界白名單
- 一句話說明「如果你想更深入理解 X，這篇論文/文章解釋了原理」

---

## Writing Philosophy

### Lilian Weng 段落節奏

每段以一個反直覺的觀察或矛盾開場，然後用機制解釋它：

> **反直覺：** Claude Code 的子代理不是獨立的 process，而是父代理的「快取共享分身」。
> 聽起來奇怪：為什麼不讓每個代理有完全獨立的 system prompt？
> **機制：** Anthropic API 的 prompt cache 基於 prefix match。兩個 API call 的 system prompt 前綴完全一致，第二次只收 10% 費用。父子代理共享同一套 CacheSafeParams——system prompt + tools + model——確保每次子代理呼叫都命中快取。
> **代價：** 子代理無法有自訂的 system prompt（除非指定 agent type）。這是刻意的架構約束，用客製化彈性換取成本可控性。

### O'Reilly 技術書籍的「Why First」原則

每個新 section 的第一句永遠是問題，不是答案：

> ❌「Claude Code 使用 memoize 快取 context。」
> ✅「每次 API call 都重新組裝 system context 會消耗數十毫秒。對於一個 agentic session 中的數百次 API call，累積延遲不可接受——於是 context 組裝只發生一次。」

---

## Chapter-by-Chapter Enrichment Spec

---

### Ch.01 — 什麼是 Harness Engineering?
**Priority: Medium**
**Research refs needed:** Lilian Weng "LLM Powered Autonomous Agents" (2023), Anthropic "Building effective agents" (2024)

**Additions:**

1. **開頭加「全書路線圖」表格**
   - 每章主題 + 依賴的前置章節 + 本章引入的核心概念

2. **Startup Flow 加詳細序列**
   - Source: `src/main.tsx`, `src/setup.ts`, `src/bootstrap/state.ts`
   - 必須說明哪些步驟必須串行（為什麼）：MCP 連線必須在 tool list 生成前完成（MCP tools 要加入 tool list）

3. **Architecture 圖後加每個 box 的責任說明**
   - 表格：box 名稱 → 負責什麼 → 主要 source files → 詳見 Ch.N

4. **加「從使用者輸入到 Claude 回應的全端旅程」散文段落**
   - O'Reilly 格式：「當你輸入 'refactor my auth module' 並按下 Enter，接下來發生的是...」
   - 這讓讀者在讀完全書之前有一個完整的心智模型

**承先啟後：** Ch.01 是唯一有「全書路線圖」的地方。結尾說明 Ch.02 從工具 interface 開始講起的理由。

**Research Package Sources:**
- Lilian Weng: "LLM Powered Autonomous Agents" — agent loop architecture section
- Anthropic Research: "Claude's Constitution" — safety constraint framing

---

### Ch.02 — Tool System
**Priority: Medium**
**Research refs needed:** Unix "everything is a file" philosophy (CSAPP), REST uniform interface principle (Fielding dissertation)

**Additions:**

1. **Zod + JSON Schema 雙軌驗證的 Why**
   - 說明兩套 schema 各自保護什麼：
     - JSON Schema → 引導 LLM 格式化輸入（tool calling protocol）
     - Zod → harness 端 runtime 保護，不讓 LLM hallucinated input crash the system
   - 類比：HTTP API 的 OpenAPI spec（告訴客戶端怎麼呼叫）vs 後端 validation（保護服務器）

2. **`lazySchema` 加 prose 解釋循環依賴場景**
   - 具體：AgentTool 的 schema 需要 tools list → tools list 包含 AgentTool → 循環
   - Lazy evaluation 打破循環：「在你 *使用* AgentTool 時才實例化它的 schema，而不是在模組載入時」

3. **Progress callback → UI 的路徑說明**
   - BashTool stdout → `onProgress()` → `StreamingToolExecutor` → React/Ink render

**前置知識橋：** 「本章的 Tool interface 是後續所有章節的基礎。Ch.03 的子代理、Ch.04 的權限系統、Ch.05 的 hook system 都建立在這個 interface 之上。」

**承先啟後 → Ch.03：** 「工具執行的生命週期到此為止——輸入、驗證、執行、結果。但有時候，一個任務需要派遣另一個 Claude 來處理。Ch.03 介紹的 AgentTool 是特殊的工具，它的 call() 函式不操作文件，而是啟動另一個 AI 對話。」

**Research Package Sources:**
- Roy Fielding Dissertation (2000): Uniform Interface constraint — tools as uniform side-effect interface
- CSAPP (CS:APP 3e): Type-safe interface design philosophy

---

### Ch.03 — Agent Orchestration
**Priority: High**
**Research refs needed:** Google "Borg" paper (2015) resource isolation, Anthropic "Multi-agent frameworks" blog

**Additions:**

1. **新增 "為什麼是 Fork 而不是 Spawn?" section**
   - Fork model（Claude Code）vs New Process（naive approach）的對比
   - Fork: 共享 CacheSafeParams prefix → 90% cache hit
   - Spawn: 每次重傳 50k token system prompt → $N × full price
   - 具體數字：10 個子代理 × 50k tokens × $15/1M tokens = $7.5 vs cache hit = $0.75

2. **Worktree 隔離加 merge/cleanup 流程**
   - 子代理 commit 後怎麼 merge 回主 branch？
   - 衝突時的處理策略
   - Source: worktree utils

3. **Prompt Caching 底層機制一段解釋**
   - Anthropic API 的 `cache_control: {"type": "ephemeral"}` marker
   - Prefix match 規則
   - 10% read price on cache hit

4. **Coordinator Mode 的 tool restriction 說明**
   - Worker 只能看到 `WORKER_ALLOWED_TOOLS`，為什麼？（防止 worker 自己派遣更多 worker 導致無限遞迴）

**前置知識橋：** 「本章建立在 Ch.02 的 Tool interface 上。AgentTool 是一個特殊工具，它的 `call()` 不操作文件，而是用 `forkedAgent()` 啟動另一個 query loop。」

**承先啟後 → Ch.04：** 「子代理擁有工具，但能使用哪些工具？誰決定？Ch.04 的 permission system 是答案。特別是，bypassPermissions mode 讓子代理在自動化流程中跳過互動確認——這是 agentic 系統中最微妙的設計之一。」

**Research Package Sources:**
- Anthropic Blog: "Building effective agents" (2024) — multi-agent coordination
- Google "Borg" (2015) — resource isolation vs sharing trade-offs

---

### Ch.04 — Permission Architecture
**Priority: Low**
**Research refs needed:** Bell-LaPadula security model (1973), POLA (Principle of Least Authority)

**Additions:**

1. **加具體的 Permission Rule 例子**
   - 一個 rule JSON：「只允許讀取 /tmp 和 /home/user/project 目錄」

2. **Speculative Classification 的觸發時機**
   - 在 LLM streaming 時看到 `tool_use` block 的開始就觸發，不等 complete JSON
   - 減少 end-to-end latency 的具體數字（如果有）

3. **bypassPermissions mode 的安全設計**
   - 什麼情況下是合法的（CI/CD automation）
   - 為什麼需要顯式設定而不是預設（blast radius）

**前置知識橋：** 「本章的 permission system 接在 Ch.02 的 tool execution sequence 之後，是 `runToolUse()` 中 Permission Check 狀態的實現細節。」

**承先啟後 → Ch.05：** 「Permission system 有一個重要的擴展點：hook。Ch.05 展示如何用 pre_tool hook 在 permission decision 之後、tool execution 之前注入自訂邏輯——例如記錄所有危險命令或二次確認刪除操作。」

**Research Package Sources:**
- E. B. Saltzer & M. D. Schroeder "The Protection of Information in Computer Systems" (1975) — least authority principle
- USENIX Security: capability-based security model

---

### Ch.05 — Hook System
**Priority: Low**
**Research refs needed:** Unix signal handling (POSIX), WordPress Hook architecture, Ruby on Rails callbacks

**Additions:**

1. **Env Var 組裝的說明**
   - harness 在 spawn subprocess 前如何組裝 env：來自 AppState + current tool context

2. **多層 Hook 的全部執行語義**
   - 同一 event 在 5 個 source 都有 hook 時：全部執行（串行），結果聚合
   - 這和某些框架的「first wins」不同——要說清楚

**前置知識橋：** 「Hook system 是 permission architecture（Ch.04）的一個具體擴展點，也是 context management（Ch.06）的觀察者。」

**承先啟後 → Ch.06：** 「Hook 讓外部腳本可以觀察和介入工具執行。但 Claude 本身的「記憶」——從一輪到下一輪如何保留資訊——是另一個問題。Ch.06 的 context management 解決 AI 的記憶問題。」

**Research Package Sources:**
- Martin Fowler "Event Sourcing" — hook as observable side effects
- WordPress Plugin Handbook: hook/filter architecture as extension model

---

### Ch.06 — Context Management
**Priority: Medium**
**Research refs needed:** Lilian Weng "The Transformer Family" memory section, "Attention is All You Need" (2017)

**Additions:**

1. **Microcompact 的 "cached" 語義說明**
   - 什麼是「複用前一次壓縮結果」？
   - 觸發條件：上一輪已壓縮 + conversation 結構沒有根本改變
   - vs autocompact：不需要新的 LLM call，成本極低

2. **contextCollapse Feature Flag 解釋**
   - 什麼是「細粒度歷史」drain queue？
   - 和 autocompact 的互斥關係（proactive vs reactive 壓縮策略）

3. **快取失效精確語義**
   - 為什麼改 system prompt injection 也要清除 getUserContext？
   - system context + user context 是一個一致性單元

4. **加類比說明**：
   - context window = 工作記憶（Working Memory）
   - CLAUDE.md = 長期記憶（Long-term Memory）
   - 壓縮摘要 = 情節記憶（Episodic Memory）
   - 對應 Baddeley 的認知記憶模型（這是認知科學的 reference，非 AI 垃圾）

**前置知識橋：** 「前幾章的工具執行、代理通訊、權限檢查——所有這些都在 context window 內發生。本章解釋 Claude Code 如何管理這個有限資源。」

**承先啟後 → Ch.07：** 「Context 的管理是被動防禦。Ch.07 展示主動的一面：query loop 如何在每輪決策中協調所有這些機制——決定什麼時候壓縮、什麼時候允許工具並行、什麼時候終止。」

**Research Package Sources:**
- A. Baddeley "Working Memory" (1974/2000) — cognitive analogy for context window
- Lilian Weng "LLM Powered Autonomous Agents" — memory types section

---

### Ch.07 — Coordinator & Concurrency
**Priority: High**
**Research refs needed:** CSP (Communicating Sequential Processes, Hoare 1978), Go concurrency model, POSIX signals

**Additions:**

1. **新增 "## 為什麼需要這個 Loop?" 開頭 section**
   - LLM 是無狀態的：每次只能 input → output，沒有「繼續想」的能力
   - 工具執行是 async 的：必須等工具完成才能繼續
   - 需要一個 while(true) loop 作為 orchestration layer
   - 不是 trivial loop：要處理並行、壓縮、中斷、成本控制

2. **Generator vs Callback 加具體例子**
   - Callback hell 版本的偽代碼（說明問題）
   - Generator 版本（說明解法）
   - 為什麼 backpressure 在 streaming LLM output 中很重要

3. **Batch Partitioning 加動機說明**
   - 問題：concurrent write 不安全，serial execution 太慢
   - Batch partitioning：按 exclusive/safe 分組，組內並行，組間串行
   - 具體例子：[ReadFile, ReadFile, WriteFile, BashTool] → 兩個 batch

**前置知識橋：** 「這是全書的核心章節。前六章的所有機制——工具系統、代理編排、權限、Hook、context——在這裡被一個 1729 行的 `query.ts` 協調運作。」

**承先啟後 → Ch.08：** 「query loop 決定了 Claude Code 的執行節奏。但 Claude Code 的能力不是固化的——Skills 和 Plugins（Ch.08）讓使用者和第三方擴展它的工具集和行為。」

**Research Package Sources:**
- C.A.R. Hoare "Communicating Sequential Processes" (1978) — CSP model for concurrency
- Go blog "Concurrency is not Parallelism" (Rob Pike) — goroutine analogy to generator concurrency
- POSIX signal handling model — async event in synchronous loop analogy

---

### Ch.08 — Skills & Plugin System
**Priority: High**
**Research refs needed:** MCP specification (Anthropic, 2024), LSP (Language Server Protocol, 2016), UNIX everything-is-a-file

**Additions:**

1. **新增 "## Model Context Protocol (MCP) 是什麼?" section**
   - MCP = Anthropic 定義的標準化 LLM-tool interface protocol
   - 目標：任何語言寫的 tool server 都能接入 Claude
   - vs HTTP REST：MCP 是雙向 stream，tool server 可以 push 通知
   - MCP client (Claude Code) ↔ MCP server (your tool) 的 message flow
   - 類比 LSP（Language Server Protocol）：相同的 client-server 解耦理念

2. **URL Elicitation 加使用情境**
   - 觸發：MCP server 回傳特殊 error code（需要使用者提供認證 URL）
   - User experience：Claude Code 彈出 prompt → 使用者輸入 → 重試

3. **Plugin Lifecycle 每個階段說明**
   - Validation：檢查 plugin schema + required fields
   - Hook Registration：把 plugin hooks 加進 global hook registry
   - Tool Registration：把 plugin tools 加進 available tools（這時才能被 LLM 呼叫）
   - 為什麼要分三步？每步可以獨立失敗，error isolation

**前置知識橋：** 「前七章描述的是 Claude Code 的 core system。本章描述 core 之外的擴展層——它的設計原則是：擴展不應該能破壞 core。」

**承先啟後 → Ch.09：** 「Skills 和 Plugins 可以動態改變 Claude Code 的行為。但 Claude Code 如何管理這些狀態——MCP 連線、已載入的 Skills、使用者設定——這是 Ch.09 的主題。」

**Research Package Sources:**
- Anthropic MCP Specification (2024) — official protocol design rationale
- Microsoft LSP Specification (2016) — client-server protocol design for extensibility
- Martin Fowler "Plugin" pattern (Patterns of Enterprise Application Architecture)

---

### Ch.09 — State Management
**Priority: Medium**
**Research refs needed:** Redux philosophy (Dan Abramov), React unidirectional data flow, Elm architecture

**Additions:**

1. **為什麼不用 Redux/Zustand?**
   - Claude Code 的 state 有特殊需求：snapshot（用於 context 壓縮）、diff（用於成本 delta）
   - Redux 的 middleware/devtools 對 agent session 無意義（沒有 time-travel 需求）
   - AI agent 的 state 是 ephemeral：session 結束就丟棄，不需要持久化框架
   - Simple Store 的 3 methods 對比 Redux 的 20+ API

2. **ToolUseContext 的 call stack 追蹤**
   - 一次完整的 tool call context 傳遞路徑：
     - `query()` → 建立 ToolUseContext
     - → `runToolUse(context, ...)` → `tool.call(args, context, ...)`
     - → `tool.checkPermissions(context)` → hook execution

3. **L2 Disk Cache 的 invalidation 策略**
   - Key 結構：session ID + tool name + input hash
   - TTL vs explicit invalidation 的選擇

**前置知識橋：** 「Ch.07 的 query loop 在每輪都讀寫 State 物件。本章解釋這個 State 的設計哲學——為什麼一個簡單的 store 比 Redux 更適合 agent 系統。」

**承先啟後 → Ch.10：** 「State management 是一個具體的設計模式。Ch.10 收集整本書中所有出現的設計模式，給出一個統一的視角。」

**Research Package Sources:**
- Dan Abramov "You Might Not Need Redux" (2016) — when simplicity wins
- Elm Architecture documentation — unidirectional data flow rationale

---

### Ch.10 — Design Patterns Summary
**Priority: Medium**
**Research refs needed:** GoF Design Patterns, Martin Fowler PEAA, Rich Hickey "Simple Made Easy" (2011)

**Additions:**

1. **每個 Pattern 的 Problem 段落擴充到 3-4 句**
   - Pattern 1 (Generator)：callback hell 的具體後果
   - Pattern 3 (Promise.race)：串行等待的 latency 代價
   - Pattern 5 (Lazy Schema)：eager initialization 導致 Node.js module loading deadlock 的具體場景

2. **Checklist 每項加 "在 Claude Code 中：..." 標注**
   - 指向具體的實現位置（file:function）

3. **新增 "Pattern 之間的關係圖"**
   - 哪些 patterns 互相依賴？哪些是彼此的替代？

**前置知識橋：** 「你已經讀完了 9 個章節。現在我們退一步，看這些設計決策的共同主題。」

**承先啟後 → Ch.11：** 「所有的工具、代理、權限都在一個最終的媒介上運作：system prompt。Ch.11 解析 Claude Code 如何把這本書前十章的所有知識，壓縮成 LLM 能理解的指令。」

**Research Package Sources:**
- Rich Hickey "Simple Made Easy" (2011) — complexity vs simplicity trade-off philosophy
- GoF "Design Patterns" (1994) — pattern vocabulary foundation

---

### Ch.11 — Prompt Engineering
**Priority: Medium**
**Research refs needed:** Anthropic "Prompt Engineering Guide" (official), OpenAI "Best Practices for Prompt Engineering"

**Additions:**

1. **加具體的 cost impact 數字**
   - system prompt + tools ≈ 50,000 tokens
   - 沒有 cache：每次 API call = 50k input tokens × $15/1M = $0.75
   - 有 cache（10%）：等效 5k tokens = $0.075
   - 10 輪對話：$7.5 → $0.75（節省 90%）
   - 10 個子代理 session：$75 → $7.5

2. **LLM 如何「知道」自己在哪個 mode 的說明**
   - Mode 不是 if/else，是 `buildSystemPrompt(mode)` 選擇不同 Section 組合
   - Coordinator mode：system prompt 有 TeamCreateTool 使用說明
   - Subagent mode：system prompt 是簡化版，task-focused

3. **為什麼靜態 prefix 必須在動態 section 之前？**
   - Anthropic API cache = prefix match
   - 任何前面的改變都 bust cache
   - Static sections（tool defs, core instructions）放 boundary 之前
   - Dynamic sections（git status, CLAUDE.md, user context）放之後

**前置知識橋：** 「Ch.06 介紹了 context window 的有限性和壓縮策略。本章從另一個角度看這個問題：如何設計 system prompt 讓有限的 context budget 發揮最大效果。」

**承先啟後 → Ch.12：** 「我們現在理解了 Claude Code 的 prompt 設計哲學。但 Claude Code 還有很多不在文檔中的功能——隱藏在 feature flags 和環境變數背後。Ch.12 是一次深入探索。」

**Research Package Sources:**
- Anthropic "Prompt Engineering Overview" (official docs) — cache control section
- OpenAI "Best Practices for Prompt Engineering" — instruction placement rationale

---

### Ch.12 — Feature Inventory（新章節）
**Priority: High — 全新章節**
**Source:** `/Users/weirenlan/Desktop/self_project/labs/claude-code-src/claude-code-hidden-features.md`
**sidebar order: 12**

**章節主題：** Claude Code 的隱藏功能、未發佈特性、CLI 參數、環境變數完整盤點。
讀者定位：進階使用者 + 想要了解 Claude Code 「真實能力邊界」的工程師。

**結構規劃：**

```
## 為什麼有隱藏功能？
  - Feature flags 的設計哲學（gradual rollout, A/B testing, internal-only）
  - GrowthBook 作為 flag 管理系統

## 一、重大未發佈功能（10 項）
  ### Voice Mode
  ### Coordinator Mode（多 Agent 協調）
  ### KAIROS（守護程式模式）
  ### Bridge Mode（遠端控制）
  ### BUDDY（AI 精靈）
  ### ULTRAPLAN / ULTRATHINK
  ### Agent Triggers（自動排程）
  ### Workflow Scripts
  ### Team Memory
  ### Verification Agent

## 二、隱藏 CLI 參數（30+）
  - 按類別分組：多代理相關、除錯相關、模型控制、認證相關
  - 每個參數說明「使用場景」

## 三、環境變數完整參考
  - 功能開關類
  - 停用功能類
  - 除錯與效能類
  - 模型覆蓋類
  - 認證相關類

## 四、隱藏 Server 命令
  - claude server, claude ssh, claude remote-control

## 關鍵要點
  - Feature flags 是 safety net，不是 easter eggs
```

**WHY section 說明：**
為什麼要有 feature flags？
- Progressive rollout：避免一次性全面推出破壞穩定性
- A/B testing：測試不同功能的使用效果
- Internal-first：在外部發佈前讓 Anthropic 員工測試

**寫作風格：**
- 不是炫耀「我發現了彩蛋」的 blog post
- 是嚴肅的功能盤點，說明每個功能的技術原理和適用場景

**前置知識橋：** 「讀完前 11 章，你對 Claude Code 的架構有了完整認識。本章揭示架構之外的能力邊界——什麼是已經存在但還沒公開的功能。」

**承先啟後 → Ch.13：** 「隱藏功能中有一個特別重要的：system prompt 的完整內容。Ch.13 把分析文件轉化成可操作的工程知識。」

**Research Package Sources:**
- Martin Fowler "Feature Toggles (aka Feature Flags)" (2017) — feature flag design patterns
- Google "Site Reliability Engineering" Ch.25 — progressive rollout strategies

---

### Ch.13 — System Prompt Deep Dive（新章節）
**Priority: High — 全新章節**
**Source:** `/Users/weirenlan/Desktop/self_project/labs/claude-code-src/docs/claude-code-system-prompt-analysis.md`
**sidebar order: 13**

**章節主題：** Claude Code system prompt 的完整架構分析——從 17 個 section 的組裝到靜態/動態邊界的設計。
讀者定位：想要客製化 Claude Code 行為、或者理解「Claude 為什麼這樣回應」的工程師。

**結構規劃：**

```
## 為什麼 System Prompt 是工程問題？
  - 不是「寫提示詞」，是「軟體架構」
  - 模組化、版本化、快取優化、多模式多型

## 一、Prompt 優先級系統（5 層）
  - Override → Coordinator → Agent → Custom → Default
  - 什麼情況下每層會生效？

## 二、17 個 Section 的組裝流程
  - 靜態區段（1-7）：可以跨 session 快取
  - DYNAMIC BOUNDARY marker
  - 動態區段（8-17）：每 session 不同

## 三、靜態區段逐一解析
  ### Intro — 身份宣告與安全指令
  ### System — 系統行為規範
  ### Doing Tasks — 任務執行原則
  ### Executing Actions with Care — 審慎執行
  ### Using Your Tools — 工具使用指南
  ### Tone and Style — 語氣風格
  ### Output Efficiency — 輸出效率（外部 vs 內部版本差異）

## 四、動態區段解析
  ### Session-specific Guidance（根據工具動態生成）
  ### Memory（自動記憶系統 — memdir）
  ### Environment Info
  ### Language Preference
  ### MCP Instructions
  ### Scratchpad, Function Result Clearing, Summarize

## 五、特殊 Mode 的 Prompt 差異
  ### Simple Mode（3 行）
  ### Proactive / KAIROS Mode
  ### Coordinator Mode
  ### Subagent Mode

## 六、Section 快取框架
  - systemPromptSection() vs DANGEROUS_uncachedSystemPromptSection()
  - 為什麼 mcp_instructions 是 DANGEROUS_uncached？
  - 快取失效的觸發條件

## 七、如何客製化 Claude Code 的行為
  - CLAUDE.md 層級（managed / user / project）
  - --system-prompt / --append-system-prompt
  - Custom Agent Definition

## 關鍵要點
  - System prompt 是 Claude Code 行為的 "source of truth"
  - 每一行都有工程原因，不是隨意的指令
```

**WHY section：**
理解 system prompt 為什麼重要：
- Claude 的行為 = 訓練 + system prompt 的交集
- 改 system prompt = 改 Claude 的行為，不需要改訓練
- 理解 prompt 的結構 = 理解為什麼 Claude 不做某件事

**前置知識橋：** 「Ch.11 從工程師角度介紹了 prompt cache 和 section system 的設計原理。本章是完整的參考文件——每一個 section 的實際內容。」

**承先啟後：** Ch.13 是全書的最後一章，結尾可以有「延伸研究方向」的 outlook section，指向未來的研究可能性。

**Research Package Sources:**
- Anthropic "Character Overview" (Constitutional AI methodology) — prompt as behavioral specification
- OpenAI "System Prompts" documentation — comparison with Claude Code's approach
- Murray Shanahan "Role Play with Large Language Models" (2023, Nature) — identity/persona in prompts

---

## Implementation Plan（13 章的執行順序）

### Phase 1 — 新章節（先寫，建立新 baseline）
每章一個 commit：

1. **Ch.12** — Feature Inventory（新章節，source 已有完整整理）
2. **Ch.13** — System Prompt Deep Dive（新章節，source 已有完整分析）

### Phase 2 — 高優先既有章節
3. **Ch.07** — 加 Why Loop + Generator 例子 + Batch Partitioning 動機
4. **Ch.03** — Fork vs Spawn + Worktree merge + Cache cost 數字
5. **Ch.08** — MCP 101 + URL elicitation + Plugin lifecycle

### Phase 3 — 中優先既有章節
6. **Ch.06** — Microcompact + contextCollapse + 認知科學類比
7. **Ch.02** — Zod/JSON Schema why + lazySchema + Progress flow
8. **Ch.09** — Why-not-Redux + ToolUseContext trace

### Phase 4 — 補全與整合
9. **Ch.01** — 全書路線圖 + Startup sequence + 全端旅程
10. **Ch.11** — Cost numbers + Mode injection + Static prefix why
11. **Ch.10** — Pattern Problem expansion + Checklist annotations
12. **Ch.04** — Rule example + Speculative trigger
13. **Ch.05** — Env var assembly + Hook precedence

### 每章執行流程

```
1. 準備 Chapter Research Package（讀 source code + 找業界 refs）
2. 更新現有內容（按 Enrichment Spec）
3. 加前置知識橋（開頭）
4. 加承先啟後連結（結尾）
5. 驗證 E1-E7 評分標準
6. commit（一章一個 commit）
```

---

## Source Files Reference Map

| Chapter | Key Source Files |
|---------|----------------|
| Ch.01 | `src/main.tsx`, `src/setup.ts`, `src/bootstrap/state.ts` |
| Ch.02 | `src/Tool.ts`, `src/tools/AgentTool/AgentTool.tsx`, `src/services/tools/toolExecution.ts` |
| Ch.03 | `src/utils/forkedAgent.ts`, `src/Task.ts`, worktree utils |
| Ch.04 | `src/hooks/toolPermission/`, `src/services/tools/toolExecution.ts` |
| Ch.05 | `src/utils/hooks.ts`, hook loading source |
| Ch.06 | `src/services/compact/`, `src/context.ts`, contextCollapse dir |
| Ch.07 | `src/query.ts`, `src/services/tools/StreamingToolExecutor.ts`, `src/services/tools/toolOrchestration.ts` |
| Ch.08 | `src/services/mcp/client.ts`, `src/utils/plugins/pluginLoader.ts`, `src/skills/loadSkillsDir.ts` |
| Ch.09 | `src/state/store.ts`, `src/state/AppStateStore.ts`, `src/utils/queryContext.ts` |
| Ch.10 | (all above, summary) |
| Ch.11 | `src/utils/systemPrompt.ts`, `src/constants/systemPromptSections.ts`, `src/constants/prompts.ts` |
| Ch.12 | `claude-code-hidden-features.md` (source doc) |
| Ch.13 | `docs/claude-code-system-prompt-analysis.md`, `src/constants/prompts.ts` |

---

## Quality Scoring（更新版 Autoresearch Evals）

| ID | Eval | Pass Condition |
|----|------|---------------|
| E1 | Source accuracy | 所有 type/function 名稱可在 source code 驗證 |
| E2 | State machine present | 有 stateDiagram-v2（有 FSM 的章節）|
| E3 | Design motivation | 每個主要機制有「Why does this exist?」說明 |
| E4 | Accessible entry | 章節開頭非技術讀者也能理解問題 |
| E5 | No AI smell | 無誇大形容詞、無 AI 套話 |
| E6 | Trade-off explicit | 主要設計決策說明取捨（新增）|
| E7 | Concrete numbers | 效能/成本相關有具體數字（新增）|
| E8 | Industry references | 每章有 ≥1 個業界白名單來源的節錄（新增）|
| E9 | Chapter transitions | 有前置知識橋 + 承先啟後連結（新增）|

**Max score: 13 chapters × 9 evals = 117 points**

---

## Anti-Patterns（禁止）

**AI smell 的具體例子：**
- ❌ 「Claude Code 最精妙的設計之一是...」
- ❌ 「這個創新的解決方案...」
- ❌ 「這是一個重要的見解」
- ❌ 「完美地解決了...的問題」
- ❌ 「這個架構充分展現了...」

**替換成：**
- ✅ 描述機制：「X 確保了 Y」
- ✅ 說明結果：「這讓 Z 成為可能」
- ✅ 引用數字：「cache hit 率在典型 session 中約 85-90%」
- ✅ 說明代價：「犧牲了 A，換取了 B」

**業界參考的反例（不接受）：**
- ❌ Medium blog post
- ❌ Dev.to 文章
- ❌ 無法追溯作者的 "tutorial" 網站
- ❌ AI 生成的技術文章（Medium 上充斥）
- ✅ 只接受業界白名單中的來源

---

*Plan created: 2026-04-01*
*Based on: 11-chapter audit + 2 new source files (claude-code-hidden-features.md, claude-code-system-prompt-analysis.md)*
