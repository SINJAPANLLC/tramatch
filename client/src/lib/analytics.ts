export function trackEvent(eventName: string, params?: Record<string, string>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event: eventName, ...params });
  }
}

export function trackCtaClick(ctaType: string, location: string) {
  trackEvent("cta_click", { cta_type: ctaType, location });
}

export function trackArticleToRegister(articleSlug: string) {
  trackEvent("article_to_register", { article_slug: articleSlug });
}

export function trackCategoryArticleClick(category: string, articleSlug: string) {
  trackEvent("category_article_click", { category, article_slug: articleSlug });
}
