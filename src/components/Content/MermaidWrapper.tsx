import { MermaidDiagram } from "./MermaidDiagram";

/**
 * Server Component wrapper for Mermaid diagrams.
 * The remark-mermaid plugin transforms ```mermaid code blocks
 * into <Mermaid chart="..."> elements with the chart as a plain string prop.
 */
export function MermaidWrapper({ chart }: { chart?: string }) {
  if (!chart) {
    return null;
  }

  return <MermaidDiagram chart={chart} />;
}
