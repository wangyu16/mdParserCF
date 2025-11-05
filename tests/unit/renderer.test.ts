/**
 * HTML Renderer Unit Tests
 *
 * Tests for HTML output generation from AST
 */

import { describe, it, expect } from 'vitest';
import { Parser } from '../../src/parser/parser';
import { HTMLRenderer } from '../../src/renderer/html-renderer';

describe('HTMLRenderer', () => {
  const parser = new Parser();
  const renderer = new HTMLRenderer();

  function renderMarkdown(markdown: string): string {
    const ast = parser.parse(markdown);
    return renderer.render(ast).html;
  }

  describe('Headings', () => {
    it('should render h1 heading', () => {
      const html = renderMarkdown('# Heading 1');
      expect(html).toContain('<h1>');
      expect(html).toContain('Heading 1');
      expect(html).toContain('</h1>');
    });

    it('should render all heading levels', () => {
      for (let level = 1; level <= 6; level++) {
        const markdown = '#'.repeat(level) + ' Heading';
        const html = renderMarkdown(markdown);
        expect(html).toContain(`<h${level}>`);
        expect(html).toContain(`</h${level}>`);
      }
    });
  });

  describe('Paragraphs', () => {
    it('should wrap paragraph in <p> tags', () => {
      const html = renderMarkdown('This is a paragraph.');
      expect(html).toContain('<p>');
      expect(html).toContain('This is a paragraph.');
      expect(html).toContain('</p>');
    });

    it('should render multiple paragraphs', () => {
      const html = renderMarkdown(`First paragraph.

Second paragraph.`);
      const paragraphs = html.match(/<p>/g);
      expect(paragraphs).toHaveLength(2);
    });
  });

  describe('Emphasis', () => {
    it('should render italic as <em>', () => {
      const html = renderMarkdown('This is *italic*.');
      expect(html).toContain('<em>italic</em>');
    });

    it('should render bold as <strong>', () => {
      const html = renderMarkdown('This is **bold**.');
      expect(html).toContain('<strong>bold</strong>');
    });

    it('should render bold and italic', () => {
      const html = renderMarkdown('This is ***both***.');
      expect(html).toContain('<strong><em>both</em></strong>');
    });
  });

  describe('Strikethrough', () => {
    it('should render strikethrough with <del>', () => {
      const html = renderMarkdown('This is ~~strikethrough~~ text.');
      expect(html).toContain('<del>strikethrough</del>');
    });

    it('should render strikethrough with nested formatting', () => {
      const html = renderMarkdown('This is ~~**bold strikethrough**~~ text.');
      expect(html).toContain('<del>');
      expect(html).toContain('<strong>bold strikethrough</strong>');
      expect(html).toContain('</del>');
    });

    it('should render multiple strikethrough on same line', () => {
      const html = renderMarkdown('~~first~~ and ~~second~~');
      const dels = html.match(/<del>/g);
      expect(dels).toHaveLength(2);
    });

    it('should escape HTML in strikethrough', () => {
      const html = renderMarkdown('~~`<script>`~~');
      expect(html).toContain('<del>');
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>');
    });
  });

  describe('Code', () => {
    it('should render inline code with <code>', () => {
      const html = renderMarkdown('Use `const x = 5;`');
      expect(html).toContain('<code>const x = 5;</code>');
    });

    it('should escape HTML in code', () => {
      const html = renderMarkdown('`<script>alert("xss")</script>`');
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>');
    });

    it('should render fenced code block', () => {
      const markdown = `\`\`\`js
const x = 5;
\`\`\``;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<pre><code');
      expect(html).toContain('language-js');
      expect(html).toContain('const x = 5;');
    });

    it('should render indented code block', () => {
      const markdown = `    code line 1
    code line 2`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<pre><code>');
      expect(html).toContain('code line 1');
    });
  });

  describe('Links', () => {
    it('should render link with href', () => {
      const html = renderMarkdown('[example](https://example.com)');
      expect(html).toContain('<a href="https://example.com">');
      expect(html).toContain('example');
      expect(html).toContain('</a>');
    });

    it('should include title attribute if present', () => {
      const html = renderMarkdown('[link](https://example.com "Title")');
      expect(html).toContain('title="Title"');
    });

    it('should escape URL', () => {
      const html = renderMarkdown('[link]("javascript:alert(1)")');
      expect(html).toContain('&quot;');
    });
  });

  describe('Images', () => {
    it('should render img tag', () => {
      const html = renderMarkdown('![alt text](image.png)');
      expect(html).toContain('<img');
      expect(html).toContain('src="image.png"');
      expect(html).toContain('alt="alt text"');
    });

    it('should include title if present', () => {
      const html = renderMarkdown('![alt](img.png "Title")');
      expect(html).toContain('title="Title"');
    });

    it('should use self-closing img tag', () => {
      const html = renderMarkdown('![alt](img.png)');
      expect(html).toContain(' />');
    });
  });

  describe('Lists', () => {
    it('should render unordered list', () => {
      const markdown = `- Item 1
- Item 2`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>');
      expect(html).toContain('Item 1');
      expect(html).toContain('</ul>');
    });

    it('should render ordered list', () => {
      const markdown = `1. First
2. Second`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<ol>');
      expect(html).toContain('<li>');
      expect(html).toContain('First');
      expect(html).toContain('</ol>');
    });

    it('should include start attribute for ordered lists', () => {
      const markdown = `5. Fifth
6. Sixth`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('start="5"');
    });
  });

  describe('Blockquotes', () => {
    it('should render blockquote', () => {
      const html = renderMarkdown('> Quoted text');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('Quoted text');
      expect(html).toContain('</blockquote>');
    });

    it('should allow markdown inside blockquote', () => {
      const html = renderMarkdown('> **Bold quote**');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('<strong>Bold quote</strong>');
    });
  });

  describe('Horizontal Rules', () => {
    it('should render horizontal rule', () => {
      const html = renderMarkdown('---');
      expect(html).toContain('<hr');
    });

    it('should use self-closing tag', () => {
      const html = renderMarkdown('***');
      expect(html).toContain(' />');
    });
  });

  describe('HTML Escaping', () => {
    it('should escape ampersands', () => {
      const html = renderMarkdown('Fish & chips');
      expect(html).toContain('&amp;');
      expect(html).not.toContain('Fish & chips');
    });

    it('should escape less-than', () => {
      const html = renderMarkdown('a < b');
      expect(html).toContain('&lt;');
    });

    it('should escape greater-than', () => {
      const html = renderMarkdown('a > b');
      expect(html).toContain('&gt;');
    });

    it('should escape quotes', () => {
      const html = renderMarkdown('"quoted"');
      expect(html).toContain('&quot;');
    });
  });

  describe('End-to-End Rendering', () => {
    it('should render complex document', () => {
      const markdown = `# Title

This is a paragraph with **bold** and *italic*.

## Subsection

- List item 1
- List item 2

\`\`\`js
console.log('hello');
\`\`\`

[Link](https://example.com)`;

      const html = renderMarkdown(markdown);

      expect(html).toContain('<h1>Title</h1>');
      expect(html).toContain('<h2>Subsection</h2>');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<ul>');
      expect(html).toContain('<pre><code');
      expect(html).toContain('<a href=');
    });

    it('should be valid HTML structure', () => {
      const markdown = `# Title

Paragraph with **emphasis**.

- List item`;

      const html = renderMarkdown(markdown);

      // Basic structural checks
      expect(html.match(/<h1>/g)).toHaveLength(html.match(/<\/h1>/g)?.length || 0);
      expect(html.match(/<p>/g)).toHaveLength(html.match(/<\/p>/g)?.length || 0);
      expect(html.match(/<ul>/g)).toHaveLength(html.match(/<\/ul>/g)?.length || 0);
    });
  });

  describe('Tables', () => {
    it('should render table with <table> tag', () => {
      const markdown = `| Header |
| ------ |
| Data   |`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<table>');
      expect(html).toContain('</table>');
    });

    it('should render table header in <thead>', () => {
      const markdown = `| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<thead>');
      expect(html).toContain('</thead>');
      expect(html).toContain('<th>Header 1</th>');
      expect(html).toContain('<th>Header 2</th>');
    });

    it('should render table body in <tbody>', () => {
      const markdown = `| Header |
| ------ |
| Cell   |`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<tbody>');
      expect(html).toContain('</tbody>');
      expect(html).toContain('<td>Cell</td>');
    });

    it('should render table with multiple rows', () => {
      const markdown = `| H |
| - |
| R1 |
| R2 |`;
      const html = renderMarkdown(markdown);
      const rows = html.match(/<tr>/g);
      expect(rows).toHaveLength(3); // 1 header row + 2 body rows
    });

    it('should render left alignment style', () => {
      const markdown = `| Left |
| :--- |
| Data |`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('style="text-align:left"');
    });

    it('should render center alignment style', () => {
      const markdown = `| Center |
| :-: |
| Data   |`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('style="text-align:center"');
    });

    it('should render right alignment style', () => {
      const markdown = `| Right |
| ---: |
| Data  |`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('style="text-align:right"');
    });

    it('should render table with mixed alignments', () => {
      const markdown = `| Left | Center | Right |
| :--- | :-: | ---: |
| L    | C   | R     |`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('style="text-align:left"');
      expect(html).toContain('style="text-align:center"');
      expect(html).toContain('style="text-align:right"');
    });

    it('should render inline formatting in table cells', () => {
      const markdown = `| **Bold** | *Italic* |
| -------- | -------- |
| Normal   | \`Code\`   |`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<strong>Bold</strong>');
      expect(html).toContain('<em>Italic</em>');
      expect(html).toContain('<code>Code</code>');
    });
  });

  describe('Footnotes', () => {
    it('should render footnote reference as superscript link', () => {
      const markdown = 'Text with footnote[^1].\n\n[^1]: This is a footnote.';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<sup><a href="#fn-1"');
      expect(html).toContain('[1]</a></sup>');
    });

    it('should render footnotes section', () => {
      const markdown = 'Text[^1].\n\n[^1]: Footnote content.';
      const html = renderMarkdown(markdown);
      expect(html).toContain('class="footnotes"');
      expect(html).toContain('Footnote content');
    });

    it('should render multiple footnotes in order', () => {
      const markdown = `First[^1] and second[^2].

[^1]: First footnote.
[^2]: Second footnote.`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('First footnote');
      expect(html).toContain('Second footnote');
    });

    it('should render footnote with markdown formatting', () => {
      const markdown = 'Text[^1].\n\n[^1]: **Bold** and *italic* text.';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<strong>Bold</strong>');
      expect(html).toContain('<em>italic</em>');
    });

    it('should escape HTML in footnotes', () => {
      const markdown = 'Text[^1].\n\n[^1]: <script>alert("xss")</script>';
      const html = renderMarkdown(markdown);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('Special Characters', () => {
    it('should render copyright symbol', () => {
      const html = renderMarkdown('© 2024');
      expect(html).toContain('©');
    });

    it('should preserve unicode', () => {
      const html = renderMarkdown('Hello 世界');
      expect(html).toContain('世界');
    });

    it('should handle emoji', () => {
      const html = renderMarkdown('🎉 Party!');
      expect(html).toContain('🎉');
    });
  });

  describe('Line Breaks', () => {
    it('should render hard line break as <br />', () => {
      const markdown = 'Line 1  \nLine 2';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<br />');
    });

    it('should render soft line break as space', () => {
      const markdown = 'Line 1 \nLine 2';
      const html = renderMarkdown(markdown);
      // Soft line break becomes space in rendering
      expect(html).toContain('Line 1');
      expect(html).toContain('Line 2');
      expect(html).not.toContain('<br />');
    });

    it('should render multiple line breaks', () => {
      const markdown = 'Line 1  \nLine 2  \nLine 3';
      const html = renderMarkdown(markdown);
      const breakCount = (html.match(/<br \/>/g) || []).length;
      expect(breakCount).toBe(2);
    });
  });
});

