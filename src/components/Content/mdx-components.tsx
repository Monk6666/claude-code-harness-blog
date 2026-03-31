import { MermaidWrapper } from "./MermaidWrapper";
import { Callout } from "./Callout";

export const mdxComponents = {
  Mermaid: MermaidWrapper,
  Callout,
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
