# Examples

This folder contains examples demonstrating the capabilities of mdParserCF.

## Files

### `features.md` (14 KB, 716 lines)

A comprehensive showcase of all supported markdown features and plugins:

**Core Features (15 sections)**
- Headings (h1-h6)
- Emphasis, strikethrough, underline, highlight, superscript, subscript
- Lists (unordered, ordered, nested, mixed)
- Links (inline, reference-style, auto-links)
- Images
- Code (inline and fenced blocks)
- Blockquotes
- Horizontal rules
- HTML passthrough

**Phase 1 Extensions (7 sections)**
- Tables (GFM with alignment)
- Footnotes
- Custom containers (block and inline)
- Extended link types
- Auto-links

**Advanced Features (9 sections)**
- Math formulas (inline and block)
- Chemistry formulas with mhchem
- YouTube embeds
- Emoji insertion
- SMILES chemical structures
- Custom badges
- Mermaid diagrams

**Complex Scenarios (26 sections)**
- Nested lists with formatting
- Tables inside blockquotes
- Code with special characters
- Escaping edge cases
- Overlapping syntax (math vs emphasis, plugins vs code)
- Nested emphasis and strikethrough
- List items with multiple paragraphs
- Reference links with special naming
- HTML edge cases
- Math in various contexts
- Emoji in various contexts
- Consecutive special elements
- Ambiguous syntax cases
- Unicode and special characters
- Performance edge cases
- Real-world workflow examples

**Plus Real-World Examples:**
- Chemical workflow combining multiple features
- Learning module with embedded content

## How to Use

1. **Read the file**: View `features.md` to see all supported syntax
2. **Copy examples**: Use snippets from this file in your own markdown
3. **Test the parser**: Process this file through mdParserCF to see it rendered
4. **Reference guide**: Use as documentation for markdown syntax support

## Quick Feature Map

| Section | Examples | Notes |
|---------|----------|-------|
| Core Markdown | 1-9 | CommonMark compliance |
| Extensions | 10-15 | Phase 1 enhancements |
| Advanced | 16-21 | Math, chemistry, plugins |
| Nesting | 22-36 | Complex scenarios |
| Edge Cases | 37-42 | Escaping, conflicts, Unicode |

## Testing with mdParserCF

To use this file with mdParserCF:

```typescript
import { parseMarkdown, renderMarkdown } from 'mdparser';
import fs from 'fs';

const markdown = fs.readFileSync('examples/features.md', 'utf-8');
const html = renderMarkdown(markdown);
console.log(html);
```

## Coverage

This file covers **all 232 supported features** including:
- ✅ 92 parser test scenarios
- ✅ 87 renderer test scenarios  
- ✅ 35 plugin test scenarios
- ✅ 18 math/chemistry test scenarios

Total: **42 comprehensive examples** with nested combinations

---

**Generated**: November 5, 2025  
**Size**: 14 KB (716 lines)  
**Coverage**: All Phase 1 features + advanced plugins + edge cases
