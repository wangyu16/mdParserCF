/**
 * Tests for clickable images feature
 * Syntax: [![alt](imageUrl)](linkUrl)
 * With attributes: [![alt](imageUrl)<!-- attrs -->](linkUrl)
 */

import { describe, it, expect } from 'vitest';
import { Parser } from '../../src/parser/parser';
import { HTMLRenderer } from '../../src/renderer/html-renderer';

describe('Clickable Images', () => {
  const parser = new Parser({ debugAST: false });
  const renderer = new HTMLRenderer();

  function parse(md: string): string {
    const ast = parser.parse(md);
    return renderer.render(ast).html;
  }

  describe('Basic clickable image syntax', () => {
    it('should render a simple clickable image', () => {
      const md = '[![Alt](https://example.com/img.jpg)](https://example.com)';
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com">');
      expect(html).toContain('<img src="https://example.com/img.jpg" alt="Alt" />');
      expect(html).toContain('</a>');
    });

    it('should render clickable image with empty alt text', () => {
      const md = '[![](https://example.com/img.jpg)](https://example.com)';
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com">');
      expect(html).toContain('<img src="https://example.com/img.jpg" alt="" />');
    });

    it('should render clickable image with image title', () => {
      const md = '[![Alt](https://example.com/img.jpg "Image title")](https://example.com)';
      const html = parse(md);
      expect(html).toContain(
        '<img src="https://example.com/img.jpg" alt="Alt" title="Image title" />'
      );
    });

    it('should render clickable image with link title', () => {
      const md = '[![Alt](https://example.com/img.jpg)](https://example.com "Link title")';
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com" title="Link title">');
    });

    it('should render clickable image with both titles', () => {
      const md =
        '[![Alt](https://example.com/img.jpg "Image title")](https://example.com "Link title")';
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com" title="Link title">');
      expect(html).toContain(
        '<img src="https://example.com/img.jpg" alt="Alt" title="Image title" />'
      );
    });
  });

  describe('Clickable images with HTML comment attributes', () => {
    it('should render clickable image with width attribute', () => {
      const md = '[![Alt](https://example.com/img.jpg)<!-- width="100px" -->](https://example.com)';
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com">');
      expect(html).toContain('<img src="https://example.com/img.jpg" alt="Alt" width="100px" />');
    });

    it('should render clickable image with multiple attributes', () => {
      const md =
        '[![Alt](https://example.com/img.jpg)<!-- width="200px" height="100px" class="my-img" -->](https://example.com)';
      const html = parse(md);
      expect(html).toContain('width="200px"');
      expect(html).toContain('height="100px"');
      expect(html).toContain('class="my-img"');
    });

    it('should render clickable image with style attribute', () => {
      const md =
        '[![Alt](https://example.com/img.jpg)<!-- style="border:1px solid red" -->](https://example.com)';
      const html = parse(md);
      expect(html).toContain('style="border:1px solid red"');
    });

    it('should render clickable image with both title and attributes', () => {
      const md =
        '[![Alt](https://example.com/img.jpg "Image title")<!-- width="150px" -->](https://example.com "Link title")';
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com" title="Link title">');
      expect(html).toContain('title="Image title"');
      expect(html).toContain('width="150px"');
    });

    it('should render clickable image with single-quoted attributes', () => {
      const md = "[![Alt](https://example.com/img.jpg)<!-- width='100px' -->](https://example.com)";
      const html = parse(md);
      expect(html).toContain('width="100px"');
    });

    it('should handle data-* attributes', () => {
      const md =
        '[![Alt](https://example.com/img.jpg)<!-- data-id="123" data-type="banner" -->](https://example.com)';
      const html = parse(md);
      expect(html).toContain('data-id="123"');
      expect(html).toContain('data-type="banner"');
    });
  });

  describe('Clickable images in context', () => {
    it('should render clickable image within a paragraph', () => {
      const md =
        'Check out [![Logo](https://example.com/logo.png)](https://example.com) for more info.';
      const html = parse(md);
      expect(html).toContain(
        '<p>Check out <a href="https://example.com"><img src="https://example.com/logo.png" alt="Logo" /></a> for more info.</p>'
      );
    });

    it('should render multiple clickable images', () => {
      const md =
        '[![A](https://a.com/a.jpg)](https://a.com) [![B](https://b.com/b.jpg)](https://b.com)';
      const html = parse(md);
      expect(html).toContain(
        '<a href="https://a.com"><img src="https://a.com/a.jpg" alt="A" /></a>'
      );
      expect(html).toContain(
        '<a href="https://b.com"><img src="https://b.com/b.jpg" alt="B" /></a>'
      );
    });
  });

  describe('Reference-style clickable images', () => {
    it('should render reference-style clickable image with [ref]', () => {
      const md = `[![Alt](https://example.com/img.jpg)][mylink]

[mylink]: https://example.com`;
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com">');
      expect(html).toContain('<img src="https://example.com/img.jpg" alt="Alt" />');
    });

    it('should render reference-style clickable image with [] (use alt as ref)', () => {
      const md = `[![google](https://example.com/img.jpg)][]

[google]: https://google.com`;
      const html = parse(md);
      expect(html).toContain('<a href="https://google.com">');
      expect(html).toContain('<img src="https://example.com/img.jpg" alt="google" />');
    });

    it('should render reference-style clickable image with attributes', () => {
      const md = `[![Alt](https://example.com/img.jpg)<!-- width="100px" -->][mylink]

[mylink]: https://example.com`;
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com">');
      expect(html).toContain('width="100px"');
    });

    it('should render reference-style clickable image with title from reference', () => {
      const md = `[![Alt](https://example.com/img.jpg)][mylink]

[mylink]: https://example.com "Link Title"`;
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com" title="Link Title">');
    });

    it('should render reference-style clickable image with image title and link title', () => {
      const md = `[![Alt](https://example.com/img.jpg "Image Title")][mylink]

[mylink]: https://example.com "Link Title"`;
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com" title="Link Title">');
      expect(html).toContain('title="Image Title"');
    });

    it('should be case-insensitive for reference names', () => {
      const md = `[![Alt](https://example.com/img.jpg)][MyLink]

[mylink]: https://example.com`;
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com">');
    });

    it('should not render clickable image link if reference is not defined', () => {
      const md = `[![Alt](https://example.com/img.jpg)][undefined-ref]`;
      const html = parse(md);
      // When reference is not found, the pattern is not matched as a clickable image
      // and falls through to other parsing rules
      expect(html).toContain('[undefined-ref]');
    });
  });

  describe('Non-clickable images and links still work', () => {
    it('should still render regular images', () => {
      const md = '![Alt](https://example.com/img.jpg)';
      const html = parse(md);
      expect(html).toContain('<p><img src="https://example.com/img.jpg" alt="Alt" /></p>');
    });

    it('should still render regular links', () => {
      const md = '[Link text](https://example.com)';
      const html = parse(md);
      expect(html).toContain('<p><a href="https://example.com">Link text</a></p>');
    });

    it('should still render images with titles', () => {
      const md = '![Alt](https://example.com/img.jpg "Title")';
      const html = parse(md);
      expect(html).toContain('<img src="https://example.com/img.jpg" alt="Alt" title="Title" />');
    });

    it('should still render links with titles', () => {
      const md = '[Link text](https://example.com "Title")';
      const html = parse(md);
      expect(html).toContain('<a href="https://example.com" title="Title">Link text</a>');
    });

    it('should still render regular images with HTML comment attributes', () => {
      const md = '![Alt](https://example.com/img.jpg)<!-- width="100px" -->';
      const html = parse(md);
      expect(html).toContain('<img src="https://example.com/img.jpg" alt="Alt" width="100px" />');
    });

    it('should still render regular reference-style links', () => {
      const md = `[Link text][ref1]

[ref1]: https://google.com`;
      const html = parse(md);
      expect(html).toContain('<a href="https://google.com">Link text</a>');
    });
  });
});
