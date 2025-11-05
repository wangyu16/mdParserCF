/**
 * HTML Renderer
 *
 * Converts AST nodes to HTML output
 * Uses KaTeX for server-side math rendering
 */

import * as katex from 'katex';

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
  FootnoteReference,
  RendererOptions,
  HTMLOutput,
} from '../parser/ast-types';

import { escapeHtml } from './escaper';

/**
 * HTML Renderer - converts AST to HTML
 */
export class HTMLRenderer {
  constructor(_options: RendererOptions = {}) {
    // Options reserved for future use (syntax highlighting, sanitization, etc.)
  }

  /**
   * Render document to HTML
   */
  public render(ast: Document): HTMLOutput {
    const html = this.renderDocument(ast);
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
    return `<h${heading.level}>${content}</h${heading.level}>\n`;
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
    const items = list.children.map((item) => this.renderListItem(item)).join('');
    return `<ul>\n${items}</ul>\n`;
  }

  /**
   * Render ordered list
   */
  private renderOrderedList(list: OrderedList): string {
    const startAttr = list.start && list.start !== 1 ? ` start="${list.start}"` : '';
    const items = list.children.map((item) => this.renderListItem(item)).join('');
    return `<ol${startAttr}>\n${items}</ol>\n`;
  }

  /**
   * Render list item
   */
  private renderListItem(item: ListItem): string {
    const content = item.children.map((block) => this.renderBlock(block)).join('');
    return `<li>${content}</li>\n`;
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
   * Render HTML block (pass-through)
   */
  private renderHTMLBlock(block: HTMLBlock): string {
    return block.content + '\n';
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
      case 'html-inline':
        return (node as HTMLInline).value;
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
      const content = footnote.children.map((block: BlockNode) => this.renderBlock(block)).join('');
      html += `<li id="fn-${escapeHtml(footnote.label)}"><p>${content}</p></li>\n`;
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
      return katex.renderToString(node.content, {
        throwOnError: false,
        trust: true,
      });
    } catch (error) {
      // Fallback to escaped text if KaTeX rendering fails
      return `<span class="math-error" title="Math rendering failed">${escapeHtml(node.content)}</span>`;
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
        displayMode: true,
        throwOnError: false,
        trust: true,
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
}

