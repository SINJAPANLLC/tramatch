import { useMemo } from "react";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function extractHeadings(content: string): TocItem[] {
  const headings: TocItem[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const text = match[2].replace(/\*\*/g, "").replace(/\*/g, "").trim();
    const id = text.replace(/\s+/g, "-").replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]/g, "").toLowerCase();
    headings.push({ id, text, level: match[1].length });
  }
  return headings;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length === 0) return null;

  return (
    <nav className="bg-muted/50 border rounded-lg p-4 mb-6" data-testid="nav-toc">
      <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <List className="w-4 h-4" />
        目次
      </h2>
      <ol className="space-y-1.5">
        {headings.map((h, i) => (
          <li key={i} className={h.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${h.id}`}
              className="text-sm text-primary hover:underline block py-0.5"
              data-testid={`link-toc-${i}`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
