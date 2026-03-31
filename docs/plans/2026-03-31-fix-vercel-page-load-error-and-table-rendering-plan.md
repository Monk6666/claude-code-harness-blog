---
title: "Fix Vercel Page Load Error and Table Rendering"
type: fix
date: 2026-03-31
---

# Fix Vercel Page Load Error and Table Rendering

## Overview

Two bugs affect the deployed blog on Vercel:
1. **"This page couldn't load"** error when visiting any page on the deployed site
2. **Markdown tables render as raw pipe text** instead of `<table>` elements

Both issues have clear root causes identified through local investigation.

## Problem Statement

### Bug 1: "This page couldn't load" on Vercel

The static export builds successfully locally (`npm run build` completes, all 15 pages generated in `out/`). However, when deployed to Vercel, pages show the Next.js error boundary message: "This page couldn't load — Reload to try again, or go back."

**Root cause analysis:**

The project uses `output: "export"` (static HTML export) with client-side components that depend on hydration. The most likely causes are:

1. **Mermaid dynamic import chunk failure** — `MermaidDiagram.tsx:20` does `await import("mermaid")` which generates a large JS chunk. If the chunk fails to load (e.g., due to path issues or size limits), the entire page crashes.

2. **Missing `trailingSlash` config** — Without `trailingSlash: true`, the generated asset paths and client-side router may have mismatches on Vercel's CDN, causing JS chunks to 404. Next.js 16 static export generates both `chapters/01-introduction.html` and `chapters/01-introduction/index.html`, but the client router's fetch paths may not match Vercel's serving strategy.

3. **Potential remaining hydration issues** — Commit `f4e7163` fixed a `pre` component hydration mismatch by switching to `CodeBlockEnhancer` (DOM manipulation after hydration). However, if there are other server/client mismatches (e.g., `ThemeProvider`, `usePathname` in Sidebar), they could still crash the page.

### Bug 2: Tables render as raw text

All markdown tables across 10+ chapters render as plain text with `|` pipe characters inside `<p>` tags:

```html
<!-- Current output (broken) -->
<p>| Category | Tool | Description |
|------|------|------|
| Files | <code>FileReadTool</code> | Read files |</p>

<!-- Expected output -->
<div class="table-wrapper">
  <table>
    <thead><tr><th>Category</th><th>Tool</th><th>Description</th></tr></thead>
    <tbody>...</tbody>
  </table>
</div>
```

**Root cause:** `remark-gfm` is not installed or configured. Pipe tables are a GitHub Flavored Markdown (GFM) extension, not standard Markdown. Without the `remark-gfm` plugin in the MDX pipeline (`src/lib/mdx.ts:15`), the table syntax is treated as plain text.

**Evidence:** `npm ls remark-gfm` returns empty; `out/chapters/02-tool-system.html` contains 0 `<table>` elements; table content is inside `<p>` tags with literal `|` characters.

## Proposed Solution

### Fix 1: Add `remark-gfm` for table rendering

- Install `remark-gfm`
- Add it to the remark plugins in `src/lib/mdx.ts`
- The existing `table` component override in `mdx-components.tsx` will then correctly wrap tables in `<div className="table-wrapper">`
- The CSS in `globals.css:160-188` already styles `.table-wrapper`, `table`, `th`, `td` correctly

### Fix 2: Add `trailingSlash` to Next.js config

- Add `trailingSlash: true` to `next.config.ts`
- This ensures consistent URL resolution on Vercel's static CDN
- Client-side navigation links and JS chunk paths will align with Vercel's file serving

### Fix 3: Harden Mermaid import with error boundary

- Wrap the mermaid dynamic import in a try/catch at the component level (already partially done)
- Ensure the error does NOT propagate to crash the entire page — the current `MermaidDiagram` catches errors, but if the chunk itself fails to load (network error), the `import()` Promise rejection might not be caught properly
- Consider adding a React Error Boundary around `MermaidDiagram` renders

### Fix 4: Verify Vercel deployment settings (manual check)

- Ensure Vercel project "Framework Preset" is set to "Next.js" (should auto-detect `output: "export"`)
- Or alternatively set "Output Directory" to `out` with "Other" framework preset
- Verify no custom build command overrides

## Acceptance Criteria

- [x] `npm run build` completes without errors
- [x] All markdown tables render as proper `<table>` elements in `out/` HTML files
- [x] Tables have the `table-wrapper` div, correct header styling, and zebra striping
- [ ] Deployed Vercel site loads without "This page couldn't load" error
- [ ] Chapter pages with Mermaid diagrams render (or gracefully degrade)
- [ ] Client-side navigation between chapters works
- [ ] Theme toggle works on deployed site

## MVP

### 1. Install `remark-gfm`

```bash
npm install remark-gfm
```

### 2. Update `src/lib/mdx.ts`

```typescript
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { remarkMermaid } from "./remark-mermaid";
import { mdxComponents } from "@/components/Content/mdx-components";

export async function renderMDX(source: string) {
  const { content, frontmatter } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMermaid],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypePrettyCode,
            {
              theme: {
                dark: "github-dark",
                light: "github-light",
              },
              keepBackground: false,
              filterMetaString: (meta: string) =>
                meta.replace(/mermaid/g, ""),
            },
          ],
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: {
                className: ["anchor-link"],
              },
            },
          ],
        ],
      },
    },
  });

  return { content, frontmatter };
}
```

### 3. Update `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### 4. Verify table output after build

After `npm run build`, check that `out/chapters/02-tool-system.html` contains `<table>` elements and `table-wrapper` divs.

## Technical Considerations

- **`remark-gfm` enables more than tables**: It also enables strikethrough (`~~text~~`), autolinks, task lists (`- [x]`), and literal URLs. All of these are likely used in the MDX content already.
- **`trailingSlash: true`** changes all `<Link>` href outputs to end with `/`. This is a safe change for a new project with no external backlinks to worry about.
- **Mermaid chunk size**: The `mermaid` package is ~2MB. On slow connections, the chunk may take time to load. The existing skeleton loader in `MermaidDiagram.tsx` handles this gracefully, but a chunk load failure should NOT crash the page.
- **Build time**: Adding `remark-gfm` has negligible impact on build time.

## Dependencies & Risks

- **Low risk**: `remark-gfm` is the most widely used remark plugin — extremely stable
- **Low risk**: `trailingSlash` is a well-supported Next.js config option
- **Vercel-specific**: If the "page couldn't load" error persists after these fixes, the issue may be in Vercel's project settings (framework preset, build command, or output directory), which requires checking the Vercel dashboard

## References

- `src/lib/mdx.ts` — MDX compilation pipeline (missing `remark-gfm`)
- `src/components/Content/mdx-components.tsx:7-11` — Table component override (exists but never triggered)
- `src/app/globals.css:160-188` — Table CSS styles (exist, ready to use)
- `next.config.ts` — Missing `trailingSlash`
- `src/components/Content/MermaidDiagram.tsx:20` — Dynamic mermaid import
- Commit `f4e7163` — Previous hydration fix (CodeBlock → CodeBlockEnhancer)
- Content files with tables: all 10 chapters in `content/chapters/`
