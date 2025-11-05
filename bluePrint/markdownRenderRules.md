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

<!-- 16. Potential Plugins (Future Extensions) -->

The following plugins are recommended for future implementation to enhance chemistry, biology, and data science documentation capabilities. They follow the same `{{pluginName args}}` syntax as existing plugins.

**High Priority / High-Value Plugins**

**3D Molecular Structure Viewer**
Syntax: `{{3dstructure format:data}}`

Example:
```
{{3dstructure pdb:1crn}}
```

Description: Interactive 3D viewer for protein structures and molecular models. Displays PDB (Protein Data Bank) files or raw coordinate data. Supports rotation, zoom, atom/residue selection, and color schemes (cartoon, surface, CPK). Uses client-side 3Dmol.js or NGL.js library.

Features:
- Load structures from PDB ID or inline coordinates
- Interactive 3D rendering in browser
- Selectable atoms and residues
- Multiple display modes (cartoon, surface, ball-and-stick, CPK)
- Export snapshot as PNG/SVG
- Ideal for: structural biology, protein documentation, education

Implementation: Client-side rendering with canvas/WebGL. Server generates HTML with unique div ID and embedded script that calls 3Dmol.js when library is available.

**Reaction Mechanism / Arrow-Pushing**
Syntax: `{{mechanism steps}}`

Example:
```
{{mechanism
step1: Substrate → Intermediate1 [curved arrow from C to N]
step2: Intermediate1 → Product [curved arrow showing electron flow]
}}
```

Description: Visualizes organic reaction mechanisms with curved arrows showing electron flow, charges, and formal charge changes. Renders as interactive SVG with optional step-by-step animation.

Features:
- Curved arrows with arrowheads and labels
- Electron pair movement visualization
- Formal charge annotations
- Step-by-step progression (optional animation)
- Export as SVG or PNG
- Ideal for: organic chemistry education, mechanism documentation

Implementation: Server-side SVG generation using d3 or SVG.js. Client-side enhancement for interactivity.

**Spectroscopic Data Viewer (NMR / IR / MS)**
Syntax: `{{spectra format type:data}}`

Example:
```
{{spectra jcamp NMR:path/to/sample.jdx}}
```

or inline:

```
{{spectra inline MS:
m/z: [43, 71, 85, 99]
intensity: [100, 85, 92, 45]
}}
```

Description: Interactive spectral plots for NMR (1H, 13C), IR, and mass spectrometry (MS) data. Supports JCAMP-DX and mzML formats, or inline CSV-like data. Features zoom, peak picking, annotation, and comparison tools.

Features:
- Support for multiple spectra types (1H NMR, 13C NMR, IR, MS)
- Zoom and pan interactions
- Peak identification and annotation
- Integration calculation (NMR)
- Multiplet analysis
- Data import from JCAMP-DX, mzML, or CSV
- Ideal for: analytical chemistry, spectroscopy teaching, data documentation

Implementation: Client-side rendering using Plotly.js or Chart.js. Server provides data parsing for common formats.

**Medium Priority / Useful Plugins**

**Data Plotting (Generic)**
Syntax: `{{plot format:data [options]}}`

Example:
```
{{plot csv:
x,y
1,2
2,4
3,9
type: scatter
title: Sample Data
}}
```

Description: Generic plotting plugin for inline numeric data. Supports scatter, line, bar, and histogram plots. Data can be inline CSV or JSON, or referenced from a URL.

Features:
- Multiple plot types (scatter, line, bar, histogram)
- Interactive legends and hover tooltips
- Axis labels and title
- Grid and axis styling
- Export as PNG/SVG
- Responsive sizing
- Ideal for: data visualization in documentation, inline plots

Implementation: Client-side rendering using Plotly.js or Vega-Lite.

**Reaction Balancing & Stoichiometry**
Syntax: `{{stoichiometry equation [options]}}`

Example:
```
{{stoichiometry
C6H12O6 + O2 -> CO2 + H2O
}}
```

Description: Automatically balances chemical equations and computes stoichiometric ratios. Displays coefficients, molar masses, and limiting reagent calculations.

Features:
- Automatic equation balancing using algebraic methods
- Display of balanced equation with coefficients
- Molar mass calculation
- Stoichiometric ratio computation
- Limiting reagent identification (with optional reactant amounts)
- Ideal for: chemistry education, problem solving

Implementation: Server-side chemistry algorithms (balancing, mass calculation). Render as formatted table or HTML.

**Unit-Aware Calculation**
Syntax: `{{calc expression}}`

Example:
```
{{calc (5 m * 3 cm) / (2 s)}}
```

Renders as: `7.5 m·cm/s` or automatically simplified with unit conversion.

Description: Inline calculator supporting unit-aware math. Expressions maintain unit consistency and automatically convert/simplify. Useful for quick conversions and dimensional analysis.

Features:
- Unit-aware arithmetic (km + m = km, with automatic conversion)
- Dimensional analysis
- Common unit conversions
- Support for SI and imperial units
- Display final result with simplified units
- Ideal for: chemistry/physics calculations, homework, documentation

Implementation: Uses js-quantities or Unit.js library. Server-side or client-side evaluation.

**Periodic Table Widget**
Syntax: `{{periodic [highlight:element1,element2]}}` or `{{element symbol}}`

Example:
```
{{periodic highlight:H,C,N,O}}
```

or inline:

```
The element {{element Au}} has atomic number 79.
```

Description: Interactive periodic table with detailed element information. Clicking an element shows atomic properties, electron configuration, isotopes, and common reactions. Lightweight and embeddable.

Features:
- Full periodic table with color-coded blocks (s, p, d, f)
- Hover tooltips showing element name, atomic mass, common oxidation states
- Click for detailed view: electron configuration, isotopes, electronegativity, common reactions
- Copy-to-clipboard for element symbols, names, atomic numbers
- Highlight specific elements (for teaching trends)
- Inline element link: `{{element Au}}` renders as clickable link to Au details
- Ideal for: chemistry reference, education, quick lookups

Implementation: Client-side interactive widget using a lightweight periodic table library (custom SVG or pre-built component). Server provides minimal HTML with unique ID.

**Lower Priority / Advanced Plugins**

**Biological Sequence Viewer**
Syntax: `{{sequence format:data [features]}}` or `{{dna sequence}}`, `{{protein sequence}}`

Example:
```
{{dna
ATGCGATCGATCGATCG
features: [
  {start: 1, end: 5, name: "ATG", type: "start_codon"},
  {start: 10, end: 15, name: "stop", type: "stop_codon"}
]
}}
```

Description: Render DNA, RNA, or protein sequences with visual features (exons, introns, motifs, domains). Supports zooming, scrolling, and feature annotations. Can display multiple aligned sequences.

Features:
- Sequence rendering with color schemes (DNA: ATCG; protein: hydrophobic, charged, etc.)
- Feature tracks (exons, introns, motifs, domains, restriction sites)
- Zoomable view
- Multiple sequence alignment (if multiple sequences provided)
- Copy sequence to clipboard
- Link-out to databases (UniProt, NCBI)
- Ideal for: molecular biology documentation, genomics, bioinformatics

Implementation: Client-side rendering using biojs/SeqViz or custom canvas/SVG. Lightweight library for feature rendering.

**Jupyter Output Embedding**
Syntax: `{{jupyter source:url [options]}}` or `{{jupyter-cell code}}`

Example:
```
{{jupyter source:https://example.com/notebook.ipynb cell:2}}
```

or inline code (server-executed):

```
{{jupyter-cell
import numpy as np
plt.plot(np.linspace(0, 2*np.pi, 100), np.sin(np.linspace(0, 2*np.pi, 100)))
plt.show()
}}
```

Description: Embed Jupyter notebook cells or pre-rendered outputs (HTML, PNG) into documentation. For static rendering, exports notebook outputs as HTML. For live execution, requires secure sandbox (e.g., JupyterLite, Binder, or server-side execution with security controls).

Features:
- Static output embedding (HTML/PNG export from notebook)
- Optional live execution via Binder/JupyterLite (read-only or sandboxed)
- Cell-level selection from full notebooks
- Output rendering (plots, tables, stdout)
- Optional code visibility toggle
- Ideal for: data science documentation, tutorials, reproducible examples

Implementation: Static mode (server extracts and embeds HTML). Live mode requires external service integration (Binder, JupyterLite).

**RDKit / ChemDoodle Integration (Advanced)**
Syntax: `{{chem-property input [property]}}` or `{{chem-depict SMILES}}`

Example:
```
{{chem-property C1CCCCC1 logP}}
```

Returns: `logP: 3.44` (for cyclohexane)

or:

```
{{chem-depict C1CCCCC1 width:400 height:300}}
```

Renders: High-quality 2D depiction of the molecule.

Description: Server-side cheminformatics using RDKit (Python library) or ChemDoodle. Compute molecular properties (logP, MW, tPSA, H-bond donors/acceptors, etc.), generate conformers, and produce publication-quality molecular depictions.

Features:
- Molecular property calculation (logP, molecular weight, PSA, rotatable bonds, etc.)
- Conformer generation and 3D coordinate prediction
- High-quality 2D depiction (SVG or PNG)
- Similarity search against SMILES/SMARTS
- Fragment analysis
- Substructure matching
- Ideal for: advanced cheminformatics, property databases, drug discovery documentation

Implementation: Server-side service (Python RDKit running in Docker or as microservice). Requires infrastructure. Returns JSON or SVG/PNG.

---

**Plugin Development Guidelines**

All plugins should follow these conventions:

1. **Syntax:** `{{pluginName args}}` (single-line) or multi-line for block-level content.
2. **Unique IDs:** Generate unique element IDs (canvas, div, svg) to avoid conflicts when multiple instances appear in one document.
3. **Client-Side Priority:** Prefer client-side rendering (JavaScript) for responsiveness. Use server-side only for heavy computation.
4. **Error Handling:** Gracefully degrade with fallback text or error message if library is not available or parsing fails.
5. **Testing:** Add unit tests verifying HTML output contains expected placeholders and data attributes. Add integration tests for client-side rendering where feasible.
6. **Documentation:** Include usage examples, supported formats, required CDN/script includes, and limitations.
7. **Accessibility:** Provide alt text for generated images/visualizations. Include ARIA labels where possible.

---

**Integration and Deployment Strategy**

- **Phase 1 (Current):** YouTube, Emoji, SMILES, Badge, Mermaid, Math (KaTeX with mhchem)
- **Phase 2:** 3D Viewer, Reaction Mechanisms, Spectra Viewer (high-impact chemistry/biology features)
- **Phase 3:** Generic plotting, stoichiometry, periodic table, unit-aware calc (utility plugins)
- **Phase 4:** Sequence viewer, Jupyter embedding, RDKit integration (advanced/specialized)

Prioritize by user feedback and use case frequency. 
