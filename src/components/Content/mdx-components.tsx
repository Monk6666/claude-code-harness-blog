import { MermaidDiagram } from "./MermaidDiagram";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";

export const mdxComponents = {
  Mermaid: MermaidDiagram,
  Callout,
  pre: CodeBlock,
  table: (props: React.ComponentProps<"table">) => (
    <div className="table-wrapper">
      <table {...props} />
    </div>
  ),
  img: (props: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} className="rounded-lg max-w-full" />
  ),
};
