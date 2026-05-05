const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'em',
  'h2',
  'h3',
  'h4',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'ul',
]);

const GLOBAL_ATTRIBUTES = new Set(['title']);
const TAG_ATTRIBUTES = {
  a: new Set(['href', 'target', 'rel', 'title']),
};

function isSafeUrl(value) {
  if (!value) return false;
  if (value.startsWith('/') || value.startsWith('#')) return true;

  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeElement(element) {
  const tagName = element.tagName.toLowerCase();

  if (['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'].includes(tagName)) {
    element.remove();
    return;
  }

  if (!ALLOWED_TAGS.has(tagName)) {
    element.replaceWith(...Array.from(element.childNodes));
    return;
  }

  const allowedAttributes = TAG_ATTRIBUTES[tagName] || new Set();
  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;

    if (name.startsWith('on')) {
      element.removeAttribute(attribute.name);
      continue;
    }

    if (!GLOBAL_ATTRIBUTES.has(name) && !allowedAttributes.has(name)) {
      element.removeAttribute(attribute.name);
      continue;
    }

    if (name === 'href' && !isSafeUrl(value)) {
      element.removeAttribute(attribute.name);
    }
  }

  if (tagName === 'a' && element.getAttribute('target') === '_blank') {
    element.setAttribute('rel', 'noopener noreferrer');
  }
}

export function sanitizeArticleHtml(html = '') {
  if (typeof document === 'undefined') {
    return String(html).replace(/<[^>]*>/g, ' ');
  }

  const template = document.createElement('template');
  template.innerHTML = String(html);

  const walk = (node) => {
    for (const child of Array.from(node.children)) {
      sanitizeElement(child);
      walk(child);
    }
  };

  walk(template.content);
  return template.innerHTML;
}
