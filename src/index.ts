/**
 * mdParserCF - Main Entry Point
 *
 * Exports the Parser class and related utilities for markdown parsing
 */

export { Parser } from './parser/parser';
export { HTMLRenderer } from './renderer/html-renderer';
export { escapeHtml, unescapeHtml, sanitizeHtml, stripHtmlTags, getTextContent } from './renderer/escaper';

export type {
  Document,
  BlockNode,
  InlineNode,
  Paragraph,
  Heading,
  HorizontalRule,
  BlockQuote,
  UnorderedList,
  OrderedList,
  ListItem,
  CodeBlock,
  FencedCodeBlock,
  Table,
  TableRow,
  TableCell,
  Text,
  Emphasis,
  Strong,
  Code,
  Link,
  Image,
  Strikethrough,
  ParserOptions,
  RendererOptions,
  HTMLOutput,
} from './parser/ast-types';

/**
 * Parse markdown and render to HTML
 */
export async function parseAndRender(markdown: string): Promise<string> {
  const { Parser } = await import('./parser/parser');
  const { HTMLRenderer } = await import('./renderer/html-renderer');
  const parser = new Parser({ debugAST: false });
  const ast = parser.parse(markdown);
  const renderer = new HTMLRenderer();
  const output = renderer.render(ast);
  return output.html;
}

/**
 * Parse markdown to AST only
 */
export async function parseToAST(markdown: string) {
  const { Parser } = await import('./parser/parser');
  const parser = new Parser({ debugAST: false });
  return parser.parse(markdown);
}

/**
 * Convenient wrapper for one-off rendering
 */
export async function mdToHtml(markdown: string, options?: { debug?: boolean }): Promise<string> {
  const { Parser } = await import('./parser/parser');
  const { HTMLRenderer } = await import('./renderer/html-renderer');
  const parser = new Parser({ debugAST: options?.debug || false });
  const ast = parser.parse(markdown);
  const renderer = new HTMLRenderer();
  return renderer.render(ast).html;
}
