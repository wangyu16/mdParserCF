># Math Formulas & Plugin System Guide

**Project:** mdParserCF  
**Version:** 0.0.1  
**Date:** November 5, 2025  
**Status:** ✅ Complete - 223 Tests Passing

---

## 📋 Table of Contents

- [Math Formulas](#math-formulas)
  - [Inline Math](#inline-math)
  - [Block Math](#block-math)
  - [MathJax Integration](#mathjax-integration)
  - [Examples](#math-examples)
- [Plugin System](#plugin-system)
  - [Architecture](#plugin-architecture)
  - [Built-in Plugins](#built-in-plugins)
  - [Creating Custom Plugins](#custom-plugins)
  - [Examples](#plugin-examples)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

---

## 🧮 Math Formulas

Math formula support allows you to embed mathematical expressions in your markdown using TeX/LaTeX syntax. The parser supports both inline math and block-level math expressions.

### Inline Math

Inline math expressions are wrapped with single dollar signs (`$`).

**Syntax:**
```markdown
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$, which solves...
```

**Rendered as:**
```html
<p>The quadratic formula is <script type="math/tex">x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}</script>, which solves...</p>
```

**Features:**
- Parse within paragraph text
- Multiple formulas per paragraph
- Works with all markdown elements
- Preserves TeX/LaTeX syntax exactly

### Block Math

Block-level math expressions are wrapped with double dollar signs (`$$`) on separate lines.

**Syntax:**
```markdown
Here is a proof:

$$
\begin{align}
E &= mc^2 \\
F &= ma
\end{align}
$$

This proves...
```

**Rendered as:**
```html
<div class="math-block">
<script type="math/tex; mode=display">
\begin{align}
E &= mc^2 \\
F &= ma
\end{align}
</script>
</div>
```

**Features:**
- Display mode rendering
- Multiline formulas
- Centered display
- Wrapped in `<div class="math-block">`
- Wrapped in MathJax display mode script tags

### MathJax Integration

All math is rendered with MathJax script tags. To display math in HTML, include MathJax library:

**In HTML Head:**
```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
```

**Configuration (Optional):**
```html
<script>
MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
```

### Math Examples

#### Basic Formulas
```markdown
- Pythagorean theorem: $a^2 + b^2 = c^2$
- Einstein: $E = mc^2$
- Quadratic: $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$
```

#### Chemical Equations
```markdown
$$
2H_2 + O_2 \rightarrow 2H_2O
$$
```

#### Matrices
```markdown
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$
```

#### Greek Letters
```markdown
- Alpha: $\alpha$
- Beta: $\beta$
- Gamma: $\gamma$
- Delta: $\delta$
- Sigma: $\Sigma \sum$
```

#### Complex Analysis
```markdown
$$
f(z) = \sum_{n=0}^{\infty} a_n z^n
$$
```

---

## 🔌 Plugin System

The plugin system provides an extensible architecture for custom markdown syntax. Create plugins for domain-specific content like embedded media, chemical notation, custom badges, diagrams, and more.

### Plugin Architecture

**Plugin Registry:**
```typescript
const registry = new PluginRegistry();
registry.registerInlinePlugin(customPlugin);
registry.registerBlockPlugin(customPlugin);
```

**Plugin Interface:**
```typescript
interface Plugin {
  name: string;           // Unique plugin identifier
  pattern: RegExp;        // Pattern to match
  handler: Function;      // Processing function
  type: 'inline' | 'block'; // Node type
}
```

**Handler Result:**
```typescript
interface PluginResult {
  type: 'rendered' | 'fallthrough';
  content?: string | InlineNode | BlockNode;
}
```

### Built-in Plugins

#### 1. YouTube Embed Plugin

**Syntax:**
```markdown
{{youtube dQw4w9WgXcQ}}
```

**Output:**
```html
<iframe width="560" height="315" 
  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
  frameborder="0" allow="accelerometer; autoplay; clipboard-write; 
  encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen></iframe>
```

**Features:**
- Inline plugin
- 560x315 default dimensions
- Full iframe attributes for security
- Supports auto-play, fullscreen, encrypted media

**Examples:**
```markdown
Check out this video: {{youtube dQw4w9WgXcQ}}

Or this tutorial: {{youtube W0mJ4zEYLr4}}
```

#### 2. Emoji Plugin

**Syntax:**
```markdown
{{emoji smile}}
{{emoji thumbsup}}
{{emoji rocket}}
```

**Supported Emojis:**
- Faces: smile, laugh, happy, sad, angry, thinking
- Hands: thumbsup, thumbsdown
- Objects: heart, star, fire, rocket, party, eyes, check, cross

**Output:**
```html
<p>Great! {{emoji thumbsup}} Let's {{emoji rocket}} to the moon!</p>
```

**Examples:**
```markdown
- Success! {{emoji check}}
- This is {{emoji fire}}
- Love it! {{emoji heart}}
- Party time {{emoji party}}
```

#### 3. SMILES Notation Plugin

SMILES (Simplified Molecular Input Line Entry System) for chemical structures.

**Syntax:**
```markdown
Ethanol molecule: {{smiles CCO}}
```

**Output:**
```html
<span class="smiles" data-smiles="CCO" title="SMILES: CCO">[CCO]</span>
```

**Features:**
- Supported characters: `A-Za-z0-9-()=#+\/%@`
- Data attribute stores SMILES string
- Title tooltip with formula
- Can be rendered with SMILES visualizer (e.g., ChemDoodle)

**Examples:**
```markdown
- Methane: {{smiles C}}
- Ethane: {{smiles CC}}
- Methanol: {{smiles CO}}
- Benzene: {{smiles c1ccccc1}}
- Glucose: {{smiles C([C@@H](C([C@H]([C@H](C=O)O)O)O)O)O}}
```

#### 4. Badge/Alert Plugin

**Syntax:**
```markdown
{{badge success: All tests passed}}
{{badge warning: Deprecation notice}}
{{badge danger: Critical error}}
```

**Supported Types:**
- `success` - Green badge
- `danger` - Red badge
- `warning` - Yellow badge
- `info` - Blue badge
- `primary` - Primary color
- `secondary` - Secondary color

**Output:**
```html
<span class="badge badge-success">All tests passed</span>
```

**Examples:**
```markdown
Status: {{badge success: Deployed}}
API: {{badge warning: Beta version}}
Security: {{badge danger: Review needed}}
Info: {{badge info: Documentation available}}
```

#### 5. Diagram Plugin (Mermaid)

**Syntax:**
```markdown
{{diagram mermaid
graph TD
    A --> B
    B --> C
}}
```

**Supported Diagram Types:**
- Flowchart (graph)
- Sequence diagrams
- Gantt charts
- Class diagrams
- State diagrams
- Pie charts

**Output:**
```html
<div class="mermaid">
graph TD
    A --> B
    B --> C
</div>
<script async src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
```

**Examples:**

**Flowchart:**
```markdown
{{diagram mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D
}}
```

**Sequence Diagram:**
```markdown
{{diagram mermaid
sequenceDiagram
    participant A as Actor
    participant B as Backend
    A->>B: Request
    B->>B: Process
    B-->>A: Response
}}
```

**Gantt Chart:**
```markdown
{{diagram mermaid
gantt
    title Project Timeline
    section Tasks
    Task A :a1, 0, 30d
    Task B :after a1, 20d
    Task C :b1, 10d, 15d
}}
```

### Creating Custom Plugins

**Step 1: Define Plugin Handler**
```typescript
import { Plugin, PluginResult, InlineNode } from './parser/plugin-system';

const myPlugin: Plugin = {
  name: 'myfeature',
  pattern: /\{\{myfeature\s+([^}]+)\}\}/g,
  type: 'inline',
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{myfeature\s+([^}]+)\}\}/);
    if (!match || !match[1]) {
      return { type: 'fallthrough' };
    }

    const value = match[1].trim();
    return {
      type: 'rendered',
      content: {
        type: 'html-inline',
        value: `<span class="myfeature">${value}</span>`,
      } as InlineNode,
    };
  },
};
```

**Step 2: Register Plugin**
```typescript
import { createDefaultPluginRegistry } from './parser/plugin-system';

const registry = createDefaultPluginRegistry();
registry.registerInlinePlugin(myPlugin);
```

**Step 3: Use in Parser**
```typescript
const parser = new Parser({
  enablePlugins: true,
  plugins: { myfeature: myPlugin.handler },
});
```

### Plugin Examples

#### Link Preview Plugin
```typescript
const linkPreviewPlugin: Plugin = {
  name: 'preview',
  pattern: /\{\{preview\s+(.+?)\}\}/g,
  type: 'inline',
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{preview\s+(.+?)\}\}/);
    if (!match) return { type: 'fallthrough' };
    
    const url = match[1];
    return {
      type: 'rendered',
      content: {
        type: 'html-inline',
        value: `<a href="${url}" class="preview" data-url="${url}">Preview</a>`,
      } as InlineNode,
    };
  },
};
```

#### Code Highlight Plugin
```typescript
const highlightPlugin: Plugin = {
  name: 'highlight',
  pattern: /\{\{highlight\s+(\w+)\s+(.+?)\}\}/g,
  type: 'inline',
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{highlight\s+(\w+)\s+(.+?)\}\}/);
    if (!match) return { type: 'fallthrough' };
    
    const [, color, text] = match;
    return {
      type: 'rendered',
      content: {
        type: 'html-inline',
        value: `<mark style="background-color: ${color}">${text}</mark>`,
      } as InlineNode,
    };
  },
};
```

#### Info Box Plugin
```typescript
const infoBoxPlugin: Plugin = {
  name: 'infobox',
  pattern: /\{\{infobox\s+(\w+)\s*\n([\s\S]*?)\}\}/,
  type: 'block',
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{infobox\s+(\w+)\s*\n([\s\S]*?)\}\}/);
    if (!match) return { type: 'fallthrough' };
    
    const [, type, body] = match;
    return {
      type: 'rendered',
      content: {
        type: 'html-block',
        content: `<div class="infobox infobox-${type}">${body}</div>`,
      } as BlockNode,
    };
  },
};
```

---

## 📚 API Reference

### Parser Options

```typescript
interface ParserOptions {
  debugAST?: boolean;              // Enable debug output
  enableMath?: boolean;             // Enable math formulas (default: true)
  enableCustomContainers?: boolean; // Enable custom containers (default: true)
  enableFootnotes?: boolean;        // Enable footnotes (default: true)
  enablePlugins?: boolean;          // Enable plugin system (default: true)
  plugins?: Record<string, PluginHandler>;
  maxNestingDepth?: number;         // Max nesting depth (default: 10)
}
```

### Parser Usage

```typescript
// With math enabled
const parser = new Parser({ enableMath: true });
const ast = parser.parse('$E = mc^2$');

// With custom plugins
const registry = createDefaultPluginRegistry();
const customParser = new Parser({ 
  enablePlugins: true,
  plugins: {
    youtube: youtubePlugin.handler,
  }
});
```

### Renderer Output

```typescript
interface HTMLOutput {
  html: string;
  footnotes?: string;
  metadata?: Record<string, any>;
}

const renderer = new HTMLRenderer();
const output = renderer.render(ast);
console.log(output.html);
```

---

## ✅ Best Practices

### Math Writing

1. **Space Around Delimiters:**
   ```markdown
   ✓ Good: This is $x^2$ in text.
   ✗ Bad: This is$x^2$in text.
   ```

2. **Complex Formulas:**
   ```markdown
   ✓ Use block math for complex multi-line formulas
   ✓ Use inline math for simple expressions
   ```

3. **Escaping:**
   ```markdown
   ✓ LaTeX special characters: \_, \$, \{, \}
   ✗ Don't escape inside math: $ \$ → $$$ (3 dollars)
   ```

### Plugin Development

1. **Always Return PluginResult:**
   ```typescript
   ✓ return { type: 'fallthrough' } when no match
   ✗ return undefined or null
   ```

2. **Validate Content:**
   ```typescript
   ✓ Check match groups exist
   ✗ Assume regex always matches
   ```

3. **Escape User Input:**
   ```typescript
   ✓ Use escapeHtml() for user data
   ✗ Render user input directly in HTML
   ```

4. **Use Appropriate Node Type:**
   ```typescript
   ✓ inline plugin → type: 'inline', creates InlineNode
   ✗ inline plugin → type: 'block'
   ```

### Testing

```typescript
// Test math parsing
it('should parse inline math', () => {
  const parser = new Parser({ enableMath: true });
  const ast = parser.parse('$x^2$');
  expect(ast.children[0].children).toContainEqual({
    type: 'inline-math',
    content: 'x^2'
  });
});

// Test plugin functionality
it('should handle custom plugin', () => {
  const result = customPlugin.handler('{{custom value}}');
  expect(result.type).toBe('rendered');
  expect(result.content).toBeDefined();
});
```

---

## 📊 Test Coverage

**Total Tests: 223**
- Parser tests: 92
- Renderer tests: 87
- Math tests: 15
- Plugin tests: 29

**All Features Tested:**
- ✅ Inline math parsing and rendering
- ✅ Block math parsing and rendering
- ✅ Math with special characters
- ✅ Plugin registration and execution
- ✅ Built-in plugins (5 total)
- ✅ Plugin fallthrough handling
- ✅ Multiple instances per document

---

## 🐛 Troubleshooting

### Math Not Rendering

**Problem:** `$x^2$` appears as plain text

**Solutions:**
1. Check `enableMath: true` in parser options
2. Ensure MathJax script is loaded in HTML
3. Verify dollar signs are not escaped in markdown

### Plugin Not Executing

**Problem:** `{{plugin content}}` not processed

**Solutions:**
1. Check plugin is registered: `registry.registerInlinePlugin(plugin)`
2. Verify `enablePlugins: true` in parser options
3. Check pattern regex matches your syntax
4. Ensure handler returns valid PluginResult

### HTML Escaping Issues

**Problem:** Special characters appearing as entities

**Solutions:**
1. For display: ✓ escapeHtml() is correct
2. For code: Use `<code>` or `<pre>` tags
3. For math: Use raw math format, not escaped HTML

---

## 🚀 Next Steps

1. **Integration Testing:** Test math/plugins with real-world markdown
2. **Performance Optimization:** Profile parser with large documents
3. **Additional Plugins:** Create more specialized plugins as needed
4. **Documentation:** Add usage examples to main README

---

**Version:** 0.0.1  
**Last Updated:** November 5, 2025  
**Status:** ✅ Complete
