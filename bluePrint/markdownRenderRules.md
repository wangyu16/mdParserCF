<!-- 0. Paragraphs and Line Breaks -->

Paragraphs are formed by one or more consecutive lines of text separated by one or more blank lines.

Syntax:
```
This is a paragraph with multiple lines.
It continues here without a blank line.

This is a new paragraph.
```
Renders as: `<p>This is a paragraph with multiple lines. It continues here without a blank line.</p><p>This is a new paragraph.</p>`

**Line Breaks:**
To force a line break (`<br>`) within a paragraph, end a line with two or more spaces.

Syntax:
```
Line 1  
Line 2
```
Renders as: `<p>Line 1<br>Line 2</p>`

Note: Single newlines are ignored and treated as spaces. Blank lines are required to separate paragraphs.

<!-- 2. Headings -->

Headings are created using hash symbols (#) followed by a space and the heading text.

Syntax:
- `# h1 Heading` - Renders as `<h1>h1 Heading</h1>`
- `## h2 Heading` - Renders as `<h2>h2 Heading</h2>`
- `### h3 Heading` - Renders as `<h3>h3 Heading</h3>`
- `#### h4 Heading` - Renders as `<h4>h4 Heading</h4>`
- `##### h5 Heading` - Renders as `<h5>h5 Heading</h5>`
- `###### h6 Heading` - Renders as `<h6>h6 Heading</h6>`

Note: A space after the hash symbol(s) is required. Without a space, the text will not be rendered as a heading.


<!-- 3. Horizontal Rules -->

Horizontal rules (dividers) can be created using three or more consecutive characters on a line.

Supported patterns:
- `___` (three underscores)
- `---` (three hyphens)
- `***` (three asterisks)

All render as: `<hr>`

Note: Ensure there is a blank line before and after the horizontal rule for proper rendering.


<!-- 4. Inline Text Styles -->

Inline text can be styled using various wrapper characters.

**Bold text:**
- `**This is bold text**` - Renders as `<strong>This is bold text</strong>`
- `__This is bold text__` - Renders as `<strong>This is bold text</strong>`

**Italic text:**
- `*This is italic text*` - Renders as `<em>This is italic text</em>`
- `_This is italic text_` - Renders as `<em>This is italic text</em>`

**Bold and italic combined:**
- `***Bold and italic***` - Renders as `<strong><em>Bold and italic</em></strong>`
- `___Bold and italic___` - Renders as `<strong><em>Bold and italic</em></strong>`

**Strikethrough:**
- `~~Strikethrough~~` - Renders as `<del>Strikethrough</del>` or `<s>Strikethrough</s>`

**Underline:**
- `++Underline++` - Renders as `<u>Underline</u>`

**Highlight:**
- `==Highlight==` - Renders as `<mark>Highlight</mark>`

**Superscript:**
- `^superscript^` - Renders as `<sup>superscript</sup>`

**Subscript:**
- `~subscript~` - Renders as `<sub>subscript</sub>`

Note: These styles can be nested to combine multiple effects.


<!-- 5. Blockquotes -->

Blockquotes are created using the greater-than symbol (>) at the beginning of a line.

Syntax:
- `> This is a blockquote` - Renders as `<blockquote><p>This is a blockquote</p></blockquote>`

**Nested blockquotes:**
Blockquotes can be nested by using multiple greater-than signs:
- `>> Second level` - Creates a nested blockquote
- `>>> Third level` - Creates a deeper nested blockquote

Spaces between the `>` symbols are optional and produce the same result.

Note: The content within blockquotes is parsed as markdown and can include other elements like headings, lists, or inline styles.


<!-- 6. Lists -->

**Unordered Lists:**
Create an unordered list by starting a line with `+`, `-`, or `*` followed by a space.

Syntax:
```
+ Item 1
- Item 2
* Item 3
```
Renders as: `<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>`

**Nested Lists:**
Create sub-lists by indenting 2 spaces (or 1 tab) before the list marker:
```
+ Parent item
  - Child item 1
    * Grandchild item
```

Note: Changing the marker character (between `+`, `-`, `*`) at the same indentation level will start a new list.

**Ordered Lists:**
Create an ordered list using numbers followed by a period and a space.

Syntax:
```
1. First item
2. Second item
3. Third item
```
Renders as: `<ol><li>First item</li><li>Second item</li><li>Third item</li></ol>`

**Numbering options:**
- Sequential numbering: `1.` `2.` `3.` (numbers increment)
- Lazy numbering: `1.` `1.` `1.` (parser auto-increments)
- Custom start offset: Starting with a number other than 1 (e.g., `57.`) will begin numbering from that value

Example:
```
57. foo
1. bar
```
Renders as: 57. foo, 58. bar

Note: List items can contain multiple paragraphs and other block elements by indenting continuation lines.


<!-- 7. Code -->

**Inline Code:**
Wrap code in single backticks for inline code spans.

Syntax: `` `code` ``
Renders as: `<code>code</code>`

**Indented Code Blocks:**
Create a code block by indenting every line with 4 spaces or 1 tab.

Syntax:
```
    // Some comments
    line 1 of code
    line 2 of code
```
Renders as: `<pre><code>// Some comments\nline 1 of code\nline 2 of code</code></pre>`

**Fenced Code Blocks:**
Create a code block using three backticks (```) before and after the code.

Syntax:
````
```
Sample text here...
```
````
Renders as: `<pre><code>Sample text here...</code></pre>`

**Syntax Highlighting:**
Specify a language identifier after the opening fence for syntax highlighting.

Syntax:
````
``` js
var foo = function (bar) {
  return bar++;
};
console.log(foo(5));
```
````
Renders as: `<pre><code class="language-js">var foo = function (bar) {\n  return bar++;\n};\nconsole.log(foo(5));</code></pre>`

Note: The actual syntax highlighting styling depends on the CSS or highlighting library used in the renderer.

<!-- 8. Tables -->

Tables are created using pipes (`|`) to separate columns and hyphens (`-`) to define headers.

**Basic Table:**
Syntax:
```
| Column 1 | Column 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```
Renders as: `<table><thead><tr><th>Column 1</th><th>Column 2</th></tr></thead><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></tbody></table>`

**Column Alignment:**
Use colons (`:`) in the separator row to control alignment:
- Left-aligned (default): `| --- |` or `| :--- |`
- Center-aligned: `| :---: |`
- Right-aligned: `| ---: |`

Example (right-aligned columns):
```
| Option | Description |
| ------:| -----------:|
| data   | path to data files |
| engine | template engine |
```

Note: 
- The outer pipes are optional
- Cells can contain inline markdown formatting
- A minimum of three hyphens is required in each separator cell


<!-- 9. Links -->

Links are created using square brackets for the link text and parentheses for the URL.

**Inline Links:**
Syntax: `[link text](http://example.com)`
Renders as: `<a href="http://example.com">link text</a>`

**Links with Titles:**
Syntax: `[link text](http://example.com "Title text")`
Renders as: `<a href="http://example.com" title="Title text">link text</a>`

**Reference-Style Links:**
Syntax:
```
[link text][reference-id]

[reference-id]: http://example.com "Optional title"
```
Renders as: `<a href="http://example.com" title="Optional title">link text</a>`

**Auto-Links:**
URLs and email addresses can be automatically converted to links:
- `<http://example.com>` - Renders as `<a href="http://example.com">http://example.com</a>`
- `<email@example.com>` - Renders as `<a href="mailto:email@example.com">email@example.com</a>`

Note: Link text can contain inline formatting (bold, italic, etc.).


<!-- 10. Images -->

Images use similar syntax to links, but with an exclamation mark (!) prefix.

**Basic Image:**
Syntax: `![alt text](image-url.png)`
Renders as: `<img src="image-url.png" alt="alt text">`

**Image with Title:**
Syntax: `![alt text](image-url.png "Image title")`
Renders as: `<img src="image-url.png" alt="alt text" title="Image title">`

**Reference-Style Images:**
Syntax:
```
![alt text][image-ref]

[image-ref]: image-url.png "Optional title"
```

**Custom Attributes (Parser-Specific):**
An HTML comment immediately following an image (on the same line, no space) will be parsed as additional attributes for the `<img>` element.

Syntax:
```
![alt text](image-url.png)<!-- class="responsive-img" style="width: 100%;" -->
```
Renders as: `<img src="image-url.png" alt="alt text" class="responsive-img" style="width: 100%;">`

Note: There must be no space between the image syntax and the HTML comment for attributes to be applied.

<!-- 11. Footnotes -->

Footnotes create references with corresponding definitions elsewhere in the document.

**Basic Footnote:**
Syntax:
```
This is text with a footnote[^1].

[^1]: This is the footnote content.
```

**Footnote with Identifier:**
Use descriptive identifiers instead of numbers:
```
This references a footnote[^my-note].

[^my-note]: Footnote content can include **markdown formatting**.
```

**Multi-Paragraph Footnotes:**
Indent subsequent paragraphs with 4 spaces or 1 tab:
```
[^multi]: First paragraph of the footnote.

    Second paragraph (indented with 4 spaces).
```

**Inline Footnotes:**
Define a footnote inline using `^[content]`:
```
This has an inline footnote^[This is the footnote text].
```

**Reusing Footnotes:**
The same footnote reference can be used multiple times:
```
First reference[^note]. Second reference[^note].

[^note]: This footnote appears only once at the bottom.
```

Note: Footnote definitions can appear anywhere in the document and will be collected and rendered at the bottom. Footnote content is parsed as markdown.


<!-- 12. Custom Containers (Parser-Specific Extension) -->

Custom containers allow wrapping content in HTML elements with specific class names.

**Inline Span Container:**
Syntax: `::CLASSNAME[content]::`
Renders as: `<span class="CLASSNAME">content</span>`

Example:
```
This is ::highlight[important text]:: in a sentence.
```
Renders as: `This is <span class="highlight">important text</span> in a sentence.`

Note: The content between `::[` and `]::` is parsed as markdown, so you can use inline styles.

**Block Div Container:**
Syntax:
```
:::CLASSNAME
content here
:::
```
Renders as: `<div class="CLASSNAME">content here</div>`

Example:
```
:::warning
**Warning:** This is a warning message with *markdown* formatting.
:::
```
Renders as: `<div class="warning"><p><strong>Warning:</strong> This is a warning message with <em>markdown</em> formatting.</p></div>`

Note: 
- The content between the `:::` fences is parsed as markdown
- The opening and closing `:::` must be on their own lines
- Custom class names can be used for styling purposes (e.g., `note`, `warning`, `info`, `tip`)  



<!-- 13. Math and Chemistry Formulas (Parser-Specific Extension) -->

Mathematical and chemical formulas are rendered using KaTeX with the mhchem extension.

**Inline Math:**
Syntax: `$formula$`
Wraps the formula in inline math delimiters for KaTeX rendering.

Examples:
- `$E=mc^2$` - Einstein's mass-energy equivalence
- `$\sum_{i=1}^{n} x_i$` - Summation notation
- `$\frac{a}{b}$` - Fractions

**Inline Chemistry:**
Syntax: `$\ce{formula}$`
Uses the mhchem package for chemical formulas.

Examples:
- `$\ce{H2O}$` - Water molecule
- `$\ce{CO2}$` - Carbon dioxide

**Block Math:**
Syntax:
```
$$
formula
$$
```
Creates a centered, display-style math block.

Examples:
```
$$
\begin{align}
F & = ma \\
a & = \frac{\mathrm{d}v}{\mathrm{d}t}
\end{align}
$$
```

**Block Chemistry:**
Syntax:
```
$$\ce{reaction}$$
```

Example:
```
$$\ce{CO2 + C -> 2CO}$$
```

Note: 
- KaTeX syntax documentation: https://katex.org/docs/supported.html
- mhchem syntax for chemistry: https://mhchem.github.io/MathJax-mhchem/
- Math blocks should have blank lines before and after for proper rendering

<!-- 14. Custom Plugins (Parser-Specific Extension) -->

Custom plugins allow embedding dynamic content using a double-brace syntax.

**General Syntax:**
`{{pluginName pluginInput}}`

The parser will invoke the registered plugin handler for `pluginName` with `pluginInput` as the parameter. Allow multi line input. 

**Example - YouTube Embed:**
Syntax: `{{youtube VIDEO_ID}}`

Example:
```
{{youtube dQw4w9WgXcQ}}
```
Renders as: An embedded YouTube video player for the video with ID `dQw4w9WgXcQ`

Example:
```
{{mermaid 
flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
}}
```
Rneders to a Mermaid diagram. 

**Example - Markdown Import:**
Syntax: `{{markdown SRC}}`

Where SRC is a URL or file path to an external Markdown file.

Example:
```
{{markdown https://example.com/external.md}}
```
Renders as: The parsed HTML content of the external Markdown file.

**Example - SMILES Chemical Structure:**
Syntax: `{{smiles SMILES_STRING}}`

Uses the SmilesDrawer library (https://github.com/reymond-group/smilesDrawer) to render chemical structures from SMILES notation.

Example:
```
{{smiles C1CCCCC1}}
```
Renders as: An SVG image of the cyclohexane molecule.

**Implementation Notes:**
- Each plugin must be registered with the parser before use
- The plugin handler receives the input string and returns the HTML to be inserted
- Multiple plugins can be defined for different content types (e.g., {{tweet ID}}, {{codepen ID}}, {{spotify TRACK_ID}}, {{markdown SRC}}, {{smiles SMILES_STRING}})
- Plugin names are case-sensitive
- Invalid plugin names or missing handlers should either render an error message or pass through as plain text (implementation-dependent) 

<!-- 14. Parsing Precedence -->

To resolve conflicts between overlapping syntax elements, the parser processes elements in a specific order. Elements are parsed from the outermost (block-level) to the innermost (inline-level).

**Parsing Order:**
1. HTML blocks and raw HTML
2. Code blocks (fenced and indented)
3. Tables
4. Blockquotes, lists, headings, and horizontal rules
5. Inline elements: links and images (before emphasis and other inline styles)
6. Emphasis (bold, italic, etc.), code spans, and other inline formatting
7. Custom extensions (containers, math, plugins, footnotes)

Note: Within the same level, longer matches are preferred (e.g., `**bold**` over `*italic*`). Escaping takes precedence over all parsing.

<!-- 15. HTML and Escape Rules -->

**Raw HTML:**
HTML tags are passed through to the output HTML literally. The content between HTML opening and closing tags is still parsed as markdown.

Example:
```html
<p>This is the **content**.</p>
```
Renders as:
```html
<p>This is the <strong>content</strong>.</p>
```

**Self-Closing HTML Tags:**
Self-closing HTML tags are rendered as-is:
- `<br>` - Line break
- `<hr>` - Horizontal rule
- `<img src="..." alt="...">` - Image

**HTML Comments:**
HTML comments are preserved in the output:
```html
<!-- This is a comment -->
```
Renders as: `<!-- This is a comment -->`

**Special Case - Image Attributes:**
When an HTML comment immediately follows an image (no space between), the comment content is parsed as additional attributes for the `<img>` element instead of being rendered as a comment. See section 9 (Images) for details.

**Escaping Markdown Syntax:**
To display markdown syntax literally without rendering, prefix special characters with a backslash (`\`).

Examples:
- `\*not italic\*` - Renders as: `*not italic*`
- `\[not a link\](url)` - Renders as: `[not a link](url)`
- `\# not a heading` - Renders as: `# not a heading`
- `\`not code\`` - Renders as: `` `not code` ``

**Escapable Characters:**
The following characters can be escaped: `\` `` ` `` `*` `_` `{` `}` `[` `]` `(` `)` `#` `+` `-` `.` `!` `|` `~` `=` `^` `:` 

**Escaping Custom Container Syntax:**
To display custom container syntax literally:
- Inline span: `\:\:CLASSNAME[content]\:\:` - Renders as: `::CLASSNAME[content]::`
- Block div: Escape the opening fence: `\:\:\:CLASSNAME` - Renders as: `:::CLASSNAME`

**Escaping Custom Plugin Syntax:**
To display plugin syntax literally:
- Escape the opening braces: `\{\{youtube VIDEO_ID\}\}` - Renders as: `{{youtube VIDEO_ID}}`
- Alternative: Escape only the first brace: `\{{youtube VIDEO_ID}}` - Renders as: `{{youtube VIDEO_ID}}`

Note: Use `\\` to render a literal backslash. 
