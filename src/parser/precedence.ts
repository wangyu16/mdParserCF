/**
 * Parsing Precedence Rules
 *
 * This file defines the order in which markdown elements are parsed.
 * Parsing follows a strict precedence to resolve conflicts between overlapping syntax elements.
 */

/**
 * Parsing precedence order (highest to lowest priority)
 *
 * Elements are parsed from the outermost (block-level) to the innermost (inline-level).
 * Within the same level, longer matches are preferred.
 * Escaping takes precedence over all parsing.
 */
export const PARSING_PRECEDENCE = {
  // 1. Escaping - highest priority
  ESCAPE: { priority: 100, level: 'escape' },

  // 2. Block-level elements (parsed first, top-to-bottom)
  HTML_BLOCK: { priority: 90, level: 'block' },
  FENCED_CODE_BLOCK: { priority: 85, level: 'block' },
  INDENTED_CODE_BLOCK: { priority: 84, level: 'block' },
  TABLE: { priority: 80, level: 'block' },
  BLOCKQUOTE: { priority: 75, level: 'block' },
  LIST_UNORDERED: { priority: 70, level: 'block' },
  LIST_ORDERED: { priority: 69, level: 'block' },
  HEADING: { priority: 68, level: 'block' },
  HORIZONTAL_RULE: { priority: 67, level: 'block' },
  CUSTOM_CONTAINER_BLOCK: { priority: 65, level: 'block' },

  // 3. Inline-level elements (parsed after block detection)
  LINK: { priority: 60, level: 'inline' },
  IMAGE: { priority: 59, level: 'inline' },

  // 4. Emphasis and formatting
  STRONG_EMPHASIS: { priority: 50, level: 'inline' },
  STRONG: { priority: 49, level: 'inline' },
  EMPHASIS: { priority: 48, level: 'inline' },
  CODE_SPAN: { priority: 47, level: 'inline' },
  STRIKETHROUGH: { priority: 46, level: 'inline' },
  UNDERLINE: { priority: 45, level: 'inline' },
  HIGHLIGHT: { priority: 44, level: 'inline' },
  SUPERSCRIPT: { priority: 43, level: 'inline' },
  SUBSCRIPT: { priority: 42, level: 'inline' },
  CUSTOM_SPAN: { priority: 41, level: 'inline' },

  // 5. Extensions (lowest priority within inline)
  MATH_BLOCK: { priority: 40, level: 'extension' },
  INLINE_MATH: { priority: 39, level: 'extension' },
  FOOTNOTE: { priority: 38, level: 'extension' },
  PLUGIN: { priority: 37, level: 'extension' },

  // 6. Line breaks (lowest overall)
  HARD_LINE_BREAK: { priority: 10, level: 'inline' },
  SOFT_LINE_BREAK: { priority: 5, level: 'inline' },
  HTML_INLINE: { priority: 3, level: 'inline' },
  TEXT: { priority: 1, level: 'inline' },
};

/**
 * Escape sequences that can be used to prevent markdown parsing
 */
export const ESCAPABLE_CHARS = [
  '\\', // Backslash
  '`', // Backtick
  '*', // Asterisk
  '_', // Underscore
  '{', // Left brace
  '}', // Right brace
  '[', // Left bracket
  ']', // Right bracket
  '(', // Left paren
  ')', // Right paren
  '#', // Hash
  '+', // Plus
  '-', // Minus
  '.', // Period
  '!', // Exclamation
  '|', // Pipe
  '~', // Tilde
  '=', // Equals
  '^', // Caret
  ':', // Colon
];

/**
 * Block-level element markers (characters that typically start block elements)
 */
export const BLOCK_START_CHARS = {
  '#': 'heading',
  '>': 'blockquote',
  '-': 'list-or-hr',
  '+': 'list',
  '*': 'list-or-hr',
  '`': 'fenced-code-block',
  '~': 'fenced-code-block',
  '|': 'table',
  '<': 'html-block',
  ':': 'custom-container-or-plugin',
  '{': 'plugin-or-math',
  ' ': 'indented-code-or-list', // 4 spaces
};

/**
 * Inline emphasis markers and their properties
 */
export const EMPHASIS_MARKERS = {
  '*': {
    single: 'emphasis', // *text*
    double: 'strong', // **text**
    triple: 'strong-emphasis', // ***text***
  },
  '_': {
    single: 'emphasis', // _text_
    double: 'strong', // __text__
    triple: 'strong-emphasis', // ___text___
  },
  '~': {
    single: 'subscript', // ~text~
    double: 'strikethrough', // ~~text~~
  },
  '+': {
    double: 'underline', // ++text++
  },
  '=': {
    double: 'highlight', // ==text==
  },
  '^': {
    single: 'superscript', // ^text^
  },
  ':': {
    double: 'custom-span', // ::classname[text]::
  },
};

/**
 * Delimiters for various markdown constructs
 */
export const DELIMITERS = {
  codeBlock: {
    fence: '```',
    tilde: '~~~',
    indent: 4, // spaces
    tab: 1, // tab
  },
  blockquote: '>',
  list: ['-', '+', '*'], // unordered
  listOrdered: /^\d+\./, // numbered
  hardLineBreak: '  ', // two spaces at end of line
  horizontalRule: {
    hyphens: '---',
    asterisks: '***',
    underscores: '___',
  },
  customContainer: {
    block: ':::',
    span: '::',
  },
  link: {
    text: '[...]',
    url: '(...)',
  },
  image: {
    start: '!',
    text: '[...]',
    url: '(...)',
  },
  footnote: {
    ref: '[^...]',
    def: '[^...]:',
  },
  math: {
    inline: '$...$',
    block: '$$...$$',
  },
  plugin: {
    start: '{{',
    end: '}}',
  },
};

/**
 * HTML special characters that need escaping
 */
export const HTML_ESCAPE_CHARS: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

/**
 * Safe HTML tags that are allowed in markdown
 */
export const ALLOWED_HTML_TAGS = [
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

/**
 * Get the sorting order for elements by precedence
 */
export function sortByPrecedence(
  elements: Array<{ type: string }>,
): Array<{ type: string }> {
  return [...elements].sort((a, b) => {
    const aPriority = PARSING_PRECEDENCE[a.type as keyof typeof PARSING_PRECEDENCE]?.priority ?? 0;
    const bPriority = PARSING_PRECEDENCE[b.type as keyof typeof PARSING_PRECEDENCE]?.priority ?? 0;
    return bPriority - aPriority; // Higher priority first
  });
}

/**
 * Check if a character is escapable
 */
export function isEscapable(char: string): boolean {
  return ESCAPABLE_CHARS.includes(char);
}

/**
 * Check if a string represents a horizontal rule
 */
export function isHorizontalRule(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.length >= 3 &&
    (trimmed === '-'.repeat(trimmed.length) ||
      trimmed === '*'.repeat(trimmed.length) ||
      trimmed === '_'.repeat(trimmed.length)) &&
    !/[^-]/.test(trimmed) ||
    !/[^*]/.test(trimmed) ||
    !/[^_]/.test(trimmed)
  );
}

/**
 * Check if a line appears to be indented code (4 spaces or tab)
 */
export function isIndentedCode(line: string): boolean {
  return line.startsWith('    ') || line.startsWith('\t');
}

/**
 * Check if a line starts a fenced code block
 */
export function isFencedCodeStart(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('```') || trimmed.startsWith('~~~');
}

/**
 * Extract fence type and metadata from fence marker
 */
export function parseFenceMarker(line: string): { fence: string; language: string; meta: string } {
  const match = line.match(/^(`{3,}|~{3,})([^\s`~]*)(.*)$/);
  return {
    fence: match?.[1] ?? '```',
    language: match?.[2] ?? '',
    meta: match?.[3] ?? '',
  };
}

/**
 * Check if line closes a fenced code block
 */
export function isFenceEnd(line: string, openFence: string): boolean {
  const trimmed = line.trim();
  const fenceChar = openFence[0];
  const fenceLength = openFence.length;
  return (
    trimmed.startsWith(fenceChar.repeat(fenceLength)) &&
    [...trimmed.slice(fenceLength)].every((c: string) => c === fenceChar)
  );
}
