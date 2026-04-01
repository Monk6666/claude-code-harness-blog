Create an agent team of 4 teammates to enrich 6 medium-priority chapters of our O'Reilly-quality technical book about
Claude Code internals. Work fully in parallel — each teammate owns their assigned chapters end-to-end.

**Project root:** /Users/weirenlan/Desktop/self_project/labs/claude-code-harness-blog
**Chapter files:** src/content/docs/chapters/
**External source:** /Users/weirenlan/Desktop/self_project/labs/claude-code-src/ (search with Glob if path varies)
**Language:** Traditional Chinese (zh-TW). Technical terms, function/type names stay in English.

---

## UNIVERSAL QUALITY RULES (every teammate must follow these)

**Section structure — every major concept:**
1. Problem Statement (1 sentence) — what breaks without this mechanism?
2. Context (1-2 sentences) — background conditions
3. Solution (3-5 sentences) — how it specifically works
4. Code Example — REAL type/function names from source, never invented
5. Consequence (1-2 sentences) — what trade-off does this choice make?

**Paragraph rhythm (Lilian Weng style) — open every section with a counterintuitive observation:**
❌ "Claude Code uses memoize to cache context."
✅ "Every API call reassembling system context costs tens of milliseconds. Across hundreds of calls in an agentic session,
cumulative latency is unacceptable — so context assembly happens exactly once."

**Numbers must be specific:**
❌ "saves a lot of token cost"
✅ "cache hits reduce 50k token cost to equivalent 5k tokens (90% discount)"

**Trade-offs must be explicit:**
❌ "this design is more elegant"
✅ "this design sacrifices sub-agent system prompt customization in exchange for 85-90% cache hit rate"

**Every new section starts with a problem/question, never with an answer.**

**Each chapter requires:**
- 前置知識橋 (1-2 sentences at start): what prior chapter knowledge this builds on
- 承先啟後 (1-2 sentences at end): what the next chapter covers and why it follows

**Reference whitelist (only cite these):**
- AI Agents: lilianweng.github.io, Anthropic Research Blog, OpenAI Research Blog
- Systems: USENIX OSDI/SOSP, Google/Meta/Microsoft engineering blogs
- Concurrency/OS: CSAPP (CS:APP 3e), MIT 6.S081
- LLM Engineering: Hugging Face Blog, Andrej Karpathy, DeepMind Blog
- Software: Martin Fowler bliki, Dan Abramov (overreacted.io), ACM/IEEE
- Security: USENIX Security, Anthropic Alignment blog

Each reference must include: 2+ sentence direct quote, relationship to chapter, source URL + date.

---

## TEAMMATE A — Ch.06: Context Management (ENRICH EXISTING)

**Output:** src/content/docs/chapters/06-context-management.mdx (READ first, then add to it)

**Step 1 — Audit existing content:**
Read src/content/docs/chapters/06-context-management.mdx. List every existing section and its approximate word count. Note what's already there so Step 3 additions don't duplicate.

**Step 2 — Research via /workflows:plan:**
Run the /workflows:plan skill with this exact feature description:

> "Enrich Ch.06 Context Management of a technical book about Claude Code internals. Need to add four missing sections: (1) Microcompact 'cached' semantics — what 'reuse previous compression result' means, trigger conditions (previous round compressed + conversation structure unchanged), contrast with autocompact which requires no new LLM call, (2) contextCollapse feature flag — what 'fine-grained history drain queue' means, mutual exclusion with autocompact (proactive vs reactive compression strategy), (3) Cache invalidation precise semantics — why changing system prompt injection also clears getUserContext, why system context + user context are a consistency unit, (4) Cognitive analogy — context window = Working Memory, CLAUDE.md = Long-term Memory, compression summary = Episodic Memory, mapped to Baddeley's cognitive memory model (1974/2000). Source: grep codebase for microcompact, autocompact, contextCollapse, getUserContext, cache invalidation patterns. External research: Baddeley 'Working Memory' 1974, Lilian Weng 'LLM Powered Autonomous Agents' memory types section. Goal: O'Reilly quality additions in Traditional Chinese."

When /workflows:plan asks clarifying questions, answer autonomously:
- Detail level → **A LOT (Comprehensive)**
- This is a chapter enrichment task (adding sections to existing .mdx), not a new app feature
- After the plan is saved to docs/plans/, do NOT create GitHub issues — answer "proceed to write"
- Save the plan file path; you will read it in Step 3

**Step 3 — Execute plan via /workflows:work:**
Run the /workflows:work skill to execute the plan saved in Step 2. This will carry out the research, source code analysis, and initial content drafting defined in the plan. When /workflows:work completes, review its output and proceed to Step 4 for final section additions.

**Step 4 — Add these sections (ADD, do not replace existing content):**
Using the research and drafted content from /workflows:work, finalize and add the following sections. Ensure all content follows the UNIVERSAL QUALITY RULES and uses real source references discovered during the work phase.

**ADD 前置知識橋 at very start:**
"前幾章的工具執行、代理通訊、權限檢查——所有這些都在 context window 內發生。本章解釋 Claude Code 如何管理這個有限資源。"

**ADD: "## Microcompact 的 Cached 語義"**
- What is "reuse previous compression result"? Trigger: previous round compressed + conversation structure not fundamentally changed
- vs autocompact: doesn't require a new LLM call, extremely low cost
- Use O'Reilly 5-part structure. Show real microcompact function signature from source.

**ADD: "## contextCollapse：主動壓縮的旗標機制"**
- What is "fine-grained history drain queue"?
- Mutual exclusion relationship with autocompact:
  - contextCollapse = proactive compression (drain gradually before hitting limit)
  - autocompact = reactive compression (compress when limit approached)
- Why can't both be active simultaneously?
- Show real feature flag usage from source.

**ADD: "## 快取失效的一致性語義"**
- Why does changing system prompt injection ALSO clear getUserContext?
- system context + user context form a consistency unit — must be atomically invalidated
- Concrete scenario: if only system context cleared but user context stale → mismatched assumptions
- Show real cache invalidation logic from source.

**ADD: "## 認知科學類比：為什麼這個設計是對的"**
Write as a Lilian Weng counterintuitive opener:
- context window = Working Memory (Baddeley): limited capacity, active processing
- CLAUDE.md = Long-term Memory: persistent, slow to update
- Compression summary = Episodic Memory: condensed past experience
- Cite Baddeley "Working Memory" (1974/2000) — explain the cognitive parallel
- Consequence: Claude Code's memory architecture mirrors human cognition constraints for a reason

**ADD 承先啟後 at very end:**
"Context 的管理是被動防禦。Ch.07 展示主動的一面：query loop 如何在每輪決策中協調所有這些機制——決定什麼時候壓縮、什麼時候允許工具並行、什麼時候終止。"

**Step 5 — Verify:**
Re-read the final 06-context-management.mdx. Confirm all 4 new sections + 前置知識橋 + 承先啟後 are present, code examples use real source names, and no existing content was deleted.

---

## TEAMMATE B — Ch.02 + Ch.09: Tool System & State Management (ENRICH EXISTING)

**Outputs:**
- src/content/docs/chapters/02-tool-system.mdx (READ first, then add)
- src/content/docs/chapters/09-state-management.mdx (READ first, then add)

**Step 1 — Audit existing content:**
Read both files. For each: list every existing section and its approximate word count. Note what's already there so additions don't duplicate.

**Step 2 — Research via /workflows:plan (Ch.02):**
Run the /workflows:plan skill with this exact feature description:

> "Enrich Ch.02 Tool System of a technical book about Claude Code internals. Need to add three missing sections: (1) Zod + JSON Schema dual-validation rationale — JSON Schema guides LLM input format (tool calling protocol), Zod provides harness-side runtime protection against hallucinated inputs; analogy: OpenAPI spec (tells clients how to call) vs backend validation (protects server), (2) lazySchema circular dependency explanation — AgentTool schema needs tools list, tools list includes AgentTool = circular; lazy evaluation breaks it: 'instantiate schema only when AgentTool is USED, not at module load time'; show real lazySchema usage from source, (3) Progress callback to UI path — BashTool stdout → onProgress() → StreamingToolExecutor → React/Ink render; trace the complete path with real function names. Source: grep codebase for lazySchema, onProgress, StreamingToolExecutor, InputSchema, ZodSchema. External research: Roy Fielding Dissertation 2000 Uniform Interface constraint, CSAPP type-safe interface design. Goal: O'Reilly quality with real source references, Traditional Chinese."

When /workflows:plan asks clarifying questions, answer autonomously:
- Detail level → **A LOT (Comprehensive)**
- Chapter enrichment task only — do NOT create GitHub issues after plan is saved
- Save the plan file path for Step 3

**Step 3 — Execute plan via /workflows:work (Ch.02):**
Run the /workflows:work skill to execute the Ch.02 plan saved in Step 2. This will carry out the source code research (lazySchema, onProgress, StreamingToolExecutor) and initial content drafting. When complete, proceed to Step 4.

**Step 4a — Add to Ch.02:**
Using the research and drafted content from /workflows:work, finalize and add the following sections.

**ADD 前置知識橋 at very start:**
"本章的 Tool interface 是後續所有章節的基礎。Ch.03 的子代理、Ch.04 的權限系統、Ch.05 的 hook system 都建立在這個 interface 之上。"

**ADD: "## Zod + JSON Schema：雙軌驗證的為什麼"**
- JSON Schema → guides LLM to format inputs correctly (tool calling protocol)
- Zod → harness runtime guard, prevents LLM hallucinated inputs from crashing the system
- Analogy: HTTP API's OpenAPI spec (tells client how to call) vs backend validation (protects the server)
- Consequence: two schemas for the same data is intentional duplication, not redundancy
- Show real InputSchema type and Zod schema usage from source.

**ADD: "## lazySchema：打破循環依賴的惰性求值"**
- Concrete problem: AgentTool's schema needs the tools list → tools list contains AgentTool → circular
- Lazy evaluation breaks the cycle: "instantiate schema only when AgentTool is USED, not at module load time"
- Consequence: module loading succeeds; schema is correct when needed
- Show real lazySchema call from source.

**ADD: "## Progress Callback：從 BashTool 到螢幕的完整路徑"**
- Trace: BashTool stdout → onProgress() → StreamingToolExecutor → React/Ink render
- Why each step? onProgress decouples tool from UI. StreamingToolExecutor buffers for backpressure.
- Show real function signatures from source.

**ADD 承先啟後 at very end:**
"工具執行的生命週期到此為止——輸入、驗證、執行、結果。但有時候，一個任務需要派遣另一個 Claude 來處理。Ch.03 介紹的 AgentTool 是特殊的工具，它的 call() 函式不操作文件，而是啟動另一個 AI 對話。"

**Step 5 — Research via /workflows:plan (Ch.09):**
After finishing Ch.02, run a second /workflows:plan with this feature description:

> "Enrich Ch.09 State Management of a technical book about Claude Code internals. Need to add three missing sections: (1) Why not Redux/Zustand? — Claude Code's state has special needs: snapshot capability (for context compression) and diff capability (for cost delta tracking); Redux middleware/devtools are meaningless for agent sessions (no time-travel requirement); AI agent state is ephemeral (session-end = discard, no persistence framework needed); Simple Store's 3 methods vs Redux's 20+ API surface, (2) ToolUseContext call stack trace — complete propagation path: query() creates ToolUseContext → runToolUse(context, ...) → tool.call(args, context, ...) → tool.checkPermissions(context) → hook execution; show real types from source, (3) L2 Disk Cache invalidation strategy — key structure: session ID + tool name + input hash; TTL vs explicit invalidation tradeoff and which Claude Code chose. Source: grep codebase for ToolUseContext, AppState, Store, diskCache, sessionId. External research: Dan Abramov 'You Might Not Need Redux' 2016, Elm Architecture documentation unidirectional data flow. Goal: O'Reilly quality, Traditional Chinese."

When /workflows:plan asks clarifying questions, answer autonomously:
- Detail level → **A LOT (Comprehensive)**
- Chapter enrichment task only — do NOT create GitHub issues after plan is saved
- Save the plan file path for Step 6

**Step 6 — Execute plan via /workflows:work (Ch.09):**
Run the /workflows:work skill to execute the Ch.09 plan saved in Step 5. This will carry out the source code research (ToolUseContext, AppState, Store, diskCache) and initial content drafting. When complete, proceed to Step 7.

**Step 7 — Add to Ch.09:**
Using the research and drafted content from /workflows:work, finalize and add the following sections.

**ADD 前置知識橋 at very start:**
"Ch.07 的 query loop 在每輪都讀寫 State 物件。本章解釋這個 State 的設計哲學——為什麼一個簡單的 store 比 Redux 更適合 agent 系統。"

**ADD: "## 為什麼不用 Redux？"**
- Claude Code's state has unique needs Redux doesn't address: snapshot (for compression) and diff (for cost tracking)
- Redux middleware/devtools = meaningless for agent sessions (no time-travel need)
- Agent state is ephemeral by design — session ends, state discards, no persistence needed
- Simple Store: 3 methods (get, set, subscribe). Redux: 20+ API surface. Match complexity to need.
- Cite Dan Abramov "You Might Not Need Redux" (2016) — when simplicity wins
- Show real Store interface from source.

**ADD: "## ToolUseContext：貫穿調用棧的上下文物件"**
- Trace the complete propagation:
  1. query() — creates ToolUseContext
  2. → runToolUse(context, ...) — passes to execution layer
  3. → tool.call(args, context, ...) — tool receives context
  4. → tool.checkPermissions(context) — permission check uses same context
  5. → hook execution — hooks observe the same context
- Why single context object? Avoids threading individual values through every function signature.
- Show real ToolUseContext type definition from source.

**ADD: "## L2 Disk Cache 的失效策略"**
- Key structure: session ID + tool name + input hash (why each component?)
- TTL (time-based) vs explicit invalidation: which did Claude Code choose and why?
- Consequence: explicit invalidation requires tracking dependencies; TTL is simpler but can serve stale data

**ADD 承先啟後 at very end:**
"State management 是一個具體的設計模式。Ch.10 收集整本書中所有出現的設計模式，給出一個統一的視角。"

---

## TEAMMATE C — Ch.01: Introduction (ENRICH EXISTING)

**Output:** src/content/docs/chapters/01-introduction.mdx (READ first, then add to it)

**Step 1 — Audit existing content:**
Read src/content/docs/chapters/01-introduction.mdx. List every existing section and its approximate word count. Note what's already there so Step 3 additions don't duplicate.

**Step 2 — Research via /workflows:plan:**
Run the /workflows:plan skill with this exact feature description:

> "Enrich Ch.01 Introduction of a technical book about Claude Code internals. This chapter is the entry point for the entire 13-chapter book. Need to add four major additions: (1) Full book roadmap table — for ALL 13 chapters: chapter topic, prerequisite chapters, and core concepts introduced; this table appears ONLY in Ch.01, (2) Startup flow detailed sequence — source files src/main.tsx, src/setup.ts, src/bootstrap/state.ts; must explain which steps must be serial and WHY (MCP connection must complete before tool list generation because MCP tools must be added to tool list), (3) Architecture diagram box responsibility table — for each box in the architecture diagram: box name → what it's responsible for → primary source files → see Ch.N for details, (4) Full end-to-end journey prose — O'Reilly narrative: 'When you type refactor my auth module and press Enter, here is what happens...' covering all 13 chapters' subsystems in sequence. Source: grep codebase for main.tsx, setup.ts, bootstrap, MCP initialization, tool registration. External research: Lilian Weng 'LLM Powered Autonomous Agents' 2023 agent loop architecture, Anthropic 'Building effective agents' 2024. Goal: O'Reilly quality, Traditional Chinese."

When /workflows:plan asks clarifying questions, answer autonomously:
- Detail level → **A LOT (Comprehensive)**
- This is a chapter enrichment task (adding content to existing .mdx), not a new app feature
- After the plan is saved to docs/plans/, do NOT create GitHub issues — answer "proceed to write"
- Save the plan file path; you will read it in Step 3

**Step 3 — Execute plan via /workflows:work:**
Run the /workflows:work skill to execute the plan saved in Step 2. This will carry out the source code research (main.tsx, setup.ts, bootstrap) and initial content drafting for all 4 additions. When /workflows:work completes, review its output and proceed to Step 4.

**Step 4 — Add these sections (ADD, do not replace existing content):**
Using the research and drafted content from /workflows:work, finalize and add the following sections. Ensure all content follows the UNIVERSAL QUALITY RULES and uses real source references discovered during the work phase.

**ADD at chapter beginning: "## 全書路線圖"**
Create a table with ALL 13 chapters covering:
| 章節 | 主題 | 前置章節 | 本章引入的核心概念 |
Include all chapters from Ch.01 to Ch.13 (Ch.12 Feature Inventory, Ch.13 System Prompt Deep Dive).
This table exists ONLY in Ch.01 — reference it in the 承先啟後.

**ADD: "## Startup Flow：啟動序列的因果鏈"**
- Trace startup sequence from source: src/main.tsx → src/setup.ts → src/bootstrap/state.ts
- Key insight: MCP connection MUST complete before tool list generation
  - Why serial? MCP tools must be added to tool list. If tool list generates before MCP connects, MCP tools are missing.
  - Show actual initialization order from source with real function names.
- Use O'Reilly 5-part structure (Problem/Context/Solution/Code/Consequence)

**ADD: "## Architecture 責任矩陣"**
After the existing architecture diagram, add a table:
| 元件名稱 | 負責什麼 | 主要 Source Files | 詳見 |
Fill in all boxes visible in the architecture diagram using real source file paths found in codebase.

**ADD: "## 從輸入到回應：一次完整的旅程"**
Write as O'Reilly narrative prose:
"當你輸入 'refactor my auth module' 並按下 Enter，接下來發生的是..."
Trace through ALL major subsystems in order:
1. Input → query loop starts (Ch.07)
2. Context assembly — CLAUDE.md loaded, system prompt built (Ch.06, Ch.11)
3. First LLM call — tool calls returned in streaming (Ch.07)
4. Tool execution — permission check, hook pre_tool, execution, hook post_tool (Ch.02, Ch.04, Ch.05)
5. If AgentTool — sub-agent fork, worktree checkout (Ch.03)
6. Context compression if needed (Ch.06)
7. Loop continues until terminal state (Ch.07)
This gives readers a complete mental model before reading individual chapters.

**ADD 承先啟後 at very end:**
"Ch.01 是唯一有「全書路線圖」的地方。接下來，Ch.02 從 Claude Code 最基礎的抽象開始——Tool interface。理解 Tool 是理解後續所有章節的前提。"

---

## TEAMMATE D — Ch.10 + Ch.11: Design Patterns & Prompt Engineering (ENRICH EXISTING)

**Outputs:**
- src/content/docs/chapters/10-design-patterns-summary.mdx (READ first, then add)
- src/content/docs/chapters/11-prompt-engineering.mdx (READ first, then add)

**Step 1 — Audit existing content:**
Read both files. For each: list every existing section and approximate word count. Note what's already there so additions don't duplicate.

**Step 2 — Research via /workflows:plan (Ch.10):**
Run the /workflows:plan skill with this exact feature description:

> "Enrich Ch.10 Design Patterns Summary of a technical book about Claude Code internals. Need to add three improvements: (1) Expand Problem paragraph for each pattern to 3-4 sentences — Pattern 1 (Generator): specific consequences of callback hell; Pattern 3 (Promise.race): latency cost of serial waiting; Pattern 5 (Lazy Schema): concrete scenario where eager initialization causes Node.js module loading deadlock, (2) Add 'in Claude Code:...' annotation to every checklist item pointing to specific implementation location (file:function), (3) Add 'Pattern Relationship Diagram' section — which patterns depend on each other, which are alternatives to each other, show as a diagram or structured table. Source: grep codebase for all pattern implementations. External research: Rich Hickey 'Simple Made Easy' 2011, GoF 'Design Patterns' 1994 pattern vocabulary. Goal: O'Reilly quality, Traditional Chinese."

When /workflows:plan asks clarifying questions, answer autonomously:
- Detail level → **A LOT (Comprehensive)**
- Chapter enrichment task only — do NOT create GitHub issues after plan is saved
- Save the plan file path for Step 3

**Step 3 — Execute plan via /workflows:work (Ch.10):**
Run the /workflows:work skill to execute the Ch.10 plan saved in Step 2. This will carry out the source code research (pattern implementations, file:function locations) and initial content drafting. When complete, proceed to Step 4.

**Step 4a — Add to Ch.10:**
Using the research and drafted content from /workflows:work, finalize and add the following sections.

**ADD 前置知識橋 at very start (if not already present):**
"你已經讀完了 9 個章節。現在我們退一步，看這些設計決策的共同主題。"

**EXPAND existing pattern Problem sections to 3-4 sentences:**
For each pattern in the existing file, expand its Problem Statement to 3-4 sentences:
- Pattern 1 (Generator): what specifically breaks with callback hell — pyramid of doom, error propagation failure, untestable code
- Pattern 3 (Promise.race): what latency cost looks like — 5 parallel tools waiting 2s each serialized = 10s vs 2s
- Pattern 5 (Lazy Schema): what Node.js module loading deadlock looks like — module A requires module B at load time, B requires A, both hang

**ADD "在 Claude Code 中：..." to every checklist item:**
After each ✅ checklist item in the existing file, add a line:
"在 Claude Code 中：`file.ts:functionName` — [one sentence explanation]"
Find the real file:function using Grep.

**ADD: "## Pattern 之間的關係圖"**
Show:
- Dependencies: which patterns enable others (Generator enables Batch Partitioning)
- Alternatives: which patterns solve the same problem differently
- Present as structured table or Mermaid diagram (prefer diagram)

**ADD 承先啟後 at very end:**
"所有的工具、代理、權限都在一個最終的媒介上運作：system prompt。Ch.11 解析 Claude Code 如何把這本書前十章的所有知識，壓縮成 LLM 能理解的指令。"

**Step 5 — Research via /workflows:plan (Ch.11):**
After finishing Ch.10, run a second /workflows:plan with this feature description:

> "Enrich Ch.11 Prompt Engineering of a technical book about Claude Code internals. Need to add three missing sections: (1) Specific cost impact numbers — system prompt + tools ≈ 50,000 tokens; no cache: each API call = 50k × $15/1M = $0.75; with cache (10%): $0.075 per call; 10 conversation rounds: $7.50 → $0.75 (90% saving); 10 sub-agent sessions: $75 → $7.50, (2) How LLM 'knows' which mode it's in — mode is not if/else, it's buildSystemPrompt(mode) selecting different Section combinations; Coordinator mode: system prompt includes TeamCreateTool usage instructions; Subagent mode: simplified, task-focused, (3) Why static prefix MUST come before dynamic sections — Anthropic API cache = prefix match; any change before the boundary busts the entire cache; static sections (tool defs, core instructions) go before the DYNAMIC_BOUNDARY marker; dynamic sections (git status, CLAUDE.md content, user context) go after. Source: grep codebase for buildSystemPrompt, DYNAMIC_BOUNDARY, coordinatorMode prompt sections. External research: Anthropic Prompt Engineering Overview official docs cache control section, OpenAI Best Practices for Prompt Engineering instruction placement. Goal: O'Reilly quality with specific numbers, Traditional Chinese."

When /workflows:plan asks clarifying questions, answer autonomously:
- Detail level → **A LOT (Comprehensive)**
- Chapter enrichment task only — do NOT create GitHub issues after plan is saved
- Save the plan file path for Step 6

**Step 6 — Execute plan via /workflows:work (Ch.11):**
Run the /workflows:work skill to execute the Ch.11 plan saved in Step 5. This will carry out the source code research (buildSystemPrompt, DYNAMIC_BOUNDARY, coordinatorMode) and initial content drafting. When complete, proceed to Step 7.

**Step 7 — Add to Ch.11:**
Using the research and drafted content from /workflows:work, finalize and add the following sections.

**ADD 前置知識橋 at very start:**
"Ch.06 介紹了 context window 的有限性和壓縮策略。本章從另一個角度看這個問題：如何設計 system prompt 讓有限的 context budget 發揮最大效果。"

**ADD: "## Cache 的真實成本：一組具體數字"**
Write with these exact numbers:
- system prompt + tools ≈ 50,000 tokens (verify or adjust from source)
- No cache: each API call = 50,000 × $15/1M = $0.75
- With cache (10% read price): = $0.075 per cached call
- 10 conversation rounds: $7.50 → $0.75 (saves $6.75, 90% reduction)
- 10 sub-agent sessions: $75.00 → $7.50 (saves $67.50)
- Use O'Reilly 5-part structure. Cite Anthropic Prompt Engineering docs — cache_control section.

**ADD: "## LLM 如何知道自己在哪個 Mode？"**
- Mode is not runtime if/else — it's buildSystemPrompt(mode) composing different section sets at startup
- Coordinator mode: system prompt includes TeamCreateTool + team management instructions
- Subagent mode: simplified system prompt, task-focused, no team tools
- Simple mode: ~3 lines only
- Show real buildSystemPrompt call signatures from source.
- Consequence: mode-switching requires restarting the session (can't change mode mid-conversation)

**ADD: "## 為什麼靜態 Prefix 必須在動態 Section 之前？"**
- Anthropic API cache = prefix match (byte-identical prefix required)
- Any change before the DYNAMIC_BOUNDARY marker busts the ENTIRE cache
- Static before dynamic: tool definitions, core instructions, safety rules → cacheable across sessions
- Dynamic after: git status, CLAUDE.md content, user context, MCP instructions → change per session
- Engineering consequence: a seemingly harmless "add today's date to system prompt start" = 100% cache miss rate
- Show DYNAMIC_BOUNDARY marker from source.

**ADD 承先啟後 at very end:**
"我們現在理解了 Claude Code 的 prompt 設計哲學。但 Claude Code 還有很多不在文檔中的功能——隱藏在 feature flags 和環境變數背後。Ch.12 是一次深入探索。"

---

## START INSTRUCTIONS

Begin all 4 teammate tasks simultaneously and in parallel.
Teammate B and D each handle 2 chapters sequentially within their own session — finish Ch.02 before Ch.09, finish Ch.10 before Ch.11.
If a source file is missing, use Glob or WebSearch to find it — do not give up.
Real function/type names from source are mandatory in code examples.
When done, each teammate reports:
1. Chapters enriched (list them)
2. Sections added per chapter
3. Word count: before → after (per chapter)
4. One surprising insight discovered during research
