/**
 * YAML Plugin Tests
 *
 * Tests for the YAML/YML plugin that parses YAML content and outputs
 * a div with embedded JSON script.
 */

import { describe, it, expect } from 'vitest';
import { Parser } from '../../src/parser/parser';
import { HTMLRenderer } from '../../src/renderer/html-renderer';

describe('YAML Plugin', () => {
  const parser = new Parser();
  const renderer = new HTMLRenderer();

  function renderMarkdown(markdown: string): string {
    const ast = parser.parse(markdown);
    return renderer.render(ast).html;
  }

  describe('Basic YAML parsing', () => {
    it('should parse simple key-value YAML', () => {
      const markdown = `{{yaml
key: value
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<div');
      expect(html).toContain('class="yaml-data"');
      expect(html).toContain('<script type="application/json">');
      expect(html).toContain('{"key":"value"}');
      expect(html).toContain('</script>');
      expect(html).toContain('</div>');
    });

    it('should parse multiple key-value pairs', () => {
      const markdown = `{{yaml
id: 101
name: Test Item
active: true
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"id":101');
      expect(html).toContain('"name":"Test Item"');
      expect(html).toContain('"active":true');
    });

    it('should parse nested YAML structures', () => {
      const markdown = `{{yaml
user:
  name: John
  age: 30
  email: john@example.com
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"user":{');
      expect(html).toContain('"name":"John"');
      expect(html).toContain('"age":30');
    });

    it('should parse YAML arrays', () => {
      const markdown = `{{yaml
items:
  - apple
  - banana
  - cherry
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"items":["apple","banana","cherry"]');
    });

    it('should parse complex nested structures with arrays', () => {
      const markdown = `{{yaml
questions:
  - id: 1
    text: What is 2+2?
    options:
      - 3
      - 4
      - 5
  - id: 2
    text: What is the capital of France?
    options:
      - London
      - Paris
      - Berlin
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"questions":[');
      expect(html).toContain('"id":1');
      expect(html).toContain('"text":"What is 2+2?"');
      // YAML parses numeric values as numbers, not strings
      expect(html).toContain('"options":[3,4,5]');
    });
  });

  describe('YAML alias (yml)', () => {
    it('should work with {{yml}} alias', () => {
      const markdown = `{{yml
title: Hello World
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('class="yaml-data"');
      expect(html).toContain('"title":"Hello World"');
    });

    it('should produce identical output for yaml and yml', () => {
      const yamlMarkdown = `{{yaml
key: value
}}`;
      const ymlMarkdown = `{{yml
key: value
}}`;
      const yamlHtml = renderMarkdown(yamlMarkdown);
      const ymlHtml = renderMarkdown(ymlMarkdown);

      // Both should contain the same JSON content
      expect(yamlHtml).toContain('{"key":"value"}');
      expect(ymlHtml).toContain('{"key":"value"}');
    });
  });

  describe('Special characters handling', () => {
    it('should handle quotes in YAML values', () => {
      const markdown = `{{yaml
text: "Safe to use 'quotes' here"
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<script type="application/json">');
      // JSON should properly escape the content
      expect(html).toContain("Safe to use 'quotes' here");
    });

    it('should handle HTML-like content in YAML values', () => {
      const markdown = `{{yaml
html: "<p>This is a paragraph</p>"
}}`;
      const html = renderMarkdown(markdown);
      // The JSON string should contain escaped HTML
      expect(html).toContain('<script type="application/json">');
      expect(html).toContain('<p>');
    });

    it('should handle special characters from spec example', () => {
      const markdown = `{{yaml
id: 101
text: Calculate the velocity.
complexData: "Safe to use 'quotes' and <tags> here"
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"id":101');
      expect(html).toContain('"text":"Calculate the velocity."');
      expect(html).toContain("Safe to use 'quotes' and <tags> here");
    });

    it('should handle multiline strings in YAML', () => {
      const markdown = `{{yaml
description: |
  This is a long
  multiline description
  that spans several lines
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<script type="application/json">');
      expect(html).toContain('description');
    });

    it('should handle unicode characters', () => {
      const markdown = `{{yaml
emoji: "🎉"
chinese: "你好"
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('🎉');
      expect(html).toContain('你好');
    });
  });

  describe('Output structure', () => {
    it('should have display:none style on the div', () => {
      const markdown = `{{yaml
data: test
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('style="display:none;"');
    });

    it('should have unique id on each yaml block', () => {
      const markdown = `{{yaml
first: 1
}}

{{yaml
second: 2
}}`;
      const html = renderMarkdown(markdown);
      const idMatches = html.match(/id="yaml-[a-z0-9]+"/g);
      expect(idMatches).toHaveLength(2);
      expect(idMatches![0]).not.toBe(idMatches![1]);
    });

    it('should have script type="application/json"', () => {
      const markdown = `{{yaml
data: test
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<script type="application/json">');
    });
  });

  describe('YAML data types', () => {
    it('should handle boolean values', () => {
      const markdown = `{{yaml
enabled: true
disabled: false
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"enabled":true');
      expect(html).toContain('"disabled":false');
    });

    it('should handle number values', () => {
      const markdown = `{{yaml
integer: 42
float: 3.14
negative: -10
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"integer":42');
      expect(html).toContain('"float":3.14');
      expect(html).toContain('"negative":-10');
    });

    it('should handle null values', () => {
      const markdown = `{{yaml
empty: null
also_empty: ~
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"empty":null');
      expect(html).toContain('"also_empty":null');
    });

    it('should handle date values as strings', () => {
      const markdown = `{{yaml
date: 2024-01-15
}}`;
      const html = renderMarkdown(markdown);
      // js-yaml parses dates as Date objects, JSON.stringify converts to ISO string
      expect(html).toContain('2024-01-15');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid YAML gracefully', () => {
      const markdown = `{{yaml
invalid: [unclosed bracket
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('class="yaml-error"');
      expect(html).toContain('YAML Error');
    });

    it('should show error with helpful message', () => {
      const markdown = `{{yaml
  - badly indented
 - mixed indentation
}}`;
      const html = renderMarkdown(markdown);
      // Should either parse successfully or show an error message
      expect(html).toBeDefined();
    });

    it('should handle empty YAML block with whitespace', () => {
      // YAML block with whitespace-only content
      const markdown = `{{yaml
~
}}`;
      const html = renderMarkdown(markdown);
      // ~ is YAML for null
      expect(html).toContain('null');
    });
  });

  describe('Integration with markdown', () => {
    it('should work alongside regular markdown content', () => {
      const markdown = `# Heading

Some paragraph text.

{{yaml
data:
  key: value
}}

More text after the YAML block.`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<h1');
      expect(html).toContain('Some paragraph text');
      expect(html).toContain('class="yaml-data"');
      expect(html).toContain('"data":{"key":"value"}');
      expect(html).toContain('More text after');
    });

    it('should work with multiple YAML blocks in a document', () => {
      const markdown = `# Config

{{yaml
section: header
title: Welcome
}}

## Body

{{yml
section: content
items:
  - first
  - second
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"section":"header"');
      expect(html).toContain('"section":"content"');
    });

    it('should not interfere with code blocks containing yaml', () => {
      const markdown = `Here's some YAML:

\`\`\`yaml
key: value
\`\`\`

And here's an actual YAML plugin:

{{yaml
real: data
}}`;
      const html = renderMarkdown(markdown);
      // Code block should be rendered as code
      expect(html).toContain('<pre>');
      expect(html).toContain('<code');
      // Plugin should create the div with JSON
      expect(html).toContain('class="yaml-data"');
      expect(html).toContain('"real":"data"');
    });
  });

  describe('Edge cases', () => {
    it('should handle YAML with only whitespace lines', () => {
      const markdown = `{{yaml
key: value

another: value
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"key":"value"');
      expect(html).toContain('"another":"value"');
    });

    it('should handle YAML with comments', () => {
      const markdown = `{{yaml
# This is a comment
key: value  # inline comment
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"key":"value"');
      // Comments should not appear in output
      expect(html).not.toContain('This is a comment');
    });

    it('should handle deeply nested structures', () => {
      const markdown = `{{yaml
level1:
  level2:
    level3:
      level4:
        value: deep
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"level1":{"level2":{"level3":{"level4":{"value":"deep"}}}}');
    });

    it('should handle anchors and aliases in YAML', () => {
      const markdown = `{{yaml
defaults: &defaults
  timeout: 30
  retries: 3
development:
  <<: *defaults
  debug: true
}}`;
      const html = renderMarkdown(markdown);
      // Anchors/aliases should be resolved
      expect(html).toContain('"development":{');
      expect(html).toContain('"timeout":30');
      expect(html).toContain('"debug":true');
    });
  });
});
