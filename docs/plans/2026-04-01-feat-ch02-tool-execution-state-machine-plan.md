---
title: "feat: Ch.02 Tool Execution State Machine"
type: feat
date: 2026-04-01
chapter: 02-tool-system
source_verified: true
---

# Ch.02 Tool Execution State Machine

## Source

- `src/services/tools/StreamingToolExecutor.ts` (530 lines)
- `src/services/tools/toolExecution.ts`

## ToolStatus State Machine

```typescript
type ToolStatus = 'queued' | 'executing' | 'completed' | 'yielded'
```

Transitions:
- `queued` → `executing`: `canExecuteTool()` passes (no exclusive tools running, or all are concurrency-safe)
- `executing` → `completed`: `tool.call()` resolves
- `completed` → `yielded`: `getRemainingResults()` yields the result
- Any → synthetic complete: abort signal fires (sibling error or user Ctrl+C)

## runToolUse Lifecycle

1. Tool lookup (with alias fallback for deprecated names)
2. Abort check (before even starting)
3. Permission check: `streamedCheckPermissionsAndCallTool()` → `canUseTool()` → `Promise.race([interactive, hook, classifier])`
4. Tool execution with progress streaming
5. Error handling (catch → yield error tool_result)

## Plan

Add a new "## Tool 執行狀態機" section showing:
1. `stateDiagram-v2` of TrackedTool status transitions
2. Sequence of steps in `runToolUse()`

Insert before the existing `## buildTool — 安全預設值模式` section.

Also add a note about `sibling_error` abort cascade.

## Acceptance Criteria

- [ ] E2: `stateDiagram-v2` shows queued→executing→completed→yielded with guard conditions
- [ ] E1: References `StreamingToolExecutor.ts` and `toolExecution.ts` with actual type names
- [ ] E3: Explains WHY `completed` and `yielded` are separate states
