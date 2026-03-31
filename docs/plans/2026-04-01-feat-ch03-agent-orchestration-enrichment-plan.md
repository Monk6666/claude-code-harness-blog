---
title: "feat: Enrich Ch.03 Agent Orchestration — Four Missing Sections"
type: feat
date: 2026-04-01
chapter: "03-agent-orchestration.mdx"
parent_plan: "2026-04-01-feat-deepen-all-chapters-oreilly-quality-plan.md"
language: "zh-TW (Traditional Chinese)"
quality_target: "O'Reilly professional depth"
source_verified: true
---

# Enrich Ch.03 Agent Orchestration — Four Missing Deep-Dive Sections

## Overview

Ch.03 已有骨架（AgentTool 三模式、CacheSafeParams 簡介、Worktree 概述、代理間通訊）。
缺的是工程師需要的「為什麼」：Fork 的成本數學、Worktree 完整生命週期、Prompt Cache 底層機制、
以及 Coordinator Mode 的工具限制設計。

本計畫新增 **5 個段落**（含前後橋接），字數從約 ~800 字增加到 ~2500+ 字，
達到 O'Reilly 技術書籍標準。

---

## Chapter Research Package

### 1. 現有內容盤點（src/content/docs/chapters/03-agent-orchestration.mdx）

| Section | 約字數 |
|---------|-------|
| 為什麼需要子代理？ | ~80 |
| 代理生命週期狀態機 | ~120 |
| AgentTool 的三種執行模式 | ~80 |
| CacheSafeParams — 成本優化的關鍵 | ~150 |
| 子代理建立流程 | ~60 |
| AgentTool 的輸入 Schema | ~100 |
| Agent Definition System | ~80 |
| Worktree 隔離模式 | ~80 |
| 代理間通訊 | ~80 |
| Task 生命週期管理 | ~80 |
| 關鍵要點 | ~60 |
| **合計** | **~970 字** |

### 2. Source Code 對齊（已驗證）

| 符號 | 位置 |
|------|------|
| `CacheSafeParams` type | `src/utils/forkedAgent.ts:57-68` |
| `ForkedAgentParams` type | `src/utils/forkedAgent.ts:83-113` |
| `runForkedAgent()` | `src/utils/forkedAgent.ts:489-626` |
| `saveCacheSafeParams()` | `src/utils/forkedAgent.ts:75-77` |
| `getLastCacheSafeParams()` | `src/utils/forkedAgent.ts:79-81` |
| `createSubagentContext()` | `src/utils/forkedAgent.ts:345-462` |
| `isForkSubagentEnabled()` | `src/tools/AgentTool/forkSubagent.ts:32-39` |
| `FORK_AGENT` definition | `src/tools/AgentTool/forkSubagent.ts:60-71` |
| `buildForkedMessages()` | `src/tools/AgentTool/forkSubagent.ts:107-169` |
| `buildWorktreeNotice()` | `src/tools/AgentTool/forkSubagent.ts:205-210` |
| `ASYNC_AGENT_ALLOWED_TOOLS` | `src/constants/tools.ts:55-71` |
| `COORDINATOR_MODE_ALLOWED_TOOLS` | `src/constants/tools.ts:107-112` |
| `ALL_AGENT_DISALLOWED_TOOLS` | `src/constants/tools.ts:36-46` |
| `isCoordinatorMode()` | `src/coordinator/coordinatorMode.ts:36-41` |
| `getCoordinatorUserContext()` | `src/coordinator/coordinatorMode.ts:80-109` |
| `getCacheControl()` | `src/services/api/claude.ts:358-374` |
| `buildSystemPromptBlocks()` | `src/services/api/claude.ts:3213-3237` |
| `addCacheBreakpoints()` | `src/services/api/claude.ts:3063-3106` |
| `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` | `src/constants/prompts.ts:114-115` |
| `WorktreeSession` type | `src/utils/worktree.ts:140-154` |
| `getOrCreateWorktree()` | `src/utils/worktree.ts:235-375` |
| `worktreeBranchName()` | `src/utils/worktree.ts:221-223` |
| `validateWorktreeSlug()` | `src/utils/worktree.ts:66-87` |
| `bypassPermissions` mode | `src/types/permissions.ts:17-22` |
| `PermissionMode` union | `src/types/permissions.ts:28-29` |

### 3. 業界參考文獻（白名單來源）

| 來源 | 引用點 |
|------|--------|
| Anthropic "Building effective agents" (2024) | Fork vs Spawn 設計，multi-agent cost control |
| Google Borg Paper (2015, EUROSYS) | 資源隔離 vs 工具限制對比 |
| Lilian Weng "LLM Powered Autonomous Agents" (2023) | Agent orchestration 架構背景 |

### 4. 缺口分析

現有 Ch.03 缺少：

1. **Fork 成本數學**：為什麼選 fork 模型？精確的美元計算沒有。
2. **Worktree 完整生命週期**：`getOrCreateWorktree()` → 子代理工作 → commit → merge/cleanup 沒有完整流程圖。
3. **Prompt Cache 底層機制**：`cache_control: {type: 'ephemeral'}` 的 prefix match 規則沒有解釋；靜態/動態排序的工程約束沒有說明。
4. **Coordinator Mode 工具限制**：`ASYNC_AGENT_ALLOWED_TOOLS` vs `COORDINATOR_MODE_ALLOWED_TOOLS` 的差異和遞迴防護邏輯沒有展開。

---

## Proposed Solution

### 新增段落清單

| # | 段落標題 | 插入位置 | 核心內容 |
|---|---------|---------|---------|
| 0 | 前置知識橋 | frontmatter 之後（最前面） | Ch.02 → Ch.03 橋接 |
| 1 | 為什麼是 Fork 而不是 Spawn? | CacheSafeParams 段落之後 | 成本數學、CacheSafeParams 原始定義 |
| 2 | Worktree 隔離：子代理的平行宇宙 | Worktree 隔離模式段落之後 | 完整生命週期流程 |
| 3 | Prompt Caching 底層機制 | Worktree 段落之後 | ephemeral marker、prefix match、靜態/動態排序 |
| 4 | Coordinator Mode 的工具限制 | 代理間通訊段落之後 | ASYNC_AGENT_ALLOWED_TOOLS 清單、遞迴防護 |
| 5 | 承先啟後 | 章節最末 | Ch.04 permission/bypassPermissions 橋接 |

---

## Technical Approach

### 段落 0：前置知識橋（Bridge）

插入位置：frontmatter `---` 結束後、`## 為什麼需要子代理？` 前。

**內容：**
```
本章建立在 Ch.02 的 Tool interface 上。AgentTool 是一個特殊工具，
它的 `call()` 不操作文件，而是用 `forkedAgent()` 啟動另一個 query loop。
```

短橋接，1-2 句，不展開。

---

### 段落 1：為什麼是 Fork 而不是 Spawn?

**問題陳述：**
每次 API 呼叫重新組裝系統上下文耗費數十毫秒。在一個代理會話中跨越數百次呼叫，累積延遲無法接受——更不用說巨額的 token 費用。

**核心內容規格：**

```
## 為什麼是 Fork 而不是 Spawn?

[反直覺觀察段落]

### Fork 模型 vs Spawn 模型

| 維度 | Fork 模型（Claude Code 的選擇） | Naive Spawn 模型 |
|------|-------------------------------|-----------------|
| System prompt | 父子共享 CacheSafeParams 前綴 | 子代理重新傳送整個 prompt |
| Cache 命中率 | 85-90%（前綴完全相符） | 0%（每次全新請求） |
| 客製化彈性 | 無（system prompt 必須一致） | 有（子代理可自定 prompt） |

### 成本計算

10 個子代理 × 50,000 tokens × $15/1M tokens：

Naive Spawn：  10 × 50,000 × $15 / 1,000,000 = **$7.50**
Fork + Cache： 10 × 50,000 × $15 / 1,000,000 × 10% = **$0.75**
淨節省：**$6.75 / 每次協調會話**

### 真實的 CacheSafeParams 定義

[從 src/utils/forkedAgent.ts:57-68 貼出真實 TypeScript type]

### 後果

[說明刻意的約束：子代理不能有自定義 system prompt]

### 引用 Anthropic "Building effective agents"

[2+ 句引用 + 對應關係 + URL + 日期]
```

**真實 type（貼入 mdx）：**
```typescript
// src/utils/forkedAgent.ts
export type CacheSafeParams = {
  /** System prompt - must match parent for cache hits */
  systemPrompt: SystemPrompt
  /** User context - prepended to messages, affects cache */
  userContext: { [k: string]: string }
  /** System context - appended to system prompt, affects cache */
  systemContext: { [k: string]: string }
  /** Tool use context containing tools, model, and other options */
  toolUseContext: ToolUseContext
  /** Parent context messages for prompt cache sharing */
  forkContextMessages: Message[]
}
```

---

### 段落 2：Worktree 隔離：子代理的平行宇宙

**問題陳述：**
兩個子代理同時修改同一個文件 — 這在並行工作流程中幾乎必然發生。沒有隔離機制，後寫者覆蓋先寫者，所有並行性的好處全部消失。

**核心內容規格：**

```
## Worktree 隔離：子代理的平行宇宙

[反直覺觀察]

### Worktree 的工作原理

git worktree 提供：
- 同一 repo，獨立工作目錄
- 子代理在 .claude/worktrees/<slug>/ 工作
- 主分支完全不受影響

### 完整生命週期流程圖（mermaid sequenceDiagram）

Parent → EnterWorktreeTool → getOrCreateWorktree()
子代理在隔離工作樹工作 → commit
ExitWorktreeTool(action: keep | remove)
手動 merge 或丟棄

### WorktreeSession 型別（真實定義）

[貼 src/utils/worktree.ts:140-154]

### 衝突解決策略

當兩個子代理修改重疊的文件：
- 使用 keep action 保留兩個 worktree
- 協調者逐一 review 各 worktree 的 commit
- 手動 merge 或讓第三個子代理處理衝突

### 代價

[工程取捨：隔離性 vs 磁碟空間（node_modules 用 symlink 解決）]
```

**WorktreeSession 真實型別：**
```typescript
// src/utils/worktree.ts
export type WorktreeSession = {
  originalCwd: string
  worktreePath: string      // .claude/worktrees/<slug>/
  worktreeName: string
  worktreeBranch?: string   // worktree-<flattenedSlug>
  originalBranch?: string
  originalHeadCommit?: string
  sessionId: string
  tmuxSessionName?: string
  hookBased?: boolean
  creationDurationMs?: number
  usedSparsePaths?: boolean
}
```

---

### 段落 3：Prompt Caching 底層機制

**問題陳述：**
Prompt cache 有個陷阱：在 50,000 token system prompt 中，哪怕只有一個 byte 在靜態前綴之前改變，整個 cache 就失效。設計 Claude Code 的 system prompt 順序不是偶然——這是工程約束決定的排列。

**核心內容規格：**

```
## Prompt Caching 底層機制

[反直覺觀察：cache 不是 key-value store，而是 prefix match]

### cache_control: { type: "ephemeral" } 做了什麼

Anthropic API 在工具定義或系統 prompt 的最後一個 block 加上
cache_control 標記：

[貼 getCacheControl() 實際返回值]

### Prefix Match 規則

快取命中條件：
- 本次請求的 system prompt + tools 前綴，必須與上次請求**完全 byte 相同**
- 第一個不同的 byte 之後，全部重新計費

### 價格模型

| 類型 | 費用 |
|------|------|
| 正常輸入 tokens | $15 / 1M tokens（Claude Sonnet） |
| cache_creation | $18.75 / 1M tokens（寫入快取成本） |
| cache_read | $1.50 / 1M tokens（**原始價的 10%**） |

### 工程後果：靜態 sections 必須在動態 sections 之前

[解釋 SYSTEM_PROMPT_DYNAMIC_BOUNDARY 的作用]

tool definitions（靜態）→ CLAUDE.md（半靜態）→ git status（動態）
                                                      ↑ boundary

任何在 boundary 之前的改變都會 bust 整個 cache。
這是為什麼 git status / 即時上下文 必須放在最後。

### 真實的邊界常數

```typescript
// src/constants/prompts.ts
export const SYSTEM_PROMPT_DYNAMIC_BOUNDARY =
  '__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__'
```
```

---

### 段落 4：Coordinator Mode 的工具限制

**問題陳述：**
如果 Worker 可以無限制地派生新 Worker，一個協調任務可能產生指數增長的代理樹——費用和延遲都會爆炸。Claude Code 用工具白名單來切斷這條路。

**核心內容規格：**

```
## Coordinator Mode 的工具限制

[反直覺觀察：限制工具不是為了安全，而是為了防止遞迴爆炸]

### Workers 能使用的工具（ASYNC_AGENT_ALLOWED_TOOLS）

[貼 src/constants/tools.ts:55-71 的完整清單]

### Coordinator 只能使用的工具（COORDINATOR_MODE_ALLOWED_TOOLS）

[貼 src/constants/tools.ts:107-112]

重要：Coordinator 的清單**不包含** FileEdit、Bash——
協調者不應該自己動手，只應該下達指令。

### 遞迴防護邏輯

```
ALL_AGENT_DISALLOWED_TOOLS 包含 AgentTool（預設）
例外：process.env.USER_TYPE === 'ant' 才允許 nested agents
```

這意味著：Worker 無法再啟動 Worker（除非是 Anthropic 內部人員）。
這個設計防止了 O(2^n) 的代理樹爆炸。

### 對比 Google Borg（2015）

[引用 Google Borg 論文關於資源隔離的段落]
[解釋 Borg 用 quota + namespace 隔離，Claude Code 用工具白名單做到類似效果]
[來源 URL + 日期]
```

**ASYNC_AGENT_ALLOWED_TOOLS 真實清單：**
```typescript
// src/constants/tools.ts
export const ASYNC_AGENT_ALLOWED_TOOLS = new Set([
  FILE_READ_TOOL_NAME,
  WEB_SEARCH_TOOL_NAME,
  TODO_WRITE_TOOL_NAME,
  GREP_TOOL_NAME,
  WEB_FETCH_TOOL_NAME,
  GLOB_TOOL_NAME,
  ...SHELL_TOOL_NAMES,
  FILE_EDIT_TOOL_NAME,
  FILE_WRITE_TOOL_NAME,
  NOTEBOOK_EDIT_TOOL_NAME,
  SKILL_TOOL_NAME,
  SYNTHETIC_OUTPUT_TOOL_NAME,
  TOOL_SEARCH_TOOL_NAME,
  ENTER_WORKTREE_TOOL_NAME,
  EXIT_WORKTREE_TOOL_NAME,
])

export const COORDINATOR_MODE_ALLOWED_TOOLS = new Set([
  AGENT_TOOL_NAME,
  TASK_STOP_TOOL_NAME,
  SEND_MESSAGE_TOOL_NAME,
  SYNTHETIC_OUTPUT_TOOL_NAME,
])
```

---

### 段落 5：承先啟後（Bridge Out）

插入位置：章節最後（`## 關鍵要點` 之後）。

**內容：**
```
## 承先啟後

子代理擁有工具，但能使用哪些工具？誰決定？
Ch.04 的 permission system 是答案。特別是，`bypassPermissions` mode
讓協調者信任子代理的判斷——這個設計選擇在 Ch.04 有完整的安全分析。
```

---

## Quality Rules Checklist

每個新段落必須符合以下標準：

- [ ] 以反直覺觀察開頭（❌ 陳述事實開頭 → ✅ 問題/驚喜開頭）
- [ ] 包含精確數字（美元、token 數、百分比）
- [ ] 所有 type/function 名稱來自真實 source（已驗證）
- [ ] 明確陳述取捨（犧牲 X 換取 Y）
- [ ] 每個 reference 包含：2+ 句引用 + 對應關係 + URL + 日期
- [ ] 語言：Traditional Chinese，技術術語/程式碼保持英文

---

## Implementation Phases

### Phase 1：插入橋接段落（約 10 分鐘）

- 插入「前置知識橋」（frontmatter 後）
- 插入「承先啟後」（章節末）
- 驗證文件可正常 build

### Phase 2：插入核心深度段落（約 30 分鐘）

按順序插入，每段驗證：
1. 為什麼是 Fork 而不是 Spawn?
2. Worktree 隔離：子代理的平行宇宙
3. Prompt Caching 底層機制
4. Coordinator Mode 的工具限制

### Phase 3：驗證（約 10 分鐘）

- 字數統計：目標 2500+ 字
- 所有 code block 語法正確
- mermaid 圖表可渲染
- 無重複內容（與現有段落）
- 所有 source 引用已驗證

---

## Acceptance Criteria

### Functional Requirements

- [ ] 前置知識橋段落新增在 frontmatter 之後
- [ ] Fork vs Spawn 段落含完整成本計算（$7.50 vs $0.75）
- [ ] CacheSafeParams 真實 type 定義（來自 src/utils/forkedAgent.ts）
- [ ] Worktree 完整生命週期含 mermaid sequenceDiagram
- [ ] Prompt Cache 含 SYSTEM_PROMPT_DYNAMIC_BOUNDARY 常數
- [ ] ASYNC_AGENT_ALLOWED_TOOLS 完整清單展示
- [ ] COORDINATOR_MODE_ALLOWED_TOOLS 清單展示
- [ ] 承先啟後段落含 bypassPermissions 提及
- [ ] 每個段落以反直覺問題開頭

### Non-Functional Requirements

- [ ] 語言：zh-TW（繁體中文），技術術語英文
- [ ] 每個外部 reference：2+ 句引用 + URL + 日期
- [ ] 字數：現有 ~970 → 目標 2500+
- [ ] 不刪除或替換現有任何段落
- [ ] 文件可正常 Next.js build（無 MDX 語法錯誤）

### Quality Gates

- [ ] 所有數字可在 source code 中驗證
- [ ] 無 AI 生成的空洞語言（"這展示了 X 的重要性"）
- [ ] 每個取捨明確陳述（"犧牲 X 換取 Y"）

---

## Risk Analysis

| 風險 | 可能性 | 影響 | 緩解 |
|------|--------|------|------|
| MDX syntax error（code block 嵌套） | 中 | 高 | 使用 ```` 而非 ``` 嵌套時 |
| Mermaid 圖表渲染失敗 | 低 | 中 | 先在 mermaid.live 驗證語法 |
| source code 引用行號過時 | 低 | 低 | 引用 function 名稱，不依賴行號 |
| 新段落字數超過頁面排版 | 低 | 低 | 分節呈現，不影響 build |

---

## References & Research

### Internal References

- 現有章節：`src/content/docs/chapters/03-agent-orchestration.mdx`
- CacheSafeParams：`src/utils/forkedAgent.ts:57-68`
- Fork logic：`src/tools/AgentTool/forkSubagent.ts`
- Worker tools：`src/constants/tools.ts:55-71, 107-112`
- Cache control：`src/services/api/claude.ts:358-374, 3213-3237`
- Worktree：`src/utils/worktree.ts:140-154, 221-375`
- Permissions：`src/types/permissions.ts:16-29`
- Dynamic boundary：`src/constants/prompts.ts:114-115`
- Parent plan：`docs/plans/2026-04-01-feat-deepen-all-chapters-oreilly-quality-plan.md`

### External References

- Anthropic "Building effective agents" (2024)
  URL: https://www.anthropic.com/research/building-effective-agents
  用途：Fork 模型對應 "multi-agent best practices" 中的成本控制建議

- Abhishek Gupta et al. "Borg: The Next Generation" / Original Borg paper (Verma et al., EUROSYS 2015)
  URL: https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/
  用途：Coordinator Mode 工具限制 vs Borg quota/namespace 資源隔離對比

- Lilian Weng "LLM Powered Autonomous Agents" (2023)
  URL: https://lilianweng.github.io/posts/2023-06-23-agent/
  用途：Agent 架構背景，orchestration 模式分類

---

## Estimated Effort

| Phase | 工作內容 | 時間估計 |
|-------|---------|---------|
| 1 | 橋接段落 | 10 分鐘 |
| 2 | 4 個核心深度段落 | 30 分鐘 |
| 3 | 驗證 + 修正 | 10 分鐘 |
| **合計** | | **~50 分鐘** |

---

## Notes for Implementation

1. **不要刪除現有內容**：所有新段落使用 `Edit` tool 插入，保留原有文字。
2. **代碼塊語言標記**：TypeScript 區塊使用 `typescript`，mermaid 使用 `mermaid`。
3. **中文標點**：使用全形標點（「」、。、，），英文句子保留半形。
4. **:::tip 格式**：現有章節使用 `:::tip[Key Insight]` Starlight 語法，新段落保持一致。
5. **行號引用**：Source 引用格式 `// src/utils/forkedAgent.ts`，不要硬編碼行號（會過時）。
