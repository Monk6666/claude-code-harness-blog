"use client";

import { useEffect } from "react";

/**
 * Post-hydration enhancer for code blocks.
 * Injects language labels and copy buttons into rehype-pretty-code figures
 * AFTER React hydration completes, avoiding any mismatch.
 */
export function CodeBlockEnhancer() {
  useEffect(() => {
    const figures = document.querySelectorAll<HTMLElement>(
      "figure[data-rehype-pretty-code-figure]"
    );

    figures.forEach((fig) => {
      // Skip if already enhanced
      if (fig.parentElement?.classList.contains("code-block-wrapper")) return;

      const code = fig.querySelector("code[data-language]");
      const lang = code?.getAttribute("data-language") || "";
      if (!lang) return;

      // Create wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper";

      // Create header with language label + copy button
      const header = document.createElement("div");
      header.className = "code-block-header";

      const langSpan = document.createElement("span");
      langSpan.className = "code-lang";
      langSpan.textContent = lang;
      header.appendChild(langSpan);

      const copyBtn = document.createElement("button");
      copyBtn.className =
        "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors";
      copyBtn.setAttribute("aria-label", "Copy code");
      copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>`;

      copyBtn.addEventListener("click", async () => {
        const pre = fig.querySelector("pre");
        const text = pre?.textContent || "";
        await navigator.clipboard.writeText(text);
        copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>`;
        setTimeout(() => {
          copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>`;
        }, 2000);
      });

      header.appendChild(copyBtn);

      // Wrap: insert wrapper before figure, move figure inside
      fig.parentNode?.insertBefore(wrapper, fig);
      wrapper.appendChild(header);
      wrapper.appendChild(fig);
    });
  }, []);

  return null;
}
