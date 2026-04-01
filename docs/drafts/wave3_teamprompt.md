Create an agent team of 3 teammates to enrich 3 remaining chapters of our O'Reilly-quality technical book about
Claude Code internals. Work fully in parallel — each teammate owns their assigned chapter end-to-end.

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
❌ "Claude Code uses a permission system to control tool access."
✅ "Asking users to approve every tool call makes an agent useless. Never asking makes it dangerous. Claude Code's three-path race resolves this in milliseconds — most approvals complete before the user even sees a dialog."

**Numbers must be specific:**
❌ "saves a lot of time"
✅ "speculative classification approves safe commands in <50ms, before the permission dialog renders (~120ms)"

**Trade-offs must be explicit:**
❌ "this design is more robust"
✅ "this design trades hook flexibility for security: hooks cannot escalate permissions beyond what the parent session allows"

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
- Security: USENIX Security, Anthropic Alignment blog, NIST publications

Each reference must include: 2+ sentence direct quote, relationship to chapter, source URL + date.

---

## TEAMMATE A — Ch.04: Permission Architecture (ENRICH EXISTING)

**Output:** src/content/docs/chapters/04-permission-architecture.mdx (READ first, then add to it)

**Step 1 — Audit existing content:**
Read src/content/docs/chapters/04-permission-architecture.mdx. List every existing section and its approximate word count. Note what's already there so Step 3 additions don't duplicate.

**Step 2 — Research via /workflows:plan:**
Run the /workflows:plan skill with this exact feature description:

> "Enrich Ch.04 Permission Architecture of a technical book about Claude Code internals. Need to add four missing sections: (1) bypassPermissions Mode 設計哲學 — when sub-agents run in automated pipelines (no human present), interactive prompts are impossible; bypassPermissions lets orchestrator vouch for sub-agent safety; the risk model: orchestrator is responsible, not sub-agent; how this maps to NIST Zero Trust 'never trust, always verify' and where Claude Code deliberately deviates, (2) checkPermissionsAndCallTool 核心路徑 — complete trace from tool.call() entry point through all 4 layers: tool-level checkPermissions → global rules engine (alwaysAllow/alwaysDeny/alwaysAsk matching) → Promise.race([interactiveHandler, hookHandler, classifierHandler]) → PermissionDecision dispatch; show real function signature from source, (3) Speculative Classification 時序分析 — exact timing: LLM response stream arrives → BashTool call detected → startSpeculativeClassifierCheck() fires (~0ms) → classifier returns (<50ms) → permission dialog would render (~120ms); if classifier approves, dialog never shown; if classifier abstains (unsafe), dialog appears normally; show real speculative check function from source, (4) 拒絕的 Cascading 效應 — what happens after denial: denialCount increments → agent tries alternate plan → if N consecutive denials, system prompts permission rule adjustment; hooks can observe permission_denied event and override; show real denial tracking from source. Source: grep codebase for checkPermissionsAndCallTool, bypassPermissions, PermissionContext, awaitClassifierAutoApproval, startSpeculativeClassifierCheck, denialCount, PermissionDecision. External research: NIST SP 800-207 Zero Trust Architecture 2020, Saltzer & Schroeder 'Protection of Information in Computer Systems' 1975 principle of least privilege. Goal: O'Reilly quality with specific timing numbers, Traditional Chinese."

When /workflows:plan asks clarifying questions, answer autonomously:
- Detail level → **A LOT (Comprehensive)**
- This is a chapter enrichment task (adding sections to existing .mdx), not a new app feature
- After the plan is saved to docs/plans/, do NOT create GitHub issues — answer "proceed to write"
- Save the plan file path; you will read it in Step 3

**Step 3 — Execute plan via /workflows:work:**
Run the /workflows:work skill to execute the plan saved in Step 2. This will carry out the source code research and initial content drafting. When complete, proceed to Step 4.

**Step 4 — Add these sections (ADD, do not replace existing content):**
Using the research and drafted content from /workflows:work, finalize and add the following sections. Follow UNIVERSAL QUALITY RULES and use REAL source references.

**ADD 前置知識橋 at very start (after frontmatter, before first section):**
"Ch.03 的子代理以 `bypassPermissions` mode 執行，跳過互動確認。本章解釋這個 bypass 是如何運作的——以及當無法 bypass 時，四層系統如何讓三個 handler 同時競賽來做出決定。"

**ADD: "## bypassPermissions Mode 的設計哲學"**
- Problem: sub-agents in automated pipelines have no human present — interactive prompts deadlock the system
- Context: orchestrator decides sub-agent is trusted before spawning; sub-agent inherits that vouching
- Solution: `bypassPermissions: true` in PermissionContext skips all interactive layers; only alwaysDeny rules still fire (hard blocks cannot be bypassed)
- Engineering consequence: orchestrator bears full responsibility for sub-agent actions; this is why coordinator mode is restricted to WORKER_ALLOWED_TOOLS — to limit blast radius
- Cite NIST SP 800-207 Zero Trust: contrast "never trust, always verify" with Claude Code's deliberate orchestrator-vouching exception and explain why it's still safe
- Show real bypassPermissions check from source (where in the permission chain it short-circuits)

**ADD: "## checkPermissionsAndCallTool：核心決策函數的完整路徑"**
- Trace the complete call path with real function names:
  1. `tool.checkPermissions(input, context)` — tool-level layer (e.g., FileReadTool checks path bounds)
  2. → global rules engine: match against `alwaysAllowRules`, `alwaysDenyRules`, `alwaysAskRules` in PermissionContext
  3. → if no rule matches: `Promise.race([interactiveHandler.prompt(), hookHandler.evaluate(), classifierHandler.classify()])`
  4. → `PermissionDecision` dispatched: `allow` / `deny` / `allow with updatedInput` / `hook_result`
- Why Promise.race and not sequential? Latency: sequential would add 50-120ms per unanswered layer before reaching the next
- Show real `checkPermissionsAndCallTool` function signature from source

**ADD: "## Speculative Classification 的時序競賽"**
- Write with these specific timing numbers (verify or adjust from source):
  - LLM stream arrives, BashTool call detected: t=0ms
  - `startSpeculativeClassifierCheck()` fires: t=~0ms (synchronous kickoff)
  - ML classifier returns for safe command: t=<50ms
  - Permission dialog would render in UI: t=~120ms
  - Result: if classifier approves, user never sees dialog
- If classifier abstains (returns never-resolving Promise for unsafe commands): dialog appears normally at t=120ms
- Show real speculative check function and timing from source

**ADD: "## 拒絕的 Cascading 效應"**
- Single denial: agent tries alternate strategy; denialCount increments
- N consecutive denials: system surfaces message suggesting permission rule adjustment
- `permission_denied` hook event fires: external scripts can observe and log or auto-adjust rules
- Why not auto-retry indefinitely? Loop prevention: uncapped retry burns tokens and degrades UX
- Show real denial tracking / denialCount from source

**ADD 承先啟後 at very end:**
"三條競賽路徑中，Hook Handler 只是被提了一句。Ch.05 完整解析 Hook 系統——它不只能 allow/deny，還能修改工具輸入、向使用者提問、在任何生命週期節點插入自訂邏輯。"

**Step 5 — Verify:**
Re-read the final 04-permission-architecture.mdx. Confirm all 4 new sections + 前置知識橋 + 承先啟後 are present, code examples use real source names, no existing content removed.

**Step 6 — Report:**
Report:
1. Chapters enriched
2. Sections added
3. Word count: before → after
4. One surprising insight discovered during research

---

## TEAMMATE B — Ch.05: Hook System (ENRICH EXISTING)

**Output:** src/content/docs/chapters/05-hook-system.mdx (READ first, then add to it)

**Step 1 — Audit existing content:**
Read src/content/docs/chapters/05-hook-system.mdx. List every existing section and its approximate word count. Note what's already there so Step 3 additions don't duplicate.

**Step 2 — Research via /workflows:plan:**
Run the /workflows:plan skill with this exact feature description:

> "Enrich Ch.05 Hook System of a technical book about Claude Code internals. Need to add four missing sections: (1) Hook 如何修改工具輸入 — hooks can return PermissionDecision with updatedInput field, not just allow/deny; use case: sanitizing dangerous flags from a bash command before execution; show real updatedInput path through executeHookCallback and how it flows back into tool.call(); (2) PromptRequest 協議：Hook 向使用者提問 — hooks can pause execution and ask the user an interactive question via PromptRequest/PromptResponse protocol; requestPrompt() callback injected into executeHooks; use case: 'This command will deploy to prod. Continue?' without writing a full permission handler; show real PromptRequest type and requestPrompt signature, (3) Hook 超時與錯誤隔離 — TOOL_HOOK_EXECUTION_TIMEOUT_MS default value and what happens on timeout (hook result = abstain, not deny); child process error vs timeout vs async-background distinction; Promise.race([childClosePromise, childErrorPromise, childIsAsyncPromise]) semantics; consequence: a crashing hook never blocks tool execution, (4) permission_request Hook 的特殊語義 — unlike pre_tool_use (fires after permission decided), permission_request fires DURING the permission decision race as a competitor; it can resolve the race before the user sees any dialog; mutual exclusion with interactive handler: if permission_request hook resolves, interactive handler is aborted. Source: grep codebase for executeHooks, executeHookCallback, updatedInput, PromptRequest, PromptResponse, requestPrompt, TOOL_HOOK_EXECUTION_TIMEOUT_MS, childIsAsyncPromise, permission_request. External research: Unix Philosophy pipes and filters (Mike Gancarz 'The UNIX Philosophy' 1994), Martin Fowler 'Event-Driven Architecture' on event interception patterns. Goal: O'Reilly quality, Traditional Chinese."

When /workflows:plan asks clarifying questions, answer autonomously:
- Detail level → **A LOT (Comprehensive)**
- This is a chapter enrichment task (adding sections to existing .mdx), not a new app feature
- After the plan is saved to docs/plans/, do NOT create GitHub issues — answer "proceed to write"
- Save the plan file path; you will read it in Step 3

**Step 3 — Execute plan via /workflows:work:**
Run the /workflows:work skill to execute the plan saved in Step 2. When complete, proceed to Step 4.

**Step 4 — Add these sections (ADD, do not replace existing content):**
Using the research and drafted content from /workflows:work, finalize and add the following sections.

**ADD 前置知識橋 at very start (after frontmatter, before first section):**
"Ch.04 的三條平行審批路徑中，Hook Handler 是最可擴展的一條——它把權限決定外包給使用者自訂腳本。本章解釋這條路徑的完整能力：hooks 不只能 allow/deny，還能改寫工具輸入、向使用者提問、以及在任何生命週期節點注入自訂行為。"

**ADD: "## Hook 如何修改工具輸入"**
- Problem: a hook that only blocks is limited — what if you want to sanitize a dangerous flag rather than reject outright?
- Solution: `PermissionDecision` has an `updatedInput` field; hook returns `{ behavior: 'allow', updatedInput: sanitizedInput }`
- Path: `executeHookCallback` parses hook stdout → extracts `updatedInput` → returns to `checkPermissionsAndCallTool` → `tool.call(updatedInput, context)` uses the sanitized version
- Use case: stripping `--force` from a git push command instead of denying it
- Consequence: this makes hooks a transformation layer, not just a gate — but it means hooks can silently alter Claude's intended actions
- Show real `updatedInput` extraction from `executeHookCallback` in source

**ADD: "## PromptRequest 協議：Hook 向使用者提問"**
- Problem: sometimes a hook needs user confirmation, but writing a full interactive permission handler is overkill
- Solution: `PromptRequest`/`PromptResponse` protocol — hook receives `requestPrompt` callback, calls it to pause execution and ask the user a question mid-hook
- The callback is injected by `executeHooks` as the `requestPrompt` parameter; hook processes the response and decides allow/deny
- Use case: "This command will deploy to production. Type 'yes' to confirm" — implemented entirely in a shell script hook
- Show real `PromptRequest` type and `requestPrompt` function signature from source

**ADD: "## Hook 超時與錯誤隔離"**
- Default timeout: `TOOL_HOOK_EXECUTION_TIMEOUT_MS` — what is this value? (find from source)
- On timeout: hook result = abstain (not deny) — the race continues with other handlers
- Three completion states for child process: `childClosePromise` (normal exit), `childErrorPromise` (crash), `childIsAsyncPromise` (hook declares itself background-only)
- `Promise.race([childClosePromise, childErrorPromise, childIsAsyncPromise])` semantics: whichever fires first wins
- Consequence: a crashing hook never blocks tool execution — this is by design; hooks are advisory, not mandatory gatekeepers
- Show the Promise.race pattern from `executeHookCallback` in source

**ADD: "## permission_request Hook 的特殊語義"**
- Unlike `pre_tool_use` (fires after permission is decided), `permission_request` fires DURING the permission decision as a race competitor alongside interactiveHandler and classifierHandler
- If `permission_request` hook resolves first: interactive dialog is aborted before it renders
- Mutual exclusion consequence: if the hook says "allow", the user never gets to say "deny" for this specific invocation
- Use case: enterprise policy enforcement — MDM-managed hook that auto-approves all Terraform commands during a deployment window
- Show where `permission_request` hooks enter the `Promise.race` in source

**ADD 承先啟後 at very end:**
"Hook 系統在工具執行前後插入邏輯——但所有這些都發生在一個有限的 context window 內。Ch.06 解釋 Claude Code 如何管理這個窗口：壓縮、快取、以及為什麼改變 system prompt 注入也會清除 user context 快取。"

**Step 5 — Verify:**
Re-read the final 05-hook-system.mdx. Confirm all 4 new sections + 前置知識橋 + 承先啟後 are present, code examples use real source names, no existing content removed.

**Step 6 — Report:**
Report:
1. Chapters enriched
2. Sections added
3. Word count: before → after
4. One surprising insight discovered during research

---

## TEAMMATE C — Ch.08: Skills & Plugin System (ENRICH EXISTING)

**Output:** src/content/docs/chapters/08-skills-plugins.mdx (READ first, then add to it)

**Step 1 — Audit existing content:**
Read src/content/docs/chapters/08-skills-plugins.mdx. List every existing section and its approximate word count. Note what's already there so Step 3 additions don't duplicate.

**Step 2 — Research via /workflows:plan:**
Run the /workflows:plan skill with this exact feature description:

> "Enrich Ch.08 Skills & Plugin System of a technical book about Claude Code internals. Need to add four missing sections: (1) Skill 如何繼承父代理上下文 — when SkillTool calls query() recursively, what exactly is inherited: same tool list (parent tools passed down), same PermissionContext, same conversation history prefix; what is NOT inherited: model override from skill frontmatter creates a new model; consequence: skill cannot expand permissions beyond parent, only restrict or reuse; show real query() invocation in SkillTool.ts with inherited params, (2) MCP 工具發現：JSON Schema → Zod 轉換管道 — MCP server provides JSON Schema for tool inputs; Claude Code must convert to Zod for runtime validation; jsonSchemaToZod() conversion pipeline; edge cases: anyOf/oneOf (union types), $ref (circular references in MCP schemas), required vs optional fields; show real jsonSchemaToZod call from MCPTool.ts, (3) MCP Sampling Protocol：伺服器反向呼叫 LLM — MCP servers can request Claude to generate text via sampling; createSampling() handler registered on client; use case: a database MCP server asks Claude to generate a SQL query description; this is bidirectional: Claude calls MCP, MCP calls Claude; show real sampling handler registration from source, (4) Plugin 安全模型 — plugins get what permissions exactly? Plugin-provided tools inherit the same permission system as built-in tools; plugins cannot register hooks that bypass alwaysDenyRules; managed (MDM) plugins can set alwaysDenyRules that users cannot override; show real plugin permission boundary from source. Source: grep codebase for SkillTool, resolveSkill, jsonSchemaToZod, MCPTool, createSampling, sampling, pluginLoader, loadAllPlugins, alwaysDenyRules, managedPlugin. External research: MCP specification at modelcontextprotocol.io (tool schema section, sampling section), Kubernetes Operator pattern (operator-sdk.io) for comparison with plugin lifecycle management. Goal: O'Reilly quality, Traditional Chinese."

When /workflows:plan asks clarifying questions, answer autonomously:
- Detail level → **A LOT (Comprehensive)**
- This is a chapter enrichment task (adding sections to existing .mdx), not a new app feature
- After the plan is saved to docs/plans/, do NOT create GitHub issues — answer "proceed to write"
- Save the plan file path; you will read it in Step 3

**Step 3 — Execute plan via /workflows:work:**
Run the /workflows:work skill to execute the plan saved in Step 2. When complete, proceed to Step 4.

**Step 4 — Add these sections (ADD, do not replace existing content):**
Using the research and drafted content from /workflows:work, finalize and add the following sections.

**ADD 前置知識橋 at very start (after frontmatter, before first section):**
"Ch.07 的 query loop 是整個系統的心跳。Skill 的執行方式就是：在同一個 query loop 內，遞迴地呼叫自身。本章解釋這個遞迴呼叫繼承了什麼、不繼承什麼——以及 MCP 如何讓外部伺服器加入這個生態系統。"

**ADD: "## Skill 如何繼承父代理上下文"**
- Problem: if skills run in isolation, they can't access the parent session's tools or permission context — making them useless for complex tasks
- Solution: `SkillTool` calls `query()` recursively, passing the parent's `tools`, `PermissionContext`, and conversation history prefix
- What IS inherited: tool list (all parent tools available to skill), permission context (skill cannot escalate permissions), conversation history prefix (skill sees what parent saw)
- What is NOT inherited: model (skill frontmatter can specify `model: opus`, creating a new model selection for this skill's LLM calls)
- Consequence: a skill that needs elevated permissions cannot get them — it must request the user to run with appropriate parent permissions
- Show real `query()` invocation in `SkillTool.ts` with the inherited parameters

**ADD: "## MCP 工具發現：JSON Schema → Zod 轉換管道"**
- Problem: MCP servers describe tool inputs as JSON Schema (the universal schema language), but Claude Code uses Zod for runtime validation — two different schema systems
- Solution: `jsonSchemaToZod()` conversion pipeline runs once when MCP server connects; resulting Zod schema is cached on the `MCPTool` instance
- Edge cases that require special handling:
  - `anyOf`/`oneOf` → Zod `z.union()` (order matters for discriminated unions)
  - `$ref` circular references → `z.lazy()` (same pattern as `lazySchema` in Ch.02)
  - `required` array → fields not in `required` become `z.optional()`
- Show real `jsonSchemaToZod` call from `MCPTool.ts` in source
- Consequence: if MCP server sends a schema that `jsonSchemaToZod()` cannot convert, the tool is silently skipped — no crash, but capability is lost

**ADD: "## MCP Sampling Protocol：伺服器反向呼叫 LLM"**
- Problem: an MCP server (e.g., a database tool) may need Claude to generate text as part of its own logic — but MCP servers are dumb external processes with no LLM access
- Solution: MCP Sampling protocol — the server sends a `sampling/createMessage` request back through the MCP connection; Claude Code's `createSampling()` handler intercepts it and makes an actual LLM call
- This creates a bidirectional flow: Claude calls MCP tool → MCP tool asks Claude to generate text → Claude returns generated text → MCP tool uses it → MCP tool returns final result to Claude
- Use case: a code review MCP server asks Claude to summarize a diff before applying its own policy rules
- Show real `createSampling` handler registration from source
- Consequence: sampling requests count against the session's token budget; a poorly designed MCP server could trigger recursive LLM calls

**ADD: "## Plugin 安全模型：擴展點的邊界"**
- Problem: plugins can register tools and hooks — without boundaries, a malicious plugin could bypass all permission rules
- Solution: plugin-provided tools enter the same permission pipeline as built-in tools; `checkPermissionsAndCallTool` treats them identically
- Hard constraints: plugins cannot override `alwaysDenyRules` from managed (MDM) config; managed plugins can SET `alwaysDenyRules` that users cannot override
- The hierarchy: managed plugin rules > user plugin rules > project plugin rules
- `Promise.allSettled` in `loadAllPlugins`: a plugin that crashes during load is logged and skipped; it cannot take down other plugins or core
- Consequence: this design makes plugins safe to install but limits what paid/enterprise plugins can offer (they cannot grant themselves extra permissions)
- Show real plugin permission boundary / where managed plugin rules are enforced from source

**ADD 承先啟後 at very end:**
"Skills 和 Plugins 擴展了 Claude Code 的能力邊界。Ch.09 退後一步，問一個更基礎的問題：這些能力在執行期間產生的所有狀態——工具呼叫上下文、快取條目、session 資料——儲存在哪裡？是什麼設計讓 agent 系統的狀態管理如此不同於普通 Web 應用？"

**Step 5 — Verify:**
Re-read the final 08-skills-plugins.mdx. Confirm all 4 new sections + 前置知識橋 + 承先啟後 are present, code examples use real source names, no existing content removed.

**Step 6 — Report:**
Report:
1. Chapters enriched
2. Sections added
3. Word count: before → after
4. One surprising insight discovered during research

---

## START INSTRUCTIONS

Begin all 3 teammate tasks simultaneously and in parallel.
If a source file is missing, use Glob or WebSearch to find it — do not give up.
Real function/type names from source are mandatory in code examples.
When done, each teammate reports:
1. Chapters enriched (list them)
2. Sections added (list them)
3. Word count: before → after
4. One surprising insight discovered during research
