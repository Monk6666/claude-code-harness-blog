---
title: "feat: Ch.12 Feature Inventory — 隱藏功能完整清單"
type: feat
date: 2026-04-01
---

# Ch.12 Feature Inventory — 隱藏功能完整清單

## Overview

新增第 12 章至 claude-code-harness-blog，以 O'Reilly 工程書籍品質撰寫 Claude Code 隱藏功能的全面清單。本章揭示架構之外的能力邊界——feature flag 門控的未發佈功能、不出現於 `--help` 的隱藏 CLI 參數、環境變數完整參考、以及 Server/Remote 指令。

## Problem Statement

讀完前 11 章，讀者理解了 Claude Code 的架構（工具系統、代理編排、權限、hooks、上下文管理、prompt 工程）。但存在一個重要的知識缺口：**哪些功能已經在程式碼中存在，卻透過 feature flag 或隱藏參數而不對外公開？** 不瞭解這些邊界，工程師就無法：

1. 在內部環境啟用實驗性功能
2. 使用隱藏 CLI 參數調試問題
3. 理解 Anthropic 的功能開發策略

## Proposed Solution

撰寫一章專注於「功能邊界」的章節，涵蓋：

- **GrowthBook 旗標系統**：為什麼使用 feature flag 而非直接發佈
- **8 個重大未發佈功能**：每個以 O'Reilly 5-part 結構描述
- **30+ 隱藏 CLI 參數**：按類別分組，附使用場景
- **完整環境變數參考**：5 大分類 50+ 變數
- **Server/Remote 命令**：`claude serve`、`claude ssh`、`claude remote-control`

## Technical Approach

### Architecture

本章採用 O'Reilly 5-part 結構——每個主要概念包含：
1. Problem Statement（1 句）
2. Context（1-2 句）
3. Solution（3-5 句，含實際 source code 函數名）
4. Code Example（真實 TypeScript 片段）
5. Consequence（1-2 句，明確 trade-off）

### Source Code Evidence (already researched)

**GrowthBook 系統：**
- `src/services/analytics/growthbook.ts` — `GrowthBook` client, `GrowthBookUserAttributes`, `checkStatsigFeatureGate_CACHED_MAY_BE_STALE()`
- `bun:bundle` `feature()` macro — Dead Code Elimination at build time

**Coordinator Mode：**
- `src/coordinator/coordinatorMode.ts` — `isCoordinatorMode()`, `matchSessionMode()`, `getCoordinatorUserContext()`
- Gate: `CLAUDE_CODE_COORDINATOR_MODE=1` + `feature('COORDINATOR_MODE')`
- `tengu_scratch` GrowthBook gate 控制 scratchpad

**Bridge Mode (Remote Control)：**
- `src/bridge/bridgeEnabled.ts` — `isBridgeEnabled()`, `isBridgeEnabledBlocking()`, `getBridgeDisabledReason()`
- Gate: `feature('BRIDGE_MODE')` + `tengu_ccr_bridge` GrowthBook + claude.ai OAuth 訂閱
- `checkBridgeMinVersion()` — 版本下限驗證

**BUDDY：**
- `src/buddy/companion.ts` — `roll()`, `companionUserId()`, `getCompanion()`
- `mulberry32()` seeded PRNG，`rollRarity()` (common/uncommon/rare/epic/legendary)
- SALT = `'friend-2026-401'` — 版本化種子確保 companion 跨版本一致

**ULTRAPLAN：**
- `src/commands/ultraplan.tsx` — `buildUltraplanPrompt()`, `getUltraplanModel()`
- 30 分鐘超時，透過 CCR (CloudControl Relay) 在遠端執行 opus 模型
- `tengu_ultraplan_model` GrowthBook flag 控制模型選擇

**Agent Triggers (KAIROS Cron)：**
- `src/utils/cronTasks.ts` — `CronTask` type, `.claude/scheduled_tasks.json`
- `src/tools/ScheduleCronTool/prompt.ts` — `isKairosCronEnabled()`, `isDurableCronEnabled()`
- Gate: `feature('AGENT_TRIGGERS')` + `tengu_kairos_cron` GrowthBook (default: true)
- One-shot vs recurring，`permanent` flag for assistant mode

**Team Memory：**
- `src/services/teamMemorySync/index.ts` — 完整 sync service
- API: `GET/PUT /api/claude_code/team_memory?repo={owner/repo}`
- 同步語義：server wins per-key；file deletion 不傳播；delta upload

**Verification Agent：**
- `src/tools/AgentTool/built-in/verificationAgent.ts` — `VERIFICATION_SYSTEM_PROMPT`
- 反模式檢測："verification avoidance" + "seduced by the first 80%"

### Implementation Phases

#### Phase 1: 前置橋接與 GrowthBook 說明

- `前置知識橋` section
- `為什麼有隱藏功能？` section with Martin Fowler reference

#### Phase 2: 8 個重大未發佈功能（一、）

- Coordinator Mode, KAIROS, Bridge Mode, BUDDY, ULTRAPLAN/ULTRATHINK, Agent Triggers, Workflow Scripts, Team Memory
- 每個功能：5-part 結構 + TypeScript code example

#### Phase 3: 隱藏 CLI 參數（二、）

- 30+ 參數，按 4 個類別分組
- 每個：參數名、說明、使用場景

#### Phase 4: 環境變數（三、）

- 5 大分類：功能開關、停用功能、除錯效能、模型覆蓋、認證相關

#### Phase 5: Server 命令（四、）

- `claude serve`, `claude ssh`, `claude remote-control`

#### Phase 6: 收尾

- 關鍵要點 bullet summary
- 承先啟後到 Ch.13

## Alternative Approaches Considered

1. **按功能類別組織（不按發佈狀態）**：被拒絕，因為讀者關心「什麼現在能用」vs「什麼是未來的」
2. **不含 code evidence**：被拒絕，O'Reilly 品質要求 source 可驗證

## Acceptance Criteria

### Functional Requirements

- [ ] 所有 8 個重大未發佈功能均以 O'Reilly 5-part 結構撰寫
- [ ] 每個功能有真實 source code 函數名（非臆測）
- [ ] 30+ 隱藏 CLI 參數按類別分組
- [ ] 50+ 環境變數按類別分組
- [ ] Server/Remote 命令完整說明
- [ ] 包含 Martin Fowler Feature Toggles (2017) 引用（2+ 句直接引用）
- [ ] 每個 section 以問題/困惑開場，不以答案開場
- [ ] Numbers specific（例：30 分鐘超時，非「很長的超時」）
- [ ] Trade-offs 明確（例：「以 X 換取 Y」）

### Non-Functional Requirements

- [ ] 全文繁體中文，技術術語英文
- [ ] 字數 3,000–5,000 中文字
- [ ] 段落節奏：反直覺觀察開場

### Quality Gates

- [ ] 所有 TypeScript 片段來自實際 source（不捏造）
- [ ] frontmatter: `title: "Ch.12 — Feature Inventory"`, `sidebar.order: 12`

## Success Metrics

- 讀者可透過本章理解如何啟用/禁用 Claude Code 的實驗性功能
- 每個功能說明對應至少一個 source 檔案路徑

## Dependencies & Prerequisites

- Source research 已完成（`/Users/weirenlan/Desktop/self_project/labs/claude-code-src/`）
- `claude-code-hidden-features.md` 已讀取
- Ch.1–11 章節結構已理解

## Risk Analysis & Mitigation

| 風險 | 可能性 | 衝擊 | 緩解 |
|------|-------|------|------|
| Feature flag 名稱隨版本變化 | 低 | 中 | 注明基於特定 source 版本 |
| TypeScript 片段過於冗長 | 中 | 低 | 僅引用關鍵函數簽名和核心邏輯 |

## Documentation Plan

Output file: `src/content/docs/chapters/12-feature-inventory.mdx`

## References & Research

### Internal References

- `src/services/analytics/growthbook.ts` — GrowthBook client 實現
- `src/coordinator/coordinatorMode.ts` — Coordinator Mode 邏輯
- `src/bridge/bridgeEnabled.ts` — Bridge Mode 門控
- `src/buddy/companion.ts` — BUDDY companion 實現
- `src/commands/ultraplan.tsx` — ULTRAPLAN 命令
- `src/tools/ScheduleCronTool/prompt.ts` — Agent Triggers cron gate
- `src/utils/cronTasks.ts` — CronTask 型別定義
- `src/services/teamMemorySync/index.ts` — Team Memory sync API
- `src/tools/AgentTool/built-in/verificationAgent.ts` — Verification Agent prompt
- `src/utils/agentSwarmsEnabled.ts` — Agent Swarms gate logic

### External References

- Martin Fowler, "Feature Toggles (aka Feature Flags)," martinfowler.com, 2017
- GrowthBook SDK documentation, growthbook.io
- Anthropic Claude Code changelog

### Related Work

- Ch.03 — Agent Orchestration（Coordinator Mode 架構）
- Ch.07 — Coordinator Concurrency（multi-agent 實作）
- Ch.11 — Prompt Engineering（系統提示詞分層）
