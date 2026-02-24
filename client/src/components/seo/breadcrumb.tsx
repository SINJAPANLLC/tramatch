import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tramatch-sinjapan.com/" },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        ...(item.href ? { item: `https://tramatch-sinjapan.com${item.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav aria-label="パンくずリスト" className="text-sm text-muted-foreground mb-4" data-testid="nav-breadcrumb">
        <ol className="flex items-center flex-wrap gap-1">
          <li className="flex items-center gap-1">
            <Link href="/" className="hover:text-primary flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              ホーム
            </Link>
            <ChevronRight className="w-3 h-3" />
          </li>
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              {item.href && i < items.length - 1 ? (
                <Link href={item.href} className="hover:text-primary">{item.label}</Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
              {i < items.length - 1 && <ChevronRight className="w-3 h-3" />}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
