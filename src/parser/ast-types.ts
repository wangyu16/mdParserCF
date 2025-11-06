/**
 * AST Type Definitions for Markdown Parser
 *
 * This file defines all Abstract Syntax Tree (AST) node types that represent
 * the structure of a markdown document after parsing.
 *
 * The AST is an intermediate representation that allows:
 * - Multiple rendering backends (HTML, PDF, etc.)
 * - Easy debugging and inspection
 * - Clear separation between parsing and rendering
 */

/**
 * Base node type - all AST nodes extend from this
 */
export interface ASTNode {
  type: string;
  children?: ASTNode[];
}

/**
 * Root document node - represents the entire markdown document
 */
export interface Document extends ASTNode {
  type: 'document';
  children: BlockNode[];
  footnotes?: FootnoteDefinition[];
}

/**
 * Union type for all block-level elements
 * Block elements are typically separated by blank lines and form the top-level structure
 */
export type BlockNode =
  | Paragraph
  | Heading
  | HorizontalRule
  | BlockQuote
  | UnorderedList
  | OrderedList
  | CodeBlock
  | FencedCodeBlock
  | Table
  | CustomContainer
  | HTMLBlock
  | MathBlock;

/**
 * Union type for all inline elements
 * Inline elements appear within block elements and can be styled or formatted
 */
export type InlineNode =
  | Text
  | SoftLineBreak
  | HardLineBreak
  | Emphasis
  | Strong
  | StrongEmphasis
  | Code
  | Link
  | Image
  | Strikethrough
  | Underline
  | Highlight
  | Superscript
  | Subscript
  | CustomSpan
  | HTMLInline
  | FootnoteReference
  | InlineMath;

// ========================================
// BLOCK-LEVEL NODES
// ========================================

/**
 * Paragraph - a block of text
 */
export interface Paragraph extends ASTNode {
  type: 'paragraph';
  children: InlineNode[];
}

/**
 * Heading - h1 to h6
 */
export interface Heading extends ASTNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
}

/**
 * Horizontal Rule - divider line
 */
export interface HorizontalRule extends ASTNode {
  type: 'horizontal-rule';
  children?: undefined;
}

/**
 * Blockquote - quoted text, can be nested
 */
export interface BlockQuote extends ASTNode {
  type: 'blockquote';
  level: number; // 1 for >, 2 for >>, etc.
  children: BlockNode[];
}

/**
 * Unordered List - bullet points
 */
export interface UnorderedList extends ASTNode {
  type: 'unordered-list';
  children: ListItem[];
}

/**
 * Ordered List - numbered items
 */
export interface OrderedList extends ASTNode {
  type: 'ordered-list';
  start?: number; // Starting number (default 1)
  children: ListItem[];
}

/**
 * List Item - individual item in a list
 */
export interface ListItem extends ASTNode {
  type: 'list-item';
  children: BlockNode[];
  depth?: number; // Nesting depth: 0 for top-level, 1 for nested, 2 for doubly nested, etc.
}

/**
 * Indented Code Block - 4 spaces or 1 tab indentation
 */
export interface CodeBlock extends ASTNode {
  type: 'code-block';
  content: string;
  language?: undefined;
}

/**
 * Fenced Code Block - delimited by ``` or ~~~
 */
export interface FencedCodeBlock extends ASTNode {
  type: 'fenced-code-block';
  content: string;
  language?: string; // e.g., 'js', 'python', 'typescript'
  meta?: string; // Additional metadata after language
}

/**
 * Table - grid of cells with optional alignment
 */
export interface Table extends ASTNode {
  type: 'table';
  children: TableRow[];
}

/**
 * Table Row - row within a table
 */
export interface TableRow extends ASTNode {
  type: 'table-row';
  children: TableCell[];
  isHeader?: boolean;
}

/**
 * Table Cell - individual cell in a table
 */
export interface TableCell extends ASTNode {
  type: 'table-cell';
  align?: 'left' | 'center' | 'right';
  children: InlineNode[];
}

/**
 * Custom Container - block-level ::classname[content]::
 * Renders as <div class="classname">content</div>
 */
export interface CustomContainer extends ASTNode {
  type: 'custom-container';
  className: string;
  children: BlockNode[];
}

/**
 * HTML Block - HTML block with either raw content or parsed markdown content inside
 */
export interface HTMLBlock extends ASTNode {
  type: 'html-block';
  // For raw HTML content (from plugins)
  content?: string;
  // For parsed HTML with markdown inside
  tag?: string;
  attributes?: Record<string, string>;
  children?: BlockNode[];
}

// ========================================
// INLINE-LEVEL NODES
// ========================================

/**
 * Plain text - unformatted text content
 */
export interface Text extends ASTNode {
  type: 'text';
  value: string;
  children?: undefined;
}

/**
 * Soft Line Break - newline treated as space
 */
export interface SoftLineBreak extends ASTNode {
  type: 'soft-line-break';
  children?: undefined;
}

/**
 * Hard Line Break - newline treated as <br>
 */
export interface HardLineBreak extends ASTNode {
  type: 'hard-line-break';
  children?: undefined;
}

/**
 * Emphasis - italic text (*text* or _text_)
 */
export interface Emphasis extends ASTNode {
  type: 'emphasis';
  children: InlineNode[];
}

/**
 * Strong - bold text (**text** or __text__)
 */
export interface Strong extends ASTNode {
  type: 'strong';
  children: InlineNode[];
}

/**
 * Strong Emphasis - bold and italic (***text*** or ___text___)
 */
export interface StrongEmphasis extends ASTNode {
  type: 'strong-emphasis';
  children: InlineNode[];
}

/**
 * Code Span - inline code (`code`)
 */
export interface Code extends ASTNode {
  type: 'code';
  value: string;
  children?: undefined;
}

/**
 * Link - hyperlink [text](url "title")
 */
export interface Link extends ASTNode {
  type: 'link';
  url: string;
  title?: string;
  children: InlineNode[];
}

/**
 * Image - image reference ![alt](url "title")
 */
export interface Image extends ASTNode {
  type: 'image';
  url: string;
  alt: string;
  title?: string;
  attributes?: Record<string, string>;
  children?: undefined;
}

/**
 * Strikethrough - crossed-out text (~~text~~)
 */
export interface Strikethrough extends ASTNode {
  type: 'strikethrough';
  children: InlineNode[];
}

/**
 * Underline - underlined text (++text++)
 */
export interface Underline extends ASTNode {
  type: 'underline';
  children: InlineNode[];
}

/**
 * Highlight - highlighted text (==text==)
 */
export interface Highlight extends ASTNode {
  type: 'highlight';
  children: InlineNode[];
}

/**
 * Superscript - raised text (^text^)
 */
export interface Superscript extends ASTNode {
  type: 'superscript';
  children: InlineNode[];
}

/**
 * Subscript - lowered text (~text~)
 */
export interface Subscript extends ASTNode {
  type: 'subscript';
  children: InlineNode[];
}

/**
 * Custom Span - inline ::classname[content]::
 * Renders as <span class="classname">content</span>
 */
export interface CustomSpan extends ASTNode {
  type: 'custom-span';
  className: string;
  children: InlineNode[];
}

/**
 * HTML Inline - raw inline HTML
 */
export interface HTMLInline extends ASTNode {
  type: 'html-inline';
  value?: string;
  tag?: string;
  attributes?: Record<string, string>;
  children?: InlineNode[];
  selfClosing?: boolean;
}

/**
 * Footnote Reference - reference to a footnote [^1]
 */
export interface FootnoteReference extends ASTNode {
  type: 'footnote-reference';
  label: string;
  children?: undefined;
}

/**
 * Footnote Definition - definition of a footnote [^1]: content
 */
export interface FootnoteDefinition extends ASTNode {
  type: 'footnote-definition';
  label: string;
  children: BlockNode[];
}

/**
 * Math Block - block-level math $$formula$$
 */
export interface MathBlock extends ASTNode {
  type: 'math-block';
  content: string;
  children?: undefined;
}

/**
 * Inline Math - inline math $formula$
 */
export interface InlineMath extends ASTNode {
  type: 'inline-math';
  content: string;
  children?: undefined;
}

// ========================================
// PARSER CONTEXT & OPTIONS
// ========================================

/**
 * Protected region marker - used during pre-processing to protect
 * special content from markdown interpretation
 */
export interface ProtectedRegion {
  /** Type of protected content */
  type: 'escaped' | 'code' | 'plugin' | 'math';
  /** Starting position in original text */
  start: number;
  /** Ending position in original text */
  end: number;
  /** Placeholder string used in processed text */
  placeholder: string;
  /** Original content that was protected */
  originalContent: string;
}

/**
 * Result of pre-processing inline text
 * Pre-processing protects special regions from markdown parsing
 */
export interface PreprocessedText {
  /** Text with protected regions replaced by placeholders */
  processed: string;
  /** Map of placeholder strings to their original content */
  protections: Map<string, { content: string; type: ProtectedRegion['type'] }>;
}

/**
 * Parser options to customize behavior
 */
export interface ParserOptions {
  /** Enable debug output with AST inspection */
  debugAST?: boolean;

  /** Enable math formula parsing */
  enableMath?: boolean;

  /** Enable custom containers */
  enableCustomContainers?: boolean;

  /** Enable footnotes */
  enableFootnotes?: boolean;

  /** Enable HTML parsing */
  enableHtml?: boolean;

  /** Enable plugins */
  enablePlugins?: boolean;

  /** Custom plugin registry */
  plugins?: Record<string, PluginHandler>;

  /** Maximum nesting depth */
  maxNestingDepth?: number;

  /** Internal: Current list nesting depth (used for recursive parsing) */
  _currentListDepth?: number;
}

/**
 * Plugin handler function type
 */
export type PluginHandler = (input: string) => string;

/**
 * Tokenizer result - intermediate representation before AST
 */
export interface Token {
  type: string;
  value?: string;
  depth?: number;
  language?: string;
  meta?: string;
  children?: Token[];
}

/**
 * Parser state for tracking parsing progress
 */
export interface ParserState {
  lines: string[];
  position: number;
  ast: Document;
  footnotes: Map<string, FootnoteDefinition>;
  linkReferences: Map<string, { url: string; title?: string }>;
  options: ParserOptions;
}

/**
 * Renderer options
 */
export interface RendererOptions {
  /** Enable syntax highlighting for code blocks */
  highlightCode?: boolean;

  /** Base URL for relative links/images */
  baseUrl?: string;

  /** Custom class names for elements */
  classNames?: Record<string, string>;

  /** Enable HTML sanitization */
  sanitizeHtml?: boolean;
}

/**
 * HTML Output - result of rendering
 */
export interface HTMLOutput {
  html: string;
  footnotes?: string;
  metadata?: Record<string, any>;
}
