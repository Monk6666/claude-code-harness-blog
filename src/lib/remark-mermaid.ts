import { visit } from "unist-util-visit";
import type { Root, Code } from "mdast";

/**
 * Remark plugin that transforms ```mermaid code blocks into
 * <Mermaid chart="..."> JSX elements that next-mdx-remote can serialize.
 *
 * In MDX, use:
 *   ```mermaid
 *   graph TB
 *     A-->B
 *   ```
 */
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "mermaid" || index === undefined || !parent) return;

      // Replace the code node with an mdxJsxFlowElement
      const mermaidNode = {
        type: "mdxJsxFlowElement" as const,
        name: "Mermaid",
        attributes: [
          {
            type: "mdxJsxAttribute" as const,
            name: "chart",
            value: node.value,
          },
        ],
        children: [],
        data: { _mdxExplicitJsx: true },
      };

      parent.children.splice(index, 1, mermaidNode as unknown as Code);
    });
  };
}
