/**
 * HTML Renderer
 *
 * Converts AST nodes to HTML output
 * Uses KaTeX for server-side math rendering
 */

import * as katex from 'katex';
// Import mhchem extension for chemistry formulas
import 'katex/dist/contrib/mhchem.mjs';

import {
  Document,
  BlockNode,
  InlineNode,
  Paragraph,
  Heading,
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
  StrongEmphasis,
  Code,
  Link,
  Image,
  Strikethrough,
  Underline,
  Highlight,
  Superscript,
  Subscript,
  HTMLInline,
  HTMLBlock,
  HTMLComment,
  HTMLCommentBlock,
  FootnoteReference,
  RendererOptions,
  HTMLOutput,
} from '../parser/ast-types';

import { escapeHtml } from './escaper';

/**
 * KaTeX options for math rendering
 */
const KATEX_OPTIONS = {
  throwOnError: false,
  trust: true,
};

/**
 * Heading info collected for TOC generation
 */
interface HeadingInfo {
  level: number;
  text: string;
  id: string;
}

/**
 * HTML Renderer - converts AST to HTML
 */
export class HTMLRenderer {
  private headings: HeadingInfo[] = [];
  private headingIdCounter: Map<string, number> = new Map();

  constructor(_options: RendererOptions = {}) {
    // Options reserved for future use (syntax highlighting, sanitization, etc.)
  }

  /**
   * Render document to HTML
   */
  public render(ast: Document): HTMLOutput {
    // Reset headings collection for new render
    this.headings = [];
    this.headingIdCounter = new Map();

    let html = this.renderDocument(ast);

    // Process TOC placeholders after all headings are collected
    html = this.processTocPlaceholders(html);

    return {
      html,
    };
  }

  /**
   * Render document node
   */
  private renderDocument(doc: Document): string {
    const blocksHtml = doc.children.map((block) => this.renderBlock(block)).join('');
    const footnotesHtml = doc.footnotes ? this.renderFootnotes(doc.footnotes) : '';
    return blocksHtml + footnotesHtml;
  }

  /**
   * Render block-level element
   */
  private renderBlock(block: BlockNode): string {
    switch (block.type) {
      case 'paragraph':
        return this.renderParagraph(block as Paragraph);
      case 'heading':
        return this.renderHeading(block as Heading);
      case 'horizontal-rule':
        return '<hr />\n';
      case 'blockquote':
        return this.renderBlockQuote(block as BlockQuote);
      case 'unordered-list':
        return this.renderUnorderedList(block as UnorderedList);
      case 'ordered-list':
        return this.renderOrderedList(block as OrderedList);
      case 'code-block':
        return this.renderCodeBlock(block as CodeBlock);
      case 'fenced-code-block':
        return this.renderFencedCodeBlock(block as FencedCodeBlock);
      case 'table':
        return this.renderTable(block as Table);
      case 'html-block':
        return this.renderHTMLBlock(block as HTMLBlock);
      case 'html-comment-block':
        return this.renderHTMLCommentBlock(block as any);
      case 'math-block':
        return this.renderMathBlock(block as any);
      case 'custom-container':
        return this.renderCustomContainer(block as any);
      default:
        return '';
    }
  }

  /**
   * Render paragraph
   */
  private renderParagraph(para: Paragraph): string {
    const content = para.children.map((child) => this.renderInline(child)).join('');
    return `<p>${content}</p>\n`;
  }

  /**
   * Render heading
   */
  private renderHeading(heading: Heading): string {
    const content = heading.children.map((child) => this.renderInline(child)).join('');

    // Extract plain text for ID generation
    const plainText = this.getPlainTextFromInline(heading.children);
    const id = this.generateHeadingId(plainText);

    // Collect heading info for TOC
    this.headings.push({
      level: heading.level,
      text: plainText,
      id,
    });

    return `<h${heading.level} id="${escapeHtml(id)}">${content}</h${heading.level}>\n`;
  }

  /**
   * Render blockquote
   */
  private renderBlockQuote(quote: BlockQuote): string {
    const content = quote.children.map((block) => this.renderBlock(block)).join('');
    return `<blockquote>\n${content}</blockquote>\n`;
  }

  /**
   * Render unordered list
   */
  private renderUnorderedList(list: UnorderedList): string {
    // Check if this list contains any task items (checkboxes)
    const hasTaskItems = list.children.some((item) => item.checkbox !== undefined);
    const taskListClass = hasTaskItems ? ' class="task-list"' : '';
    const items = list.children.map((item) => this.renderListItem(item)).join('');
    return `<ul${taskListClass}>\n${items}</ul>\n`;
  }

  /**
   * Render ordered list
   */
  private renderOrderedList(list: OrderedList): string {
    const startAttr = list.start && list.start !== 1 ? ` start="${list.start}"` : '';
    // Check if this list contains any task items (checkboxes)
    const hasTaskItems = list.children.some((item) => item.checkbox !== undefined);
    const taskListClass = hasTaskItems ? ' class="task-list"' : '';
    const items = list.children.map((item) => this.renderListItem(item)).join('');
    return `<ol${startAttr}${taskListClass}>\n${items}</ol>\n`;
  }

  /**
   * Render list item
   */
  private renderListItem(item: ListItem): string {
    let content = item.children.map((block) => this.renderBlock(block)).join('');

    // Build CSS classes
    const classes: string[] = [];
    if (item.depth !== undefined) {
      classes.push(`depth-${item.depth}`);
    }
    if (item.checkbox !== undefined) {
      classes.push('task-list-item');
    }
    const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';

    // Add checkbox if present
    if (item.checkbox !== undefined) {
      const checked = item.checkbox === 'checked' ? ' checked' : '';
      const checkbox = `<input type="checkbox" disabled${checked}> `;
      // Insert checkbox at the beginning of the content
      // If content starts with a paragraph, insert inside the paragraph
      if (content.startsWith('<p>')) {
        content = content.replace('<p>', `<p>${checkbox}`);
      } else {
        content = checkbox + content;
      }
    }

    return `<li${classAttr}>${content}</li>\n`;
  }

  /**
   * Render indented code block
   */
  private renderCodeBlock(block: CodeBlock): string {
    const escaped = escapeHtml(block.content);
    return `<pre><code>${escaped}</code></pre>\n`;
  }

  /**
   * Render fenced code block
   */
  private renderFencedCodeBlock(block: FencedCodeBlock): string {
    const escaped = escapeHtml(block.content);
    const langClass = block.language ? ` class="language-${escapeHtml(block.language)}"` : '';
    return `<pre><code${langClass}>${escaped}</code></pre>\n`;
  }

  /**
   * Render table
   */
  private renderTable(table: Table): string {
    let html = '<table>\n';

    // Separate header and body rows
    const headerRows = table.children.filter((row) => (row as TableRow).isHeader);
    const bodyRows = table.children.filter((row) => !(row as TableRow).isHeader);

    if (headerRows.length > 0) {
      html += '<thead>\n';
      html += headerRows.map((row) => this.renderTableRow(row as TableRow, 'th')).join('');
      html += '</thead>\n';
    }

    if (bodyRows.length > 0) {
      html += '<tbody>\n';
      html += bodyRows.map((row) => this.renderTableRow(row as TableRow, 'td')).join('');
      html += '</tbody>\n';
    }

    html += '</table>\n';
    return html;
  }

  /**
   * Render table row
   */
  private renderTableRow(row: TableRow, cellType: 'th' | 'td'): string {
    const cells = (row.children as TableCell[])
      .map((cell) => this.renderTableCell(cell, cellType))
      .join('');
    return `<tr>\n${cells}</tr>\n`;
  }

  /**
   * Render table cell
   */
  private renderTableCell(cell: TableCell, cellType: 'th' | 'td'): string {
    const alignAttr = cell.align ? ` style="text-align:${cell.align}"` : '';
    const content = cell.children.map((child) => this.renderInline(child)).join('');
    return `<${cellType}${alignAttr}>${content}</${cellType}>\n`;
  }

  /**
   * Render HTML block with either raw content or parsed markdown content
   */
  private renderHTMLBlock(block: HTMLBlock): string {
    // Raw HTML content (from plugins)
    if (block.content) {
      return block.content + '\n';
    }

    // Parsed HTML with markdown content inside
    if (block.tag && block.children) {
      const attrs = block.attributes || {};
      let attrString = '';
      for (const [key, value] of Object.entries(attrs)) {
        attrString += ` ${key}="${escapeHtml(value)}"`;
      }

      const content = block.children.map((child) => this.renderBlock(child)).join('');
      return `<${block.tag}${attrString}>\n${content}</${block.tag}>\n`;
    }

    return '';
  }

  /**
   * Render HTML comment block
   * Outputs the comment as-is without modification
   */
  private renderHTMLCommentBlock(block: any): string {
    return `<!--${block.content}-->\n`;
  }

  /**
   * Render inline element
   */
  private renderInline(node: InlineNode): string {
    switch (node.type) {
      case 'text':
        return escapeHtml((node as Text).value);
      case 'soft-line-break':
        return ' ';
      case 'hard-line-break':
        return '<br />\n';
      case 'emphasis':
        return this.renderEmphasis(node as Emphasis);
      case 'strong':
        return this.renderStrong(node as Strong);
      case 'strong-emphasis':
        return this.renderStrongEmphasis(node as StrongEmphasis);
      case 'code':
        return this.renderCode(node as Code);
      case 'link':
        return this.renderLink(node as Link);
      case 'image':
        return this.renderImage(node as Image);
      case 'strikethrough':
        return this.renderStrikethrough(node as Strikethrough);
      case 'underline':
        return this.renderUnderline(node as Underline);
      case 'highlight':
        return this.renderHighlight(node as Highlight);
      case 'superscript':
        return this.renderSuperscript(node as Superscript);
      case 'subscript':
        return this.renderSubscript(node as Subscript);
      case 'inline-math':
        return this.renderInlineMath(node as any);
      case 'inline-block-math':
        return this.renderInlineBlockMath(node as any);
      case 'html-inline':
        return this.renderHTMLInline(node as HTMLInline);
      case 'html-comment':
        return this.renderHTMLComment(node as any);
      case 'footnote-reference':
        return this.renderFootnoteReference(node as FootnoteReference);
      case 'custom-span':
        return this.renderCustomSpan(node as any);
      default:
        return '';
    }
  }

  /**
   * Render emphasis (italic)
   */
  private renderEmphasis(node: Emphasis): string {
    const content = node.children.map((child) => this.renderInline(child)).join('');
    return `<em>${content}</em>`;
  }

  /**
   * Render strong (bold)
   */
  private renderStrong(node: Strong): string {
    const content = node.children.map((child) => this.renderInline(child)).join('');
    return `<strong>${content}</strong>`;
  }

  /**
   * Render strong emphasis
   */
  private renderStrongEmphasis(node: StrongEmphasis): string {
    const content = node.children.map((child) => this.renderInline(child)).join('');
    return `<strong><em>${content}</em></strong>`;
  }

  /**
   * Render code span
   */
  private renderCode(node: Code): string {
    return `<code>${escapeHtml(node.value)}</code>`;
  }

  /**
   * Render link
   */
  private renderLink(node: Link): string {
    const content = node.children.map((child) => this.renderInline(child)).join('');
    const url = escapeHtml(node.url);
    const title = node.title ? ` title="${escapeHtml(node.title)}"` : '';
    return `<a href="${url}"${title}>${content}</a>`;
  }

  /**
   * Render image
   */
  private renderImage(node: Image): string {
    const src = escapeHtml(node.url);
    const alt = escapeHtml(node.alt);
    const title = node.title ? ` title="${escapeHtml(node.title)}"` : '';

    // Build custom attributes string
    let customAttrs = '';
    if (node.attributes) {
      for (const [key, value] of Object.entries(node.attributes)) {
        customAttrs += ` ${key}="${escapeHtml(value)}"`;
      }
    }

    return `<img src="${src}" alt="${alt}"${title}${customAttrs} />`;
  }

  /**
   * Render strikethrough
   */
  private renderStrikethrough(node: Strikethrough): string {
    const content = node.children.map((child) => this.renderInline(child)).join('');
    return `<del>${content}</del>`;
  }

  /**
   * Render underline
   */
  private renderUnderline(node: Underline): string {
    const content = node.children.map((child) => this.renderInline(child)).join('');
    return `<u>${content}</u>`;
  }

  /**
   * Render highlight
   */
  private renderHighlight(node: Highlight): string {
    const content = node.children.map((child) => this.renderInline(child)).join('');
    return `<mark>${content}</mark>`;
  }

  /**
   * Render superscript
   */
  private renderSuperscript(node: Superscript): string {
    const content = node.children.map((child) => this.renderInline(child)).join('');
    return `<sup>${content}</sup>`;
  }

  /**
   * Render subscript
   */
  private renderSubscript(node: Subscript): string {
    const content = node.children.map((child) => this.renderInline(child)).join('');
    return `<sub>${content}</sub>`;
  }

  /**
   * Render footnote reference
   */
  private renderFootnoteReference(node: FootnoteReference): string {
    const label = escapeHtml(node.label);
    return `<sup><a href="#fn-${label}" id="ref-${label}">[${label}]</a></sup>`;
  }

  /**
   * Render footnotes section
   */
  private renderFootnotes(footnotes: Array<any>): string {
    if (footnotes.length === 0) return '';

    let html = '<section class="footnotes">\n<ol>\n';
    for (const footnote of footnotes) {
      // Render footnote content without wrapping in extra <p> tags
      // Footnotes can contain multiple blocks, so render them directly
      const content = footnote.children.map((block: BlockNode) => this.renderBlock(block)).join('');
      html += `<li id="fn-${escapeHtml(footnote.label)}">${content}</li>\n`;
    }
    html += '</ol>\n</section>\n';
    return html;
  }

  /**
   * Render inline math
   * Wrapped in $ delimiters, rendered using KaTeX server-side
   * Supports mhchem for chemical formulas: $\ce{H2O}$
   */
  private renderInlineMath(node: any): string {
    try {
      return katex.renderToString(node.content, KATEX_OPTIONS);
    } catch (error) {
      // Fallback to escaped text if KaTeX rendering fails
      return `<span class="math-error" title="Math rendering failed">${escapeHtml(node.content)}</span>`;
    }
  }

  /**
   * Render inline block math ($$...$$ appearing inline within text)
   * Rendered as block-level display math even though it appears inline in source
   * This breaks out of the paragraph flow to display as a centered equation
   */
  private renderInlineBlockMath(node: any): string {
    try {
      const html = katex.renderToString(node.content, {
        ...KATEX_OPTIONS,
        displayMode: true,
      });
      // Use </p><div>...<div><p> pattern to break out of paragraph
      // The empty <p></p> tags will be cleaned up by the browser
      return `</p>\n<div class="math-block">\n${html}\n</div>\n<p>`;
    } catch (error) {
      return `</p>\n<div class="math-block-error"><pre>${escapeHtml(node.content)}</pre></div>\n<p>`;
    }
  }

  /**
   * Render block-level math
   * Wrapped in $$ delimiters, rendered using KaTeX server-side in display mode
   * Supports mhchem for chemical reactions: $$\ce{CO2 + C -> 2CO}$$
   */
  private renderMathBlock(node: any): string {
    try {
      const html = katex.renderToString(node.content, {
        ...KATEX_OPTIONS,
        displayMode: true,
      });
      return `<div class="math-block">\n${html}\n</div>\n`;
    } catch (error) {
      // Fallback to code block if KaTeX rendering fails
      return `<div class="math-block-error"><pre>${escapeHtml(node.content)}</pre></div>\n`;
    }
  }

  /**
   * Render custom inline span
   */
  private renderCustomSpan(node: any): string {
    const content = node.children.map((child: InlineNode) => this.renderInline(child)).join('');
    return `<span class="${escapeHtml(node.className)}">${content}</span>`;
  }

  /**
   * Render custom container block
   */
  private renderCustomContainer(node: any): string {
    const content = node.children.map((block: BlockNode) => this.renderBlock(block)).join('');
    return `<section class="${escapeHtml(node.className)}">\n${content}</section>\n`;
  }

  /**
   * Render HTML inline element
   */
  private renderHTMLInline(node: HTMLInline): string {
    if (node.value) {
      // Raw HTML from plugins
      return node.value;
    }

    if (node.tag) {
      // Parsed HTML with markdown content
      const attrs = node.attributes || {};
      let attrString = '';
      for (const [key, value] of Object.entries(attrs)) {
        attrString += ` ${key}="${escapeHtml(value)}"`;
      }

      if (node.selfClosing) {
        return `<${node.tag}${attrString} />`;
      }

      const content = node.children
        ? node.children.map((child) => this.renderInline(child)).join('')
        : '';
      return `<${node.tag}${attrString}>${content}</${node.tag}>`;
    }

    return '';
  }

  /**
   * Render inline HTML comment
   * Outputs the comment as-is without modification
   */
  private renderHTMLComment(node: any): string {
    return `<!--${node.content}-->`;
  }

  /**
   * Extract plain text from inline nodes (for heading ID generation)
   */
  private getPlainTextFromInline(nodes: InlineNode[]): string {
    return nodes
      .map((node) => {
        switch (node.type) {
          case 'text':
            return (node as Text).value;
          case 'code':
            return (node as Code).value;
          case 'emphasis':
          case 'strong':
          case 'strong-emphasis':
          case 'strikethrough':
          case 'underline':
          case 'highlight':
          case 'superscript':
          case 'subscript':
            return this.getPlainTextFromInline((node as any).children || []);
          case 'link':
            return this.getPlainTextFromInline((node as Link).children || []);
          case 'image':
            return (node as Image).alt || '';
          default:
            return '';
        }
      })
      .join('');
  }

  /**
   * Generate a URL-friendly heading ID from text
   */
  private generateHeadingId(text: string): string {
    // Convert to lowercase and replace spaces with hyphens
    let id = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    // Handle empty IDs
    if (!id) {
      id = 'heading';
    }

    // Handle duplicate IDs by appending a counter
    const count = this.headingIdCounter.get(id) || 0;
    this.headingIdCounter.set(id, count + 1);

    if (count > 0) {
      id = `${id}-${count}`;
    }

    return id;
  }

  /**
   * Process TOC placeholders and replace with generated table of contents
   */
  private processTocPlaceholders(html: string): string {
    const tocRegex =
      /<nav id="[^"]*" class="toc-placeholder" data-toc-min="(\d)" data-toc-max="(\d)"><\/nav>/g;

    return html.replace(tocRegex, (_match, minStr, maxStr) => {
      const minLevel = parseInt(minStr, 10);
      const maxLevel = parseInt(maxStr, 10);

      return this.generateToc(minLevel, maxLevel);
    });
  }

  /**
   * Generate table of contents HTML from collected headings
   */
  private generateToc(minLevel: number, maxLevel: number): string {
    // Filter headings within the specified level range
    const filteredHeadings = this.headings.filter(
      (h) => h.level >= minLevel && h.level <= maxLevel
    );

    if (filteredHeadings.length === 0) {
      return '<nav class="toc"><p><em>No headings found</em></p></nav>\n';
    }

    let html = '<nav class="toc">\n';
    html += '<ul class="toc-list">\n';

    // Track nesting levels
    let currentLevel = minLevel;

    for (const heading of filteredHeadings) {
      const level = heading.level;

      // Handle nesting
      while (currentLevel < level) {
        html += '<ul>\n';
        currentLevel++;
      }
      while (currentLevel > level) {
        html += '</ul>\n</li>\n';
        currentLevel--;
      }

      html += `<li class="toc-item toc-level-${level}"><a href="#${escapeHtml(heading.id)}">${escapeHtml(heading.text)}</a>\n`;
    }

    // Close remaining lists
    while (currentLevel > minLevel) {
      html += '</ul>\n</li>\n';
      currentLevel--;
    }
    html += '</li>\n';

    html += '</ul>\n';
    html += '</nav>\n';

    return html;
  }
}
