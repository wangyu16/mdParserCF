/**
 * Mixed HTML/Markdown Handling Tests
 *
 * Tests for proper handling of HTML comments, global HTML tags,
 * and mixed HTML/Markdown content.
 */

import { describe, it, expect } from 'vitest';
import { Parser } from '../../src/parser/parser';
import { HTMLRenderer } from '../../src/renderer/html-renderer';

describe('Mixed HTML/Markdown Handling', () => {
  const parser = new Parser();
  const renderer = new HTMLRenderer();

  function renderMarkdown(markdown: string): string {
    const ast = parser.parse(markdown);
    return renderer.render(ast).html;
  }

  describe('HTML Comment Handling', () => {
    describe('Block-level comments', () => {
      it('should preserve HTML comments in output', () => {
        const markdown = '<!-- This is a comment -->';
        const html = renderMarkdown(markdown);
        expect(html).toContain('<!-- This is a comment -->');
      });

      it('should preserve multi-line HTML comments', () => {
        const markdown = `<!-- This is a
multi-line
comment -->`;
        const html = renderMarkdown(markdown);
        expect(html).toContain('<!--');
        expect(html).toContain('-->');
      });

      it('should handle comment at beginning of document', () => {
        const markdown = `<!-- comment -->
# Heading`;
        const html = renderMarkdown(markdown);
        expect(html).toContain('<!-- comment -->');
        expect(html).toContain('<h1');
      });

      it('should handle comment between blocks', () => {
        const markdown = `# Heading

<!-- comment -->

Some text.`;
        const html = renderMarkdown(markdown);
        expect(html).toContain('<h1');
        expect(html).toContain('<!-- comment -->');
        expect(html).toContain('<p>Some text.</p>');
      });

      it('should handle multiple comments', () => {
        const markdown = `<!-- first -->
Text
<!-- second -->`;
        const html = renderMarkdown(markdown);
        expect(html).toContain('<!-- first -->');
        expect(html).toContain('<!-- second -->');
      });
    });

    describe('Inline comments', () => {
      it('should preserve inline HTML comment', () => {
        const markdown = 'Text before <!-- inline comment --> text after.';
        const html = renderMarkdown(markdown);
        expect(html).toContain('<!-- inline comment -->');
        expect(html).toContain('Text before');
        expect(html).toContain('text after');
      });

      it('should handle comment at start of paragraph', () => {
        const markdown = '<!-- comment -->Starting text.';
        const html = renderMarkdown(markdown);
        expect(html).toContain('<!-- comment -->');
        expect(html).toContain('Starting text');
      });

      it('should handle comment at end of paragraph', () => {
        const markdown = 'Ending text.<!-- comment -->';
        const html = renderMarkdown(markdown);
        expect(html).toContain('Ending text');
        expect(html).toContain('<!-- comment -->');
      });

      it('should handle multiple inline comments', () => {
        const markdown = 'A<!-- one -->B<!-- two -->C';
        const html = renderMarkdown(markdown);
        expect(html).toContain('A');
        expect(html).toContain('<!-- one -->');
        expect(html).toContain('B');
        expect(html).toContain('<!-- two -->');
        expect(html).toContain('C');
      });
    });

    describe('Image attribute comments (special case)', () => {
      it('should apply comment attributes directly after image', () => {
        const markdown = '![alt](image.png)<!-- class="responsive" -->';
        const html = renderMarkdown(markdown);
        expect(html).toContain('class="responsive"');
        // The comment should NOT appear separately
        expect(html).not.toContain('<!--');
      });

      it('should NOT apply comment attributes when space before comment', () => {
        const markdown = '![alt](image.png) <!-- class="test" -->';
        const html = renderMarkdown(markdown);
        // Image should NOT have the class
        expect(html).not.toContain('<img src="image.png" alt="alt" class="test"');
        // Comment should be preserved
        expect(html).toContain('<!-- class="test" -->');
      });
    });
  });

  describe('Global HTML Tag Stripping', () => {
    it('should strip <!DOCTYPE html> declaration', () => {
      const markdown = `<!DOCTYPE html>
# Heading`;
      const html = renderMarkdown(markdown);
      expect(html).not.toContain('DOCTYPE');
      expect(html).toContain('<h1');
      expect(html).toContain('Heading');
    });

    it('should strip <html> and </html> tags', () => {
      const markdown = `<html>
# Heading
</html>`;
      const html = renderMarkdown(markdown);
      expect(html).not.toContain('<html>');
      expect(html).not.toContain('</html>');
      expect(html).toContain('<h1');
    });

    it('should strip entire <head>...</head> section including content', () => {
      const markdown = `<head>
<title>Test Page</title>
<style>body { color: red; }</style>
<link rel="stylesheet" href="style.css">
</head>
# Heading`;
      const html = renderMarkdown(markdown);
      expect(html).not.toContain('<head>');
      expect(html).not.toContain('</head>');
      expect(html).not.toContain('<title>');
      expect(html).not.toContain('<style>');
      expect(html).not.toContain('<link');
      expect(html).toContain('<h1');
      expect(html).toContain('Heading');
    });

    it('should strip <body> and </body> tags but preserve content', () => {
      const markdown = `<body>
# Heading
Some **text**.
</body>`;
      const html = renderMarkdown(markdown);
      expect(html).not.toContain('<body>');
      expect(html).not.toContain('</body>');
      expect(html).toContain('<h1');
      expect(html).toContain('Heading');
      expect(html).toContain('<strong>text</strong>');
    });

    it('should handle complete HTML document structure', () => {
      const markdown = `<!DOCTYPE html>
<html>
<head>
<title>Test</title>
</head>
<body>
# My Document

This is **bold** text.

- Item 1
- Item 2
</body>
</html>`;
      const html = renderMarkdown(markdown);
      expect(html).not.toContain('DOCTYPE');
      expect(html).not.toContain('<html>');
      expect(html).not.toContain('<head>');
      expect(html).not.toContain('<title>');
      expect(html).not.toContain('<body>');
      expect(html).toContain('<h1');
      expect(html).toContain('My Document');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<ul>');
      expect(html).toContain('Item 1');
    });

    it('should be case-insensitive for HTML tags', () => {
      const markdown = `<!DOCTYPE HTML>
<HTML>
<HEAD>
<TITLE>Test</TITLE>
</HEAD>
<BODY>
Content
</BODY>
</HTML>`;
      const html = renderMarkdown(markdown);
      expect(html).not.toContain('DOCTYPE');
      expect(html).not.toContain('<HTML>');
      expect(html).not.toContain('<HEAD>');
      expect(html).toContain('Content');
    });
  });

  describe('Inline HTML with Markdown Content', () => {
    it('should parse markdown inside <span>', () => {
      const markdown = '<span>Some **bold** text</span>';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<span>');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('</span>');
    });

    it('should parse markdown inside <div>', () => {
      const markdown = `<div>

# Heading

Some **text**.

</div>`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<div');
      expect(html).toContain('<h1');
      expect(html).toContain('<strong>text</strong>');
      expect(html).toContain('</div>');
    });

    it('should parse markdown inside <p>', () => {
      const markdown = '<p>This is *italic*.</p>';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<p>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('</p>');
    });

    it('should preserve self-closing tags', () => {
      const markdown = '<img src="test.png" />';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<img');
      expect(html).toContain('src="test.png"');
    });

    it('should preserve HTML attributes', () => {
      const markdown = '<div class="container" id="main">Content</div>';
      const html = renderMarkdown(markdown);
      expect(html).toContain('class="container"');
      expect(html).toContain('id="main"');
    });

    it('should handle nested markdown formatting inside HTML', () => {
      const markdown = '<div>**bold *and italic* text**</div>';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<strong>');
      expect(html).toContain('<em>');
    });

    it('should handle lists inside HTML blocks', () => {
      const markdown = `<div>

- Item 1
- Item 2

</div>`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<ul>');
      expect(html).toContain('<li');
      expect(html).toContain('Item 1');
    });

    it('should handle code inside HTML', () => {
      const markdown = '<div>Use `code` here.</div>';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<code>code</code>');
    });
  });

  describe('Mixed Content Scenarios', () => {
    it('should handle HTML comment followed by markdown', () => {
      const markdown = `<!-- comment -->
# Heading

Some text.`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<!-- comment -->');
      expect(html).toContain('<h1');
      expect(html).toContain('<p>Some text.</p>');
    });

    it('should handle markdown with embedded HTML and comments', () => {
      const markdown = `# Title

<!-- Author: John -->

<div class="intro">
This is **important**.
</div>

More text.`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<h1');
      expect(html).toContain('<!-- Author: John -->');
      expect(html).toContain('<div class="intro">');
      expect(html).toContain('<strong>important</strong>');
      expect(html).toContain('<p>More text.</p>');
    });

    it('should handle complex document with all features', () => {
      const markdown = `<!DOCTYPE html>
<html>
<head>
<title>Test</title>
</head>
<body>

# Document Title

<!-- Section 1 -->

<div class="section">

## Section Heading

This has **bold** and *italic* text.

- List item 1
- List item 2

</div>

<!-- End of document -->

</body>
</html>`;
      const html = renderMarkdown(markdown);
      // Global tags should be stripped
      expect(html).not.toContain('DOCTYPE');
      expect(html).not.toContain('<html>');
      expect(html).not.toContain('<head>');
      expect(html).not.toContain('<body>');
      // Content should be preserved and rendered
      expect(html).toContain('<h1');
      expect(html).toContain('Document Title');
      expect(html).toContain('<!-- Section 1 -->');
      expect(html).toContain('<div class="section">');
      expect(html).toContain('<h2');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<ul>');
      expect(html).toContain('<!-- End of document -->');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty comment', () => {
      const markdown = '<!---->';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<!---->');
    });

    it('should handle comment with only whitespace', () => {
      const markdown = '<!--   -->';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<!--   -->');
    });

    it('should handle comment with dashes inside', () => {
      const markdown = '<!-- -- comment -- -->';
      const html = renderMarkdown(markdown);
      expect(html).toContain('<!-- -- comment -- -->');
    });

    it('should handle unclosed comment gracefully', () => {
      const markdown = '<!-- unclosed comment';
      // Should not crash, treat as regular text
      const html = renderMarkdown(markdown);
      expect(html).toBeDefined();
    });

    it('should handle HTML-like text that is not valid HTML', () => {
      const markdown = 'Use <angle brackets> for emphasis';
      const html = renderMarkdown(markdown);
      // Should be escaped or treated as text
      expect(html).toContain('&lt;');
    });

    it('should preserve raw HTML input structure', () => {
      const markdown = `<article>
<header>
# Title
</header>
<main>
Content here.
</main>
</article>`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<article>');
      expect(html).toContain('<header>');
      expect(html).toContain('<main>');
      expect(html).toContain('</article>');
    });
  });
});
