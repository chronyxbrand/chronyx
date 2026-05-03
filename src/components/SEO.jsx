import { useEffect } from 'react';

const DEFAULT_TITLE = 'CHRONYX | Luxury Wooden Wall Clocks';
const DEFAULT_DESCRIPTION =
  'Precision-crafted wooden wall clocks blending modern minimalist design with timeless materials.';
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&q=80&w=1200&h=630';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://chronyx.in';

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => {
      if (key !== 'content') {
        element.setAttribute(key, value);
      }
    });
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const upsertLink = (selector, rel, href) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

export default function SEO({ title, description, schema, image, path }) {
  useEffect(() => {
    const pageTitle = title ? `${title} | CHRONYX` : DEFAULT_TITLE;
    const pageDescription = description || DEFAULT_DESCRIPTION;
    const pageImage = image || DEFAULT_IMAGE;
    const pageUrl = path ? `${SITE_URL}${path}` : window.location.href;

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: pageDescription,
    });

    upsertMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: pageTitle,
    });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: pageDescription,
    });
    upsertMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: pageImage,
    });
    upsertMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: pageUrl,
    });
    upsertMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: 'website',
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: pageTitle,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: pageDescription,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: pageImage,
    });

    upsertLink('link[rel="canonical"]', 'canonical', pageUrl);

    const existingSchema = document.getElementById('schema-markup');
    if (existingSchema) {
      existingSchema.remove();
    }

    if (schema) {
      const script = document.createElement('script');
      script.id = 'schema-markup';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      const schemaNode = document.getElementById('schema-markup');
      if (schemaNode) {
        schemaNode.remove();
      }
    };
  }, [title, description, schema, image, path]);

  return null;
}
