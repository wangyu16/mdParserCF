# Markdown Parser Test File

This file contains comprehensive tests for all markdown syntax features, including edge cases, nesting scenarios, and potential conflicts.

---

## 0. Paragraphs and Line Breaks Test

### Basic Paragraphs
This is the first paragraph.
It continues on the next line without a blank line.

This is the second paragraph after a blank line.

### Line Breaks
Line 1 with two spaces at end  
Line 2 (should have <br>)

Line 3 without spaces
Line 4 (no break)

### Edge Cases
Paragraph with trailing spaces   

Next paragraph.

Single line paragraph.

---

## 2. Headings Test

# Heading Level 1
## Heading Level 2
### Heading Level 3
#### Heading Level 4
##### Heading Level 5
###### Heading Level 6

### Edge Cases for Headings
#No space after hash - should NOT render as heading
# Heading with **bold** and *italic* text
## Heading with `inline code`
### Heading with ~~strikethrough~~ text

---

## 3. Horizontal Rules Test

Three underscores:
___

Three hyphens:
---

Three asterisks:
***

Edge case - not a horizontal rule (only two):
--

---

## 4. Inline Text Styles Test

### Basic Styles
**Bold with asterisks**
__Bold with underscores__
*Italic with asterisks*
_Italic with underscores_
***Bold and italic with asterisks***
___Bold and italic with underscores___
~~Strikethrough~~
++Underline++
==Highlight==
^Superscript^
~Subscript~

### Nesting Inline Styles
**Bold with *italic* inside**
*Italic with **bold** inside*
**Bold with ~~strikethrough~~**
~~Strikethrough with **bold** and *italic*~~
==Highlight with **bold** and *italic* text==
Text with ^super**bold**script^ combination
Text with ~sub**bold**script~ combination

### Edge Cases and Conflicts
**Not bold because missing closing asterisks*
*This is italic* but this*is*not
**Bold** and __also bold__ in same line
This ** is not bold ** (spaces inside)
Un__believe__able (bold in middle of word)
*Italic at start and **bold *nested italic** after*

### Escaping Inline Styles
\*Not italic\*
\*\*Not bold\*\*
\~\~Not strikethrough\~\~
\+\+Not underline\+\+
\=\=Not highlight\=\=
\^Not superscript\^
\~Not subscript\~

---

## 5. Blockquotes Test

### Basic Blockquote
> This is a simple blockquote.
> It can span multiple lines.

### Nested Blockquotes
> Level 1 blockquote
>> Level 2 blockquote
>>> Level 3 blockquote
>>>> Level 4 blockquote

> Level 1 with space
> > Level 2 with space
> > > Level 3 with space

### Blockquotes with Other Elements
> **Bold text in blockquote**
> *Italic text in blockquote*
> 
> Multiple paragraphs in blockquote.
> 
> `Inline code` in blockquote.

> Blockquote with list:
> - Item 1
> - Item 2
>   - Nested item

> Blockquote with code block:
> ```javascript
> console.log("Hello");
> ```

### Blockquote Edge Cases
> Blockquote

Not in blockquote (no > at start)

>No space after > - should still work

---

## 6. Lists Test

### Unordered Lists
+ Item with plus
- Item with dash
* Item with asterisk

- Mixed markers in same list
  + Nested with plus
    * Nested with asterisk
      - Nested with dash

### Ordered Lists
1. First item
2. Second item
3. Third item
   1. Nested ordered item
   2. Another nested item
4. Fourth item

### Lazy Numbering
1. First
1. Second (also numbered as 1)
1. Third (also numbered as 1)

### Custom Start Number
57. Starting at 57
1. This should be 58
1. This should be 59

### Lists with Inline Styles
1. **Bold item**
2. *Italic item*
3. `Code in item`
4. Item with ~~strikethrough~~
5. Item with ==highlight==

### Lists with Multiple Paragraphs
1. First item

   Continuation paragraph (indented).

2. Second item with `inline code`

   Another paragraph here.

### Lists with Code Blocks
- Item one
  ```javascript
  console.log("code in list");
  ```
- Item two

### Complex Nested Lists
1. First ordered
   - Unordered nested
     1. Ordered nested again
        - Unordered nested again
          * Different marker
     2. Back to ordered
   - Another unordered
2. Second ordered

### Edge Cases
-Not a list (no space)
- List item
-Another not a list

1.No space - not a list
1. Proper list item

---

## 7. Code Test

### Inline Code
This is `inline code` in a sentence.
Multiple `code` spans `in` one `line`.
Code with **bold** outside: `var x = 5;` **bold text**
Backtick inside code: `` `backtick` ``

### Indented Code Block
    // This is indented code
    function test() {
      return true;
    }
    
    // Multiple lines with blank line above

### Fenced Code Block Without Language
```
plain code block
no syntax highlighting
```

### Fenced Code Block With Language
```javascript
const greeting = "Hello, World!";
console.log(greeting);

function add(a, b) {
  return a + b;
}
```

```python
def hello():
    print("Hello from Python")
    return True
```

```css
.class-name {
  color: #333;
  background: white;
}
```

### Code Block Edge Cases
```
Code with **markdown** `inside` - should not render
*italic* ~~strikethrough~~ ==highlight==
```

### Escaping Backticks
\`Not code\`
This is \`not inline code\` at all.

---

## 8. Tables Test

### Basic Table
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Table with Alignment
| Left Aligned | Center Aligned | Right Aligned |
| :----------- | :------------: | ------------: |
| Left         | Center         | Right         |
| Text         | Text           | Text          |

### Table with Inline Styles
| **Bold** | *Italic* | `Code` |
| -------- | -------- | ------ |
| **Data** | *Data*   | `var x` |
| ~~Strike~~ | ==Highlight== | [Link](url) |

### Table with Varying Widths
| Short | This is a much longer header |
| ----- | ---------------------------- |
| A     | B                            |

### Table with Empty Cells
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   |          | Cell 3   |
|          | Cell 2   |          |

### Edge Cases
| Header with **bold** and `code` |
| -------------------------------- |
| Cell with [link](http://test.com) |
| Cell with ![image](img.png) |

---

## 9. Links Test

### Basic Links
[Simple link](http://example.com)
[Link with title](http://example.com "This is a title")

### Links with Inline Styles
[**Bold link text**](http://example.com)
[*Italic link text*](http://example.com)
[Link with `code`](http://example.com)

### Reference-Style Links
This is a [reference link][ref1] in text.
Another [reference link][ref2] here.

[ref1]: http://example.com "Optional title"
[ref2]: http://another.com

### Auto-Links
<http://example.com>
<email@example.com>

### Edge Cases and Nesting
Link inside **bold: [link](http://test.com) text**
[Link](http://test.com) followed by **bold**
Escaped link: \[not a link\](http://test.com)
[Link with (parentheses) in text](http://test.com)
[Link with [nested] brackets](http://test.com)

### Multiple Links
[Link 1](http://one.com) and [Link 2](http://two.com) in same line.

---

## 10. Images Test

### Basic Images
![Alt text](https://via.placeholder.com/150)
![Alt text with title](https://via.placeholder.com/150 "Image title")

### Images with Custom Attributes
![Responsive image](https://via.placeholder.com/300)<!-- class="img-fluid" style="border-radius: 8px;" -->
![Another image](https://via.placeholder.com/200)<!-- width="100" height="100" -->

### Reference-Style Images
![Alt text][img1]

[img1]: https://via.placeholder.com/150 "Referenced image"

### Edge Cases
![](https://via.placeholder.com/150)
![Alt only]
Image in **bold: ![img](https://via.placeholder.com/50) text**
![Image with **bold** in alt](https://via.placeholder.com/150)

### Image vs Link Confusion
![Image](url) vs [Link](url)
!\[Escaped image\](url)

---

## 11. Footnotes Test

### Basic Footnotes
This is a sentence with a footnote[^1].
Another sentence with a different footnote[^note2].

[^1]: This is the first footnote.
[^note2]: This is the second footnote with **bold** text.

### Inline Footnote
This has an inline footnote^[This is defined inline].

### Multi-Paragraph Footnote
Reference to complex footnote[^complex].

[^complex]: First paragraph of footnote.

    Second paragraph (indented with 4 spaces).
    
    Third paragraph with `code` and **bold**.

### Reused Footnotes
First reference[^shared].
Second reference to same footnote[^shared].

[^shared]: This footnote is referenced twice.

### Footnote Edge Cases
Footnote with special chars[^special-123].
[^special-123]: Footnote with special identifier.

No space before footnote marker[^nospc].
[^nospc]: This should still work.

---

## 12. Custom Containers Test

### Inline Span Containers
This is ::highlight[important text]:: in a sentence.
Multiple ::warning[warning]:: and ::info[info]:: spans.
Nested styles ::bold[**bold** and *italic*]:: in span.

### Block Div Containers
:::note
This is a note container.
It can have **bold**, *italic*, and `code`.
:::

:::warning
**Warning:** This is a warning message.
Multiple paragraphs are supported.

- List item 1
- List item 2
:::

:::info
### Heading in Container
Content with heading.

```javascript
// Code in container
console.log("test");
```
:::

### Nested Containers
:::outer
This is outer container.

::inner[Inner span]:: inside outer.

More outer content.
:::

### Edge Cases
:::unclosed
This container has no closing fence.

:::classname
Empty container
:::

:::[Empty class name]::

---

## 13. Math and Chemistry Test

### Inline Math
Einstein's equation: $E=mc^2$
Pythagorean theorem: $a^2 + b^2 = c^2$
Fractions: $\frac{1}{2}$ and $\frac{a+b}{c+d}$
Summation: $\sum_{i=1}^{n} x_i$

### Block Math
$$
\begin{align}
F &= ma \\
E &= mc^2 \\
a &= \frac{\mathrm{d}v}{\mathrm{d}t}
\end{align}
$$

$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$

### Inline Chemistry
Water molecule: $\ce{H2O}$
Carbon dioxide: $\ce{CO2}$
Sulfuric acid: $\ce{H2SO4}$

### Block Chemistry
$$\ce{CO2 + C -> 2CO}$$

$$\ce{2H2 + O2 -> 2H2O}$$

$$\ce{CH4 + 2O2 -> CO2 + 2H2O}$$

### Edge Cases
Math with escaping: \$not math\$
Math with **bold outside**: $x^2$ **bold**
Multiple math in line: $a$ and $b$ and $c$

---

## 14. Custom Plugins Test

### YouTube Plugin
{{youtube dQw4w9WgXcQ}}

### Mermaid Diagram Plugin
{{mermaid 
flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
}}

### Markdown Import Plugin
{{markdown https://example.com/sample.md}}
{{markdown ./local-file.md}}

### SMILES Chemical Structure Plugin
{{smiles C1CCCCC1}}
{{smiles CC(=O)OC1=CC=CC=C1C(=O)O}}

### Multiple Plugins (If Supported)
{{youtube VIDEO_ID_1}}
{{markdown https://example.com/external.md}}
{{smiles C1=CC=CC=C1}}

### Plugin Edge Cases
{{unknownPlugin someInput}}
{{ youtube SPACE_BEFORE }}
{{markdown}}
{{smiles}}
{{youtube SPACE_AFTER }}
{{mermaid
}}

---

## 15. HTML and Escaping Test

### Raw HTML Pass-Through
<p>This is a **paragraph** with markdown inside.</p>

<div class="custom-class">
Content with *italic* and `code`.
</div>

<br>

<hr>

### HTML Comments
<!-- This is a comment -->
Text before <!-- inline comment --> text after.

### Image with Attribute Comment
![Image](https://via.placeholder.com/100)<!-- class="rounded" -->

### Escaping Special Characters
\*escaped asterisk\*
\**escaped double asterisk\*\*
\_escaped underscore\_
\[escaped bracket\]
\(escaped parenthesis\)
\# escaped hash
\+ escaped plus
\- escaped dash
\` escaped backtick
\~ escaped tilde
\^ escaped caret
\= escaped equals
\! escaped exclamation
\{\{escaped braces\}\}
\:\:escaped colons\:\:

### Escaping Custom Syntax
\:\:notContainer[this should not render as container]\:\:
\{\{notPlugin this should not render as plugin\}\}
\{{youtube VIDEO_ID}} (escape first brace only)

### Escaping in Different Contexts
Escaped in **bold: \*not italic\* but still bold**
Escaped in list:
- Item with \*escaped\*
- Item with \[escaped\]
- Item with \:\:escaped\:\:
- Item with \{\{escaped\}\}

Escaped in code (should show literally): `\*text\*`

Backslash itself: \\ (escaped backslash)

---

## 16. Complex Nesting and Edge Cases

### Lists with Everything
1. **Bold item** with *italic* and `code`
   
   Paragraph in list with [link](http://test.com) and ![image](https://via.placeholder.com/50)
   
   > Blockquote in list
   > With multiple lines
   
   ```javascript
   // Code block in list
   console.log("test");
   ```
   
   - Nested list
     - Deeper nested
       1. Ordered nested
       2. Another ordered

2. Second item with math: $x^2 + y^2 = z^2$

3. Item with footnote[^list-footnote]

[^list-footnote]: Footnote from list item.

### Blockquote with Everything
> # Heading in blockquote
> 
> **Bold** and *italic* and `code`
> 
> - List in blockquote
>   - Nested item
> 
> ```python
> # Code in blockquote
> print("test")
> ```
> 
> [Link in blockquote](http://test.com)
> 
> ![Image in blockquote](https://via.placeholder.com/100)
> 
> Math in blockquote: $E=mc^2$
> 
> >> Nested blockquote

### Table with Complex Content
| **Header** | *Content* | `Code` |
| ---------- | --------- | ------ |
| [Link](http://test.com) | $x^2$ | ![img](https://via.placeholder.com/30) |
| ~~Strike~~ | ==Highlight== | Text[^fn] |
| ::span[Custom]:: | Normal | **Bold** *Italic* |

[^fn]: Footnote from table.

### All Inline Styles Combined
This sentence has **bold**, *italic*, ***bold-italic***, `code`, ~~strikethrough~~, ++underline++, ==highlight==, ^superscript^, ~subscript~, [link](http://test.com), and ![image](https://via.placeholder.com/20) all together.

### Potential Conflicts
**Bold with * single asterisk inside**
*Italic with _ underscore * conflict*
[Link with ![image](img.png) inside](http://test.com)
`Code with **attempted bold** inside`
~~Strike with **bold** and *italic*~~

### URL and Email Auto-Detection Edge Cases
http://example.com (without angle brackets - might not auto-link)
<http://example.com> (with angle brackets - should auto-link)
email@example.com (without angle brackets)
<email@example.com> (with angle brackets)

### Markdown in HTML
<div>
**This should render as bold**
*This should render as italic*

- This should be a list
- Second item

```javascript
// This should be a code block
console.log("test");
```
</div>

### Consecutive Special Elements
***
___
---

**Bold****More Bold**
*Italic**Italic*

---

## 17. Edge Cases Summary

### Empty Elements
****
**
[]()
![]()
``
[]

### Mismatched Markers
**Bold start but *italic close*
*Italic start but **bold close**

### Special Characters in Content
Text with * asterisks * but spaces
Text with _ underscores _ but spaces
Text with ` backticks ` but spaces

### Very Long Lines
This is a very long line with **bold** and *italic* and `code` and [link](http://example.com) and ![image](https://via.placeholder.com/20) repeated many times to test parser performance: **bold** *italic* `code` [link](http://example.com) ![image](https://via.placeholder.com/20) **bold** *italic* `code` [link](http://example.com)

### Unicode and Special Characters
Emoji: 😀 🎉 🚀
Special chars: © ® ™ € £ ¥
Math symbols: ∑ ∫ ∞ ≈ ≠ ≤ ≥
Arrows: → ← ↑ ↓ ↔
Greek letters: α β γ δ ε

### Multiple Blank Lines


(Three blank lines above)

---

## End of Test File

This file covers:
- ✅ Paragraphs and line breaks
- ✅ All basic syntax elements
- ✅ Nested structures
- ✅ Inline style combinations
- ✅ Edge cases and conflicts
- ✅ Escaping scenarios
- ✅ Complex nesting (lists, blockquotes, tables)
- ✅ HTML pass-through
- ✅ Math and chemistry formulas
- ✅ Custom extensions
- ✅ Potential parsing conflicts
