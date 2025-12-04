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
  HTMLBlock,
  HTMLCommentBlock,
  MathBlock,
  ParserOptions,
  ParserState,
  PreprocessedText,
  ProtectedRegion,
} from './ast-types';
import { PluginRegistry, createDefaultPluginRegistry } from './plugin-system';

/**
 * Main Parser class
 *
 * Converts markdown text into an AST (Abstract Syntax Tree)
 */
export class Parser {
  private options: ParserOptions;
  private currentLinkReferences: Map<string, { url: string; title?: string }> = new Map();
  private pluginRegistry: PluginRegistry;

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

    // Initialize plugin registry with built-in plugins
    this.pluginRegistry = createDefaultPluginRegistry();
  }

  /**
   * Preprocess HTML to strip global HTML elements
   * Removes <!DOCTYPE>, <html>, </html>, <head>...</head>, <body>, </body>
   * while preserving content inside body.
   *
   * IMPORTANT: Protects code blocks (fenced and indented) and inline code
   * so that these tags can still be shown as code examples.
   */
  private preprocessGlobalHtml(markdown: string): string {
    // Step 1: Protect code regions before stripping global HTML
    const protectedRegions: { placeholder: string; content: string }[] = [];
    let placeholderCounter = 0;
    let result = markdown;

    // Protect fenced code blocks (``` or ~~~)
    result = result.replace(/^(```|~~~)([^\n]*)\n([\s\S]*?)\n\1\s*$/gm, (match) => {
      const placeholder = `\u0000CODEBLOCK${placeholderCounter++}\u0000`;
      protectedRegions.push({ placeholder, content: match });
      return placeholder;
    });

    // Protect inline code spans (backticks)
    result = result.replace(/`([^`\n]+)`/g, (match) => {
      const placeholder = `\u0000INLINECODE${placeholderCounter++}\u0000`;
      protectedRegions.push({ placeholder, content: match });
      return placeholder;
    });

    // Protect indented code blocks (4 spaces or 1 tab at start of line)
    // This is trickier - we need to find consecutive lines that are all indented
    const lines = result.split('\n');
    const processedLines: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      // Check if line starts with 4 spaces or a tab (indented code block)
      if (/^(    |\t)/.test(line)) {
        // Collect all consecutive indented lines
        const indentedLines: string[] = [line];
        let j = i + 1;
        while (j < lines.length && (/^(    |\t)/.test(lines[j]) || lines[j].trim() === '')) {
          indentedLines.push(lines[j]);
          j++;
        }
        // Only protect if there's actual content (not just empty lines)
        if (indentedLines.some((l) => /^(    |\t)/.test(l))) {
          const content = indentedLines.join('\n');
          const placeholder = `\u0000INDENTCODE${placeholderCounter++}\u0000`;
          protectedRegions.push({ placeholder, content });
          processedLines.push(placeholder);
          i = j;
          continue;
        }
      }
      processedLines.push(line);
      i++;
    }
    result = processedLines.join('\n');

    // Step 2: Now strip global HTML elements from unprotected content
    // Remove <!DOCTYPE ...> (case-insensitive)
    result = result.replace(/<!doctype[^>]*>/gi, '');

    // Remove <html> and </html> tags (case-insensitive)
    result = result.replace(/<\/?html[^>]*>/gi, '');

    // Remove entire <head>...</head> section including content (case-insensitive, multiline)
    result = result.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');

    // Remove <body> and </body> tags but preserve content between them (case-insensitive)
    result = result.replace(/<\/?body[^>]*>/gi, '');

    // Step 3: Restore protected regions
    for (const { placeholder, content } of protectedRegions) {
      result = result.replace(placeholder, content);
    }

    return result;
  }

  /**
   * Parse markdown string into AST
   */
  public parse(markdown: string): Document {
    // Reset link references for new parse
    this.currentLinkReferences = new Map();

    // Preprocess to strip global HTML elements
    const preprocessedMarkdown = this.preprocessGlobalHtml(markdown);

    const lines = preprocessedMarkdown.split('\n');
    const state: ParserState = {
      lines,
      position: 0,
      ast: { type: 'document', children: [] },
      footnotes: new Map(),
      linkReferences: this.currentLinkReferences,
      options: this.options,
    };

    // Pre-pass: collect link reference definitions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match [label]: url or [label]: url "title" or [label]: url 'title'
      const match = line.match(/^\[([^\]]+)\]:\s+(.+?)(?:\s+["']([^"']*)["'])?\s*$/);
      if (match) {
        const label = match[1].toLowerCase();
        const url = match[2].trim();
        const title = match[3];
        this.currentLinkReferences.set(label, { url, title });
      }
    }

    // First pass: collect block-level elements
    while (state.position < lines.length) {
      console.log(
        `Main parse loop: position ${state.position}, line: '${state.lines[state.position]}'`
      );
      const block = this.parseBlock(state);
      console.log(`parseBlock returned: ${block ? block.type : 'null'}`);
      if (block) {
        state.ast.children.push(block);
        console.log(
          `Added ${block.type} to AST, children now: ${state.ast.children.map((c) => c.type)}`
        );
      }
      state.position++;
      console.log(`Incremented position to ${state.position}`);
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

    // Check for math block (block-level math with $$)
    if (this.options.enableMath && line.trim().startsWith('$$')) {
      const mathBlock = this.parseMathBlock(state);
      if (mathBlock) {
        return mathBlock;
      }
    }

    // Check for block plugins {{plugin ...}}
    if (this.options.enablePlugins && line.trim().startsWith('{{')) {
      const blockPlugin = this.parseBlockPlugin(state);
      if (blockPlugin) {
        return blockPlugin;
      }
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
      const currentDepth = this.options._currentListDepth || 0;
      return this.parseList(state, currentDepth);
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

    // Check for link reference definition [label]: url
    if (line.match(/^\[([^\]]+)\]:\s+/)) {
      const linkRef = this.parseLinkReferenceDefinition(state);
      if (linkRef) {
        return null; // Link references are collected, not rendered as blocks
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

    // Check for HTML comment block <!-- ... -->
    if (trimmed.startsWith('<!--')) {
      const commentBlock = this.parseHTMLCommentBlock(state);
      if (commentBlock) {
        return commentBlock;
      }
    }

    // Check for HTML block <tag>content</tag>
    if (trimmed.startsWith('<') && trimmed.includes('>')) {
      const htmlBlock = this.parseHTMLBlock(state);
      if (htmlBlock) {
        return htmlBlock;
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
        const unindented = line.startsWith('    ')
          ? line.slice(4)
          : line.startsWith('\t')
            ? line.slice(1)
            : line;
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
   * Parse math block ($$...$$)
   * Block-level math is delimited by $$ on separate lines
   */
  private parseMathBlock(state: ParserState): MathBlock | null {
    const line = state.lines[state.position];

    if (!line.trim().startsWith('$$')) {
      return null;
    }

    // Check for single-line block math: $$equation$$
    const singleLineMatch = line.trim().match(/^\$\$(.+?)\$\$$/);
    if (singleLineMatch) {
      return {
        type: 'math-block',
        content: singleLineMatch[1].trim(),
      };
    }

    // Multi-line block math: $$ on separate lines
    const lines: string[] = [];
    let currentLine = state.position + 1;
    let foundClosing = false;

    // Find closing $$
    while (currentLine < state.lines.length) {
      const currentLineStr = state.lines[currentLine];

      if (currentLineStr.trim().startsWith('$$')) {
        foundClosing = true;
        state.position = currentLine;
        break;
      }

      lines.push(currentLineStr);
      currentLine++;
    }

    if (!foundClosing) {
      // If no closing delimiter, treat as paragraph
      return null;
    }

    return {
      type: 'math-block',
      content: lines.join('\n').trim(),
    };
  }

  /**
   * Parse block-level plugin {{plugin ...}}
   */
  private parseBlockPlugin(state: ParserState): HTMLBlock | null {
    const line = state.lines[state.position];

    if (!line.trim().startsWith('{{')) {
      return null;
    }

    const lines: string[] = [line];
    let currentLine = state.position + 1;
    let foundClosing = line.includes('}}');

    // Find closing }} if not on same line
    if (!foundClosing) {
      while (currentLine < state.lines.length) {
        const currentLineStr = state.lines[currentLine];
        lines.push(currentLineStr);

        if (currentLineStr.includes('}}')) {
          foundClosing = true;
          state.position = currentLine;
          break;
        }

        currentLine++;
      }
    }

    if (!foundClosing) {
      // If no closing delimiter, not a valid plugin
      return null;
    }

    const pluginText = lines.join('\n');

    // Try each block plugin
    for (const plugin of this.pluginRegistry.getBlockPlugins()) {
      plugin.pattern.lastIndex = 0; // Reset regex
      if (plugin.pattern.test(pluginText)) {
        const result = plugin.handler(pluginText);
        if (result.type === 'rendered' && result.content) {
          return result.content as HTMLBlock;
        }
      }
    }

    // No plugin matched
    return null;
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
    // Join lines with hard line break marker (two spaces + newline)
    // This ensures each > line becomes a separate line in output
    const blockquoteContent = lines.join('  \n');
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
  private parseList(state: ParserState, depth: number = 0): UnorderedList | OrderedList | null {
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
        // Parse this list item, collecting all its content including nested lists
        const itemResult = this.parseListItem(state, currentLine, isOrdered, depth);
        if (itemResult) {
          children.push(itemResult.item);
          currentLine = itemResult.nextLine;
        } else {
          break;
        }
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
   * Parse a single list item, collecting all its content and nested lists
   */
  private parseListItem(
    state: ParserState,
    startLine: number,
    isOrdered: boolean,
    depth: number = 0
  ): { item: ListItem; nextLine: number } | null {
    const startLineStr = state.lines[startLine];
    const itemMatch = isOrdered
      ? startLineStr.match(/^(\d+)\.\s+(.*)$/)
      : startLineStr.match(/^([-+*])\s+(.*)$/);

    if (!itemMatch) {
      return null;
    }

    const baseIndent = startLineStr.length - startLineStr.trimStart().length;
    let firstLineContent = itemMatch[itemMatch.length - 1];

    // Calculate the content indent (where text starts after the marker)
    // For "1. Text", marker is "1. " (3 chars), for "- Text", marker is "- " (2 chars)
    const markerLength = itemMatch[0].length - firstLineContent.length;
    const contentIndent = baseIndent + markerLength;

    // Check for checkbox syntax at the beginning of the content: [ ], [x], or [X]
    let checkbox: 'checked' | 'unchecked' | undefined;
    const checkboxMatch = firstLineContent.match(/^\[([ xX])\]\s*/);
    if (checkboxMatch) {
      const checkboxChar = checkboxMatch[1];
      checkbox = checkboxChar === ' ' ? 'unchecked' : 'checked';
      // Remove the checkbox syntax from the content
      firstLineContent = firstLineContent.slice(checkboxMatch[0].length);
    }

    const itemBlocks: BlockNode[] = [];

    // Parse the first line content as inline elements wrapped in a paragraph
    if (firstLineContent.trim()) {
      itemBlocks.push({
        type: 'paragraph',
        children: this.parseInline(firstLineContent),
      });
    }

    let currentLine = startLine + 1;
    let continueParsing = true;

    while (currentLine < state.lines.length && continueParsing) {
      const currentLineStr = state.lines[currentLine];

      if (currentLineStr.trim() === '') {
        // Look ahead to see if a blank line should terminate the list
        // A blank line followed by non-indented, non-list content should end the list
        let nextNonBlankLine = currentLine + 1;
        while (
          nextNonBlankLine < state.lines.length &&
          state.lines[nextNonBlankLine].trim() === ''
        ) {
          nextNonBlankLine++;
        }

        if (nextNonBlankLine < state.lines.length) {
          const nextLine = state.lines[nextNonBlankLine];
          const nextIndent = nextLine.length - nextLine.trimStart().length;
          const nextItemMatch = isOrdered
            ? nextLine.match(/^(\d+)\.\s+/)
            : nextLine.match(/^([-+*])\s+/);

          // If the next non-blank line is at base indentation and doesn't start a list item,
          // the blank line should terminate this list item
          if (nextIndent <= baseIndent && nextLine.trim() !== '' && !nextItemMatch) {
            break;
          }
        }

        // Empty lines can continue list items but create paragraph breaks
        // Mark that we encountered a blank line so the next text creates a new paragraph
        currentLine++;

        // If the next line has content, we'll need a new paragraph
        // Look for the next non-blank line
        if (nextNonBlankLine < state.lines.length) {
          const nextLine = state.lines[nextNonBlankLine];
          const nextIndent = nextLine.length - nextLine.trimStart().length;
          // If it's indented content (not a list item), force a new paragraph
          if (nextIndent > baseIndent && !nextLine.match(/^(\s*)([-+*]|\d+\.)\s+/)) {
            // Add a paragraph break marker by clearing the "last paragraph" state
            // We do this by adding an empty placeholder that will trigger new paragraph creation
            itemBlocks.push({
              type: 'paragraph',
              children: [],
            });
          }
        }
        continue;
      }

      const currentIndent = currentLineStr.length - currentLineStr.trimStart().length;

      // If we encounter a line with less indentation than the base, stop
      if (currentIndent < baseIndent && this.startsBlock(currentLineStr.trim())) {
        break;
      }

      // Check if this line starts a new list item at the same level
      const nextItemMatch = isOrdered
        ? currentLineStr.match(/^(\d+)\.\s+/)
        : currentLineStr.match(/^([-+*])\s+/);

      if (nextItemMatch && currentIndent <= baseIndent) {
        // This is the start of the next list item, stop here
        break;
      }

      // If we encounter a non-empty line at base indentation that doesn't start a list item,
      // this should terminate the list (blank line followed by paragraph)
      if (currentIndent <= baseIndent && currentLineStr.trim() !== '' && !nextItemMatch) {
        // This is content that should break the list
        break;
      }

      // Check if this line starts a nested list (greater indentation)
      const nestedListMatch = currentLineStr.match(/^(\s*)([-+*]|\d+\.)\s+/);
      if (nestedListMatch && currentIndent > baseIndent) {
        // This is a nested list, collect all lines at this indentation level and parse as markdown
        const nestedLines = [currentLineStr]; // Start with current line
        let nestedLineIndex = currentLine + 1;

        // Collect all lines that belong to this nested list (same or greater indentation)
        while (nestedLineIndex < state.lines.length) {
          const nextNestedLine = state.lines[nestedLineIndex];
          const nextNestedIndent = nextNestedLine.length - nextNestedLine.trimStart().length;

          // Stop if we encounter a line with less indentation than the current nested list
          if (nextNestedIndent < currentIndent) {
            break;
          }

          nestedLines.push(nextNestedLine);
          nestedLineIndex++;
        }

        // Parse the nested content as a complete markdown document
        // First, strip the common indentation from all lines
        const minIndent = Math.min(
          ...nestedLines.map((line) => {
            const match = line.match(/^(\s*)/);
            return match ? match[1].length : 0;
          })
        );

        const strippedLines = nestedLines.map((line) => line.slice(minIndent));
        const nestedContent = strippedLines.join('\n');
        // Create nested parser with incremented depth
        const nestedOptions = { ...this.options, _currentListDepth: depth + 1 };
        const nestedParser = new Parser(nestedOptions);
        const nestedDoc = nestedParser.parse(nestedContent);

        // Add all parsed blocks to the current list item
        itemBlocks.push(...nestedDoc.children);

        currentLine = nestedLineIndex;
        continue;
      }

      // Check if this line starts a block element that can be nested in lists
      if (this.startsBlock(currentLineStr.trim())) {
        // Check if this is a block type that should break out of the list
        const trimmed = currentLineStr.trim();
        if (
          trimmed.match(/^(#{1,6})\s/) || // Heading
          trimmed.match(/^\[\^([^\]]+)\]:/) || // Footnote definition
          trimmed.match(/^\[([^\]]+)\]:\s+/) || // Link reference
          trimmed === '---' ||
          trimmed === '***' ||
          trimmed === '___' // Horizontal rule
        ) {
          // This is a block that should break the list, so stop parsing the list item
          break;
        }

        // Allow these block elements inside lists:
        // - Fenced code blocks (``` or ~~~)
        // - Blockquotes (>)
        // - Custom containers (:::)
        // - HTML blocks

        // Parse this as a nested block element
        // We need to remove the list item indentation from the lines so that
        // parseFencedCodeBlock and other block parsers can recognize them
        const dedentedLines = state.lines.map((line, idx) => {
          if (idx < currentLine) return line; // Don't modify lines before this
          const lineIndent = line.length - line.trimStart().length;
          if (lineIndent >= contentIndent) {
            return line.slice(contentIndent);
          } else if (lineIndent >= baseIndent) {
            return line.slice(baseIndent);
          }
          return line;
        });

        const tempState: ParserState = {
          lines: dedentedLines,
          position: currentLine,
          ast: { type: 'document', children: [] },
          footnotes: state.footnotes,
          linkReferences: state.linkReferences,
          options: state.options,
        };

        const block = this.parseBlock(tempState);
        if (block) {
          itemBlocks.push(block);
          currentLine = tempState.position + 1;
          continue;
        }
      } // Otherwise, treat as continuation of the current paragraph
      // Strip the content indent (alignment with first line text)
      let trimmedContent: string;

      if (currentIndent >= contentIndent) {
        // Properly indented continuation - remove the content indent
        trimmedContent = currentLineStr.slice(contentIndent);
      } else if (currentIndent > baseIndent) {
        // Partially indented - remove what we can
        trimmedContent = currentLineStr.slice(currentIndent);
      } else {
        // Not indented enough - just trim
        trimmedContent = currentLineStr.trim();
      }

      if (trimmedContent.trim()) {
        // If we have a previous paragraph, add to it; otherwise create a new one
        const lastBlock = itemBlocks[itemBlocks.length - 1];

        // Check if the last block is an empty paragraph (paragraph break marker)
        if (lastBlock && lastBlock.type === 'paragraph' && lastBlock.children.length === 0) {
          // Remove the empty marker and create a new paragraph
          itemBlocks.pop();
          itemBlocks.push({
            type: 'paragraph',
            children: this.parseInline(trimmedContent),
          });
        } else if (lastBlock && lastBlock.type === 'paragraph') {
          // Add a soft line break and the new content
          (lastBlock as Paragraph).children.push(
            { type: 'soft-line-break' },
            ...this.parseInline(trimmedContent)
          );
        } else {
          // Create a new paragraph
          itemBlocks.push({
            type: 'paragraph',
            children: this.parseInline(trimmedContent),
          });
        }
      }

      currentLine++;
    }

    return {
      item: {
        type: 'list-item',
        children: itemBlocks,
        depth,
        ...(checkbox !== undefined && { checkbox }),
      },
      nextLine: currentLine,
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

    return (
      cells.length > 0 &&
      cells.every((cell) => {
        const trimmed = cell.trim();
        // Each cell should contain only dashes, colons, and spaces
        return /^:?-+:?$/.test(trimmed);
      })
    );
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
        contentLines.push(''); // Preserve blank lines for paragraph separation
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
    // For security, disable HTML parsing in footnote content
    const fullContent = contentLines.join('\n');
    const footnoteOptions = { ...this.options, enableHtml: false };
    const contentParser = new Parser(footnoteOptions);
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
   * Parse link reference definition [label]: url "title"
   */
  private parseLinkReferenceDefinition(state: ParserState): boolean {
    const line = state.lines[state.position];
    // Match [label]: url or [label]: url "title" or [label]: url 'title'
    const match = line.match(/^\[([^\]]+)\]:\s+(.+?)(?:\s+["']([^"']*)["'])?\s*$/);

    if (!match) {
      return false;
    }

    const label = match[1].toLowerCase(); // Reference labels are case-insensitive
    const url = match[2].trim();
    const title = match[3];

    // Store in state
    state.linkReferences.set(label, { url, title });

    return true;
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
   * Parse HTML comment block <!-- ... -->
   * Block-level HTML comments are preserved in output as-is
   */
  private parseHTMLCommentBlock(state: ParserState): HTMLCommentBlock | null {
    const line = state.lines[state.position];
    const trimmed = line.trim();

    if (!trimmed.startsWith('<!--')) {
      return null;
    }

    // Check if comment is on single line: <!-- comment -->
    const singleLineMatch = trimmed.match(/^<!--([\s\S]*?)-->$/);
    if (singleLineMatch) {
      return {
        type: 'html-comment-block',
        content: singleLineMatch[1],
      };
    }

    // Multi-line comment: collect lines until -->
    const commentLines: string[] = [trimmed.slice(4)]; // Remove opening <!--
    let currentLine = state.position + 1;
    let foundClosing = false;

    while (currentLine < state.lines.length) {
      const currentLineStr = state.lines[currentLine];

      // Check if this line contains the closing -->
      const closingIndex = currentLineStr.indexOf('-->');
      if (closingIndex !== -1) {
        // Include content before --> in this line
        commentLines.push(currentLineStr.slice(0, closingIndex));
        foundClosing = true;
        state.position = currentLine;
        break;
      }

      commentLines.push(currentLineStr);
      currentLine++;
    }

    if (!foundClosing) {
      // If no closing found, treat the opening <!-- as text (paragraph)
      return null;
    }

    return {
      type: 'html-comment-block',
      content: commentLines.join('\n'),
    };
  }

  /**
   * Parse HTML block <tag>content</tag>
   */
  private parseHTMLBlock(state: ParserState): HTMLBlock | null {
    // Skip HTML block parsing if HTML is disabled
    if (this.options.enableHtml === false) {
      return null;
    }

    const line = state.lines[state.position];

    // Match opening HTML tag: <tag> or <tag attr="value">
    const openMatch = line.match(/^<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/);
    if (!openMatch) {
      return null;
    }

    const tag = openMatch[1];
    const attrs = openMatch[2];

    // Parse attributes
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      attributes[attrMatch[1]] = attrMatch[2];
    }

    const contentLines: string[] = [];
    let currentLine = state.position + 1;
    let foundClosing = false;

    // Find matching closing tag
    while (currentLine < state.lines.length) {
      const currentLineStr = state.lines[currentLine];
      const trimmed = currentLineStr.trim();

      // Check if this line contains the closing tag
      if (trimmed === `</${tag}>`) {
        foundClosing = true;
        state.position = currentLine;
        break;
      }

      contentLines.push(currentLineStr);
      currentLine++;
    }

    if (!foundClosing) {
      // If no closing tag found, treat as paragraph
      return null;
    }

    // Parse the content inside the HTML block as markdown
    const fullContent = contentLines.join('\n');
    const contentParser = new Parser(this.options);
    const contentDoc = contentParser.parse(fullContent);
    const children = contentDoc.children;

    return {
      type: 'html-block',
      tag,
      attributes,
      children,
    };
  }

  /**
   * Parse paragraph (default block type)
   */ /**
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
   * Pre-process inline text to protect special regions from markdown parsing
   *
   * This method identifies and protects regions that should not be interpreted
   * as markdown syntax, such as:
   * - Escaped characters (\*, \_, etc.)
   * - Code spans (`code`)
   * - Inline math ($formula$)
   * - Plugin syntax ({{plugin}})
   *
   * Protected regions are replaced with unique placeholder strings and stored
   * in a map for later restoration. This ensures proper parsing order and
   * prevents conflicts between different markdown elements.
   *
   * Processing order (priority):
   * 1. Escaped characters (highest priority)
   * 2. Code spans
   * 3. Inline math
   * 4. Plugins
   *
   * @param text - The raw inline text to pre-process
   * @returns PreprocessedText object with processed string and protection map
   */
  private preprocessInlineText(text: string): PreprocessedText {
    const protections = new Map<string, { content: string; type: ProtectedRegion['type'] }>();
    let processed = text;
    let placeholderCounter = 0;

    // Priority 1: Protect escaped characters
    // Match backslash followed by any character
    const escapeMap = new Map<string, string>(); // placeholder -> char
    processed = processed.replace(/\\(.)/g, (_match, char) => {
      const placeholder = `\u0001ESC${placeholderCounter++}\u0001`;
      escapeMap.set(placeholder, char);
      protections.set(placeholder, { content: char, type: 'escaped' });
      return placeholder;
    });

    // Helper: restore escapes in a string before protecting it
    const restoreEscapesFor = (str: string): string => {
      let restored = str;
      for (const [placeholder, char] of escapeMap.entries()) {
        restored = restored.replace(placeholder, '\\' + char);
      }
      return restored;
    };

    // Priority 2: Protect code spans `...`
    // Match backtick-delimited code, avoiding empty spans
    processed = processed.replace(/`([^`]+)`/g, (match, _content) => {
      const placeholder = `\u0001CODE${placeholderCounter++}\u0001`;
      // Restore escapes in the matched content before storing
      const restoredMatch = restoreEscapesFor(match);
      protections.set(placeholder, { content: restoredMatch, type: 'code' });
      return placeholder;
    });

    // Priority 3: Protect block math $$...$$ (must be before inline math)
    // Block math with double dollar signs should be rendered as block, even inline
    if (this.options.enableMath) {
      processed = processed.replace(/\$\$([^\$]+)\$\$/g, (match, _content) => {
        const placeholder = `\u0001BLOCKMATH${placeholderCounter++}\u0001`;
        // Restore escapes in the matched content before storing
        const restoredMatch = restoreEscapesFor(match);
        protections.set(placeholder, { content: restoredMatch, type: 'block-math' });
        return placeholder;
      });
    }

    // Priority 4: Protect inline math $...$
    // Only if math is enabled, match dollar-delimited formulas (no newlines)
    if (this.options.enableMath) {
      processed = processed.replace(/\$([^\$\n]+)\$/g, (match, _content) => {
        const placeholder = `\u0001MATH${placeholderCounter++}\u0001`;
        // Restore escapes in the matched content before storing
        const restoredMatch = restoreEscapesFor(match);
        protections.set(placeholder, { content: restoredMatch, type: 'math' });
        return placeholder;
      });
    }

    // Priority 5: Protect plugins {{...}}
    // Only if plugins are enabled, match double-brace syntax
    if (this.options.enablePlugins) {
      processed = processed.replace(/\{\{[^}]+\}\}/g, (match) => {
        const placeholder = `\u0001PLUGIN${placeholderCounter++}\u0001`;
        // Restore escapes in the matched content before storing
        const restoredMatch = restoreEscapesFor(match);
        protections.set(placeholder, { content: restoredMatch, type: 'plugin' });
        return placeholder;
      });
    }

    return { processed, protections };
  }

  /**
   * Restore protected content in a string before recursive parsing
   * @param text - Text that may contain placeholders
   * @param protections - Map of placeholders to original content
   * @param preserveEscapes - If true, restore escaped chars with backslashes (for code, etc.)
   * @returns Text with placeholders restored to original content
   */
  private restoreProtections(
    text: string,
    protections: Map<string, { content: string; type: ProtectedRegion['type'] }>,
    preserveEscapes: boolean = false
  ): string {
    let restored = text;
    for (const [placeholder, protection] of protections.entries()) {
      // For recursive parsing, we want to restore the ORIGINAL content
      // so it can be properly parsed in the nested context
      if (protection.type === 'escaped') {
        if (preserveEscapes) {
          // Restore WITH backslash (for code spans, etc.)
          restored = restored.replace(placeholder, '\\' + protection.content);
        } else {
          // Restore without backslash for normal parsing
          restored = restored.replace(placeholder, '\\' + protection.content);
        }
      } else {
        // Restore code, math, and plugins as-is
        restored = restored.replace(placeholder, protection.content);
      }
    }
    return restored;
  }

  /**
   * Parse inline elements within text
   * @param text - The text to parse
   * @param skipPreprocessing - If true, skip the preprocessing step (used for recursive calls)
   */
  private parseInline(
    text: string,
    skipPreprocessing: boolean = false,
    parentContext?: string
  ): InlineNode[] {
    // Pre-process text to protect special regions (only for top-level calls)
    let processed: string;
    let protections: Map<string, { content: string; type: ProtectedRegion['type'] }>;

    if (skipPreprocessing) {
      processed = text;
      protections = new Map();
    } else {
      const result = this.preprocessInlineText(text);
      processed = result.processed;
      protections = result.protections;
    }

    const nodes: InlineNode[] = [];
    let i = 0;

    while (i < processed.length) {
      // Check for protection placeholders
      if (processed[i] === '\u0001') {
        const placeholderMatch = processed.slice(i).match(/^\u0001(\w+)\u0001/);
        if (placeholderMatch) {
          const placeholder = placeholderMatch[0];
          const protection = protections.get(placeholder);

          if (protection) {
            // Restore protected content based on type
            if (protection.type === 'escaped') {
              // Escaped character - add as plain text
              nodes.push({
                type: 'text',
                value: protection.content,
              });
            } else if (protection.type === 'code') {
              // Code span - content already has escapes restored
              const codeContent = protection.content.slice(1, -1); // Remove backticks
              nodes.push({
                type: 'code',
                value: codeContent,
              });
            } else if (protection.type === 'block-math') {
              // Block math inline - content already has escapes restored
              const mathContent = protection.content.slice(2, -2); // Remove $$
              nodes.push({
                type: 'inline-block-math',
                content: mathContent,
              });
            } else if (protection.type === 'math') {
              // Inline math - content already has escapes restored
              const mathContent = protection.content.slice(1, -1); // Remove $
              nodes.push({
                type: 'inline-math',
                content: mathContent,
              });
            } else if (protection.type === 'plugin') {
              // Plugin - process with plugin system
              const pluginText = protection.content;
              let matched = false;

              // First try inline plugins (inline/inline)
              for (const plugin of this.pluginRegistry.getInlinePlugins()) {
                plugin.pattern.lastIndex = 0;
                if (plugin.pattern.test(pluginText)) {
                  const result = plugin.handler(pluginText);
                  if (result.type === 'rendered' && result.content) {
                    nodes.push(result.content as InlineNode);
                    matched = true;
                    break;
                  }
                }
              }

              // If not matched, try block plugins (inline/block) that can appear inline
              if (!matched) {
                for (const plugin of this.pluginRegistry.getBlockPlugins()) {
                  // Only process plugins with inline inputType
                  if (plugin.inputType === 'inline') {
                    plugin.pattern.lastIndex = 0;
                    if (plugin.pattern.test(pluginText)) {
                      const result = plugin.handler(pluginText);
                      if (result.type === 'rendered' && result.content) {
                        const content = result.content as any;
                        // If plugin returns block content, convert to inline HTML
                        if (content.type === 'html-block') {
                          nodes.push({
                            type: 'html-inline',
                            value: content.content,
                          } as InlineNode);
                        } else {
                          nodes.push(content as InlineNode);
                        }
                        matched = true;
                        break;
                      }
                    }
                  }
                }
              }

              // If plugin didn't match, add as text
              if (!matched) {
                nodes.push({
                  type: 'text',
                  value: pluginText,
                });
              }
            }

            i += placeholder.length;
            continue;
          }
        }
      }

      // NOTE: Escaped character, code span, inline math, and plugin handling
      // have been moved to pre-processing above. The following blocks are
      // now redundant and can be removed in a future cleanup.

      // Check for hard line break marker (null character + newline)
      if (processed[i] === '\u0000' && processed[i + 1] === '\n') {
        nodes.push({
          type: 'hard-line-break',
        });
        i += 2;
        continue;
      }

      // Check for soft line break (newline without marker = just space)
      if (processed[i] === '\n') {
        nodes.push({
          type: 'soft-line-break',
        });
        i += 1;
        continue;
      }

      // Check for code span - NOW HANDLED IN PRE-PROCESSING
      // Kept for backward compatibility if pre-processing is disabled
      if (processed[i] === '`') {
        const codeMatch = processed.slice(i).match(/^`([^`]+)`/);
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
      if (processed[i] === '*' || processed[i] === '_') {
        const char = processed[i];

        if (processed[i + 1] === char) {
          if (processed[i + 2] === char) {
            // Triple = bold+italic ***text***
            // Skip if we're already inside strong-emphasis
            if (parentContext === 'strong-emphasis') {
              // Treat *** as literal text, don't parse as formatting
              // Fall through to add as text at the end of the loop
            } else {
              const closingIndex = processed.indexOf(char + char + char, i + 3);
              if (closingIndex !== -1) {
                const content = processed.slice(i + 3, closingIndex);
                const restoredContent = this.restoreProtections(content, protections);
                nodes.push({
                  type: 'strong-emphasis',
                  children: this.parseInline(restoredContent, true, 'strong-emphasis'),
                });
                i = closingIndex + 3;
                continue;
              }
            }
          } else {
            // Double = bold **text**
            // Skip if we're already inside bold
            if (parentContext === 'strong') {
              // Treat ** as literal text, don't parse as formatting
              // Fall through to add as text at the end of the loop
            } else {
              const closingIndex = processed.indexOf(char + char, i + 2);
              if (closingIndex !== -1) {
                const content = processed.slice(i + 2, closingIndex);
                const restoredContent = this.restoreProtections(content, protections);
                nodes.push({
                  type: 'strong',
                  children: this.parseInline(restoredContent, true, 'strong'),
                });
                i = closingIndex + 2;
                continue;
              }
            }
          }
        } else {
          // Single = italic *text*
          // Skip if we're already inside italic
          if (parentContext === 'emphasis') {
            // Treat * as literal text, don't parse as formatting
            // Fall through to add as text at the end of the loop
          } else {
            const closingIndex = processed.indexOf(char, i + 1);
            if (closingIndex !== -1) {
              const content = processed.slice(i + 1, closingIndex);
              const restoredContent = this.restoreProtections(content, protections);
              nodes.push({
                type: 'emphasis',
                children: this.parseInline(restoredContent, true, 'emphasis'),
              });
              i = closingIndex + 1;
              continue;
            }
          }
        }
      }

      // Check for links [text](url "title") or reference-style [text][ref] or [text][]
      if (processed[i] === '[') {
        // First check for clickable image with optional attributes:
        // [![alt](imgUrl)](linkUrl) or [![alt](imgUrl "imgTitle")](linkUrl "linkTitle")
        // Also supports: [![alt](imgUrl)<!-- attrs -->](linkUrl)
        const clickableImageMatch = processed
          .slice(i)
          .match(
            /^\[!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)(<!--\s*(.*?)\s*-->)?\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/
          );
        if (clickableImageMatch) {
          const imgAlt = clickableImageMatch[1];
          const imgUrl = clickableImageMatch[2];
          const imgTitle = clickableImageMatch[3];
          // clickableImageMatch[4] is the full comment match (<!-- ... -->)
          const attributesStr = clickableImageMatch[5]; // content inside comment
          const linkUrl = clickableImageMatch[6];
          const linkTitle = clickableImageMatch[7];

          // Create an image node inside a link node
          const imageNode: any = {
            type: 'image',
            url: imgUrl,
            alt: imgAlt,
            title: imgTitle,
          };

          // Parse attributes from HTML comment if present
          if (attributesStr) {
            const attributes: Record<string, string> = {};
            const attrRegex = /([\w-]+)=['"]([^'"]*)['"]/g;
            let match;
            while ((match = attrRegex.exec(attributesStr)) !== null) {
              attributes[match[1]] = match[2];
            }
            if (Object.keys(attributes).length > 0) {
              imageNode.attributes = attributes;
            }
          }

          nodes.push({
            type: 'link',
            url: linkUrl,
            title: linkTitle,
            children: [imageNode],
          });
          i += clickableImageMatch[0].length;
          continue;
        }

        // Check for reference-style clickable image: [![alt](imgUrl)][ref] or [![alt](imgUrl)][]
        // Also supports: [![alt](imgUrl)<!-- attrs -->][ref]
        const refClickableImageMatch = processed
          .slice(i)
          .match(
            /^\[!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)(<!--\s*(.*?)\s*-->)?\](?:\[\]|\[([^\]]+)\])/
          );
        if (refClickableImageMatch) {
          const imgAlt = refClickableImageMatch[1];
          const imgUrl = refClickableImageMatch[2];
          const imgTitle = refClickableImageMatch[3];
          const attributesStr = refClickableImageMatch[5]; // content inside comment
          const refName = refClickableImageMatch[6]; // reference name, may be undefined for []

          // For [![alt](imgUrl)][], use the image alt text as reference
          // For [![alt](imgUrl)][ref], use the provided ref
          const ref = refName || imgAlt;
          const refLabel = ref.toLowerCase();

          const linkRef = this.currentLinkReferences.get(refLabel);
          if (linkRef) {
            // Create an image node inside a link node
            const imageNode: any = {
              type: 'image',
              url: imgUrl,
              alt: imgAlt,
              title: imgTitle,
            };

            // Parse attributes from HTML comment if present
            if (attributesStr) {
              const attributes: Record<string, string> = {};
              const attrRegex = /([\w-]+)=['"]([^'"]*)['"]/g;
              let match;
              while ((match = attrRegex.exec(attributesStr)) !== null) {
                attributes[match[1]] = match[2];
              }
              if (Object.keys(attributes).length > 0) {
                imageNode.attributes = attributes;
              }
            }

            nodes.push({
              type: 'link',
              url: linkRef.url,
              title: linkRef.title,
              children: [imageNode],
            });
            i += refClickableImageMatch[0].length;
            continue;
          }
          // If reference not found, fall through to treat as text
        }

        // Then try inline link: [text](url "title")
        const inlineLinkMatch = processed
          .slice(i)
          .match(/^\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
        if (inlineLinkMatch) {
          const linkText = inlineLinkMatch[1];
          const restoredLinkText = this.restoreProtections(linkText, protections);
          const url = inlineLinkMatch[2];
          const title = inlineLinkMatch[3];
          nodes.push({
            type: 'link',
            url,
            title,
            children: this.parseInline(restoredLinkText, true, 'link'),
          });
          i += inlineLinkMatch[0].length;
          continue;
        }

        // Try reference-style link: [text][ref] or [text][]
        const refLinkMatch = processed.slice(i).match(/^\[([^\]]+)\](?:\[\]|\[([^\]]+)\])/);
        if (refLinkMatch) {
          const linkText = refLinkMatch[1];
          const restoredLinkText = this.restoreProtections(linkText, protections);
          const ref = refLinkMatch[2] || linkText; // Use ref if provided, else use text as ref
          const refLabel = ref.toLowerCase(); // References are case-insensitive

          const linkRef = this.currentLinkReferences.get(refLabel);
          if (linkRef) {
            nodes.push({
              type: 'link',
              url: linkRef.url,
              title: linkRef.title,
              children: this.parseInline(restoredLinkText, true, 'link'),
            });
            i += refLinkMatch[0].length;
            continue;
          }
          // If reference not found, fall through to treat as text
        }
      }

      // Check for auto-links <url> or <email@example.com>
      if (processed[i] === '<') {
        // Try URL auto-link: <http://example.com> or <https://example.com>, etc.
        const urlAutoLinkMatch = processed
          .slice(i)
          .match(/^<([a-zA-Z][a-zA-Z0-9+.\-]*:\/\/[^>]+)>/);
        if (urlAutoLinkMatch) {
          const url = urlAutoLinkMatch[1];
          nodes.push({
            type: 'link',
            url,
            children: [{ type: 'text', value: url }],
          });
          i += urlAutoLinkMatch[0].length;
          continue;
        }

        // Try email auto-link: <user@example.com>
        const emailAutoLinkMatch = processed
          .slice(i)
          .match(/^<([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)>/);
        if (emailAutoLinkMatch) {
          const email = emailAutoLinkMatch[1];
          nodes.push({
            type: 'link',
            url: `mailto:${email}`,
            children: [{ type: 'text', value: email }],
          });
          i += emailAutoLinkMatch[0].length;
          continue;
        }
      }

      // Check for images ![alt](url "title")
      if (processed[i] === '!' && processed[i + 1] === '[') {
        // Match ![alt](url) or ![alt](url "title")
        const imgMatch = processed.slice(i).match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
        if (imgMatch) {
          const alt = imgMatch[1];
          const url = imgMatch[2];
          const title = imgMatch[3];

          // Check if HTML comment immediately follows (no space)
          const remainingText = processed.slice(i + imgMatch[0].length);
          const commentMatch = remainingText.match(/^<!--\s*(.*?)\s*-->/);

          const imageNode: any = {
            type: 'image',
            url,
            alt,
            title,
          };

          if (commentMatch) {
            // Parse attributes from HTML comment
            const attributesStr = commentMatch[1];
            const attributes: Record<string, string> = {};

            // Match attribute patterns: key="value" or key='value'
            // Attribute names can contain letters, numbers, hyphens, and underscores
            const attrRegex = /([\w-]+)=['"]([^'"]*)['"]/g;
            let match;
            while ((match = attrRegex.exec(attributesStr)) !== null) {
              attributes[match[1]] = match[2];
            }

            if (Object.keys(attributes).length > 0) {
              imageNode.attributes = attributes;
              i += imgMatch[0].length + commentMatch[0].length;
            } else {
              i += imgMatch[0].length;
            }
          } else {
            i += imgMatch[0].length;
          }

          nodes.push(imageNode);
          continue;
        }
      }

      // Check for strikethrough ~~text~~
      if (processed[i] === '~' && processed[i + 1] === '~') {
        // Skip if we're already inside strikethrough
        if (parentContext === 'strikethrough') {
          // Treat ~~ as literal text, fall through
        } else {
          const closingIndex = processed.indexOf('~~', i + 2);
          if (closingIndex !== -1) {
            const content = processed.slice(i + 2, closingIndex);
            const restoredContent = this.restoreProtections(content, protections);
            nodes.push({
              type: 'strikethrough',
              children: this.parseInline(restoredContent, true, 'strikethrough'),
            });
            i = closingIndex + 2;
            continue;
          }
        }
      }

      // Check for underline ++text++
      if (processed[i] === '+' && processed[i + 1] === '+') {
        // Skip if we're already inside underline
        if (parentContext === 'underline') {
          // Treat ++ as literal text, fall through
        } else {
          const closingIndex = processed.indexOf('++', i + 2);
          if (closingIndex !== -1) {
            const content = processed.slice(i + 2, closingIndex);
            const restoredContent = this.restoreProtections(content, protections);
            nodes.push({
              type: 'underline',
              children: this.parseInline(restoredContent, true, 'underline'),
            });
            i = closingIndex + 2;
            continue;
          }
        }
      }

      // Check for highlight ==text==
      if (processed[i] === '=' && processed[i + 1] === '=') {
        // Skip if we're already inside highlight
        if (parentContext === 'highlight') {
          // Treat == as literal text, fall through
        } else {
          const closingIndex = processed.indexOf('==', i + 2);
          if (closingIndex !== -1) {
            const content = processed.slice(i + 2, closingIndex);
            const restoredContent = this.restoreProtections(content, protections);
            nodes.push({
              type: 'highlight',
              children: this.parseInline(restoredContent, true, 'highlight'),
            });
            i = closingIndex + 2;
            continue;
          }
        }
      }

      // Check for superscript ^text^
      if (processed[i] === '^') {
        // Skip if we're already inside superscript
        if (parentContext === 'superscript') {
          // Treat ^ as literal text, fall through
        } else {
          const closingIndex = processed.indexOf('^', i + 1);
          if (closingIndex !== -1) {
            const content = processed.slice(i + 1, closingIndex);
            const restoredContent = this.restoreProtections(content, protections);
            nodes.push({
              type: 'superscript',
              children: this.parseInline(restoredContent, true, 'superscript'),
            });
            i = closingIndex + 1;
            continue;
          }
        }
      }

      // Check for subscript ~text~ (single tilde, not double which is strikethrough)
      if (processed[i] === '~' && processed[i + 1] !== '~') {
        // Skip if we're already inside subscript
        if (parentContext === 'subscript') {
          // Treat ~ as literal text, fall through
        } else {
          const closingIndex = processed.indexOf('~', i + 1);
          if (closingIndex !== -1) {
            // Make sure we don't have ~~ which would be strikethrough
            if (processed[closingIndex + 1] !== '~') {
              const content = processed.slice(i + 1, closingIndex);
              const restoredContent = this.restoreProtections(content, protections);
              nodes.push({
                type: 'subscript',
                children: this.parseInline(restoredContent, true, 'subscript'),
              });
              i = closingIndex + 1;
              continue;
            }
          }
        }
      }

      // Check for custom span ::class[content]::
      if (processed[i] === ':' && processed[i + 1] === ':') {
        const spanMatch = processed.slice(i).match(/^::([a-zA-Z0-9_-]+)\[([^\]]*)\]::/);
        if (spanMatch) {
          const className = spanMatch[1];
          const content = spanMatch[2];
          const restoredContent = this.restoreProtections(content, protections);
          nodes.push({
            type: 'custom-span',
            className,
            children: this.parseInline(restoredContent, true, 'custom-span'),
          });
          i += spanMatch[0].length;
          continue;
        }
      }

      // Check for footnote reference [^1] or [^label]
      if (processed[i] === '[' && processed[i + 1] === '^') {
        const footnoteMatch = processed.slice(i).match(/^\[\^([^\]]+)\]/);
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

      // Check for HTML comments <!-- ... --> (must be before general HTML tag check)
      // Skip if this is an image attribute comment (handled in image parsing above)
      if (
        this.options.enableHtml !== false &&
        processed[i] === '<' &&
        processed.slice(i, i + 4) === '<!--'
      ) {
        // Check if this immediately follows an image (already handled)
        // Look for pattern ![alt](url)<!-- which means it's an image attribute
        const beforeComment = processed.slice(0, i);
        const isImageAttribute = /!\[[^\]]*\]\([^)]+\)$/.test(beforeComment);

        if (!isImageAttribute) {
          // Match HTML comment: <!-- ... -->
          const commentMatch = processed.slice(i).match(/^<!--([\s\S]*?)-->/);
          if (commentMatch) {
            nodes.push({
              type: 'html-comment',
              content: commentMatch[1],
            });
            i += commentMatch[0].length;
            continue;
          }
        }
      }

      // Check for HTML tags <tag>content</tag> or <tag />
      if (this.options.enableHtml !== false && processed[i] === '<') {
        // Try to match opening and closing HTML tag with content
        const htmlRegex = /^<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>(.*?)<\/([a-zA-Z][a-zA-Z0-9]*)>/;
        const match = processed.slice(i).match(htmlRegex);
        if (match && match[1] === match[4]) {
          const tag = match[1];
          const attrs = match[2];
          const content = match[3];
          const restoredContent = this.restoreProtections(content, protections);
          const fullMatch = match[0];

          // Parse attributes
          const attributes: Record<string, string> = {};
          const attrRegex = /(\w+)=["']([^"']*)["']/g;
          let attrMatch;
          while ((attrMatch = attrRegex.exec(attrs)) !== null) {
            attributes[attrMatch[1]] = attrMatch[2];
          }

          // Parse content as markdown
          const parsedContent = this.parseInline(restoredContent, true, 'html-inline');

          nodes.push({
            type: 'html-inline',
            tag,
            attributes,
            children: parsedContent,
          });
          i += fullMatch.length;
          continue;
        }

        // Try self-closing tag
        const selfClosingRegex = /^<([a-zA-Z][a-zA-Z0-9]*)([^>]*)\/>/;
        const selfMatch = processed.slice(i).match(selfClosingRegex);
        if (selfMatch) {
          const tag = selfMatch[1];
          const attrs = selfMatch[2];
          const fullMatch = selfMatch[0];

          // Parse attributes
          const attributes: Record<string, string> = {};
          const attrRegex = /(\w+)=["']([^"']*)["']/g;
          let attrMatch;
          while ((attrMatch = attrRegex.exec(attrs)) !== null) {
            attributes[attrMatch[1]] = attrMatch[2];
          }

          nodes.push({
            type: 'html-inline',
            tag,
            attributes,
            selfClosing: true,
          });
          i += fullMatch.length;
          continue;
        }
      }

      // Default: text node
      const nextSpecial = processed.slice(i + 1).search(/[\\`*_\[\]!~:+=$^\u0000<{\u0001]/);
      const textLength = nextSpecial === -1 ? processed.length - i : nextSpecial + 1;

      nodes.push({
        type: 'text',
        value: processed.slice(i, i + textLength),
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

    // Check for block math $$...$$ on its own line
    if (this.options.enableMath && line.trim().match(/^\$\$.+\$\$$/)) {
      return true;
    }

    // Check various block starts
    if (
      line.match(/^(#{1,6})\s/) || // Heading requires space after #
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
