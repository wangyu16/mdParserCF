/**
 * Tests for Math Formula Support
 *
 * Covers inline math ($...$) and block math ($$...$$) parsing and rendering
 */

import { describe, it, expect } from 'vitest';
import { Parser } from '../../src/parser/parser';
import { HTMLRenderer } from '../../src/renderer/html-renderer';

describe('Math Formulas', () => {
  const parser = new Parser({ enableMath: true });
  const renderer = new HTMLRenderer();

  describe('Inline Math', () => {
    it('should parse inline math $x^2$', () => {
      const markdown = 'The formula $x^2$ is simple.';
      const ast = parser.parse(markdown);
      
      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children[0];
      expect(paragraph.type).toBe('paragraph');
      
      // Find the math node
      const mathNode = (paragraph as any).children.find((node: any) => node.type === 'inline-math');
      expect(mathNode).toBeDefined();
      expect(mathNode.content).toBe('x^2');
    });

    it('should render inline math with MathJax script tag', () => {
      const markdown = 'The formula $E=mc^2$ is famous.';
      const ast = parser.parse(markdown);
      const html = renderer.render(ast).html;
      
      expect(html).toContain('<script type="math/tex">E=mc^2</script>');
    });

    it('should handle multiple inline math formulas', () => {
      const markdown = 'We have $a^2$ and $b^2$ in equation.';
      const ast = parser.parse(markdown);
      const html = renderer.render(ast).html;
      
      expect(html).toContain('<script type="math/tex">a^2</script>');
      expect(html).toContain('<script type="math/tex">b^2</script>');
    });

    it('should not parse $$ as inline math', () => {
      const markdown = 'Double dollar $$ should not be inline.';
      const ast = parser.parse(markdown);
      const paragraph = ast.children[0];
      
      const mathNodes = (paragraph as any).children.filter((node: any) => node.type === 'inline-math');
      expect(mathNodes).toHaveLength(0);
    });

    it('should not parse unclosed inline math', () => {
      const markdown = 'Unclosed $x^2 should be text.';
      const ast = parser.parse(markdown);
      const html = renderer.render(ast).html;
      
      expect(html).not.toContain('<script type="math/tex">');
    });

    it('should escape special characters in math', () => {
      const markdown = 'Formula $x<y$ with symbols.';
      const ast = parser.parse(markdown);
      const html = renderer.render(ast).html;
      
      // Should have math tag with escaped content
      expect(html).toContain('<script type="math/tex">');
      expect(html).toContain('x&lt;y');
    });
  });

  describe('Block Math', () => {
    it('should parse block math $$...$$', () => {
      const markdown = `Here is a formula:

$$
E = mc^2
$$

End.`;
      const ast = parser.parse(markdown);
      
      // Find math block
      const mathBlock = ast.children.find(node => node.type === 'math-block');
      expect(mathBlock).toBeDefined();
      expect(mathBlock.type).toBe('math-block');
      expect((mathBlock as any).content).toContain('E = mc^2');
    });

    it('should render block math with mode=display', () => {
      const markdown = `$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$`;
      const ast = parser.parse(markdown);
      const html = renderer.render(ast).html;
      
      expect(html).toContain('<script type="math/tex; mode=display">');
      expect(html).toContain('x = \\frac{-b');
      expect(html).toContain('</script>');
    });

    it('should wrap block math in div with math-block class', () => {
      const markdown = `$$
y = x^2
$$`;
      const ast = parser.parse(markdown);
      const html = renderer.render(ast).html;
      
      expect(html).toContain('<div class="math-block">');
      expect(html).toContain('</div>');
    });

    it('should handle multiline math formulas', () => {
      const markdown = `$$
\\begin{align}
a &= b + c \\\\
d &= e + f
\\end{align}
$$`;
      const ast = parser.parse(markdown);
      const html = renderer.render(ast).html;
      
      expect(html).toContain('<script type="math/tex; mode=display">');
      expect(html).toContain('begin{align}');
      expect(html).toContain('a &amp;= b + c'); // & is escaped as &amp;
      expect(html).toContain('end{align}');
    });

    it('should require closing $$ delimiter', () => {
      const markdown = `$$
E = mc^2`;
      const ast = parser.parse(markdown);
      
      // Should not find math block without closing $$
      const mathBlock = ast.children.find(node => node.type === 'math-block');
      expect(mathBlock).toBeUndefined();
    });
  });

  describe('Mixed Content', () => {
    it('should handle inline and block math together', () => {
      const markdown = `We have $x$ and then:

$$
y = x^2
$$

More text with $z$.`;
      const ast = parser.parse(markdown);
      const html = renderer.render(ast).html;
      
      // Should have 2 inline and 1 block
      const inlineMath = (html.match(/type="math\/tex">/g) || []).length;
      const blockMath = (html.match(/type="math\/tex; mode=display">/g) || []).length;
      
      expect(inlineMath).toBe(2);
      expect(blockMath).toBe(1);
    });

    it('should work with other markdown elements', () => {
      const markdown = `# Math Title

Some text with **bold** and $x^2$.

$$
E = mc^2
$$

- List with $a$
- Another $b$`;
      const ast = parser.parse(markdown);
      const html = renderer.render(ast).html;
      
      expect(html).toContain('<h1>');
      expect(html).toContain('<strong>');
      expect(html).toContain('<ul>');
      expect(html).toContain('<script type="math/tex">');
      expect(html).toContain('<script type="math/tex; mode=display">');
    });
  });

  describe('Math Disabled', () => {
    const parserDisabled = new Parser({ enableMath: false });

    it('should treat $...$ as regular text when disabled', () => {
      const markdown = 'Formula $x^2$ here.';
      const ast = parserDisabled.parse(markdown);
      const html = renderer.render(ast).html;
      
      expect(html).not.toContain('<script type="math/tex">');
      expect(html).toContain('$x^2$');
    });

    it('should treat $$...$$ as regular text when disabled', () => {
      const markdown = `$$
E = mc^2
$$`;
      const ast = parserDisabled.parse(markdown);
      
      // Should not find math block
      const mathBlock = ast.children.find(node => node.type === 'math-block');
      expect(mathBlock).toBeUndefined();
    });
  });
});
