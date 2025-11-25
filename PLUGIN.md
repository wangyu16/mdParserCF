# Plugin System Design

This document describes the design and architecture of the mdParserCF plugin system.

## Overview

The plugin system allows extending the markdown parser with custom syntax patterns using the `{{pluginName ...}}` notation. Plugins can transform custom syntax into HTML elements during parsing.

## Plugin Classification

Plugins are classified along two independent axes:

### 1. Input Type (Parsing Behavior)

Determines how the plugin syntax is detected and extracted from the source:

| Input Type | Description                                | Pattern Location                                       |
| ---------- | ------------------------------------------ | ------------------------------------------------------ |
| **Inline** | Single-line content within `{{...}}`       | Can appear within paragraphs, alongside other text     |
| **Block**  | Multi-line content spanning multiple lines | Must be standalone, processed before paragraph parsing |

### 2. Output Type (Rendering Behavior)

Determines the HTML element type produced:

| Output Type | Description                        | HTML Result                           |
| ----------- | ---------------------------------- | ------------------------------------- |
| **Inline**  | Produces inline HTML elements      | `<span>`, `<img>`, `<a>`, etc.        |
| **Block**   | Produces block-level HTML elements | `<div>`, `<iframe>`, `<figure>`, etc. |

### Classification Matrix

| Plugin     | Input Type | Output Type | Example                                                     |
| ---------- | ---------- | ----------- | ----------------------------------------------------------- |
| `emoji`    | Inline     | Inline      | `{{emoji smile}}` → `😊`                                    |
| `badge`    | Inline     | Inline      | `{{badge info: Note}}` → `<span class="badge">`             |
| `smiles`   | Inline     | Inline      | `{{smiles CCO}}` → `<div class="smiles-container">`         |
| `reaction` | Inline     | Inline      | `{{reaction A>B>C}}` → `<div class="reaction-container">`   |
| `youtube`  | Inline     | Block       | `{{youtube dQw4w9WgXcQ}}` → `<iframe>`                      |
| `markdown` | Block      | Block       | `{{markdown https://...}}` → `<div class="markdown-embed">` |
| `diagram`  | Block      | Block       | `{{diagram mermaid\n...\n}}` → `<div class="mermaid">`      |

> **Note**: The `smiles` and `reaction` plugins produce container `<div>` elements for technical reasons (canvas/SVG rendering), but semantically they are inline chemical notations. They are classified as inline-input/inline-output because they appear within text flow.

> **Note**: The `markdown` plugin takes a single-line URL but is classified as block-input because it must stand alone (not within paragraph text) and produces block-level content.

## Plugin Interface

```typescript
interface Plugin {
  name: string; // Plugin identifier (e.g., 'youtube', 'emoji')
  aliases?: string[]; // Alternative names (e.g., 'md' for 'markdown')
  inputType: 'inline' | 'block'; // How the plugin is parsed
  outputType: 'inline' | 'block'; // What HTML type it produces
  pattern: RegExp; // Regex to match plugin syntax
  handler: PluginHandler; // Function to process matched content
}

type PluginHandler = (content: string) => PluginResult;

interface PluginResult {
  type: 'rendered' | 'fallthrough';
  content?: InlineNode | BlockNode;
}
```

## Built-in Plugins

### Inline Input Plugins

#### `emoji`

Converts emoji shortcodes to Unicode emoji characters.

```markdown
I'm feeling {{emoji happy}} today!
```

**Output**: `I'm feeling 😃 today!`

**Supported emojis**: smile, laugh, happy, sad, angry, thumbsup, thumbsdown, heart, star, fire, rocket, party, thinking, eyes, check, cross

---

#### `badge`

Creates styled badge/label elements.

```markdown
{{badge success: Completed}} {{badge warning: Pending}}
```

**Output**: `<span class="badge badge-success">Completed</span>`

**Types**: success, danger, warning, info, primary, secondary

---

#### `smiles`

Renders chemical structures using SMILES notation (via SmilesDrawer).

```markdown
Ethanol: {{smiles CCO}}
```

**Output**: Canvas element with rendered molecular structure

**Requirements**: SmilesDrawer library loaded in browser

---

#### `reaction`

Renders chemical reaction schemes using reaction SMILES notation.

```markdown
{{reaction C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-]}}
```

**Options**:

```markdown
{{reaction A>B>C | textBelowArrow: 90%, theme: oldschool}}
```

**Output**: SVG element with rendered reaction scheme

---

#### `youtube`

Embeds YouTube videos.

```markdown
Check out this video: {{youtube dQw4w9WgXcQ}}
```

**Output**:

```html
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  frameborder="0"
  allowfullscreen
></iframe>
```

> **Note**: Despite inline input, produces block-level `<iframe>`.

---

#### `markdown` / `md`

Embeds external markdown content from a URL.

```markdown
{{markdown https://example.com/content.md}}
{{md https://raw.githubusercontent.com/user/repo/main/README.md}}
```

**Output**: Fetched markdown content rendered inline

**Features**:

- Server-side fetching in Cloudflare Workers
- Maximum recursion depth of 3 to prevent infinite loops
- Content size limit of 100KB
- HTTPS URL validation

**Security**: Only HTTP(S) URLs are allowed. Content is sanitized during markdown parsing.

---

### Block Input Plugins

#### `diagram`

Renders diagrams using Mermaid.js or other diagramming libraries.

```markdown
{{diagram mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]
}}
```

**Output**:

```html
<div class="mermaid">graph TD A[Start] --> B{Decision} ...</div>
```

**Supported types**: mermaid (more can be added)

---

## Creating Custom Plugins

### Step 1: Define the Plugin

```typescript
import { Plugin, PluginResult, InlineNode } from './plugin-system';

export const myPlugin: Plugin = {
  name: 'myplugin',
  inputType: 'inline',
  outputType: 'inline',
  pattern: /\{\{myplugin\s+([^}]+)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{myplugin\s+([^}]+)\}\}/);
    if (!match || !match[1]) {
      return { type: 'fallthrough' };
    }

    const value = match[1].trim();

    return {
      type: 'rendered',
      content: {
        type: 'html-inline',
        value: `<span class="my-plugin">${value}</span>`,
      } as InlineNode,
    };
  },
};
```

### Step 2: Register the Plugin

```typescript
import { createDefaultPluginRegistry } from './plugin-system';

const registry = createDefaultPluginRegistry();
registry.registerPlugin(myPlugin);
```

### Step 3: Use in Markdown

```markdown
Here is {{myplugin my content}} in a paragraph.
```

---

## Pattern Guidelines

### Inline Input Patterns

For plugins that consume single-line input:

```typescript
// Simple: capture everything until }}
pattern: /\{\{pluginname\s+([^}]+)\}\}/g;

// With specific format: URL
pattern: /\{\{pluginname\s+(https?:\/\/[^\s}]+)\s*\}\}/g;

// With options: content | options
pattern: /\{\{pluginname\s+([^}|]+)(?:\s*\|\s*([^}]+))?\}\}/g;
```

### Block Input Patterns

For plugins that consume multi-line input:

```typescript
// Multi-line with type specifier
pattern: /\{\{pluginname\s+(\w+)\s*\n([\s\S]*?)\}\}/g;
```

---

## Processing Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Markdown Source                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Block Plugin Detection                                     │
│  - Scan for {{plugin\n...\n}} patterns                      │
│  - Match against block plugins (inputType: 'block')         │
│  - Replace with HTML blocks                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Standard Block Parsing                                     │
│  - Headers, paragraphs, lists, code blocks, etc.            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Inline Content Processing                                  │
│  - Within paragraphs, list items, etc.                      │
│  - Protect special syntax (code, math, plugins)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Inline Plugin Detection                                    │
│  - Match {{plugin ...}} patterns                            │
│  - Match against inline plugins (inputType: 'inline')       │
│  - Replace with inline/block HTML                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Server-Side Post-Processing (Cloudflare Workers)           │
│  - Process markdown embeds (fetch external content)         │
│  - Apply any deferred transformations                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Final HTML                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

### Why Separate Input and Output Types?

The original design conflated input parsing behavior with output rendering type. This led to confusion:

- `youtube` was classified as "inline" but produces block `<iframe>`
- `markdown` takes single-line URL but produces block content

By separating these concerns:

1. **Input type** determines _when_ and _how_ the plugin is matched
2. **Output type** determines _what_ HTML structure is produced

### Why Use Placeholders for Server-Side Plugins?

Some plugins (like `markdown`) require server-side processing that can't happen during initial parsing:

1. Fetching external resources
2. Recursive markdown parsing
3. Security validation

The solution:

1. Parser generates placeholder HTML with data attributes
2. Server-side post-processor finds placeholders
3. Async operations (fetch, parse) complete the transformation
4. Final HTML is assembled

### Why Limit Recursion Depth?

The `markdown` plugin could create infinite loops:

- A.md embeds B.md
- B.md embeds A.md

The `MAX_EMBED_DEPTH = 3` limit prevents this while allowing reasonable nesting.

---

## Future Considerations

### Potential New Plugins

| Plugin     | Input  | Output | Description          |
| ---------- | ------ | ------ | -------------------- |
| `include`  | Inline | Block  | Include local files  |
| `toc`      | Inline | Block  | Table of contents    |
| `footnote` | Block  | Mixed  | Extended footnotes   |
| `tabs`     | Block  | Block  | Tabbed content       |
| `collapse` | Block  | Block  | Collapsible sections |

### Plugin Configuration

Future versions may support global plugin configuration:

```typescript
const registry = createPluginRegistry({
  youtube: { width: 800, height: 450 },
  diagram: { theme: 'dark' },
});
```

---

## Version History

| Version | Changes                                                                     |
| ------- | --------------------------------------------------------------------------- |
| 1.0.0   | Initial plugin system with youtube, emoji, smiles, reaction, badge, diagram |
| 1.1.0   | Added markdown/md plugin for URL embedding                                  |
| 1.2.0   | Refactored to separate inputType and outputType (current)                   |
