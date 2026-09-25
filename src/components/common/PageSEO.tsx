import { useEffect } from 'react';

export interface PageSEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = 'Aman Mishra | Software Developer | C++ • React • AI/ML';
const DEFAULT_DESCRIPTION =
  'Aman Mishra is a software developer specializing in C++, Data Structures & Algorithms, React, full-stack systems, and AI/ML integrations.';
const DEFAULT_CANONICAL = 'https://www.calligraphyguruji.dev/';
const DEFAULT_IMAGE = 'https://www.calligraphyguruji.dev/og-image.png';
const DEFAULT_IMAGE_ALT = 'Aman Mishra - Software Developer Portfolio';
const SITE_NAME = 'Aman Mishra Portfolio';

function setMetaTag(selector: string, attrName: string, attrValue: string, content: string) {
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonicalTag(url: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

export const PageSEO: React.FC<PageSEOProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical = DEFAULT_CANONICAL,
  image = DEFAULT_IMAGE,
  imageAlt = DEFAULT_IMAGE_ALT,
  type = 'website',
  noindex = false,
  structuredData,
  jsonLd,
}) => {
  const schemaPayload = structuredData || jsonLd;
  useEffect(() => {
    // 1. Page Title
    document.title = title;

    // 2. Primary Meta
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="author"]', 'name', 'author', 'Aman Mishra');
    setMetaTag(
      'meta[name="robots"]',
      'name',
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // 3. Canonical Link
    setCanonicalTag(canonical);

    // 4. Open Graph
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', imageAlt);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);

    // 5. Twitter / X Card
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', canonical);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);
    setMetaTag('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', imageAlt);

    // 6. Dynamic JSON-LD Structured Data
    const scriptId = 'dynamic-page-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (schemaPayload) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schemaPayload);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    return () => {
      // Revert title if unmounted
      if (document.title === title) {
        document.title = DEFAULT_TITLE;
      }
    };
  }, [title, description, canonical, image, imageAlt, type, noindex, schemaPayload]);

  return null;
};
