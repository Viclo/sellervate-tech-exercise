import type { ReactNode } from "react";

/** Renders **bold** and *italic*. Text only: React escapes everything, no HTML is injected. */
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 1) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

/**
 * Minimal markdown for brand procedures: numbered lists and paragraphs.
 * Enough for the seeded content without pulling in a markdown dependency.
 */
export function Procedures({ markdown }: { markdown: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ol key={`ol-${blocks.length}`} className="list-decimal space-y-2 pl-5 marker:text-secondary">
        {list.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ol>,
    );
    list = [];
  };

  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    const numbered = line.match(/^\d+\.\s+(.*)$/);
    if (numbered) {
      list.push(numbered[1]);
      continue;
    }
    flushList();
    if (line) blocks.push(<p key={`p-${blocks.length}`}>{renderInline(line)}</p>);
  }
  flushList();

  return <div className="space-y-3">{blocks}</div>;
}
