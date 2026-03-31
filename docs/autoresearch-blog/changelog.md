# Autoresearch Changelog — harness-blog-v2

Tracking every experiment on the 5 priority chapters.
Eval criteria: E1=source_accuracy, E2=state_machine, E3=motivation_depth, E4=accessible_entry, E5=no_ai_smell
Max score: 25 (5 chapters × 5 evals)

---

## Experiment 0 — baseline

**Score:** 16/25 (64.0%)
**Change:** No changes — establishing baseline
**Chapters scored:**
- Ch.07 (Query Loop): 4/5 → E2=0 (no state machine), else all pass
- Ch.02 (Tool System): 4/5 → E2=0 (no tool execution FSM), else all pass
- Ch.03 (Agent Orchestration): 3/5 → E2=0 (no agent lifecycle FSM), E5=0 (some repetitive structure)
- Ch.06 (Context Management): 1/5 → E1=0 (source refs not verified), E2=0, E3=0 (no compression motivation), E5=0 (AI smell: "最獨特的功能之一")
- Ch.04 (Permission): 4/5 → E2=0 (no permission FSM), else all pass

**Key failure patterns:**
1. E2 (state machines) — failing across ALL 5 chapters (most impactful)
2. Ch.06 is the weakest chapter overall (4 failures)
3. E5 failures are scattered, mostly in Chinese superlatives

---

## Experiment 1 — keep

**Score:** 17/25 (68.0%) — improved from 64.0%
**Change:** Ch.07 — Added `stateDiagram-v2` Master Query State Machine + State type documentation + expanded Terminal/Continue tables
**Reasoning:** E2 was 0/5. Adding the most complex state machine (query loop) first gives the biggest E2 lift. The State type documentation also improves E3 (design motivation) and E1 (source accuracy) depth.
**Result:**
- E1: 1→1 (maintained, now with explicit line references)
- E2: 0→1 (stateDiagram-v2 renders with 3 phases, 7 Continue + 10 Terminal labels)
- E3: 1→1 (added "為什麼把狀態全放在一個物件" motivation paragraph)
- E4: 1→1 (state machine shown first, overview sentence before code)
- E5: 1→1 (no AI smell in new content)
**Remaining failures:** E2 still 0 for Ch.02, 03, 04, 06 — need 4 more state machine diagrams

---
