import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqBlockProps {
  items: FaqItem[];
  pageUrl?: string;
}

export default function FaqBlock({ items, pageUrl }: FaqBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mt-8 mb-6" data-testid="faq-block">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          よくある質問
        </h2>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="border rounded-lg" data-testid={`faq-item-${i}`}>
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                data-testid={`button-faq-toggle-${i}`}
              >
                <span className="text-sm font-medium text-foreground pr-4">{item.question}</span>
                {openIndex === i ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
