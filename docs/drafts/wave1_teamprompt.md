Create an agent team of 4 teammates to write/enrich 4 high-priority chapters of our O'Reilly-quality technical book about
  Claude Code internals. Work fully in parallel — each teammate owns one chapter end-to-end.                                
                                                                                                                          
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
                                                                                                                          
  ## TEAMMATE A — Ch.12: Feature Inventory (CREATE NEW CHAPTER)  
                                               
  **Output:** src/content/docs/chapters/12-feature-inventory.mdx (create this file)                                         
  **Frontmatter:**
  ```                                                                                                                       
  ---                                                                                                                       
  title: "Ch.12 — Feature Inventory"                             
  sidebar:                                                                                                                  
    order: 12                                                                                                             
  ---                                                                                                                       
  ```                                                                                                                     
                                                                 
  **Step 1 — Research via /workflows:plan:**
  Run the /workflows:plan skill with this exact feature description:

  > "Enrich Ch.12 Feature Inventory: research all hidden features, unreleased capabilities, CLI flags (30+), environment variables, and server commands in the Claude Code codebase. Source file: /Users/weirenlan/Desktop/self_project/labs/claude-code-src/claude-code-hidden-features.md. Also grep codebase for: GrowthBook, KAIROS, ULTRATHINK, ULTRAPLAN, voice, bridgeMode, BUDDY, agentTrigger, workflowScript, teamMemory, verificationAgent. External research needed: Martin Fowler Feature Toggles 2017 (martinfowler.com), Google SRE progressive rollout strategies. Goal: O'Reilly quality chapter with engineering rationale for each feature, written in Traditional Chinese."

  When /workflows:plan asks clarifying questions, answer autonomously:
  - Detail level → **A LOT (Comprehensive)**
  - This is a chapter enrichment task, not a new app feature
  - After the plan is saved to docs/plans/, do NOT create GitHub issues — answer "proceed to write"
  - Save the plan file path; you will read it in Step 2

  **Step 2 — Write the chapter** (using the plan from Step 1 as your research package):                                                                                
                                                                                                                            
  ### 前置知識橋                                                                                                            
  "讀完前 11 章，你對 Claude Code 的架構有了完整認識。本章揭示架構之外的能力邊界——什麼是已經存在但還沒公開的功能。"
                                                                                                                            
  ### 為什麼有隱藏功能？                                                                                                  
  Write in O'Reilly problem-first format:                                                                                   
  - Feature flags = safety net, not easter eggs                                                                             
  - Three reasons: progressive rollout, A/B testing, internal-first validation                                              
  - GrowthBook as the flag management system                                                                                
  - Cite Martin Fowler Feature Toggles (2017) — how flag patterns apply here                                                
                                                                                                                            
  ### 一、重大未發佈功能                                                                                                    
  For each feature below, write: what it does, what source code evidence exists, what technical mechanism it uses, what use 
  case it enables. Use O'Reilly 5-part structure.                                                                           
  - Voice Mode                                                   
  - Coordinator Mode（多 Agent 協調）                                                                                       
  - KAIROS（守護程式模式）                                                                                                  
  - Bridge Mode（遠端控制）                                      
  - BUDDY（AI 精靈）                                                                                                        
  - ULTRAPLAN / ULTRATHINK                                                                                                  
  - Agent Triggers（自動排程）                                                                                              
  - Workflow Scripts                                                                                                        
  - Team Memory                                                                                                             
  - Verification Agent                                                                                                    
                                                                 
  ### 二、隱藏 CLI 參數（30+）                                                                                              
  Group by category. For each: flag name, description, usage scenario.
  Categories: 多代理相關, 除錯相關, 模型控制, 認證相關                                                                      
                                                                                                                            
  ### 三、環境變數完整參考                                                                                                  
  Groups: 功能開關類, 停用功能類, 除錯與效能類, 模型覆蓋類, 認證相關類                                                      
                                                                                                                            
  ### 四、隱藏 Server 命令                                                                                                  
  claude server, claude ssh, claude remote-control — what each does and when to use                                         
                                                                                                                            
  ### 關鍵要點                                                                                                              
  Bullet summary                                                                                                            
                                                                                                                            
  ### 承先啟後                                                                                                            
  "隱藏功能中有一個特別重要的：system prompt 的完整內容。Ch.13 把分析文件轉化成可操作的工程知識。"                          
                                                                                                                            
  **Tone:** Serious technical inventory. Every feature explains engineering rationale and use case. NOT "look at these      
  easter eggs."                                                                                                             
                                                                                                                            
  ---                                                                                                                     
                                                                 
  ## TEAMMATE B — Ch.13: System Prompt Deep Dive (CREATE NEW CHAPTER)

  **Output:** src/content/docs/chapters/13-system-prompt.mdx (create this file)                                             
  **Frontmatter:**
  ```                                                                                                                       
  ---                                                                                                                     
  title: "Ch.13 — System Prompt Deep Dive"                       
  sidebar:                                                                                                                  
    order: 13
  ---                                                                                                                       
  ```                                                                                                                     
                                                                 
  **Step 1 — Research via /workflows:plan:**
  Run the /workflows:plan skill with this exact feature description:

  > "Enrich Ch.13 System Prompt Deep Dive: research the complete system prompt architecture in the Claude Code codebase. Source file: /Users/weirenlan/Desktop/self_project/labs/claude-code-src/docs/claude-code-system-prompt-analysis.md. Also grep for: buildSystemPrompt, systemPromptSection, DANGEROUS_uncachedSystemPromptSection, DYNAMIC_BOUNDARY, coordinatorMode, subagentMode, simpleMode. External research needed: Anthropic Constitutional AI Character Overview behavioral specification, Murray Shanahan 'Role Play with Large Language Models' Nature 2023, OpenAI system prompts best practices. Goal: O'Reilly quality reference chapter covering 17 sections, 5-layer priority system, static/dynamic boundary, mode-specific variations, written in Traditional Chinese."

  When /workflows:plan asks clarifying questions, answer autonomously:
  - Detail level → **A LOT (Comprehensive)**
  - This is a chapter enrichment task, not a new app feature
  - After the plan is saved to docs/plans/, do NOT create GitHub issues — answer "proceed to write"
  - Save the plan file path; you will read it in Step 2

  **Step 2 — Write the chapter** (using the plan from Step 1 as your research package):                                                                                
                                                                                                                            
  ### 前置知識橋                                                                                                          
  "Ch.11 從工程師角度介紹了 prompt cache 和 section system 的設計原理。本章是完整的參考文件——每一個 section 的實際內容。"
                                                                                                                            
  ### 為什麼 System Prompt 是工程問題？                                                                                     
  O'Reilly problem-first:                                                                                                   
  - Not "writing prompts" but software architecture                                                                         
  - Modular, versioned, cache-optimized, polymorphic across modes                                                           
  - Claude's behavior = training ∩ system prompt                                                                            
  - Changing system prompt = changing Claude's behavior without retraining                                                  
  - Cite Murray Shanahan (2023) on identity/persona in prompts                                                              
                                                                                                                            
  ### 一、Prompt 優先級系統（5 層）                                                                                         
  Override → Coordinator → Agent → Custom → Default                                                                         
  When does each layer activate? What happens when they conflict? Show with real buildSystemPrompt function signature.      
                                                                                                                            
  ### 二、17 個 Section 的組裝流程                                                                                          
  Present as a table: Section name | Type (Static/Dynamic) | Cache behavior | Purpose                                       
  Static sections (1-7): cacheable across sessions.                                                                         
  DYNAMIC_BOUNDARY marker: why it exists, what it signals to the cache system.                                              
  Dynamic sections (8-17): per-session, cannot be cached.                                                                   
                                                                                                                            
  ### 三、靜態區段逐一解析                                                                                                  
  For each section: what it contains, why it's static, what engineering decision it encodes.                                
  - Intro — 身份宣告與安全指令                                                                                              
  - System — 系統行為規範                                                                                                   
  - Doing Tasks — 任務執行原則                                                                                              
  - Executing Actions with Care — 審慎執行                                                                                  
  - Using Your Tools — 工具使用指南                                                                                         
  - Tone and Style — 語氣風格                                    
  - Output Efficiency — 外部 vs 內部版本差異（what's different in the internal system prompt）                              
                                                                                                                            
  ### 四、動態區段解析                                                                                                      
  - Session-specific Guidance（根據工具動態生成）                                                                           
  - Memory（自動記憶系統 — memdir）                                                                                         
  - Environment Info                                                                                                        
  - Language Preference                                                                                                     
  - MCP Instructions（why this is DANGEROUS_uncached）                                                                      
  - Scratchpad, Function Result Clearing, Summarize                                                                         
                                                                 
  ### 五、特殊 Mode 的 Prompt 差異                                                                                          
  For each mode, explain what changes and why:                                                                            
  - Simple Mode（3 行 — why so short?）                                                                                     
  - Proactive / KAIROS Mode                                                                                                 
  - Coordinator Mode（why it includes TeamCreateTool instructions）                                                         
  - Subagent Mode（why it's simplified/task-focused）                                                                       
                                                                                                                            
  ### 六、Section 快取框架                                                                                                  
  systemPromptSection() vs DANGEROUS_uncachedSystemPromptSection():                                                         
  - What determines which to use?                                                                                           
  - Why is mcp_instructions DANGEROUS_uncached? (MCP servers can change between sessions)                                   
  - Exact cache invalidation triggers                                                                                       
  Show real function signatures found in source.                                                                            
                                                                                                                            
  ### 七、如何客製化 Claude Code 的行為                                                                                   
  - CLAUDE.md hierarchy: managed / user / project — which wins?                                                             
  - --system-prompt / --append-system-prompt CLI flags                                                                      
  - Custom Agent Definition                                                                                                 
                                                                                                                            
  ### 關鍵要點 + 延伸研究方向                                                                                               
  "System prompt 是 Claude Code 行為的 source of truth. 每一行都有工程原因，不是隨意的指令。"                             
  Then: 2-3 future research directions in prompt engineering for agentic systems.                                           
                                                                                                                            
  ---                                                                                                                       
                                                                                                                            
  ## TEAMMATE C — Ch.07: Coordinator & Concurrency (ENRICH EXISTING)                                                        
                                                                                                                          
  **Output:** src/content/docs/chapters/07-coordinator-concurrency.mdx (READ first, then add to it)                         
                                                                                                                          
  **Step 1 — Audit existing content:**
  Read src/content/docs/chapters/07-coordinator-concurrency.mdx. List every existing section and its approximate word count. Note what's already there so Step 3 additions don't duplicate.

  **Step 2 — Research via /workflows:plan:**
  Run the /workflows:plan skill with this exact feature description:

  > "Enrich Ch.07 Coordinator & Concurrency of a technical book about Claude Code internals. Need to add three missing sections: (1) 'Why do we need this loop?' — LLM statelessness + async tool execution requiring orchestration, not a trivial loop (handles concurrency, compression, interruption, cost limits), (2) Generator vs Callback comparison with pseudocode showing callback hell pyramid and generator solution, plus backpressure explanation for streaming LLM output, (3) Batch Partitioning — exclusive vs safe tool classification, parallel within batch, serial between batches, with [ReadFile, ReadFile, WriteFile, BashTool] concrete example. Source: search codebase for query.ts (~1729-line file), runQuery, generator/yield usage, batchPartition, AbortController. External research: Hoare CSP 1978, Rob Pike Concurrency is not Parallelism Go blog, JavaScript async generator backpressure. Goal: O'Reilly quality additions in Traditional Chinese."

  When /workflows:plan asks clarifying questions, answer autonomously:
  - Detail level → **A LOT (Comprehensive)**
  - This is a chapter enrichment task (adding sections to existing .mdx), not a new app feature
  - After the plan is saved to docs/plans/, do NOT create GitHub issues — answer "proceed to write"
  - Save the plan file path; you will read it in Step 3

  **Step 3 — Add these sections (ADD, do not replace existing content):**                                                   
                                                                                                                            
  **ADD at chapter beginning: "## 為什麼需要這個 Loop?"**                                                                   
  - LLM is stateless: each call is input→output only, cannot "continue thinking" mid-call                                 
  - Tool execution is async: must wait for completion before next LLM turn                                                  
  - A while(true) orchestration loop bridges these two realities                                                            
  - Not a trivial loop: handles concurrency, compression, interruption, cost limits                                         
  - Use O'Reilly 5-part structure. Cite CSP paper — how Claude Code's loop maps to CSP's process model.                     
                                                                                                                            
  **ADD: "## Generator vs Callback：非同步協調的語言選擇"**                                                                 
  - Show callback hell pseudocode for tool execution (the "pyramid of doom" version)                                        
  - Show generator version with yield (how it unrolls the pyramid)                                                          
  - Explain backpressure: why it matters when LLM output arrives as a stream                                                
    - Without backpressure: consumer overwhelmed, memory unbounded                                                          
    - With generator: consumer pulls tokens at its own pace                                                                 
  - Cite Rob Pike: map goroutine/channel model to JS generator semantics                                                    
  - Include REAL yield/generator syntax found in query.ts                                                                   
                                                                                                                            
  **ADD: "## Batch Partitioning：安全並行的資料驅動排程"**                                                                  
  - Problem: concurrent writes = data corruption. Serial execution = unnecessary latency.                                   
  - Solution: classify tools as exclusive (can corrupt state) vs safe (read-only)                                           
  - Batch partitioning: group tools into batches. Within batch: parallel. Between batches: serial.                          
  - Concrete example: [ReadFile, ReadFile, WriteFile, BashTool]                                                             
    → Batch 1: [ReadFile, ReadFile] (parallel, both safe)                                                                   
    → Batch 2: [WriteFile] (exclusive, serial)                                                                              
    → Batch 3: [BashTool] (exclusive, serial)                                                                               
  - Show real batchPartition logic from source (actual function if found)                                                   
                                                                                                                            
  **ADD 前置知識橋 at very start:**                                                                                         
  "這是全書的核心章節。前六章的所有機制——工具系統、代理編排、權限、Hook、context——在這裡被一個 1729 行的 `query.ts`         
  協調運作。"                                                                                                               
                                                                                                                          
  **ADD 承先啟後 at very end:**                                                                                             
  "query loop 決定了 Claude Code 的執行節奏。但 Claude Code 的能力不是固化的——Skills 和                                   
  Plugins（Ch.08）讓使用者和第三方擴展它的工具集和行為。"                                                                   
                                               
  ---                                                                                                                       
                                                                                                                          
  ## TEAMMATE D — Ch.03: Agent Orchestration (ENRICH EXISTING)                                                              
                                               
  **Output:** src/content/docs/chapters/03-agent-orchestration.mdx (READ first, then add to it)                             
                                                                                                                          
  **Step 1 — Audit existing content:**
  Read src/content/docs/chapters/03-agent-orchestration.mdx. List every existing section and its approximate word count. Note what's already there so Step 3 additions don't duplicate.

  **Step 2 — Research via /workflows:plan:**
  Run the /workflows:plan skill with this exact feature description:

  > "Enrich Ch.03 Agent Orchestration of a technical book about Claude Code internals. Need to add four missing sections: (1) Fork vs Spawn comparison with exact cost math — 10 agents × 50k tokens: $7.50 naive vs $0.75 cached (90% saving), show real CacheSafeParams type, consequence is child agents cannot have custom system prompts, (2) Worktree isolation flow — checkout worktree, do work, commit, merge-back to main, conflict resolution strategy, (3) Prompt Caching mechanism — cache_control ephemeral marker, prefix match rule, 10% price on cache hit, why static sections must come before dynamic sections, (4) Coordinator Mode tool restriction — WORKER_ALLOWED_TOOLS list, infinite recursion prevention rationale. Source: grep codebase for forkedAgent, CacheSafeParams, worktree, cache_control, WORKER_ALLOWED_TOOLS, bypassPermissions. External research: Anthropic 'Building effective agents' 2024, Google Borg 2015 resource isolation. Goal: O'Reilly quality with specific numbers, in Traditional Chinese."

  When /workflows:plan asks clarifying questions, answer autonomously:
  - Detail level → **A LOT (Comprehensive)**
  - This is a chapter enrichment task (adding sections to existing .mdx), not a new app feature
  - After the plan is saved to docs/plans/, do NOT create GitHub issues — answer "proceed to write"
  - Save the plan file path; you will read it in Step 3

  **Step 3 — Add these sections:**                                                                                          
                                                                                                                            
  **ADD: "## 為什麼是 Fork 而不是 Spawn?"**                                                                                 
  Must include these exact numbers and comparisons:              
  - Fork model (Claude Code): child shares CacheSafeParams prefix with parent → 90% cache hit                               
  - Spawn model (naive): child re-sends entire 50k token system prompt → full price                                         
  - Cost math (write this out explicitly):                                                                                  
    - 10 sub-agents × 50,000 tokens × $15/1M = $7.50 (naive spawn)                                                          
    - 10 sub-agents × 50,000 tokens × $15/1M × 10% = $0.75 (fork with cache)                                                
    - Net saving: $6.75 per orchestration session                                                                           
  - Show real CacheSafeParams type definition from source                                                                   
  - Consequence: child agents cannot have custom system prompts (deliberate constraint — not a bug)                         
  - Cite Anthropic "Building effective agents" — how this implements their multi-agent best practices                       
                                                                                                                            
  **ADD: "## Worktree 隔離：子代理的平行宇宙"**                                                                             
  - What git worktree isolation provides (separate working directory, same repo)                                            
  - Sub-agent workflow: checkout worktree → do work → commit                                                                
  - How commits merge back to main branch after sub-agent completes                                                       
  - Conflict resolution strategy when two sub-agents modify overlapping files                                               
  - Show real worktree utility functions from source                                                                        
                                                                                                                            
  **ADD: "## Prompt Caching 底層機制"**                                                                                     
  - Anthropic API cache_control: {"type": "ephemeral"} — what this marker does                                            
  - Prefix match rule: why the ENTIRE prefix must be byte-identical for cache hit                                           
  - Price model: 10% of input token price on cache read hit                                                                 
  - Engineering consequence: static sections must come BEFORE dynamic sections                                              
    - Any change before the boundary busts the entire cache                                                                 
    - This is why git status / CLAUDE.md content goes AFTER tool definitions                                                
                                                                                                                            
  **ADD: "## Coordinator Mode 的工具限制"**                                                                                 
  - Workers can only access tools in WORKER_ALLOWED_TOOLS — why?                                                            
  - Prevention of infinite recursion: if workers could spawn sub-workers without restriction → unbounded agent trees        
  - Show actual WORKER_ALLOWED_TOOLS list from source                                                                       
  - Cite Google Borg: contrast their resource isolation model with Claude Code's tool restriction approach                  
                                                                                                                            
  **ADD 前置知識橋 at very start:**                                                                                         
  "本章建立在 Ch.02 的 Tool interface 上。AgentTool 是一個特殊工具，它的 `call()` 不操作文件，而是用 `forkedAgent()`        
  啟動另一個 query loop。"                                                                                                  
                                                                 
  **ADD 承先啟後 at very end:**                                                                                             
  "子代理擁有工具，但能使用哪些工具？誰決定？Ch.04 的 permission system 是答案。特別是，bypassPermissions mode            
  讓子代理在自動化流程中跳過互動確認——這是 agentic 系統中最微妙的設計之一。"                                                
                                                                                                                          
  ---                                                                                                                       
                                                                                                                          
  ## START INSTRUCTIONS                                          
                                               
  Begin all 4 tasks simultaneously and in parallel.                                                                         
  If a source file is missing, use Glob or WebSearch to find it — do not give up.
  Real function/type names from source are mandatory in code examples.                                                      
  When done, each teammate reports:                                                                                         
  1. Sections added (list them)                                                                                             
  2. Word count: before → after                                                                                             
  3. One surprising insight discovered during research    