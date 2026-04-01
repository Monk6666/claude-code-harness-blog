---
title: "feat: Ch.13 & Ch.14 O'Reilly-Quality Depth Enhancement"
type: feat
date: 2026-04-01
---

# Ch.13 & Ch.14 O'Reilly-Quality Depth Enhancement

If you need you could check sourc code: /Users/weirenlan/Desktop/self_project/labs/claude-code-src/src
## Enhancement Summary

**Deepened on:** 2026-04-01
**Research agents used:** best-practices-researcher, repo-research-analyst, source-explorer (×2)

### Key Improvements Discovered

1. **Verbatim content gaps are bigger than suspected** — the compact prompt, autoDream, and extractMemories sections in Ch.14 use approximated prose rather than actual source text; all three can now be corrected
2. **Section 3 has 7 ant-only rules, not 4** — a "faithful reporting" rule and a "bug reporting via /issue or /share" rule are completely absent from the current chapter
3. **O'Reilly structural pattern identified** — the missing layer is "ruled-out alternatives" and the "mechanism" explanation (why the prompt text produces the behavioral change, not just what it says)
4. **Three-field Engineering Decision callout** — replaces `**工程決策**` prose with a scannable ADR-inspired format supported by `:::tip`
5. **Repo constraint confirmed** — Astro Starlight 0.33, callouts need no imports, code attribution is first-line-comment convention (not `title=`)
6. **Fork Subagent has a "If you ARE the fork" self-reference** — `getAgentToolSection()` ends with "**If you ARE the fork** — execute directly; do not re-delegate" which prevents fork recursion

### New Considerations Discovered

- `PARTIAL_COMPACT_UP_TO_PROMPT` is a **third** compact mode with distinct purpose ("summary placed at start of continuing session") — completely absent from Ch.14
- `buildExtractCombinedPrompt()` adds a team memory security rule absent in the solo variant: "You MUST avoid saving sensitive data within shared team memories"
- autoDream's actual opening is "You are performing a *dream*" (not "similar to human brain sleep" as currently written)
- Coordinator's Continue vs Spawn matrix is a **6-row decision table**, not a 3-item list
- `@[MODEL LAUNCH]` source comments reveal ant-only rules are temporary A/B gated features that will graduate to external — worth documenting as it reframes the entire ant/external distinction

---

## Overview

目前 Ch.13（System Prompt Deep Dive）和 Ch.14（Prompt Atlas）雖已有完整的架構骨架，但距離 O'Reilly 等級的技術書籍仍有差距：

- **缺乏逐字源碼引用**：大多數段落描述「大意」，未引用實際 prompt 原文
- **缺乏關鍵功能覆蓋**：Fork Subagent、FileEditTool/GrepTool/ReadTool 分析完全缺席
- **章節間比對不足**：ant vs. 外部版本的差異有提及但未展開
- **源碼反推的 prompt 文字不準確**：部分段落（尤其 compact、autoDream）使用了近似版本而非實際源碼文字

本計劃提供具體的補充內容、精確的源碼位置，以及每個新增區塊的 O'Reilly 風格排版建議。

---

## MDX 排版規範（Platform-Verified）

### Repo 確認的可用元件（無需 import）

Astro Starlight 0.33.2，chapter MDX 檔案不使用任何 import。

```
:::note[label]    — blue, 補充資訊（前置知識橋、承先啟後）
:::tip[label]     — purple, 可行動洞見（Engineering Decision、工程後果）
:::caution[label] — yellow, 踩坑行為（代價說明中的 foot-gun）
:::danger[label]  — red, 資料遺失/不可逆（Git 破壞性操作的 CRITICAL 警告）
```

**規則：** 不可連續堆疊兩個 callout，每個 callout 前後必須有內文段落。

代碼歸屬慣例（第一行 comment，不用 `title=`）：
```typescript
// src/constants/prompts.ts — getSimpleDoingTasksSection() (lines 200-251)
```

### 三欄 Engineering Decision Callout（取代 **工程決策** 散文）

```mdx
:::tip[Engineering Decision]
**Failure prevented:** 沒有此指令時的具體失敗模式
**Alternative rejected:** 被否決的做法及原因
**Cost accepted:** 為此設計付出的代價
:::
```

只對非顯而易見的決策使用。自明的決策保留 `**工程決策：**` 粗體散文。

### Section 8 條件樹視覺化

```
getSessionSpecificGuidanceSection(enabledTools, skillToolCommands)
├── hasAskUserQuestionTool → 拒絕工具後詢問原因
├── !isNonInteractiveSession → ! <command> 互動提示
├── hasAgentTool
│   ├── isForkSubagentEnabled() = true → Fork 版本指引（含 "If you ARE the fork"）
│   └── = false, areExplorePlanAgentsEnabled()
│       ├── → 搜尋工具直接使用 vs. Explore agent 的分工說明
│       └── 閾值：EXPLORE_AGENT_MIN_QUERIES 次查詢後才升級到 Agent
├── hasSkills → /<skill-name> 說明
├── hasSkills + DiscoverSkillsTool → Skill Discovery 指引
└── hasAgentTool + VERIFICATION_AGENT + tengu_hive_evidence=true
    └── → 強制獨立驗證約束（~200 字）
```

### 跨章節引用格式

```mdx
*See Ch.11 § Prompt Cache Architecture for the infrastructure that makes this boundary possible.*
```

### Ant-only Variant Callout

```mdx
:::note[Anthropic-internal (ant) variant]
The `ant` build adds: [description or verbatim addition].
Implication: [what this reveals about the intended use case].
:::
```

---

## Problem Statement

### Ch.13 的三個主要缺口

**缺口 A：靜態 Section 的「工程決策」層缺乏逐字引用**

需要補上完整原文：
- Section 2 (System) — 六個 bullet 措辭不精確
- Section 3 (Doing Tasks) — ant-only 規則有 **7 條**（非 4 條）
- Section 4 (Actions) — 「遇到障礙時」延伸說明（lock file, merge conflict 例子）未引用
- Section 7 (Output Efficiency) — ant 版本的完整 4 段原文只引用了前 3 行

**缺口 B：Section 8 (Session-specific Guidance) 過度簡化**

實際有 7 個條件注入分支，以下完全缺席：
- `VERIFICATION_AGENT` feature gate（~200 字規則）
- Fork vs. Subagent 的實際文字差異（含 "If you ARE the fork" 句）
- `areExplorePlanAgentsEnabled()` 與 Explore/Plan agents
- `DISCOVER_SKILLS_TOOL_NAME` 的 skill discovery 結合

**缺口 C：Proactive Mode 的非對稱 append/replace 邏輯未與源碼對照**

JSDoc 注解（lines 28-39）明確說明了設計原因但未引用。

---

### Ch.14 的五個主要缺口

**缺口 D：Fork Subagent 功能完全缺席**

包含 "If you ARE the fork — execute directly; do not re-delegate" 的防遞迴設計

**缺口 E：FileEditTool、GrepTool、FileReadTool 列在 Prompt Map 但無分析**

**缺口 F：Compact Prompt 的源碼版本不精確**

- 現有：5 項清單（近似版本）
- 實際：9 項清單 + `DETAILED_ANALYSIS_INSTRUCTION_BASE`（`<analysis>` 標籤指令）+ 第三種模式 `PARTIAL_COMPACT_UP_TO_PROMPT`

**缺口 G：Memory Prompts 源碼版本不精確**

- autoDream 開篇「You are performing a *dream*」vs. 現有章節的「similar to human brain sleep」
- `buildExtractAutoOnlyPrompt()` vs `buildExtractCombinedPrompt()` 差異未展示
- team memory 安全規則缺席

**缺口 H：Coordinator 缺少「Writing Worker Prompts」規則**

6 行 Continue vs Spawn 決策矩陣完全缺席

---

## Proposed Solution

### O'Reilly 五步章節弧線

每個主要 section 應遵循：
1. **Tension**（衝突陳述）— `**什麼會壞？**` 一句話
2. **Evidence**（機制）— 源碼逐字引用（函數名 + 行號），先引用，後分析
3. **Design choice**（決策）— 三欄 Engineering Decision callout
4. **Consequence chain**（後果鏈）— `**代價：**` 或 `:::caution`
5. **Cross-reference**（交叉引用）— `*See Ch.X § ...*`

---

## Technical Approach — Ch.13 補充規格

### A1：Section 3 (Doing Tasks) — 完整 Ant-Only 規則（7條）

**Source:** `src/constants/prompts.ts` — `getSimpleDoingTasksSection()` (lines 200-249)

規則 1（注解撰寫，line 207）：
```
Default to writing no comments. Only add one when the WHY is non-obvious:
a hidden constraint, a subtle invariant, a workaround for a specific bug,
behavior that would surprise a reader. If removing the comment wouldn't
confuse a future reader, don't write it.
```

規則 2（注解內容，line 208）：
```
Don't explain WHAT the code does, since well-named identifiers already do
that. Don't reference the current task, fix, or callers ("used by X", "added
for the Y flow", "handles the case from issue #123"), since those belong in
the PR description and rot as the codebase evolves.
```

規則 3（保留現有注解，line 209）：
```
Don't remove existing comments unless you're removing the code they describe
or you know they're wrong. A comment that looks pointless to you may encode
a constraint or a lesson from a past bug that isn't visible in the current diff.
```

規則 4（完成驗證，line 211，`@[MODEL LAUNCH]: capy v8 thoroughness counterweight`）：
```
Before reporting a task complete, verify it actually works: run the test,
execute the script, check the output. Minimum complexity means no gold-plating,
not skipping the finish line. If you can't verify (no test exists, can't run
the code), say so explicitly rather than claiming success.
```

規則 5（協作者 mindset，line 226，`@[MODEL LAUNCH]: capy v8 assertiveness counterweight`）：
```
If you notice the user's request is based on a misconception, or spot a bug
adjacent to what they asked about, say so. You're a collaborator, not just
an executor—users benefit from your judgment, not just your compliance.
```

規則 6（忠實回報，line 239，`@[MODEL LAUNCH]: False-claims mitigation for Capybara v8`）：
```
Report outcomes faithfully: if tests fail, say so with the relevant output;
if you did not run a verification step, say that rather than implying it
succeeded. Never claim "all tests pass" when output shows failures, never
suppress or simplify failing checks (tests, lints, type errors) to manufacture
a green result, and never characterize incomplete or broken work as done.
Equally, when a check did pass or a task is complete, state it plainly — do
not hedge confirmed results with unnecessary disclaimers, downgrade finished
work to "partial," or re-verify things you already checked. The goal is an
accurate report, not a defensive one.
```

規則 7（bug 回報指引，line 243）：
```
If the user reports a bug, slowness, or unexpected behavior with Claude Code
itself (as opposed to asking you to fix their own code), recommend the
appropriate slash command: /issue for model-related problems (odd outputs,
wrong tool choices, hallucinations, refusals), or /share to upload the full
session transcript for product bugs, crashes, slowness, or general issues.
```

**新增節：`#### @[MODEL LAUNCH] Pattern — Ant-Only 規則的生命週期`**

Rules 4-6 的源碼旁分別有 `@[MODEL LAUNCH]: capy v8 ...` 注解，揭示這些規則是針對特定模型版本的**臨時反制措施**，不是永久設計決策。值得用一個 callout 解釋：

```mdx
:::note[@[MODEL LAUNCH] Pattern]
三條規則（完成驗證、協作者 mindset、忠實回報）源碼中都有 `@[MODEL LAUNCH]: capy v8 ... — un-gate once validated on external via A/B` 注解。
這意味著：
- 這些規則是針對 Capybara v8 模型具體行為傾向的反制措施
- 在 ant 環境 A/B 驗證通過後，會推廣至外部版本或下架 ant-only gate
- 因此 ant/external 差異不是永久性設計分歧，而是模型迭代過程中的快照

System prompt 本身成為一份「模型行為記錄」——透過比較 ant-only 規則，可以推斷哪些行為傾向正在被工程介入修正。
:::
```

---

### A2：Section 7 (Output Efficiency) — Ant 版本完整 4 段

**Source:** `src/constants/prompts.ts` — `getOutputEfficiencySection()` (lines 403-428)

完整 ant 版本（替換現有只引用前 3 行的摘要）：

```typescript
// src/constants/prompts.ts:404-414 — ant branch
`# Communicating with the user
When sending user-facing text, you're writing for a person, not logging to
a console. Assume users can't see most tool calls or thinking - only your
text output. Before your first tool call, briefly state what you're about
to do. While working, give short updates at key moments: when you find
something load-bearing (a bug, a root cause), when changing direction,
when you've made progress without an update.

When making updates, assume the person has stepped away and lost the thread.
They don't know codenames, abbreviations, or shorthand you created along
the way, and didn't track your process. Write so they can pick back up cold:
use complete, grammatically correct sentences without unexplained jargon.
Expand technical terms. Err on the side of more explanation. Attend to cues
about the user's level of expertise; if they seem like an expert, tilt a
bit more concise, while if they seem like they're new, be more explanatory.

Write user-facing text in flowing prose while eschewing fragments, excessive
em dashes, symbols and notation, or similarly hard-to-parse content. Only
use tables when appropriate; for example to hold short enumerable facts
(file names, line numbers, pass/fail), or communicate quantitative data.
Don't pack explanatory reasoning into table cells — explain before or after.
Avoid semantic backtracking: structure each sentence so a person can read
it linearly, building up meaning without having to re-parse what came before.

What's most important is the reader understanding your output without mental
overhead or follow-ups, not how terse you are. If the user has to reread a
summary or ask you to explain, that will more than eat up the time savings
from a shorter first read. Match responses to the task: a simple question
gets a direct answer in prose, not headers and numbered sections. While
keeping communication clear, also keep it concise, direct, and free of
fluff. Avoid filler or stating the obvious. Get straight to the point. Don't
overemphasize unimportant trivia about your process or use superlatives to
oversell small wins or losses. Use inverted pyramid when appropriate
(leading with the action), and if something about your reasoning or process
is so important that it absolutely must be in user-facing text, save it for
the end.

These user-facing text instructions do not apply to code or tool calls.`
```

外部版本（lines 416-428）保持不變，展示兩者的完整對比：

```
# Output efficiency

IMPORTANT: Go straight to the point. Try the simplest approach first without
going in circles. Do not overdo it. Be extra concise.
[...]
```

在對比後新增：

```mdx
:::tip[What ant-only reveals]
Section 7 的兩個版本不只是「詳細 vs. 簡潔」的偏好差異，而是截然不同的用戶模型：
- 外部版：工程師在 time pressure 下需要最短路徑 → "Be extra concise"
- Ant 版：研究員/PM 需要能冷啟動閱讀的完整上下文 → "assume the person has stepped away and lost the thread"

每當 ant 版本和外部版本有重大差異，背後都是 Anthropic 對兩類用戶行為的實證觀察。Section 7 是全書最具說服力的案例之一。
:::
```

---

### A3：Section 8 — 完整決策樹 + VERIFICATION_AGENT

**Source:** `src/constants/prompts.ts` — `getSessionSpecificGuidanceSection()` (lines 352-400)

用上方的 ASCII 條件樹視覺化替換現有的散文描述。

VERIFICATION_AGENT 完整原文（line 394，~200 字）：

```
The contract: when non-trivial implementation happens on your turn, independent
adversarial verification must happen before you report completion — regardless
of who did the implementing (you directly, a fork you spawned, or a subagent).
You are the one reporting to the user; you own the gate. Non-trivial means:
3+ file edits, backend/API changes, or infrastructure changes. Spawn the
[Agent] tool with subagent_type="[VERIFICATION_AGENT_TYPE]". Your own checks,
caveats, and a fork's self-checks do NOT substitute — only the verifier
assigns a verdict; you cannot self-assign PARTIAL. Pass the original user
request, all files changed (by anyone), the approach, and the plan file path
if applicable. Flag concerns if you have them but do NOT share test results
or claim things work. On FAIL: fix, resume the verifier with its findings
plus your fix, repeat until PASS. On PASS: spot-check it — re-run 2-3
commands from its report, confirm every PASS has a Command run block with
output that matches your re-run. If any PASS lacks a command block or
diverges, resume the verifier with the specifics. On PARTIAL (from the
verifier): report what passed and what could not be verified.
```

工程分析："you cannot self-assign PARTIAL" 解決了 AI self-reporting 的 success bias 問題——把「判定」權力從主代理移交給獨立 Verification Agent 是多代理系統的「關注點分離」在安全領域的應用。

Fork vs. Subagent 雙態文字（`getAgentToolSection()`, lines 316-320）：

```typescript
// src/constants/prompts.ts:316-320
function getAgentToolSection(): string {
  return isForkSubagentEnabled()
    // Fork 版本（注意最後一句的防遞迴設計）
    ? `Calling [AGENT_TOOL_NAME] without a subagent_type creates a fork, which
       runs in the background and keeps its tool output out of your context —
       so you can keep chatting with the user while it works. Reach for it when
       research or multi-step implementation work would otherwise fill your
       context with raw output you won't need again.
       **If you ARE the fork** — execute directly; do not re-delegate.`
    // Subagent 版本
    : `Use the [AGENT_TOOL_NAME] tool with specialized agents when the task at
       hand matches the agent's description. Subagents are valuable for
       parallelizing independent queries or for protecting the main context
       window from excessive results, but they should not be used excessively
       when not needed. Importantly, avoid duplicating work that subagents are
       already doing - if you delegate research to a subagent, do not also
       perform the same searches yourself.`
}
```

---

### A4：Proactive Mode — Append vs. Replace 源碼對照

**Source:** `src/utils/systemPrompt.ts` — `buildEffectiveSystemPrompt()` (lines 28-120)

JSDoc 注解（lines 28-39）：

```typescript
// src/utils/systemPrompt.ts:28-39
/**
 * 2. Agent system prompt (if mainThreadAgentDefinition is set)
 *    - In proactive mode: agent prompt is APPENDED to default (agent adds
 *      domain instructions on top of the autonomous agent prompt,
 *      like teammates do)
 *    - Otherwise: agent prompt REPLACES default
 */
```

Proactive append path（lines 97-111）：

```typescript
// In proactive mode, agent instructions are appended to the default prompt
// rather than replacing it. The proactive default prompt is already lean
// (autonomous agent identity + memory + env + proactive section), and agents
// add domain-specific behavior on top — same pattern as teammates.
if (agentSystemPrompt && (feature('PROACTIVE') || feature('KAIROS')) &&
    isProactiveActive_SAFE_TO_CALL_ANYWHERE()) {
  return asSystemPrompt([
    ...defaultSystemPrompt,              // ← APPEND: spread 預設 prompt
    `\n# Custom Agent Instructions\n${agentSystemPrompt}`,
    ...(appendSystemPrompt ? [appendSystemPrompt] : []),
  ])
}
```

Non-proactive path（lines 113-120）：

```typescript
return asSystemPrompt([
  ...(agentSystemPrompt
    ? [agentSystemPrompt]                // ← REPLACE: agent 直接替換預設
    : customSystemPrompt
      ? [customSystemPrompt]
      : defaultSystemPrompt),
  ...(appendSystemPrompt ? [appendSystemPrompt] : []),
])
```

設計原因（引用源碼 comment）："The proactive default prompt is already lean...and agents add domain-specific behavior on top — same pattern as teammates."

---

## Technical Approach — Ch.14 補充規格

### D1：Fork Subagent 完整分析

**Source:** `src/tools/AgentTool/prompt.ts` — `getPrompt()` fork section (lines 60-200)

#### 雙模式對比表格

| 面向 | 傳統 Subagent（指定 `subagent_type`）| Fork（省略 `subagent_type`）|
|------|----|----|
| 上下文起點 | 零上下文，需要完整 briefing | 繼承父代理整個 context |
| Prompt cache | 不共享（全新 session）| 共享父代理的 cache prefix |
| Tool output | 進入主代理 context | **不進入** 主代理 context |
| `model` 參數 | 可指定不同模型 | **不應設定**（不能重用 cache）|
| Prompt style | Briefing（背景說明）| Directive（指令，不需解釋背景）|
| 適合場景 | 需要獨立視角或特定 agent 能力 | 研究/實作工作，結果不需留在主 context |

#### "Don't peek / Don't race" 逐字引用

```
Don't peek. The tool result includes an output_file path — do not Read or tail
it unless the user explicitly asks for a progress check. You get a completion
notification; trust it. Reading the transcript mid-flight pulls the fork's tool
noise into your context, which defeats the point of forking.

Don't race. After launching, you know nothing about what the fork found.
Never fabricate or predict fork results in any format — not as prose, summary,
or structured output. The notification arrives as a user-role message in a
later turn; it is never something you write yourself. If the user asks a
follow-up before the notification lands, tell them the fork is still running —
give status, not a guess.
```

```mdx
:::tip[Engineering Decision]
**Failure prevented:** LLM 在 fork 完成前天然傾向「預測」結果（completion 是訓練目標），預測結果一旦傳遞給使用者，後續真實 notification 無法覆蓋這個錯誤承諾
**Alternative rejected:** 讓主代理輪詢 fork 狀態——但輪詢需要 sleep，而 sleep 是 prompt 明確禁止的時序管理方式
**Cost accepted:** Fork 完成後才能彙報結果，使用者必須等待 notification
:::
```

#### Fork Prompt 的 Directive Style

```
Writing a fork prompt. Since the fork inherits your context, the prompt is
a directive — what to do, not what the situation is. Be specific about scope:
what's in, what's out, what another agent is handling. Don't re-explain
background.
```

傳統 subagent 的 prompt 是「背景說明（briefing）」，fork 的 prompt 是「接下來做什麼（directive）」——這是完全相反的兩種寫作策略。

#### "If you ARE the fork" 防遞迴設計

Fork 版本的 `getAgentToolSection()` 最後一句（見 A3）：`**If you ARE the fork** — execute directly; do not re-delegate.`

這解決了 fork 遞迴問題：一個 fork 收到任務後可能再派生另一個 fork，造成無限遞迴。這句話是明確的中止條件。

---

### E1：14.5 其他核心工具 Prompt（新增節）

建議在 TodoWriteTool 分析後新增 `## 14.5 其他核心工具 Prompt`。

#### 14.5.1 FileEditTool — Prompt-Runtime 協同設計

**Source:** `src/tools/FileEditTool/prompt.ts` — `getEditToolDescription()` (lines 1-29)

```
Performs exact string replacements in files.

Usage:
- You must use your Read tool at least once in the conversation before editing.
  This tool will error if you attempt an edit without reading the file.
- When editing text from Read tool output, ensure you preserve the exact
  indentation (tabs/spaces) as it appears AFTER the line number prefix.
  The line number prefix format is: [line number + tab]. Everything after
  that is the actual file content to match. Never include any part of the
  line number prefix in the old_string or new_string.
- ALWAYS prefer editing existing files in the codebase. NEVER write new files
  unless explicitly required.
- Only use emojis if the user explicitly requests it.
- The edit will FAIL if old_string is not unique in the file. Either provide
  a larger string with more surrounding context to make it unique or use
  replace_all to change every instance of old_string.
```

```mdx
:::tip[Engineering Decision]
**Failure prevented:** 沒有「先讀後編」約束，Claude 可能用錯誤的 old_string 嘗試修改，或無法保留正確縮排
**Alternative rejected:** 純粹依賴模型遵守 prompt 指令
**Cost accepted:** 每次編輯前必須至少 Read 一次——但這個「成本」本身是好的實踐
:::
```

**Prompt-Runtime 協同設計**：「必須先 Read 再 Edit」不只是 prompt 指令，FileEditTool 的 runtime 如果沒有先讀取，工具本身會拋出錯誤。Prompt 層指令 + runtime 層強制執行的雙重防護，不依賴模型遵守指令。

Ant-only variant：`minimalUniquenessHint` — "Use the smallest old_string that's clearly unique — usually 2-4 adjacent lines is sufficient. Avoid including 10+ lines of context when less uniquely identifies the target."

#### 14.5.2 GrepTool — 完整 12 行規範

**Source:** `src/tools/GrepTool/prompt.ts` — `getDescription()` (lines 6-19)

```
A powerful search tool built on ripgrep

Usage:
- ALWAYS use Grep for search tasks. NEVER invoke `grep` or `rg` as a Bash
  command. The Grep tool has been optimized for correct permissions and access.
- Supports full regex syntax (e.g., "log.*Error", "function\s+\w+")
- Filter files with glob parameter (e.g., "*.js", "**/*.tsx") or type
  parameter (e.g., "js", "py", "rust")
- Output modes: "content" shows matching lines, "files_with_matches" shows
  only file paths (default), "count" shows match counts
- Use Agent tool for open-ended searches requiring multiple rounds
- Pattern syntax: Uses ripgrep (not grep) — literal braces need escaping
  (use `interface\{\}` to find `interface{}` in Go code)
- Multiline matching: By default patterns match within single lines only.
  For cross-line patterns like `struct \{[\s\S]*?field`, use `multiline: true`
```

值得分析：
- "Use Agent tool for open-ended searches requiring multiple rounds" — 明確的 Grep vs. Agent 分工
- `interface\{\}` 的逸出說明——ripgrep 和 grep 的關鍵差異，許多工程師的常見踩坑點，直接寫進 prompt

#### 14.5.3 FileReadTool — 多模態與部署差異

**Source:** `src/tools/FileReadTool/prompt.ts` — `renderPromptTemplate()` (lines 1-49)

兩個版本的 offset instruction：

| 版本 | 文字 | 設計邏輯 |
|------|------|---------|
| 外部（default）| "it's recommended to read the whole file by not providing these parameters" | 外部使用者傾向讓 Claude 判斷範圍 |
| Ant（targeted）| "When you already know which part of the file you need, only read that part" | Ant 場景 Claude 需要主動控制 token 消耗 |

`isPDFSupported()` 的 conditional：PDF 支援說明段落本身通過 runtime 函數動態插入，表示 Claude Code 的多模態能力因部署環境而異。

---

### F1：Compact Prompt — 修正為實際 9 項清單

**Source:** `src/services/compact/prompt.ts` — `BASE_COMPACT_PROMPT` (lines 61-143)

#### DETAILED_ANALYSIS_INSTRUCTION_BASE（lines 31-44）

`BASE_COMPACT_PROMPT` 的前置指令，要求先用 `<analysis>` 標籤組織思考：

```
Before providing your final summary, wrap your analysis in <analysis> tags
to organize your thoughts and ensure you've covered all necessary points.
In your analysis process:

1. Chronologically analyze each message and section of the conversation.
   For each section thoroughly identify:
   - The user's explicit requests and intents
   - Your approach to addressing the user's requests
   - Key decisions, technical concepts and code patterns
   - Specific details like: file names, full code snippets, function
     signatures, file edits
   - Errors that you ran into and how you fixed them
   - Pay special attention to specific user feedback that you received,
     especially if the user told you to do something differently.
2. Double-check for technical accuracy and completeness.
```

#### BASE_COMPACT_PROMPT 的完整 9 項（lines 68-143）

```
1. Primary Request and Intent: Capture all of the user's explicit requests
   and intents in detail

2. Key Technical Concepts: List all important technical concepts,
   technologies, and frameworks discussed.

3. Files and Code Sections: Enumerate specific files and code sections
   examined, modified, or created. Pay special attention to the most recent
   messages and include full code snippets where applicable and include a
   summary of why this file read or edit is important.

4. Errors and fixes: List all errors that you ran into, and how you fixed
   them. Pay special attention to specific user feedback that you received,
   especially if the user told you to do something differently.

5. Problem Solving: Document problems solved and any ongoing troubleshooting
   efforts.

6. All user messages: List ALL user messages that are not tool results. These
   are critical for understanding the users' feedback and changing intent.

7. Pending Tasks: Outline any pending tasks that you have explicitly been
   asked to work on.

8. Current Work: Describe in detail precisely what was being worked on
   immediately before this summary request, paying special attention to
   the most recent messages from both user and assistant.

9. Optional Next Step: List the next step that is related to the most recent
   work. IMPORTANT: ensure that this step is DIRECTLY in line with the user's
   most recent explicit requests. If there is a next step, include direct
   quotes from the most recent conversation showing exactly what task you were
   working on and where you left off. This should be verbatim to ensure
   there's no drift in task interpretation.
```

#### 第三種模式：PARTIAL_COMPACT_UP_TO_PROMPT（lines 208-267）

目前 Ch.14 完全未提及。開篇說明了它的不同目的：

```
Your task is to create a detailed summary of this conversation. This summary
will be placed at the start of a continuing session; newer messages that build
on this context will follow after your summary (you do not see them here).
Summarize thoroughly so that someone reading only your summary and then the
newer messages can fully understand what happened and continue the work.
```

與 PARTIAL_COMPACT_PROMPT 的結構差異——它的 Section 8/9 不同：
- Section 8：**Work Completed**（而非 Current Work）
- Section 9：**Context for Continuing Work**（而非 Optional Next Step）

三種模式選擇邏輯（`getPartialCompactPrompt()`, lines 274-291）：

| `direction` 參數 | 使用的 Prompt | 目的 |
|---------|-------------|------|
| `undefined`（全量）| `BASE_COMPACT_PROMPT` | 摘要整個對話 |
| `'partial'`（最近片段）| `PARTIAL_COMPACT_PROMPT` | 只壓縮最近增量 |
| `'up_to'`（到標記點）| `PARTIAL_COMPACT_UP_TO_PROMPT` | 摘要放在繼續 session 的開頭 |

---

### G1：Memory Prompts — 修正為實際源碼版本

**Source:** `src/services/extractMemories/prompts.ts` (lines 50-154)
**Source:** `src/services/autoDream/consolidationPrompt.ts` (lines 10-65)

#### buildExtractAutoOnlyPrompt() vs buildExtractCombinedPrompt()

| 面向 | `buildExtractAutoOnlyPrompt()` | `buildExtractCombinedPrompt()` |
|------|------|------|
| 啟用條件 | 預設 | `feature('TEAMMEM')` |
| 記憶目錄 | 單一 private directory | private + team 兩個目錄 |
| MEMORY.md | 單一索引文件 | 每個目錄各自的 MEMORY.md |
| 額外安全規則 | 無 | "You MUST avoid saving sensitive data within shared team memories. For example, never save API keys or user credentials." |
| `skipIndex=true` 效果 | 省略 Step 2（不更新 MEMORY.md）| 同左（用於避免並行寫入衝突）|

#### autoDream 實際開篇與四個 Phase

**Source:** `src/services/autoDream/consolidationPrompt.ts:10-65`

實際開篇（替換現有的「similar to human brain sleep」）：

```
You are performing a dream — a reflective pass over your memory files.
Synthesize what you've learned recently into durable, well-organized
memories so that future sessions can orient quickly.
```

完整四個 Phase（確切標題與內容）：

```
## Phase 1 — Orient
- `ls` the memory directory to see what already exists
- Read MEMORY.md to understand the current index
- Skim existing topic files so you improve them rather than creating duplicates
- If logs/ or sessions/ subdirs exist, review recent entries

## Phase 2 — Gather recent signal
Priority sources (in order):
1. Daily logs (logs/YYYY/MM/YYYY-MM-DD.md) if present
2. Existing memories that drifted — facts that contradict the codebase now
3. Transcript search — grep narrowly for specific terms, don't read whole files
   `grep -rn "<narrow term>" [transcriptDir]/ --include="*.jsonl" | tail -50`
Don't exhaustively read transcripts. Look only for things you already suspect matter.

## Phase 3 — Consolidate
For each thing worth remembering, write or update a memory file. Focus on:
- Merging new signal into existing topic files (not creating near-duplicates)
- Converting relative dates ("yesterday") to absolute dates
- Deleting contradicted facts

## Phase 4 — Prune and index
Update MEMORY.md so it stays under [MAX_ENTRYPOINT_LINES] lines AND ~25KB.
It's an index, not a dump — each entry should be one line under ~150 chars.
- Remove pointers to stale/wrong/superseded memories
- Demote verbose entries: if an index line is over ~200 chars, move the
  detail to the topic file — shorten the line
- Add pointers to newly important memories
- Resolve contradictions — if two files disagree, fix the wrong one
```

**觸發條件（補充，源碼未在現有章節提及）：** 時間 gate（距上次整合 24h+）AND session gate（累積 5+ sessions）雙重滿足才觸發。

---

### H1：Coordinator — Writing Worker Prompts 完整規則

**Source:** `src/coordinator/coordinatorMode.ts` — worker prompt section (lines 251-310)

#### "Never delegate understanding" 逐字引用

```
### Always synthesize — your most important job

When workers report research findings, you must understand them before
directing follow-up work. Read the findings. Identify the approach. Then
write a prompt that proves you understood by including specific file paths,
line numbers, and exactly what to change.

Never write "based on your findings" or "based on the research." These
phrases delegate understanding to the worker instead of doing it yourself.
You never hand off understanding to another worker.
```

反例 vs. 正例（源碼中的具體對比）：

```typescript
// Anti-pattern — lazy delegation
Agent({ prompt: "Based on your findings, fix the auth bug" })
Agent({ prompt: "The worker found an issue in the auth module. Please fix it." })

// Good — synthesized spec
Agent({ prompt: "Fix the null pointer in src/auth/validate.ts:42. The user
field on Session (src/auth/types.ts:15) is undefined when sessions expire
but the token remains cached. Add a null check before user.id access —
if null, return 401 with 'Session expired'. Commit and report the hash." })
```

#### Purpose Statement 範例（逐字）

```
Include a brief purpose so workers can calibrate depth and emphasis:

- "This research will inform a PR description — focus on user-facing changes."
- "I need this to plan an implementation — report file paths, line numbers,
  and type signatures."
- "This is a quick check before we merge — just verify the happy path."
```

#### Continue vs. Spawn 完整決策矩陣（6 行）

| Situation | Mechanism | Why |
|-----------|-----------|-----|
| Research explored exactly the files that need editing | **Continue** (SendMessage) | Worker has context + gets a clear plan |
| Research was broad but implementation is narrow | **Spawn fresh** (Agent) | Avoid dragging along exploration noise |
| Correcting a failure or extending recent work | **Continue** | Worker has the error context |
| Verifying code a different worker just wrote | **Spawn fresh** | Verifier needs fresh eyes |
| First implementation used the wrong approach | **Spawn fresh** | Wrong-approach context pollutes the retry |
| Completely unrelated task | **Spawn fresh** | No useful context to reuse |

源碼注解：「There is no universal default. Think about how much of the worker's context overlaps with the next task. High overlap → continue. Low overlap → spawn fresh.」

---

## Implementation Phases

### Phase 1：Ch.13 補充

**目標文件：** `src/content/docs/chapters/13-system-prompt.mdx`

- [x] Section 3 — 新增 `#### Ant-only 規則（7條）` 節，引用全部規則原文（prompts.ts:205-248）
- [x] Section 3 — 新增 `#### @[MODEL LAUNCH] Pattern` callout 說明 ant-only 規則的生命週期
- [x] Section 7 — 替換為完整 4 段 ant 版本 + "What ant-only reveals" tip callout
- [x] Section 8 — 替換為條件樹圖 + 每分支實際文字，特別展開 VERIFICATION_AGENT 路徑
- [x] Section 5 — 補充 `getAgentToolSection()` 雙態展示（含 "If you ARE the fork" 句）
- [x] Proactive Mode — 補充 JSDoc 注解引用 + append vs replace 源碼對照（lines 97-120）

### Phase 2：Ch.14 補充

**目標文件：** `src/content/docs/chapters/14-prompt-atlas.mdx`

- [x] 14.3 AgentTool — 在 worktree 節後新增 Fork Subagent 完整分析
- [x] 新增 `## 14.5 其他核心工具 Prompt`（FileEditTool + GrepTool + FileReadTool）
- [x] 14.5 Compact（改為 14.6）— 修正為實際 9 項清單 + DETAILED_ANALYSIS_INSTRUCTION + 第三種模式
- [x] 14.6 Memory（改為 14.7）— 修正 extractMemories 雙函數、team memory 安全規則、autoDream 開篇和 Phase 名稱
- [x] 14.7 Coordinator（改為 14.8）— 新增 Writing Worker Prompts 節（Never delegate + Purpose statement + 6 行矩陣）

### Phase 3：排版統一

- [x] 將所有 `**工程決策**` 散文段落轉換為三欄 Engineering Decision callout（對非顯而易見的決策）
- [x] 確保每個 source code fence 上方有 `**Source:** src/path.ts — functionName() (lines X-Y)` 行
- [ ] 新增章末「延伸研究方向」條目
- [x] 更新 14.1 Prompt Map 的工具統計（從 6 個全部補充）

---

## Acceptance Criteria

### Ch.13

- [x] Section 3 展示全部 7 條 ant-only 規則原文 + `@[MODEL LAUNCH]` 背景說明
- [x] Section 7 有完整 4 段 ant 版本 + "What ant-only reveals" callout
- [x] Section 8 的決策樹有 7 個分支，包含 VERIFICATION_AGENT 完整文字
- [x] Proactive Mode 有 append vs replace 的源碼對照（含 JSDoc 注解）

### Ch.14

- [x] Fork Subagent 有雙模式對比表 + Don't peek/race 逐字引用 + "If you ARE the fork" 說明
- [x] 六個 Prompt Map 工具全部有分析（包含 FileEditTool/GrepTool/FileReadTool）
- [x] BASE_COMPACT_PROMPT 有 9 項清單 + DETAILED_ANALYSIS_INSTRUCTION + 第三種模式
- [x] autoDream 開篇為 "You are performing a *dream*"，Phase 標題與源碼一致
- [x] Coordinator 有 "Never delegate understanding" 逐字引用 + 6 行 Continue/Spawn 矩陣

---

## Files to Modify

```
src/content/docs/chapters/13-system-prompt.mdx
src/content/docs/chapters/14-prompt-atlas.mdx
```

## Key Source References

| 主題 | 文件 | 行範圍 |
|------|------|--------|
| Ant-only rules (7 total) | `src/constants/prompts.ts` | 200-249 |
| Output efficiency both versions | `src/constants/prompts.ts` | 403-428 |
| Session-specific guidance (7 branches) | `src/constants/prompts.ts` | 352-400 |
| Fork vs subagent dual text | `src/constants/prompts.ts` | 316-320 |
| Proactive append vs replace + JSDoc | `src/utils/systemPrompt.ts` | 28-120 |
| AgentTool fork section | `src/tools/AgentTool/prompt.ts` | 60-200 |
| FileEditTool prompt | `src/tools/FileEditTool/prompt.ts` | 1-29 |
| GrepTool prompt | `src/tools/GrepTool/prompt.ts` | 6-19 |
| FileReadTool prompt | `src/tools/FileReadTool/prompt.ts` | 1-49 |
| Compact BASE (9 items) + analysis instr | `src/services/compact/prompt.ts` | 31-143 |
| Compact PARTIAL_UP_TO (3rd mode) | `src/services/compact/prompt.ts` | 208-267 |
| extractMemories auto-only | `src/services/extractMemories/prompts.ts` | 50-94 |
| extractMemories combined + team security | `src/services/extractMemories/prompts.ts` | 101-154 |
| autoDream dream opening + 4 phases | `src/services/autoDream/consolidationPrompt.ts` | 10-65 |
| Coordinator "never delegate" + matrix | `src/coordinator/coordinatorMode.ts` | 251-310 |
| TodoWriteTool full examples | `src/tools/TodoWriteTool/prompt.ts` | 1-100 |

## Internal References

- 現有 Ch.13：`src/content/docs/chapters/13-system-prompt.mdx`
- 現有 Ch.14：`src/content/docs/chapters/14-prompt-atlas.mdx`
- 源碼根目錄：`/Users/weirenlan/Desktop/self_project/labs/claude-code-src/src`
