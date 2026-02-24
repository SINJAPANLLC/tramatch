import { useEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  noindex?: boolean;
  canonicalOverride?: string;
}

function setMeta(name: string, content: string, attr = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setRobots(noindex: boolean) {
  let el = document.querySelector('meta[name="robots"]');
  if (noindex) {
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "robots");
      document.head.appendChild(el);
    }
    el.setAttribute("content", "noindex, follow");
  } else if (el) {
    el.remove();
  }
}

export default function SeoHead({ title, description, canonical, ogType = "website", noindex = false, canonicalOverride }: SeoHeadProps) {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:url", canonical || window.location.href, "property");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setCanonical(canonicalOverride || canonical || window.location.href);
    setRobots(noindex);
    return () => setRobots(false);
  }, [title, description, canonical, ogType, noindex, canonicalOverride]);
  return null;
}
