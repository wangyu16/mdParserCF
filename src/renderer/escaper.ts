/**
 * HTML Escaping Utilities
 *
 * Functions for escaping special characters in HTML to prevent injection attacks
 * and render special characters correctly.
 */

/**
 * Map of characters to their HTML entity equivalents
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

/**
 * Escape HTML special characters
 * Converts &, <, >, ", ' to their HTML entity equivalents
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Unescape HTML entities back to characters
 */
export function unescapeHtml(text: string): string {
  const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null;
  if (textarea) {
    textarea.innerHTML = text;
    return textarea.value;
  }
  // Fallback for non-browser environments
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

/**
 * Sanitize HTML by removing potentially dangerous attributes and tags
 */
export function sanitizeHtml(html: string): string {
  if (typeof document === 'undefined') {
    return html;
  }

  const div = document.createElement('div');
  div.innerHTML = html;

  // Remove script tags and event handlers
  const scripts = div.querySelectorAll('script');
  scripts.forEach((script) => script.remove());

  // Remove event handler attributes
  div.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.toLowerCase().startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    });
  });

  return div.innerHTML;
}

/**
 * Check if a tag is in the safe list
 */
export function isSafeTag(tag: string): boolean {
  const safeTags = [
    'p',
    'br',
    'hr',
    'div',
    'span',
    'strong',
    'em',
    'i',
    'b',
    'u',
    's',
    'del',
    'mark',
    'code',
    'pre',
    'blockquote',
    'ol',
    'ul',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'img',
    'a',
    'sup',
    'sub',
  ];
  return safeTags.includes(tag.toLowerCase());
}

/**
 * Check if an attribute is safe for a given tag
 */
export function isSafeAttribute(tag: string, attr: string): boolean {
  const safeAttributes: Record<string, string[]> = {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    div: ['class', 'id'],
    span: ['class', 'id'],
    '*': ['class', 'id', 'style'], // Global safe attributes
  };

  const attrs = safeAttributes[tag.toLowerCase()] || [];
  const globalAttrs = safeAttributes['*'] || [];

  return attrs.includes(attr.toLowerCase()) || globalAttrs.includes(attr.toLowerCase());
}

/**
 * Strip HTML tags, keeping only text content
 */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '');
}

/**
 * Get text content from HTML (preserves text structure)
 */
export function getTextContent(html: string): string {
  if (typeof document === 'undefined') {
    return stripHtmlTags(html);
  }

  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}
