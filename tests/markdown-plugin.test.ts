import { describe, it, expect } from 'vitest';
import { Parser } from '../src/parser/parser';
import { HTMLRenderer } from '../src/renderer/html-renderer';

describe('Markdown Embed Plugin', () => {
  const parser = new Parser();
  const renderer = new HTMLRenderer();

  it('should generate placeholder for {{markdown url}}', () => {
    const input = '{{markdown https://example.com/test.md}}';
    const ast = parser.parse(input);
    const html = renderer.render(ast).html;

    expect(html).toContain('class="markdown-embed"');
    expect(html).toContain('data-markdown-url="https://example.com/test.md"');
    expect(html).toContain('markdown-embed-loading');
  });

  it('should generate placeholder for {{md url}} shorthand', () => {
    const input = '{{md https://example.com/readme.md}}';
    const ast = parser.parse(input);
    const html = renderer.render(ast).html;

    expect(html).toContain('class="markdown-embed"');
    expect(html).toContain('data-markdown-url="https://example.com/readme.md"');
  });

  it('should reject non-http(s) URLs', () => {
    const input = '{{markdown ftp://example.com/test.md}}';
    const ast = parser.parse(input);
    const html = renderer.render(ast).html;

    // Should not match since pattern only accepts http/https
    expect(html).not.toContain('data-markdown-url');
  });

  it('should handle invalid URLs gracefully', () => {
    const input = '{{markdown not-a-valid-url}}';
    const ast = parser.parse(input);
    const html = renderer.render(ast).html;

    // Should not match since pattern requires valid URL format
    expect(html).not.toContain('data-markdown-url');
  });

  it('should escape HTML in URLs', () => {
    const input = '{{markdown https://example.com/test.md?foo=<script>}}';
    const ast = parser.parse(input);
    const html = renderer.render(ast).html;

    // URL should be escaped
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should work with surrounding content', () => {
    const input = `# Title

Some text before.

{{markdown https://example.com/content.md}}

Some text after.`;
    const ast = parser.parse(input);
    const html = renderer.render(ast).html;

    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('Some text before');
    expect(html).toContain('class="markdown-embed"');
    expect(html).toContain('Some text after');
  });

  it('should generate unique IDs for multiple embeds', () => {
    const input = `{{markdown https://example.com/file1.md}}

{{markdown https://example.com/file2.md}}`;
    const ast = parser.parse(input);
    const html = renderer.render(ast).html;

    // Should have two different IDs
    const idMatches = html.match(/id="md-embed-[a-z0-9]+"/g);
    expect(idMatches).toHaveLength(2);
    expect(idMatches![0]).not.toBe(idMatches![1]);
  });
});
