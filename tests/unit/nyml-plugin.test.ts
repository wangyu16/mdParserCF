/**
 * NYML Plugin Tests
 *
 * Tests for the NYML plugin that parses NYML content and outputs
 * a div with embedded JSON script.
 *
 * NYML is similar to YAML but with key differences:
 * - Root is always a list of entries
 * - All end level values are strings
 * - Multi-value fields create nested lists
 */

import { describe, it, expect } from 'vitest';
import { Parser } from '../../src/parser/parser';
import { HTMLRenderer } from '../../src/renderer/html-renderer';
import { parseNyml, serializeNyml } from '../../src/parser/nyml-parser';

describe('NYML Plugin', () => {
  const parser = new Parser();
  const renderer = new HTMLRenderer();

  function renderMarkdown(markdown: string): string {
    const ast = parser.parse(markdown);
    return renderer.render(ast).html;
  }

  describe('Basic NYML parsing', () => {
    it('should parse simple key-value NYML', () => {
      const markdown = `{{nyml
key: value
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<div');
      expect(html).toContain('class="nyml-data"');
      expect(html).toContain('<script type="application/json">');
      expect(html).toContain('[{"key":"value"}]');
      expect(html).toContain('</script>');
      expect(html).toContain('</div>');
    });

    it('should parse multiple key-value pairs as list', () => {
      const markdown = `{{nyml
name: Alice
age: 25
}}`;
      const html = renderMarkdown(markdown);
      // NYML produces a list at root level
      expect(html).toContain('[{"name":"Alice"},{"age":"25"}]');
    });

    it('should parse nested NYML structures', () => {
      const markdown = `{{nyml
items:
  value1
  value2
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('[{"items":["value1","value2"]}]');
    });

    it('should parse mixed content (strings and key/value)', () => {
      const markdown = `{{nyml
items:
  value1
  child: a
  another plain value
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('[{"items":["value1",{"child":"a"},"another plain value"]}]');
    });

    it('should parse deeply nested structures', () => {
      const markdown = `{{nyml
outer:
  inner:
    a
    b
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('[{"outer":[{"inner":["a","b"]}]}]');
    });
  });

  describe('Multiline values', () => {
    it('should parse multiline string with pipe syntax', () => {
      const markdown = `{{nyml
description: |
  This is a
  multiline value
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('class="nyml-data"');
      // The JSON should contain the multiline string
      expect(html).toContain('"description"');
      expect(html).toContain('This is a');
    });

    it('should handle multiline with proper indentation', () => {
      const markdown = `{{nyml
markdown-example: |
  # Head
  This is content
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"markdown-example"');
    });
  });

  describe('Special characters handling', () => {
    it('should handle colons in values', () => {
      const markdown = `{{nyml
url: http://example.com
time: 10:30:00
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"url":"http://example.com"');
      expect(html).toContain('"time":"10:30:00"');
    });

    it('should handle quoted keys with colons', () => {
      const markdown = `{{nyml
"http:key": value
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"http:key":"value"');
    });

    it('should handle hash symbols (no comments in NYML)', () => {
      const markdown = `{{nyml
tag: #hashtag
comment: # this is not a comment
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"tag":"#hashtag"');
      expect(html).toContain('"comment":"# this is not a comment"');
    });

    it('should handle unicode characters', () => {
      const markdown = `{{nyml
greeting: 你好世界
emoji: 🎉
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"greeting":"你好世界"');
      expect(html).toContain('"emoji":"🎉"');
    });
  });

  describe('Output structure', () => {
    it('should have display:none style on the div', () => {
      const markdown = `{{nyml
key: value
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('style="display:none;"');
    });

    it('should have unique id on each nyml block', () => {
      const markdown = `{{nyml
first: block
}}

{{nyml
second: block
}}`;
      const html = renderMarkdown(markdown);
      const idMatches = html.match(/id="nyml-[a-z0-9]+"/g);
      expect(idMatches).toHaveLength(2);
      expect(idMatches![0]).not.toBe(idMatches![1]);
    });

    it('should have script type="application/json"', () => {
      const markdown = `{{nyml
key: value
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<script type="application/json">');
    });
  });

  describe('All values are strings', () => {
    it('should keep number-like values as strings', () => {
      const markdown = `{{nyml
count: 42
price: 19.99
}}`;
      const html = renderMarkdown(markdown);
      // NYML treats all values as strings
      expect(html).toContain('"count":"42"');
      expect(html).toContain('"price":"19.99"');
    });

    it('should keep boolean-like values as strings', () => {
      const markdown = `{{nyml
enabled: true
disabled: false
}}`;
      const html = renderMarkdown(markdown);
      // NYML treats all values as strings
      expect(html).toContain('"enabled":"true"');
      expect(html).toContain('"disabled":"false"');
    });

    it('should keep null-like values as strings', () => {
      const markdown = `{{nyml
empty: null
nothing: ~
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"empty":"null"');
      expect(html).toContain('"nothing":"~"');
    });
  });

  describe('Error handling', () => {
    it('should handle NYML block with only key-value', () => {
      const markdown = `{{nyml
key: value
}}`;
      const html = renderMarkdown(markdown);
      // Should produce valid output
      expect(html).toContain('class="nyml-data"');
      expect(html).toContain('[{"key":"value"}]');
    });

    it('should handle NYML block with empty content after newline', () => {
      // Note: Pattern requires newline after {{nyml, so minimal valid block has newline
      const markdown = `{{nyml
key: 
}}`;
      const html = renderMarkdown(markdown);
      // key with empty value should work
      expect(html).toContain('class="nyml-data"');
    });
  });

  describe('Integration with markdown', () => {
    it('should work alongside regular markdown content', () => {
      const markdown = `# Heading

Some paragraph text.

{{nyml
title: Example
}}

More text after the NYML block.`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('<h1');
      expect(html).toContain('Heading');
      expect(html).toContain('<p>Some paragraph text.</p>');
      expect(html).toContain('class="nyml-data"');
      expect(html).toContain('"title":"Example"');
      expect(html).toContain('<p>More text after the NYML block.</p>');
    });

    it('should work with multiple NYML blocks in a document', () => {
      const markdown = `# Config

{{nyml
setting: value1
}}

## Data

{{nyml
data: value2
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('"setting":"value1"');
      expect(html).toContain('"data":"value2"');
    });

    it('should not interfere with code blocks containing nyml', () => {
      const markdown =
        "Here's some NYML example:\n\n```\n{{nyml\nkey: value\n}}\n```\n\nAnd here's an actual NYML plugin:\n\n{{nyml\nreal: data\n}}";
      const html = renderMarkdown(markdown);
      // Code block should be preserved as code
      expect(html).toContain('<pre>');
      expect(html).toContain('<code>');
      // Real NYML should be processed
      expect(html).toContain('"real":"data"');
    });
  });

  describe('Edge cases', () => {
    it('should handle single-item multi-value field', () => {
      const markdown = `{{nyml
item:
  only-one
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('[{"item":["only-one"]}]');
    });

    it('should handle key with child key/value pair', () => {
      const markdown = `{{nyml
item:
  only: one
}}`;
      const html = renderMarkdown(markdown);
      expect(html).toContain('[{"item":[{"only":"one"}]}]');
    });

    it('should differentiate single-line vs multi-value', () => {
      // Single-line: value is "only: one" as a string
      const markdown1 = `{{nyml
item: only: one
}}`;
      const html1 = renderMarkdown(markdown1);
      expect(html1).toContain('[{"item":"only: one"}]');

      // Multi-value: value is a list with key/value pair
      const markdown2 = `{{nyml
item:
  only: one
}}`;
      const html2 = renderMarkdown(markdown2);
      expect(html2).toContain('[{"item":[{"only":"one"}]}]');
    });

    it('should ignore root-level plain strings without colons', () => {
      const markdown = `{{nyml
This is a comment line
key: value
Another ignored line
}}`;
      const html = renderMarkdown(markdown);
      // Only the key:value should be included
      expect(html).toContain('[{"key":"value"}]');
    });
  });
});

describe('NYML Parser Unit Tests', () => {
  describe('parseNyml function', () => {
    it('should parse simple key-value', () => {
      const result = parseNyml('name: Alice\nage: 25');
      expect(result).toEqual([{ name: 'Alice' }, { age: '25' }]);
    });

    it('should parse nested lists', () => {
      const result = parseNyml('items:\n  value1\n  value2');
      expect(result).toEqual([{ items: ['value1', 'value2'] }]);
    });

    it('should parse mixed content', () => {
      const result = parseNyml('items:\n  value1\n  child: a\n  another');
      expect(result).toEqual([{ items: ['value1', { child: 'a' }, 'another'] }]);
    });

    it('should handle multiline strings', () => {
      const result = parseNyml('desc: |\n  line1\n  line2');
      expect(result[0]).toHaveProperty('desc');
      expect((result[0] as any).desc).toContain('line1');
      expect((result[0] as any).desc).toContain('line2');
    });

    it('should handle quoted keys', () => {
      const result = parseNyml('"http:key": value');
      expect(result).toEqual([{ 'http:key': 'value' }]);
    });
  });

  describe('serializeNyml function', () => {
    it('should serialize simple key-value', () => {
      const data: any[] = [{ name: 'Alice' }, { age: '25' }];
      const result = serializeNyml(data);
      expect(result).toContain('name: Alice');
      expect(result).toContain('age: 25');
    });

    it('should serialize nested lists', () => {
      const data: any[] = [{ items: ['value1', 'value2'] }];
      const result = serializeNyml(data);
      expect(result).toContain('items:');
      expect(result).toContain('value1');
      expect(result).toContain('value2');
    });

    it('should quote keys with colons', () => {
      const data: any[] = [{ 'http:key': 'value' }];
      const result = serializeNyml(data);
      expect(result).toContain('"http:key"');
    });
  });

  describe('Round-trip parsing', () => {
    it('should preserve data through parse -> serialize -> parse', () => {
      const original = 'name: Alice\nage: 25';
      const parsed = parseNyml(original);
      const serialized = serializeNyml(parsed);
      const reparsed = parseNyml(serialized);
      expect(reparsed).toEqual(parsed);
    });

    it('should preserve nested data through round-trip', () => {
      const original = 'items:\n  value1\n  child: a';
      const parsed = parseNyml(original);
      const serialized = serializeNyml(parsed);
      const reparsed = parseNyml(serialized);
      expect(reparsed).toEqual(parsed);
    });
  });
});
