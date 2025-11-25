import { describe, it, expect } from 'vitest';
import { Parser } from '../src/parser/parser';
import { HTMLRenderer } from '../src/renderer/html-renderer';

describe('Block Math in Various Contexts', () => {
  const parser = new Parser();
  const renderer = new HTMLRenderer();

  it('should render inline $$...$$ as block math', () => {
    // Feature: $$E=mc^2$$ written within a paragraph should render as block equation
    const input = 'Even if the block equation is written inline $$E=mc^2$$ it will be shown as block equation.';
    const ast = parser.parse(input);
    const html = renderer.render(ast).html;
    
    // Should contain a block math element (katex-display)
    expect(html).toContain('katex-display');
  });

  it('should render $$...$$ following text without empty line as block math', () => {
    // Feature: $$...$$ that follows text without blank line should be block math
    const input = `Or if the equation follow the previous line without an empty line
$$E=mc^2$$
It is considered as a block equation.`;
    const ast = parser.parse(input);
    const html = renderer.render(ast).html;
    
    // Should contain a block math element
    expect(html).toContain('katex-display');
  });

  it('should still render standalone $$...$$ as block math', () => {
    const input = '$$E=mc^2$$';
    const ast = parser.parse(input);
    const html = renderer.render(ast).html;
    
    expect(html).toContain('katex-display');
  });

  it('should render $...$ as inline math', () => {
    const input = 'The equation $E=mc^2$ is famous.';
    const ast = parser.parse(input);
    const html = renderer.render(ast).html;
    
    // Should contain inline math (not display)
    expect(html).toContain('katex');
    expect(html).not.toContain('katex-display');
  });
});
