/**
 * Parser Unit Tests
 *
 * Tests for the markdown parser - AST generation
 */

import { describe, it, expect } from 'vitest';
import { Parser } from '../../src/parser/parser';

describe('Parser', () => {
  const parser = new Parser();

  describe('Headings', () => {
    it('should parse h1 heading', () => {
      const ast = parser.parse('# Heading 1');
      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe('heading');
      const heading = ast.children[0] as any;
      expect(heading.level).toBe(1);
      expect(heading.children[0].type).toBe('text');
      expect(heading.children[0].value).toBe('Heading 1');
    });

    it('should parse h2-h6 headings', () => {
      for (let level = 2; level <= 6; level++) {
        const markdown = '#'.repeat(level) + ' Heading';
        const ast = parser.parse(markdown);
        expect(ast.children[0].type).toBe('heading');
        expect((ast.children[0] as any).level).toBe(level);
      }
    });

    it('should require space after hash', () => {
      const ast = parser.parse('#NoSpace');
      // Without space, should be treated as paragraph
      expect(ast.children[0].type).toBe('paragraph');
    });
  });

  describe('Paragraphs', () => {
    it('should parse simple paragraph', () => {
      const ast = parser.parse('This is a paragraph.');
      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe('paragraph');
    });

    it('should parse multiline paragraph', () => {
      const markdown = `This is a paragraph
with multiple lines.`;
      const ast = parser.parse(markdown);
      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe('paragraph');
    });

    it('should split paragraphs by blank lines', () => {
      const markdown = `First paragraph.

Second paragraph.`;
      const ast = parser.parse(markdown);
      expect(ast.children).toHaveLength(2);
      expect(ast.children[0].type).toBe('paragraph');
      expect(ast.children[1].type).toBe('paragraph');
    });
  });

  describe('Emphasis', () => {
    it('should parse italic with *', () => {
      const ast = parser.parse('This is *italic* text.');
      const para = ast.children[0] as any;
      expect(para.children.some((child: any) => child.type === 'emphasis')).toBe(true);
    });

    it('should parse italic with _', () => {
      const ast = parser.parse('This is _italic_ text.');
      const para = ast.children[0] as any;
      expect(para.children.some((child: any) => child.type === 'emphasis')).toBe(true);
    });

    it('should parse bold with **', () => {
      const ast = parser.parse('This is **bold** text.');
      const para = ast.children[0] as any;
      expect(para.children.some((child: any) => child.type === 'strong')).toBe(true);
    });

    it('should parse bold with __', () => {
      const ast = parser.parse('This is __bold__ text.');
      const para = ast.children[0] as any;
      expect(para.children.some((child: any) => child.type === 'strong')).toBe(true);
    });

    it('should parse bold and italic with ***', () => {
      const ast = parser.parse('This is ***bold and italic*** text.');
      const para = ast.children[0] as any;
      expect(para.children.some((child: any) => child.type === 'strong-emphasis')).toBe(true);
    });
  });

  describe('Strikethrough', () => {
    it('should parse strikethrough', () => {
      const ast = parser.parse('This is ~~strikethrough~~ text.');
      const para = ast.children[0] as any;
      expect(para.children.some((child: any) => child.type === 'strikethrough')).toBe(true);
    });

    it('should parse strikethrough with nested formatting', () => {
      const ast = parser.parse('This is ~~**bold strikethrough**~~ text.');
      const para = ast.children[0] as any;
      const strikethrough = para.children.find((child: any) => child.type === 'strikethrough') as any;
      expect(strikethrough).toBeDefined();
      expect(strikethrough.children.some((child: any) => child.type === 'strong')).toBe(true);
    });

    it('should parse multiple strikethrough on one line', () => {
      const ast = parser.parse('~~first~~ and ~~second~~ text.');
      const para = ast.children[0] as any;
      const strikethroughs = para.children.filter((child: any) => child.type === 'strikethrough');
      expect(strikethroughs).toHaveLength(2);
    });

    it('should not parse unclosed strikethrough', () => {
      const ast = parser.parse('This is ~~unclosed strikethrough text.');
      const para = ast.children[0] as any;
      expect(para.children.some((child: any) => child.type === 'strikethrough')).toBe(false);
    });
  });

  describe('Code', () => {
    it('should parse inline code', () => {
      const ast = parser.parse('Use `const x = 5;` for code.');
      const para = ast.children[0] as any;
      expect(para.children.some((child: any) => child.type === 'code')).toBe(true);
      const codeNode = para.children.find((child: any) => child.type === 'code') as any;
      expect(codeNode.value).toBe('const x = 5;');
    });

    it('should parse fenced code block', () => {
      const markdown = `\`\`\`javascript
const x = 5;
\`\`\``;
      const ast = parser.parse(markdown);
      expect(ast.children[0].type).toBe('fenced-code-block');
      const codeBlock = ast.children[0] as any;
      expect(codeBlock.language).toBe('javascript');
      expect(codeBlock.content.trim()).toBe('const x = 5;');
    });

    it('should parse indented code block', () => {
      const markdown = `    const x = 5;
    console.log(x);`;
      const ast = parser.parse(markdown);
      expect(ast.children[0].type).toBe('code-block');
      const codeBlock = ast.children[0] as any;
      expect(codeBlock.content).toContain('const x = 5;');
    });
  });

  describe('Links', () => {
    it('should parse inline link', () => {
      const ast = parser.parse('Check [example.com](https://example.com)');
      const para = ast.children[0] as any;
      expect(para.children.some((child: any) => child.type === 'link')).toBe(true);
      const link = para.children.find((child: any) => child.type === 'link') as any;
      expect(link.url).toBe('https://example.com');
    });

    it('should parse link with title', () => {
      const ast = parser.parse('[link](https://example.com "Title")');
      const para = ast.children[0] as any;
      const link = para.children.find((child: any) => child.type === 'link') as any;
      expect(link.title).toBe('Title');
    });
  });

  describe('Images', () => {
    it('should parse inline image', () => {
      const ast = parser.parse('![alt text](image.png)');
      const para = ast.children[0] as any;
      const img = para.children.find((child: any) => child.type === 'image') as any;
      expect(img.url).toBe('image.png');
      expect(img.alt).toBe('alt text');
    });

    it('should parse image with title', () => {
      const ast = parser.parse('![alt](image.png "Image Title")');
      const para = ast.children[0] as any;
      const img = para.children.find((child: any) => child.type === 'image') as any;
      expect(img.title).toBe('Image Title');
    });
  });

  describe('Lists', () => {
    it('should parse unordered list', () => {
      const markdown = `- Item 1
- Item 2
- Item 3`;
      const ast = parser.parse(markdown);
      expect(ast.children[0].type).toBe('unordered-list');
      const list = ast.children[0] as any;
      expect(list.children).toHaveLength(3);
    });

    it('should parse ordered list', () => {
      const markdown = `1. First
2. Second
3. Third`;
      const ast = parser.parse(markdown);
      expect(ast.children[0].type).toBe('ordered-list');
      const list = ast.children[0] as any;
      expect(list.children).toHaveLength(3);
      expect(list.start).toBe(1);
    });

    it('should handle ordered list with custom start', () => {
      const markdown = `5. Fifth
6. Sixth`;
      const ast = parser.parse(markdown);
      const list = ast.children[0] as any;
      expect(list.start).toBe(5);
    });

    it('should parse mixed list markers', () => {
      const markdown = `+ Plus item
- Minus item
* Star item`;
      const ast = parser.parse(markdown);
      expect(ast.children[0].type).toBe('unordered-list');
    });
  });

  describe('Blockquotes', () => {
    it('should parse simple blockquote', () => {
      const ast = parser.parse('> This is quoted text.');
      expect(ast.children[0].type).toBe('blockquote');
      const quote = ast.children[0] as any;
      expect(quote.level).toBe(1);
      expect(quote.children).toHaveLength(1);
    });

    it('should parse nested blockquote', () => {
      const markdown = `>> Nested quote.`;
      const ast = parser.parse(markdown);
      expect(ast.children[0].type).toBe('blockquote');
      const quote = ast.children[0] as any;
      expect(quote.level).toBe(2);
    });

    it('should parse multiline blockquote', () => {
      const markdown = `> Line 1
> Line 2
> Line 3`;
      const ast = parser.parse(markdown);
      const quote = ast.children[0] as any;
      expect(quote.children.length).toBeGreaterThan(0);
    });
  });

  describe('Horizontal Rules', () => {
    it('should parse hr with hyphens', () => {
      const ast = parser.parse('---');
      expect(ast.children[0].type).toBe('horizontal-rule');
    });

    it('should parse hr with asterisks', () => {
      const ast = parser.parse('***');
      expect(ast.children[0].type).toBe('horizontal-rule');
    });

    it('should parse hr with underscores', () => {
      const ast = parser.parse('___');
      expect(ast.children[0].type).toBe('horizontal-rule');
    });
  });

  describe('Escaping', () => {
    it('should escape special characters', () => {
      const ast = parser.parse(String.raw`\*not italic\*`);
      const para = ast.children[0] as any;
      const text = para.children.find((child: any) => child.type === 'text') as any;
      expect(text.value).toContain('*');
    });

    it('should escape brackets', () => {
      const ast = parser.parse(String.raw`\[not a link\]`);
      const para = ast.children[0] as any;
      expect(para.children.some((child: any) => child.type === 'link')).toBe(false);
    });
  });

  describe('Complex Documents', () => {
    it('should parse mixed content', () => {
      const markdown = `# Title

This is a paragraph with **bold** and *italic*.

- List item 1
- List item 2

\`\`\`js
code();
\`\`\`

> A quote`;
      const ast = parser.parse(markdown);
      expect(ast.children.length).toBeGreaterThan(1);
      expect(ast.children.some((child) => child.type === 'heading')).toBe(true);
      expect(ast.children.some((child) => child.type === 'unordered-list')).toBe(true);
      expect(ast.children.some((child) => child.type === 'fenced-code-block')).toBe(true);
      expect(ast.children.some((child) => child.type === 'blockquote')).toBe(true);
    });
  });

  describe('Tables', () => {
    it('should parse simple table', () => {
      const markdown = `| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |`;
      const ast = parser.parse(markdown);
      expect(ast.children).toHaveLength(1);
      expect(ast.children[0].type).toBe('table');
      const table = ast.children[0] as any;
      expect(table.children).toHaveLength(2); // 1 header + 1 body row
      expect(table.children[0].isHeader).toBe(true);
      expect(table.children[1].isHeader).toBeFalsy();
    });

    it('should parse table with multiple body rows', () => {
      const markdown = `| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`;
      const ast = parser.parse(markdown);
      const table = ast.children[0] as any;
      expect(table.children).toHaveLength(3); // 1 header + 2 body rows
    });

    it('should parse table with left alignment', () => {
      const markdown = `| Left |
| :--- |
| Data |`;
      const ast = parser.parse(markdown);
      const table = ast.children[0] as any;
      expect(table.children[0].children[0].align).toBe('left');
    });

    it('should parse table with center alignment', () => {
      const markdown = `| Center |
| :-: |
| Data   |`;
      const ast = parser.parse(markdown);
      const table = ast.children[0] as any;
      expect(table.children[0].children[0].align).toBe('center');
    });

    it('should parse table with right alignment', () => {
      const markdown = `| Right |
| ---: |
| Data  |`;
      const ast = parser.parse(markdown);
      const table = ast.children[0] as any;
      expect(table.children[0].children[0].align).toBe('right');
    });

    it('should parse table with mixed alignments', () => {
      const markdown = `| Left | Center | Right |
| :--- | :-: | ---: |
| L    | C   | R     |`;
      const ast = parser.parse(markdown);
      const table = ast.children[0] as any;
      const cells = table.children[0].children;
      expect(cells[0].align).toBe('left');
      expect(cells[1].align).toBe('center');
      expect(cells[2].align).toBe('right');
    });

    it('should parse table cells with inline formatting', () => {
      const markdown = `| **Bold** | *Italic* |
| -------- | -------- |
| Normal   | Code     |`;
      const ast = parser.parse(markdown);
      const table = ast.children[0] as any;
      const headerCells = table.children[0].children;
      expect(headerCells[0].children.some((child: any) => child.type === 'strong')).toBe(true);
      expect(headerCells[1].children.some((child: any) => child.type === 'emphasis')).toBe(true);
    });

    it('should end table at blank line', () => {
      const markdown = `| Header |
| ------ |
| Data   |

Paragraph after table`;
      const ast = parser.parse(markdown);
      expect(ast.children).toHaveLength(2);
      expect(ast.children[0].type).toBe('table');
      expect(ast.children[1].type).toBe('paragraph');
    });

    it('should end table when encountering non-pipe line', () => {
      const markdown = `| Header |
| ------ |
| Data   |
Not a table line
More text`;
      const ast = parser.parse(markdown);
      expect(ast.children[0].type).toBe('table');
      expect(ast.children.length).toBeGreaterThan(1);
    });
  });

  describe('Footnotes', () => {
    it('should parse footnote reference', () => {
      const markdown = 'This is text with a footnote[^1].';
      const ast = parser.parse(markdown);
      expect(ast.children[0].type).toBe('paragraph');
      const paragraph = ast.children[0] as any;
      const hasFootnoteRef = paragraph.children.some((node: any) => node.type === 'footnote-reference');
      expect(hasFootnoteRef).toBe(true);
    });

    it('should parse footnote definition', () => {
      const markdown = `Text with footnote[^1].

[^1]: This is the footnote content.`;
      const ast = parser.parse(markdown);
      expect(ast.footnotes).toBeDefined();
      expect(ast.footnotes?.length).toBeGreaterThan(0);
      expect(ast.footnotes?.[0].label).toBe('1');
    });

    it('should parse multiple footnote references', () => {
      const markdown = 'First[^1] and second[^2] footnotes.';
      const ast = parser.parse(markdown);
      const paragraph = ast.children[0] as any;
      const footnoteRefs = paragraph.children.filter((node: any) => node.type === 'footnote-reference');
      expect(footnoteRefs.length).toBe(2);
    });

    it('should parse multi-paragraph footnote', () => {
      const markdown = `Text[^1].

[^1]: First paragraph.

    Second paragraph indented.`;
      const ast = parser.parse(markdown);
      expect(ast.footnotes).toBeDefined();
      expect(ast.footnotes?.[0].children.length).toBeGreaterThan(1);
    });

    it('should parse descriptive footnote label', () => {
      const markdown = `Text with note[^my-note].

[^my-note]: This footnote has a descriptive label.`;
      const ast = parser.parse(markdown);
      expect(ast.footnotes).toBeDefined();
      expect(ast.footnotes?.[0].label).toBe('my-note');
    });

    it('should handle unclosed footnote reference', () => {
      const markdown = 'Text with unclosed footnote[^1 not closed.';
      const ast = parser.parse(markdown);
      // Should not crash, treat as regular text
      expect(ast.children[0].type).toBe('paragraph');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const ast = parser.parse('');
      expect(ast.children).toHaveLength(0);
    });

    it('should handle whitespace only', () => {
      const ast = parser.parse('   \n  \n   ');
      expect(ast.children).toHaveLength(0);
    });

    it('should handle single newline', () => {
      const ast = parser.parse('\n');
      expect(ast.children).toHaveLength(0);
    });

    it('should handle multiple blank lines', () => {
      const markdown = `Paragraph 1.



Paragraph 2.`;
      const ast = parser.parse(markdown);
      expect(ast.children).toHaveLength(2);
    });
  });

  describe('Line Breaks', () => {
    it('should parse hard line break with two trailing spaces', () => {
      const markdown = 'Line 1  \nLine 2';
      const ast = parser.parse(markdown);
      const para = ast.children[0] as any;
      expect(para.type).toBe('paragraph');
      
      // Should have: text("Line 1"), hard-line-break, text("Line 2")
      const hasLineBreak = para.children.some((child: any) => child.type === 'hard-line-break');
      expect(hasLineBreak).toBe(true);
    });

    it('should not create hard line break with single trailing space', () => {
      const markdown = 'Line 1 \nLine 2';
      const ast = parser.parse(markdown);
      const para = ast.children[0] as any;
      
      // Should treat as soft line break (space)
      const hasHardBreak = para.children.some((child: any) => child.type === 'hard-line-break');
      expect(hasHardBreak).toBe(false);
    });

    it('should handle multiple hard line breaks in one paragraph', () => {
      const markdown = 'Line 1  \nLine 2  \nLine 3';
      const ast = parser.parse(markdown);
      const para = ast.children[0] as any;
      
      const breakCount = para.children.filter((child: any) => child.type === 'hard-line-break').length;
      expect(breakCount).toBe(2);
    });
  });
});

