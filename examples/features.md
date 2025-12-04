# mdParserCF Features Showcase

This file demonstrates all supported markdown features in mdParserCF, including complex nesting scenarios, escaping, and edge cases.

{{toc }}

### Key Features

- Supports mixed HTML and Markdown; HTML passthrough preserves tags with Markdown inside.
- Enforces standardized syntax; alternative or legacy Markdown variants are intentionally unsupported.
- Built-in KaTeX math, with mhchem for chemical formulas (inline and block).
- Robust handling of complex nesting, overlapping syntax, and escaping edge cases.
  - Except some very complicated ones, which are not likely to be used any way.
- Allows creating HTML containers like <div> and <span> with class names using reserved Markdown syntax.
- Use HTML comment syntax to pass attributes to an image.
- Extensible plugin system: emoji, badges, SMILES, YouTube, Mermaid, markdown, qrcode, YAML, NYML, and more.
- Blank (empty) line = paragraph break (new paragraph).
- Hard line break inside a paragraph is created by:
  - Two spaces at the end of a line, then newline
  - An explicit `<br>` tag
  - A single newline without one of the above is rendered as a space.

---

# 1. Core Markdown Features

## 1.1. Headings

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

**Note**:

- Headings can contain emphasis: ## _Important_ Section
- Do not accept other heading syntax

## 1.2. Emphasis & Styling

**Standard inline styling:**

**Bold text** and _italic text_ and **_bold italic_**

**Extended inline styling:**

~~Strikethrough text~~ shows deleted content

++Underlined text++ for emphasis

==Highlighted text== for important points

Superscript: E=mc^2^ is the famous equation

Subscript: H~2~O is water

**Complex**: **_~~bold italic strikethrough~~_** text

## 1.3. Lists

### Unordered Lists

Simple list

- Item 1
- Item 2
- Item 3

* Item 1
* Item 2
* Item 3

Checkbox list

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

Nested list

- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
    - Deeply nested 2.2.1
    - Deeply nested 2.2.2
- Item 3

### Ordered Lists

Simple list

1. Item 1
1. Item 2
1. Item 3

Nested list

1. First item
2. Second item
   1. Nested first
   2. Nested second
3. Third item
   1. Another nested
      1. Triple nested

### Mixed Lists

1. First ordered
   - Unordered under ordered
   - Another bullet
2. Second ordered
   - Bullet with **bold**
   - Bullet with _italic_

## 1.4. Links

[Inline link](https://example.com)

[Reference-style link][ref1]

[Another reference][ref2]

Auto-link: <https://example.com>

Email auto-link: <user@example.com>

[ref1]: https://example.com
[ref2]: https://google.com

## 1.5. Images

Standard markdown syntax to insert an image.

![Markdown logo](https://markdown-here.com/img/icon256.png)

This Markdown parser supports passing attributes via HTML comments (<!-- -->) placed directly after an image element. This approach ensures compatibility with other Markdown parsers, as the comments are ignored during rendering and do not interfere with the output. See following examples.

![Markdown logo](https://markdown-here.com/img/icon256.png)<!-- title="Image" -->

![Markdown logo](https://markdown-here.com/img/icon256.png)<!-- width="100px" -->

![Markdown logo](https://markdown-here.com/img/icon256.png)<!-- style="border:5px solid black" -->

Image with a link.

[![Markdown logo](https://markdown-here.com/img/icon256.png)](https://example.com)

Clickable image with attributes (click the image to navigate, attributes control image size/style).

[![Markdown logo](https://markdown-here.com/img/icon256.png)<!-- width="100px" -->](https://example.com)

[![Markdown logo](https://markdown-here.com/img/icon256.png)<!-- style="border:5px solid black" -->](https://example.com))

Reference-style clickable image (link URL defined separately).

[![Markdown logo](https://markdown-here.com/img/icon256.png)][example-link]

[example-link]: https://example.com 'Example Site'

## 1.6. Code

Inline code: `const x = 42;`

Complex inline code with special chars: `function() { return "test"; }`

### Code Block (JavaScript)

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return true;
}
```

### Code Block (Python)

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

### Code Block (Plain)

```
Plain text code block
with multiple lines
  and indentation
```

## 1.7. Blockquotes

> Single level blockquote
> Second line of blockquote

> Nested blockquote:
>
> > This is nested
> > Multiple lines
> >
> > > Even deeper nesting

> Blockquote with **bold**, _italic_, and ~~strikethrough~~

## 1.8. Horizontal Rules

---

## 1.9. HTML Passthrough

You can combine HTML labeling with markdown to add HTML elements directly in your markdown file.

<span class="custom">A _sentence_.</span>

<p>A paragraph.</p>

<div class="custom">
Custom HTML content can be embedded and markdown works inside:

- List item 1
- List item 2

**Bold text** inside HTML blocks

</div>

---

## 1.10. Tables (GFM)

| Feature | Status     | Priority |
| ------- | ---------- | -------- |
| Tables  | ✅ Working | High     |
| Math    | ✅ Working | High     |
| Plugins | ✅ Working | High     |

### Table with Alignment

| Left         |     Center     |         Right |
| :----------- | :------------: | ------------: |
| Left aligned | Center aligned | Right aligned |
| Text         |   More text    |    Final text |

### Complex Table with Formatting

| **Bold Header**    | _Italic Header_    | ~~Strikethrough~~                |
| ------------------ | ------------------ | -------------------------------- |
| Regular cell       | `code cell`        | [Link cell](https://example.com) |
| Cell with **bold** | Cell with _italic_ | Cell with ++underline++          |

## 1.11. Footnotes

This text has a footnote[^1].

Another footnote[^2] here.

Reference the same note again[^1].

[^1]: This is a footnote. It can span multiple lines.

    It can have multiple paragraphs.

[^2]: This is another footnote with `code` and **formatting**.

## 1.12. Custom Containers (Block)

:::note
This is a note container with custom styling.
:::

:::warning
This is a warning with **bold** and _italic_ support.
:::

:::info
This container has:

- Multiple items
- With **formatting**
- And links: [example](https://example.com)

:::

:::error
This is an error state.
:::

## 1.13. Custom Containers (Inline)

This text has ::highlight[highlighted inline content]:: within it.

And here is ::success[success badge style]:: text.

Complex: ::info[Inline container with **bold** and *italic*]:: text.

## 1.14. Extended Links

Reference link with empty reference: [Link][]

[Link]: https://example.com

### 1.15. Auto-Links

<https://example.com>

<user@example.com>

---

## 1.16. Math

### Inline Math

Einstein's equation: $E=mc^2$

Quadratic formula: $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$

Simple: $\alpha + \beta = \gamma$

### Block Math

$$E = mc^2$$

$$\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x+h)-f(x)}{h}$$

Even if the block equation is written inline $$E=mc^2$$ it will be shown as block equation.

Or if the equation follow the previous line without an empty line
$$E=mc^2$$
It is considered as a block equation.

### Chemistry with mhchem

Water molecule: $\ce{H2O}$

Chemical reaction: $\ce{2H2 + O2 -> 2H2O}$

Complex reaction: $\ce{CaCO3 ->[heat] CaO + CO2}$

Oxidation state: $\ce{[Fe(CN)6]^{4-}}$

$$\ce{C + O2 -> CO2}$$

### Mixed Math and Text

The equation $E=mc^2$ shows mass-energy equivalence in chemistry calculations like $\ce{C + O2 -> CO2}$.

---

# 2. Plugins

## 2.1. Emoji Insertion

Use either `{{emoji ...}}`, such as the first line below, or `{{em ...}}`, such as the second line below.

Emotions: {{emoji smile}} {{emoji heart}} {{emoji laughing}}

Symbols: {{em star}} {{em fire}} {{em rocket}}

Nature: {{emoji flower}} {{emoji tree}} {{emoji sun}}

### Supported Emoji List

| Emoji Name           | Result             | Emoji Name             | Result               |
| -------------------- | ------------------ | ---------------------- | -------------------- |
| `{{emoji smile}}`    | {{emoji smile}}    | `{{emoji laugh}}`      | {{emoji laugh}}      |
| `{{emoji happy}}`    | {{emoji happy}}    | `{{emoji sad}}`        | {{emoji sad}}        |
| `{{emoji angry}}`    | {{emoji angry}}    | `{{emoji heart}}`      | {{emoji heart}}      |
| `{{emoji thumbsup}}` | {{emoji thumbsup}} | `{{emoji thumbsdown}}` | {{emoji thumbsdown}} |
| `{{emoji star}}`     | {{emoji star}}     | `{{emoji fire}}`       | {{emoji fire}}       |
| `{{emoji rocket}}`   | {{emoji rocket}}   | `{{emoji party}}`      | {{emoji party}}      |
| `{{emoji thinking}}` | {{emoji thinking}} | `{{emoji eyes}}`       | {{emoji eyes}}       |
| `{{emoji check}}`    | {{emoji check}}    | `{{emoji cross}}`      | {{emoji cross}}      |

**Note:** You can also use any emoji character directly in the syntax: `{{emoji 😊}}` will render as {{emoji 😊}}

## 2.2. Custom Badges

Use either `{{badge ...}}`, such as the first three of the follows, or `{{bd ...}}`, such as the later three of the follows.

{{badge success: All tests passing}}

{{badge warning: Review required}}

{{badge info: New feature}}

{{bd danger: Critical issue}}

{{bd secondary: Not started}}

{{bd light: Light badge}}

### Supported Badge Types

| Badge Type | Syntax                                 | Result                               |
| ---------- | -------------------------------------- | ------------------------------------ |
| Success    | `{{badge success: All tests passing}}` | {{badge success: All tests passing}} |
| Warning    | `{{badge warning: Review required}}`   | {{badge warning: Review required}}   |
| Info       | `{{badge info: New feature}}`          | {{badge info: New feature}}          |
| Danger     | `{{badge danger: Critical issue}}`     | {{badge danger: Critical issue}}     |
| Primary    | `{{badge primary: Main task}}`         | {{badge primary: Main task}}         |
| Secondary  | `{{badge secondary: Not started}}`     | {{badge secondary: Not started}}     |
| Light      | `{{badge light: Light badge}}`         | {{badge light: Light badge}}         |

**Note:** Badge syntax is `{{badge type: Your text here}}`. Any unrecognized type defaults to `info`.

## 2.3. YouTube Embed

Use either `{{youtube ...}}` or `{{yt ...}}`.

{{youtube dQw4w9WgXcQ}}

{{yt aqz-KE-bpKQ}}

## 2.4. SMILES Chemical Structures

Use either `{{smiles ...}}`, such as the first three of the follows, or `{{sm ...}}`, such as the later two of the follows.

Ethanol: {{smiles CCO}}

Benzene: {{smiles c1ccccc1}}

Cyclohexane: {{smiles C1CCCCC1}}

Acetone: {{sm CC(=O)C}}

Glucose: {{sm C(C(C(C(C=O)O)O)O)O}}

## 2.5. External Markdown

Use either `{{markdown ...}}` or `{{md ...}}`.

and you will get:

{{markdown https://raw.githubusercontent.com/wangyu16/mdParserCF/refs/heads/main/examples/mdPlugin.md}}

{{md https://raw.githubusercontent.com/wangyu16/mdParserCF/refs/heads/main/examples/mdPlugin.md}}

## 2.6. QR code

Pass a string and receive an svg QR code image. Use either `{{qrcode ...}}` or `{{qr ...}}`.

`{{qrcode https://raw.githubusercontent.com/wangyu16/mdParserCF/refs/heads/main/examples/mdPlugin.md}}`

and you will get:

{{qrcode https://raw.githubusercontent.com/wangyu16/mdParserCF/refs/heads/main/examples/mdPlugin.md}}

Another example:

{{qr https://github.com}}

## 2.7. Mermaid Diagrams

Use either `{{mermaid ...}}` or `{{mm ...}}`.

{{mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[Skip]
    C --> E[End]
    D --> E
}}

{{mm
sequenceDiagram
    participant User
    participant Server
    User->>Server: Request data
    Server-->>User: Response data
    User->>Server: Process complete
}}

## 2.8. YAML Data Embedding

Use `{{yaml ...}}` or `{{yml ...}}` to embed YAML data as hidden JSON. The YAML content is parsed and converted to JSON, stored in a hidden div for client-side JavaScript access.

{{yaml
title: Example Page
author: John Doe
tags:

- markdown
- parser
- yaml
  metadata:
  version: 1.0
  published: true
  }}

## 2.9. NYML Data Embedding

Use `{{nyml ...}}` to embed NYML data as hidden JSON. NYML is a format inspired by YAML but with key differences:

- All fields at the same level are converted to a list by default
- All end level values are strings (no type conversion)
- Simpler syntax without comments
- Multi-value fields create nested lists

**Basic key-value:**

{{nyml
name: Alice
age: 25
location: New York
}}

**Multi-value fields (creates lists):**

{{nyml
items:
  value1
  value2
  child: nested value
  another plain value
}}

**Multiline values with pipe syntax:**

{{nyml
description: |
  This is a multiline value.
  It preserves line breaks.
  Useful for embedding markdown content.
}}

**Key differences from YAML:**

| Feature        | YAML             | NYML            |
| -------------- | ---------------- | --------------- |
| Root structure | Object or Array  | Always Array    |
| Value types    | Auto-detected    | Always String   |
| Comments       | Supported (#)    | Not supported   |
| Multi-value    | Use - for arrays | Use indentation |

## 2.10. Table of Content

Use `{{toc }}` to show table of content, as can be seen at the top of this document. You can specify the level of headers to be included. By default, it will include level 1 to 3, but you can specify, such as `{{toc 2, 4}}`, `{{toc 1, 5}}`, etc.

---

# 3. Complex Nesting & Edge Cases Testing

## Nested Lists with Multiple Formatting

1. First item with **bold** and `code`
   - Nested item with _italic_
     - Deep item with ~~strikethrough~~
       - Very deep with [link](https://example.com)
       - With {{emoji rocket}} emoji
   - Back to level 2 with `code block`:
     ```python
     # Code in list
     def hello():
         return "nested"
     ```
2. Second main item
   > Blockquote in list
   > Multiple lines
   > And a paragraph after the blockquote

## Tables Inside Blockquotes

> | Header 1 | Header 2 |
> | -------- | -------- |
> | Cell 1   | Cell 2   |
> | Cell 3   | Cell 4   |
>
> Note: This table is inside a blockquote

## Code with Special Characters

### Code Block with Markdown-like Content

```markdown
# This looks like markdown

## But it's code

- Not parsed as list
  [Not a link](url)

**Not bold** in code
```

### Inline Code Preservation

The syntax `{{example arg}}` is preserved as-is in code.

The pattern `[link](url)` stays literal.

### Escaped Characters in Code

```
\*Not italic\*
\[Not a link\](url)
\#Not a heading
\`Not code\`
```

## Escaping Edge Cases

### Escaping Special Characters

Asterisk: \* literal star  
Bracket: \[ literal bracket  
Hash: \# not a heading  
Backslash: \\ escaped backslash  
Underscore: \_not italic\_  
Caret: \^ not superscript  
Tilde: \~ not subscript  
Plus: \+ not underline  
Equals: \= not highlight

### Escaped Markdown Inside Emphasis

**_\~~Not strikethrough\~~ but escaped_**

**\*Escaped asterisk inside bold\***

\*\*Escaped inside italic\*\*

### Complex Escaping

The text \\_should be\\_ `\*literal\*` but this is **\*\*not escaped\*\*** in bold.

## Overlapping & Conflicting Syntax

### Math vs Emphasis

The formula $E = m \times c^2$ contains caret but shouldn't be parsed as superscript.

Multiple dollars: $a+b$ and $c+d$ are separate.

Underscore in math: $y = mx_0 + b$ uses underscore literally.

### Plugin Syntax vs Code

```
{{emoji smile}}  # This is code, not plugin
{{smiles CCO}}   # Also code, not rendered
```

But outside code: {{emoji smile}} and {{smiles CCO}}

### Links vs Auto-links

Auto-link: <https://example.com>

Regular link: [text](https://example.com)

Reference link: [text][ref]

[ref]: https://example.com

Escaped link-like text: \[not a link\](url)

## Nested Emphasis & Strikethrough

Simple: **_bold italic_**

Complex: ~~**bold strikethrough**~~

Extreme: ~~**_bold italic strikethrough_**~~

Partial: **_bold ~~strikethrough bold~~ bold_**

With code: **bold with `code` inside**

With link: **_[bold italic link](https://example.com)_**

## List Items with Multiple Paragraphs

1. First paragraph in item

Second paragraph same item (note blank line)

2. Another item
   - Nested list in second paragraph
   - Second nested item

   Back to main paragraph

3. Item with:
   - Nested list
   - Another item
   ```
   And code block
   ```
   > And blockquote

## Blockquote Edge Cases

> Blockquote with:
>
> - A list
> - Second item
>
> Paragraph after list

> Code block in blockquote:
>
> ```
> code here
> ```
>
> More text

> **Bold blockquote with [link](https://example.com)**

## Mixed Plugin & Markdown

**Important:** {{emoji rocket}} _Deploy_ with {{badge success: Ready}} status

Section with {{diagram mermaid
graph LR
    A[Feature] -->|Process| B[Result]
}} diagram embedded

## Reference Links with Special Cases

[Link with spaces][link with spaces]

[UPPERCASE LINK][uppercase link]

[Link-with-dashes][link-with-dashes]

[link with spaces]: https://example.com
[uppercase link]: https://example.com
[link-with-dashes]: https://example.com

## HTML Edge Cases

<div>
This **markdown** should be parsed inside div
- List here
- Another item
</div>

<span>Inline HTML with **markdown**</span> around it

```html
<div>This is code, so **not parsed**</div>
```

## Empty & Whitespace Edge Cases

### Empty list item:

Multiple blank lines between paragraphs:

Still same paragraph logic

---

Multiple horizontal rules (should render as separate rules):

---

---

---

## Long Content with Complex Nesting

This is a **complex paragraph** with:

- Multiple formatting types (**bold**, _italic_, ~~strikethrough~~, ++underline++, ==highlight==, superscript^2^, subscript~0~)
- `inline code with "quotes"`
- [link to example](https://example.com)
- {{emoji star}} and {{badge info: Note}}

Followed by a blockquote:

> This blockquote contains:
>
> > Nested blockquote with **bold**
>
> A list:
>
> - Item 1
> - Item 2
>
> And code:
>
> ```javascript
> const complex = 'example';
> ```

Then a table:

| Feature  | Status |
| -------- | ------ |
| **Bold** | ✅     |
| _Italic_ | ✅     |

## Math in Various Contexts

### In Headings

### The Equation $E=mc^2$ in a Heading

### In Lists

1. Simple equation: $a+b=c$
2. Complex: $\frac{x}{y} = \frac{1}{2}$
3. Chemistry: $\ce{H2SO4}$ in list

### In Tables

| Math Content | Result    |
| ------------ | --------- |
| $x^2$        | Quadratic |
| $\ce{NaCl}$  | Salt      |

### In Blockquotes

> The equation $E=mc^2$ is fundamental
>
> And $\ce{2H2 + O2 -> 2H2O}$ shows reaction

### In Code (Not Parsed)

```
This $E=mc^2$ should NOT render as math
```

## Emoji in Various Contexts

#### In Text

This is a {{emoji smile}} in text

### In Headings

### Progress: {{emoji fire}} Status

### In Lists

- Item {{emoji check}}
- Another {{emoji rocket}}

### In Badges

{{badge success: {{emoji star}} Complete}}

### In Links

[{{emoji link}} Go to example](https://example.com)

---

## Special Testing Scenarios

### Consecutive Special Elements

{{emoji smile}}{{emoji heart}}{{emoji rocket}}

[link1](url1)[link2](url2)

**bold1\*\***bold2\*\*

### Ambiguous Syntax Cases

The text "**_mixed_**" should parse as **_mixed_**

The pattern "_*combined*_" should be _*combined*_

The sequence "**_triple_**" could be interpreted multiple ways

### Unicode & Special Characters

Mathematics: α, β, γ, Δ, Σ

Arrows: →, ←, ↑, ↓, ↔

Symbols: ©, ®, ™, €, £, ¥

Emoji: 😀 😃 😄 😁 (literal emoji chars)

### Performance Edge Cases

Very long inline text: The quick brown fox jumps over the lazy dog and continues with more text including **bold**, _italic_, `code`, and [links](url) all in one long sentence that tests how the parser handles extended content.

Very long code block:

```
This is a very long code block
with multiple lines
        indentation
    more indentation
and content
that goes on
for quite a while
to test parser performance
with realistic scenarios
```

Deep nesting:

> > > > > Deeply nested content
> > > > >
> > > > > > Even deeper
> > > > > >
> > > > > > > And more

---

## Advanced Plugin Combinations

### Chemical Workflow Example

**Reaction Analysis:**

Reactant: {{smiles CCO}}  
Catalyst: {{badge warning: Heat required}}  
Product: {{smiles CC(=O)C}}

Equation: $\ce{C2H6O ->[H+,heat] CH3COCH3}$

{{emoji rocket}} Process {{emoji check}}

### Learning Module Example

## Lesson 1: {{emoji lightbulb}} Introduction

{{emoji check}} Topics covered:

- Molecular structure: {{smiles c1ccccc1}}
- Equation: $\ce{C6H6}$
- Reference: [Wikipedia](https://example.com)

{{badge info: 45% complete}}

---

# 4. Summary

This file demonstrates:

✅ **Core Markdown**: All CommonMark elements
✅ **Phase 1 Extensions**: Tables, footnotes, strikethrough, containers, inline styles
✅ **Advanced Features**: Math formulas with chemistry, plugins
✅ **Complex Nesting**: Multiple levels of embedded content
✅ **Edge Cases**: Escaping, overlapping syntax, ambiguous patterns
✅ **Real-World Scenarios**: Practical examples combining multiple features

All these features are **fully supported and tested** in mdParserCF!
