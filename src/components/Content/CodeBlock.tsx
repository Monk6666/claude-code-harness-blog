"use client";

import { CopyButton } from "./CopyButton";
import {
  isValidElement,
  Children,
  type ReactElement,
  type ReactNode,
} from "react";

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!isValidElement(node)) return "";
  const children = (node.props as { children?: ReactNode }).children;
  return Children.toArray(children).map(extractText).join("");
}

export function CodeBlock(props: React.ComponentProps<"pre">) {
  const { children, ...rest } = props;

  // Extract language from the code element's data attribute
  let language = "";
  let filepath = "";

  if (isValidElement(children)) {
    const codeEl = children as ReactElement<{
      "data-language"?: string;
      children?: ReactNode;
    }>;
    language = codeEl.props["data-language"] || "";

    // Extract file path from first line comment pattern: // src/path/to/file.ts
    const text = extractText(codeEl);
    const firstLine = text.split("\n")[0]?.trim() || "";
    const pathMatch = firstLine.match(
      /^\/\/\s+(src\/[^\s]+|[a-zA-Z][a-zA-Z0-9_.-]*\/[^\s]+)/
    );
    if (pathMatch) {
      filepath = pathMatch[1];
    }
  }

  const rawCode = extractText(
    isValidElement(children) ? children : <>{children}</>
  );

  const hasHeader = language || filepath;

  if (!hasHeader) {
    return <pre {...rest}>{children}</pre>;
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <div className="flex items-center gap-3">
          {language && <span className="code-lang">{language}</span>}
          {filepath && <span className="code-filepath">{filepath}</span>}
        </div>
        <CopyButton code={rawCode} />
      </div>
      <pre {...rest}>{children}</pre>
    </div>
  );
}
