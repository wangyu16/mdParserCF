/**
 * Markdown Parser
 *
 * Main parser class that orchestrates tokenization, parsing, and rendering
 */

import {
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
  FootnoteDefinition,
  CustomContainer,
  CustomSpan,
  ParserOptions,
  ParserState,
} from './ast-types';


/**
 * Main Parser class
 *
 * Converts markdown text into an AST (Abstract Syntax Tree)
 */
export class Parser {
  private options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = {
      debugAST: false,
      enableMath: true,
      enableCustomContainers: true,
      enableFootnotes: true,
      enablePlugins: true,
      maxNestingDepth: 10,
      ...options,
    };
  }

  /**
   * Parse markdown string into AST
   */
  public parse(markdown: string): Document {
    const lines = markdown.split('\n');
    const state: ParserState = {
      lines,
      position: 0,
      ast: { type: 'document', children: [] },
      footnotes: new Map(),
      options: this.options,
    };

    // First pass: collect block-level elements
    while (state.position < lines.length) {
      const block = this.parseBlock(state);
      if (block) {
        state.ast.children.push(block);
      }
      state.position++;
    }

    // Add collected footnotes if enabled
    if (this.options.enableFootnotes && state.footnotes.size > 0) {
      state.ast.footnotes = Array.from(state.footnotes.values());
    }

    // Debug output
    if (this.options.debugAST) {
      console.log('📊 Parsed AST:');
      console.log(JSON.stringify(state.ast, null, 2));
    }

    return state.ast;
  }

  /**
   * Parse a single block-level element
   */
  private parseBlock(state: ParserState): BlockNode | null {
    const line = state.lines[state.position];

    // Skip empty lines
    if (line.trim() === '') {
      return null;
    }

    // Try each block type in precedence order
    // Heading requires space after # (e.g., "# Title" not "#NoSpace")
    if (line.match(/^#{1,6}\s/)) {
      return this.parseHeading(state);
    }

    if (line.trim().startsWith('```') || line.trim().startsWith('~~~')) {
      return this.parseFencedCodeBlock(state);
    }

    if (line.startsWith('    ') || line.startsWith('\t')) {
      return this.parseIndentedCodeBlock(state);
    }

    if (line.startsWith('>')) {
      return this.parseBlockQuote(state);
    }

    if (line.match(/^[-+*]\s/) || line.match(/^\d+\.\s/)) {
      return this.parseList(state);
    }

    // Check for table (pipe character indicates potential table)
    if (line.includes('|')) {
      const table = this.parseTable(state);
      if (table) {
        return table;
      }
    }

    // Check for footnote definition [^label]: content
    if (line.match(/^\[\^([^\]]+)\]:/)) {
      const footnote = this.parseFootnoteDefinition(state);
      if (footnote) {
        return null; // Footnote definitions are collected, not rendered as blocks
      }
    }

    // Check for horizontal rule
    const trimmed = line.trim();
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      return { type: 'horizontal-rule' } as HorizontalRule;
    }

    // Check for custom container :::classname...:::
    if (trimmed.startsWith(':::')) {
      const container = this.parseCustomContainer(state);
      if (container) {
        return container;
      }
    }

    // Default to paragraph
    return this.parseParagraph(state);
  }

  /**
   * Parse heading (# - ###### levels)
   */
  private parseHeading(state: ParserState): Heading | null {
    const line = state.lines[state.position];
    const match = line.match(/^(#{1,6})\s+(.*)$/);

    if (!match) {
      return null;
    }

    const level = match[1].length as 1 | 2 | 3 | 4 | 5 | 6;
    const content = match[2];

    return {
      type: 'heading',
      level,
      children: this.parseInline(content),
    };
  }

  /**
   * Parse fenced code block (``` or ~~~)
   */
  private parseFencedCodeBlock(state: ParserState): FencedCodeBlock | null {
    const line = state.lines[state.position];
    const fenceMatch = line.match(/^(`{3,}|~{3,})([a-z0-9]*)?/);

    if (!fenceMatch) {
      return null;
    }

    const fence = fenceMatch[1];
    const language = fenceMatch[2] || undefined;
    const fenceChar = fence[0];
    const fenceLength = fence.length;

    const lines: string[] = [];
    let currentLine = state.position + 1;

    // Find closing fence
    while (currentLine < state.lines.length) {
      const currentLineStr = state.lines[currentLine];
      const trimmed = currentLineStr.trim();

      // Check if this line closes the fence
      if (
        trimmed.startsWith(fenceChar.repeat(fenceLength)) &&
        [...trimmed.slice(fenceLength)].every((c) => c === fenceChar)
      ) {
        state.position = currentLine; // Move position to closing fence
        break;
      }

      lines.push(currentLineStr);
      currentLine++;
    }

    return {
      type: 'fenced-code-block',
      content: lines.join('\n'),
      language,
    };
  }

  /**
   * Parse indented code block (4 spaces or 1 tab)
   */
  private parseIndentedCodeBlock(state: ParserState): CodeBlock | null {
    const lines: string[] = [];
    let currentLine = state.position;

    while (currentLine < state.lines.length) {
      const line = state.lines[currentLine];

      // Check if line is indented or empty
      if (line.startsWith('    ') || line.startsWith('\t') || line.trim() === '') {
        const unindented = line.startsWith('    ') ? line.slice(4) : line.startsWith('\t') ? line.slice(1) : line;
        lines.push(unindented);
        currentLine++;
      } else {
        break;
      }
    }

    state.position = currentLine - 1; // Move position to last processed line

    return {
      type: 'code-block',
      content: lines.join('\n').replace(/\n\s*$/, ''), // Remove trailing empty lines
    };
  }

  /**
   * Parse blockquote (> nested levels)
   */
  private parseBlockQuote(state: ParserState): BlockQuote | null {
    const line = state.lines[state.position];
    const match = line.match(/^(>+)\s+(.*)/);

    if (!match) {
      return null;
    }

    const level = match[1].length;
    const contentLine = match[2];

    const lines: string[] = [contentLine];
    let currentLine = state.position + 1;

    // Collect consecutive blockquote lines
    while (currentLine < state.lines.length) {
      const nextLine = state.lines[currentLine];

      // Continue if line is also a blockquote at same or greater depth
      if (nextLine.startsWith('>')) {
        const nextMatch = nextLine.match(/^(>+)\s+(.*)/);
        if (nextMatch) {
          lines.push(nextMatch[2]);
          currentLine++;
        } else {
          break;
        }
      } else if (nextLine.trim() === '') {
        // Allow empty lines within blockquote
        lines.push('');
        currentLine++;
      } else {
        break;
      }
    }

    state.position = currentLine - 1;

    // Parse content of blockquote recursively
    const blockquoteContent = lines.join('\n');
    const tempParser = new Parser(this.options);
    const tempAST = tempParser.parse(blockquoteContent);

    return {
      type: 'blockquote',
      level,
      children: tempAST.children,
    };
  }

  /**
   * Parse list (ordered and unordered)
   */
  private parseList(state: ParserState): UnorderedList | OrderedList | null {
    const line = state.lines[state.position];

    const unorderedMatch = line.match(/^([-+*])\s+(.*)$/);
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);

    if (!unorderedMatch && !orderedMatch) {
      return null;
    }

    const isOrdered = !!orderedMatch;
    const children: ListItem[] = [];
    let currentLine = state.position;

    while (currentLine < state.lines.length) {
      const currentLineStr = state.lines[currentLine];

      if (currentLineStr.trim() === '') {
        currentLine++;
        continue;
      }

      const itemMatch = isOrdered
        ? currentLineStr.match(/^(\d+)\.\s+(.*)$/)
        : currentLineStr.match(/^([-+*])\s+(.*)$/);

      if (itemMatch) {
        const content = itemMatch[itemMatch.length - 1];
        const item: ListItem = {
          type: 'list-item',
          children: this.parseInline(content).map((node) => ({
            type: 'paragraph',
            children: [node],
          })) as BlockNode[],
        };
        children.push(item);
        currentLine++;
      } else {
        break;
      }
    }

    state.position = currentLine - 1;

    if (isOrdered) {
      const startMatch = line.match(/^(\d+)\./);
      const start = startMatch ? parseInt(startMatch[1]) : 1;
      return {
        type: 'ordered-list',
        start,
        children,
      };
    }

    return {
      type: 'unordered-list',
      children,
    };
  }

  /**
   * Parse table (GFM syntax with pipes and separators)
   * Example:
   * | Header 1 | Header 2 |
   * | -------- | -------- |
   * | Cell 1   | Cell 2   |
   */
  private parseTable(state: ParserState): Table | null {
    const currentLine = state.lines[state.position];

    // First line must have pipes
    if (!currentLine.includes('|')) {
      return null;
    }

    // Check if next line is a separator (contains dashes and pipes)
    if (state.position + 1 >= state.lines.length) {
      return null;
    }

    const nextLine = state.lines[state.position + 1];
    const isSeparator = this.isTableSeparator(nextLine);

    if (!isSeparator) {
      return null;
    }

    // Parse header row
    const headerCells = this.parseTableRow(currentLine);
    if (!headerCells) {
      return null;
    }

    // Parse separator to determine alignment
    const alignments = this.parseTableAlignment(nextLine, headerCells.length);

    // Apply alignments to header cells
    headerCells.forEach((cell, i) => {
      if (alignments[i]) {
        cell.align = alignments[i] as 'left' | 'center' | 'right';
      }
    });

    const rows: TableRow[] = [
      {
        type: 'table-row',
        children: headerCells,
        isHeader: true,
      },
    ];

    // Parse body rows
    let currentRowIndex = state.position + 2;
    while (currentRowIndex < state.lines.length) {
      const line = state.lines[currentRowIndex];

      // Empty line ends the table
      if (line.trim() === '') {
        break;
      }

      // Line doesn't contain pipe - end table
      if (!line.includes('|')) {
        break;
      }

      const cells = this.parseTableRow(line);
      if (!cells) {
        break;
      }

      // Ensure same number of cells as header
      while (cells.length < headerCells.length) {
        cells.push({
          type: 'table-cell',
          children: [{ type: 'text', value: '' }],
        });
      }

      // Apply alignments
      cells.forEach((cell, i) => {
        if (alignments[i]) {
          cell.align = alignments[i] as 'left' | 'center' | 'right';
        }
      });

      rows.push({
        type: 'table-row',
        children: cells,
      });

      currentRowIndex++;
    }

    // Update parser state
    state.position = currentRowIndex - 1;

    return {
      type: 'table',
      children: rows,
    };
  }

  /**
   * Check if a line is a table separator (contains pipes, dashes, and optional colons)
   * Example: | --- | :-: | --: |
   */
  private isTableSeparator(line: string): boolean {
    if (!line.includes('|') || !line.includes('-')) {
      return false;
    }

    // Split by pipe and check each cell
    const cells = line.split('|').slice(1, -1); // Remove empty first and last elements
    
    return cells.length > 0 && cells.every((cell) => {
      const trimmed = cell.trim();
      // Each cell should contain only dashes, colons, and spaces
      return /^:?-+:?$/.test(trimmed);
    });
  }

  /**
   * Parse table alignment from separator line
   * Returns array of alignments: 'left' | 'center' | 'right'
   */
  private parseTableAlignment(
    line: string,
    columnCount: number
  ): (string | 'left' | 'center' | 'right' | undefined)[] {
    const alignments: (string | 'left' | 'center' | 'right' | undefined)[] = [];
    const cells = line.split('|').slice(1, -1); // Remove empty first and last

    for (let i = 0; i < columnCount; i++) {
      if (i >= cells.length) {
        alignments.push(undefined);
      } else {
        const trimmed = cells[i].trim();
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) {
          alignments.push('center');
        } else if (trimmed.endsWith(':')) {
          alignments.push('right');
        } else if (trimmed.startsWith(':')) {
          alignments.push('left');
        } else {
          alignments.push(undefined);
        }
      }
    }

    return alignments;
  }

  /**
   * Parse a table row into cells
   * Splits by pipe and parses inline content for each cell
   */
  private parseTableRow(line: string): TableCell[] | null {
    const cells: TableCell[] = [];

    // Remove leading/trailing pipes and split
    const content = line.trim();
    if (!content.startsWith('|') || !content.endsWith('|')) {
      return null;
    }

    const cellContents = content
      .slice(1, -1) // Remove leading/trailing pipes
      .split('|')
      .map((cell) => cell.trim());

    for (const cellContent of cellContents) {
      cells.push({
        type: 'table-cell',
        children: this.parseInline(cellContent),
      });
    }

    return cells;
  }

  /**
   * Parse footnote definition [^label]: content
   */
  private parseFootnoteDefinition(state: ParserState): FootnoteDefinition | null {
    const line = state.lines[state.position];
    const match = line.match(/^\[\^([^\]]+)\]:\s*(.*)/);

    if (!match) {
      return null;
    }

    const label = match[1];
    let content = match[2];
    const contentLines: string[] = [];

    if (content) {
      contentLines.push(content);
    }

    // Collect continuation lines (indented or following blank lines)
    let nextLine = state.position + 1;

    while (nextLine < state.lines.length) {
      const line = state.lines[nextLine];

      // Empty line followed by indented content continues the footnote
      if (line.trim() === '') {
        contentLines.push('');  // Preserve blank lines for paragraph separation
        nextLine++;
        continue;
      }

      // Indented content (4 spaces or tab) continues the footnote
      if (line.startsWith('    ') || line.startsWith('\t')) {
        contentLines.push(line.replace(/^    |\t/, ''));
        nextLine++;
        continue;
      }

      // Non-indented non-empty line ends the footnote
      break;
    }

    state.position = nextLine - 1;

    // Parse the footnote content as blocks
    const fullContent = contentLines.join('\n');
    const contentParser = new Parser(this.options);
    const contentDoc = contentParser.parse(fullContent);
    const children = contentDoc.children;

    const footnote: FootnoteDefinition = {
      type: 'footnote-definition',
      label,
      children,
    };

    // Store in state for later collection
    if (state.footnotes && this.options.enableFootnotes) {
      state.footnotes.set(label, footnote);
    }

    return footnote;
  }

  /**
   * Parse custom container :::classname\n...\n:::
   */
  private parseCustomContainer(state: ParserState): CustomContainer | null {
    const line = state.lines[state.position];
    const match = line.match(/^:::([a-zA-Z0-9_-]+)$/);

    if (!match) {
      return null;
    }

    const className = match[1];
    let nextLine = state.position + 1;
    const contentLines: string[] = [];

    // Collect lines until closing :::
    while (nextLine < state.lines.length) {
      const currentLine = state.lines[nextLine];

      if (currentLine.trim() === ':::') {
        break;
      }

      contentLines.push(currentLine);
      nextLine++;
    }

    // Update position to after closing :::
    state.position = nextLine;

    // Parse the container content as blocks
    const fullContent = contentLines.join('\n');
    const contentParser = new Parser(this.options);
    const contentDoc = contentParser.parse(fullContent);
    const children = contentDoc.children;

    return {
      type: 'custom-container',
      className,
      children,
    };
  }

  /**
   * Parse paragraph (default block type)
   */
  private parseParagraph(state: ParserState): Paragraph {
    const lines: string[] = [];
    let currentLine = state.position;

    while (currentLine < state.lines.length) {
      const line = state.lines[currentLine];

      if (line.trim() === '') {
        break;
      }

      // Check if next line starts a new block
      if (currentLine > state.position && this.startsBlock(line)) {
        break;
      }

      // Check for trailing spaces (2+ spaces = hard line break marker)
      // Replace 2+ trailing spaces with special marker for hard line breaks
      if (currentLine < state.lines.length - 1 && /  +$/.test(line)) {
        lines.push(line.replace(/  +$/, '\u0000')); // Use null character as marker
      } else {
        lines.push(line);
      }
      currentLine++;
    }

    state.position = currentLine - 1;

    const content = lines.join('\n');
    return {
      type: 'paragraph',
      children: this.parseInline(content),
    };
  }

  /**
   * Parse inline elements within text
   */
  private parseInline(text: string): InlineNode[] {
    const nodes: InlineNode[] = [];
    let i = 0;

    while (i < text.length) {
      // Check for escaped character
      if (text[i] === '\\' && i + 1 < text.length) {
        nodes.push({
          type: 'text',
          value: text[i + 1],
        });
        i += 2;
        continue;
      }

      // Check for hard line break marker (null character + newline)
      if (text[i] === '\u0000' && text[i + 1] === '\n') {
        nodes.push({
          type: 'hard-line-break',
        });
        i += 2;
        continue;
      }

      // Check for soft line break (newline without marker = just space)
      if (text[i] === '\n') {
        nodes.push({
          type: 'soft-line-break',
        });
        i += 1;
        continue;
      }

      // Check for code span
      if (text[i] === '`') {
        const codeMatch = text.slice(i).match(/^`([^`]+)`/);
        if (codeMatch) {
          nodes.push({
            type: 'code',
            value: codeMatch[1],
          });
          i += codeMatch[0].length;
          continue;
        }
      }

      // Check for bold/italic
      if (text[i] === '*' || text[i] === '_') {
        const char = text[i];

        if (text[i + 1] === char) {
          if (text[i + 2] === char) {
            // Triple = bold+italic ***text***
            const closingIndex = text.indexOf(char + char + char, i + 3);
            if (closingIndex !== -1) {
              const content = text.slice(i + 3, closingIndex);
              nodes.push({
                type: 'strong-emphasis',
                children: this.parseInline(content),
              });
              i = closingIndex + 3;
              continue;
            }
          } else {
            // Double = bold **text**
            const closingIndex = text.indexOf(char + char, i + 2);
            if (closingIndex !== -1) {
              const content = text.slice(i + 2, closingIndex);
              nodes.push({
                type: 'strong',
                children: this.parseInline(content),
              });
              i = closingIndex + 2;
              continue;
            }
          }
        } else {
          // Single = italic *text*
          const closingIndex = text.indexOf(char, i + 1);
          if (closingIndex !== -1) {
            const content = text.slice(i + 1, closingIndex);
            nodes.push({
              type: 'emphasis',
              children: this.parseInline(content),
            });
            i = closingIndex + 1;
            continue;
          }
        }
      }

      // Check for links [text](url "title")
      if (text[i] === '[') {
        // Match [text](url) or [text](url "title")
        const linkMatch = text.slice(i).match(/^\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
        if (linkMatch) {
          const linkText = linkMatch[1];
          const url = linkMatch[2];
          const title = linkMatch[3];
          nodes.push({
            type: 'link',
            url,
            title,
            children: this.parseInline(linkText),
          });
          i += linkMatch[0].length;
          continue;
        }
      }

      // Check for images ![alt](url "title")
      if (text[i] === '!' && text[i + 1] === '[') {
        // Match ![alt](url) or ![alt](url "title")
        const imgMatch = text.slice(i).match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
        if (imgMatch) {
          const alt = imgMatch[1];
          const url = imgMatch[2];
          const title = imgMatch[3];
          nodes.push({
            type: 'image',
            url,
            alt,
            title,
          });
          i += imgMatch[0].length;
          continue;
        }
      }

      // Check for strikethrough ~~text~~
      if (text[i] === '~' && text[i + 1] === '~') {
        const closingIndex = text.indexOf('~~', i + 2);
        if (closingIndex !== -1) {
          const content = text.slice(i + 2, closingIndex);
          nodes.push({
            type: 'strikethrough',
            children: this.parseInline(content),
          });
          i = closingIndex + 2;
          continue;
        }
      }

      // Check for custom span ::class[content]::
      if (text[i] === ':' && text[i + 1] === ':') {
        const spanMatch = text.slice(i).match(/^::([a-zA-Z0-9_-]+)\[([^\]]*)\]::/);
        if (spanMatch) {
          const className = spanMatch[1];
          const content = spanMatch[2];
          nodes.push({
            type: 'custom-span',
            className,
            children: this.parseInline(content),
          });
          i += spanMatch[0].length;
          continue;
        }
      }

      // Check for footnote reference [^1] or [^label]
      if (text[i] === '[' && text[i + 1] === '^') {
        const footnoteMatch = text.slice(i).match(/^\[\^([^\]]+)\]/);
        if (footnoteMatch) {
          const label = footnoteMatch[1];
          nodes.push({
            type: 'footnote-reference',
            label,
          });
          i += footnoteMatch[0].length;
          continue;
        }
      }

      // Default: text node
      const nextSpecial = text.slice(i + 1).search(/[\\`*_\[\]!~:\u0000]/);
      const textLength = nextSpecial === -1 ? text.length - i : nextSpecial + 1;

      nodes.push({
        type: 'text',
        value: text.slice(i, i + textLength),
      });
      i += textLength;
    }

    return nodes;
  }

  /**
   * Check if a line starts a new block element
   */
  private startsBlock(line: string): boolean {
    if (line.trim() === '') return false;

    // Check various block starts
    if (
      line.match(/^(#{1,6})\s/) ||  // Heading requires space after #
      line.startsWith('```') ||
      line.startsWith('~~~') ||
      line.startsWith('>') ||
      line.startsWith('-') ||
      line.startsWith('+') ||
      line.startsWith('*') ||
      line.startsWith('|') ||
      line.match(/^\d+\./)
    ) {
      return true;
    }

    return false;
  }
}
