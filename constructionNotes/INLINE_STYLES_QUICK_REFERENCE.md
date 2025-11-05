# Inline Styles Quick Reference

## Underline: `++text++`

### Syntax
```markdown
This is ++underlined text++.
Mix with ++**bold underline**++.
Multiple: ++first++ and ++second++ underlines.
```

### Renders To
```html
<p>This is <u>underlined text</u>.</p>
<p>Mix with <u><strong>bold underline</strong></u>.</p>
<p>Multiple: <u>first</u> and <u>second</u> underlines.</p>
```

### HTML Tag
`<u>...</u>` (semantic underline element)

---

## Highlight: `==text==`

### Syntax
```markdown
This is ==highlighted text==.
Mix with ==*italic highlight*==.
Multiple: ==first== and ==second== highlights.
```

### Renders To
```html
<p>This is <mark>highlighted text</mark>.</p>
<p>Mix with <mark><em>italic highlight</em></mark>.</p>
<p>Multiple: <mark>first</mark> and <mark>second</mark> highlights.</p>
```

### HTML Tag
`<mark>...</mark>` (semantic highlight/mark element)

---

## Superscript: `^text^`

### Syntax
```markdown
E = mc^2^
H^+ in water
Multiple: ^first^ and ^second^ superscripts
```

### Renders To
```html
<p>E = mc<sup>2</sup></p>
<p>H<sup>+</sup> in water</p>
<p>Multiple: <sup>first</sup> and <sup>second</sup> superscripts</p>
```

### HTML Tag
`<sup>...</sup>` (semantic superscript element)

### Common Uses
- Mathematical exponents: `x^2^`, `2^n^`
- Chemical notations: `H^+^`, `O^2-^`
- Footnote markers: `[1]^cite^`

---

## Subscript: `~text~`

### Syntax
```markdown
H~2~O (water)
CH~4~ (methane)
Multiple: ~first~ and ~second~ subscripts
```

### Renders To
```html
<p>H<sub>2</sub>O (water)</p>
<p>CH<sub>4</sub> (methane)</p>
<p>Multiple: <sub>first</sub> and <sub>second</sub> subscripts</p>
```

### HTML Tag
`<sub>...</sub>` (semantic subscript element)

### Common Uses
- Chemical formulas: `H~2~O`, `CO~2~`
- Mathematical notation: `x~i~`, `a~1~`
- Variable subscripts

### Important Note
**Single tilde** `~text~` = subscript  
**Double tilde** `~~text~~` = strikethrough (different feature)

```markdown
Subscript: ~H2O~
Strikethrough: ~~mistake~~
Mixed: ~sub~ and ~~strike~~
```

---

## Nesting with Other Formats

### Underline with Bold
```markdown
++**bold underline**++
Renders: <u><strong>bold underline</strong></u>
```

### Highlight with Italic
```markdown
==*italic highlight*==
Renders: <mark><em>italic highlight</em></mark>
```

### Superscript with Code
```markdown
E = mc^`2`^
Renders: E = mc<sup><code>2</code></sup>
```

### Subscript with Bold
```markdown
~**2**~O
Renders: <sub><strong>2</strong></sub>O
```

### Complex Nesting
```markdown
Chemistry: ++H~2~SO~4~++
Renders: <u>H<sub>2</sub>SO<sub>4</sub></u>

Math: ==Einstein's E = mc^**2**^==
Renders: <mark>Einstein's E = mc<sup><strong>2</strong></sup></mark>
```

---

## Edge Cases & Gotchas

### Unclosed Delimiters
```markdown
This ++ is not underlined
This ~~ is not strikethrough
```

**Both are treated as literal text** - delimiters must be closed to be recognized.

### Subscript vs Strikethrough
```markdown
~single tilde~ = subscript
~~double tilde~~ = strikethrough
~sub~ and ~~strike~~ = both recognized correctly
```

The parser checks for double `~~` first (strikethrough), then single `~` (subscript).

### Empty Content
```markdown
++++ does not create empty underline
==== does not create empty highlight
^^ creates empty superscript (unusual but valid)
~~ is strikethrough, not subscript
```

Empty underline/highlight/superscript are technically valid HTML but unusual.

### Whitespace Handling
```markdown
++ text ++ = <u> text </u>
Whitespace inside is preserved
```

### HTML in Content
```markdown
++<script>++  is escaped to: <u>&lt;script&gt;</u>
XSS safe - all HTML entities escaped
```

---

## CSS Styling

### Default Browser Rendering
| Element | Default | CSS Property |
|---------|---------|--------------|
| `<u>` | Underline | `text-decoration: underline` |
| `<mark>` | Yellow bg | `background-color: yellow` |
| `<sup>` | Raised + smaller | `vertical-align: super; font-size: smaller` |
| `<sub>` | Lowered + smaller | `vertical-align: sub; font-size: smaller` |

### Custom Styling Examples

```css
/* Underline */
u {
  text-decoration: underline 2px wavy red;
}

/* Highlight */
mark {
  background-color: #ffff00;
  color: black;
}

/* Superscript */
sup {
  color: red;
  font-weight: bold;
}

/* Subscript */
sub {
  color: blue;
  font-size: 0.8em;
}
```

---

## Real-World Examples

### Scientific Writing
```markdown
Water is H~2~O, and has a density of 1 g/cm^3^.
The formula E = mc^2^ shows mass-energy equivalence.
```

### Emphasis in Documentation
```markdown
This feature is ++critical++ and ==must== be tested.
The ^priority^ level is ~low~ high.
```

### Chemical Equations
```markdown
H~2~SO~4~ + ++2NaOH++ → Na~2~SO~4~ + H~2~O
```

### Mathematical Notation
```markdown
The series is: a^1^ + a^2^ + a^3^ = ∑a~i~
```

---

## Performance Notes

- **Parsing**: Fast - single pass, no backtracking
- **Rendering**: Fast - simple HTML tag wrapping
- **Nesting**: Fully supported - recursive parsing
- **Escaping**: All HTML escaped automatically

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge | IE |
|---------|--------|---------|--------|------|-----|
| `<u>` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `<mark>` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `<sup>` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `<sub>` | ✅ | ✅ | ✅ | ✅ | ✅ |

**Note**: IE doesn't support `<mark>` element, but it will render as generic element without styling.

---

## Migration Guide

### If You Were Using HTML
```html
<!-- Old -->
<u>underlined</u>
<mark>highlighted</mark>
<sup>superscript</sup>
<sub>subscript</sub>

<!-- Now in Markdown -->
++underlined++
==highlighted==
^superscript^
~subscript~
```

### If You Were Using Workarounds
```markdown
<!-- Old (using emphasis) -->
*underlined* <- not really underlined
`highlighted` <- not really highlighted

<!-- Now (proper syntax) -->
++underlined++
==highlighted==
```

---

## Testing Your Markdown

```markdown
# Test Document

This has ++underlined++, ==highlighted==, ^superscript^, and ~subscript~.

Science:
- Water: H~2~O
- Carbon dioxide: CO~2~
- Energy: E = mc^2^

Mixed formatting:
- ++**Bold underline**++ and ~~strikethrough~~
- ==*Italic highlight*== text
- ^Super **bold**^ script

Edge cases:
- This ++ is not underlined (unclosed)
- This ~~ is strikethrough (double tilde)
- This ~ is subscript (single tilde)
```

---

## API Usage (TypeScript)

```typescript
import { Parser, HTMLRenderer } from 'mdparser-cf';

const parser = new Parser();
const renderer = new HTMLRenderer();

// Parse with inline styles
const ast = parser.parse('E = mc^2^');
const html = renderer.render(ast).html;

console.log(html);
// Output: <p>E = mc<sup>2</sup></p>

// Check AST structure
const inlineStyles = ast.children[0].children;
// [
//   { type: 'text', value: 'E = mc' },
//   { type: 'superscript', children: [{ type: 'text', value: '2' }] }
// ]
```

---

## Troubleshooting

### Underline not working
```markdown
✅ Correct: ++text++
❌ Wrong: +text+      (single plus)
❌ Wrong: __text__    (use ** or __ for bold)
```

### Highlight not working
```markdown
✅ Correct: ==text==
❌ Wrong: =text=      (single equals)
❌ Wrong: {mark}text{/mark} (not HTML)
```

### Superscript not working
```markdown
✅ Correct: ^text^
❌ Wrong: **text** (use for bold, not super)
❌ Wrong: text^2 (missing closing caret)
```

### Subscript not working
```markdown
✅ Correct: ~text~
❌ Wrong: ~~text~~ (double tilde = strikethrough)
❌ Wrong: _text_    (use for italic, not sub)
```

---

**Reference Version**: 0.1.0  
**Status**: ✅ Complete  
**Last Updated**: November 5, 2025

