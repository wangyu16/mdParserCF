# KaTeX Implementation - Visual Example

This document shows the before/after transformation of math rendering in the mdParserCF project.

## Quick Example

### Input Markdown
```markdown
Einstein's famous equation: $E=mc^2$

The quadratic formula:
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

Chemical formula example: $\ce{H2O}$ is water.

Chemical reaction:
$$
\ce{2H2 + O2 -> 2H2O}
$$
```

### Output with KaTeX (Server-Side Rendering)

#### Inline Math: `$E=mc^2$`
**Rendered HTML**:
```html
<p>Einstein's famous equation: <span class="katex">
  <span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML">
    <semantics><mrow><mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></mrow>
    <annotation encoding="application/x-tex">E=mc^2</annotation>
  </semantics></math></span>
  <span class="katex-html" aria-hidden="true">
    <!-- CSS-styled HTML representation -->
  </span>
</span></p>
```

**Result**: Fully rendered math with both MathML (for accessibility) and styled HTML (for display)

#### Block Math: `$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$`
**Rendered HTML**:
```html
<div class="math-block">
  <span class="katex-display"><span class="katex">
    <span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
      <!-- Complex MathML for quadratic formula -->
    </math></span>
    <span class="katex-html" aria-hidden="true">
      <!-- Large, centered CSS-styled representation -->
    </span>
  </span></span>
</div>
```

**Result**: Display-mode rendering with proper spacing and centering

#### Chemistry: `$\ce{H2O}$`
**Input**: `$\ce{H2O}$`
**Output**: Properly formatted chemical formula with proper subscript styling

#### Chemical Reaction: `$$\ce{2H2 + O2 -> 2H2O}$$`
**Input**: `$$\ce{2H2 + O2 -> 2H2O}$$`
**Output**: Block-level chemical equation with proper alignment and styling

## Before vs After Comparison

| Aspect | Before (MathJax) | After (KaTeX) |
|--------|------------------|---------------|
| **Rendering** | Client-side | Server-side ✅ |
| **HTML Type** | Script tags | Static HTML ✅ |
| **Performance** | Requires JS | No JS needed ✅ |
| **mhchem Support** | Manual setup | Built-in ✅ |
| **Browser Support** | All modern | All modern ✅ |
| **Accessibility** | Limited | MathML included ✅ |
| **SEO Friendly** | No | Yes ✅ |
| **Bundle Size** | ~100KB | ~100KB (same) |

## Test Coverage

### Math Formula Tests (18 total)
✅ Inline math parsing and rendering
✅ Block math rendering  
✅ Multiple inline formulas
✅ Special character handling
✅ Chemical formulas (mhchem)
✅ Multiline formulas (align environment)
✅ Mixed content with markdown
✅ Math disabled mode
✅ Error handling

### All Tests Passing
```
✓ tests/unit/parser.test.ts (92 tests)
✓ tests/unit/renderer.test.ts (87 tests)
✓ tests/unit/plugins.test.ts (29 tests)
✓ tests/unit/math.test.ts (18 tests)
─────────────────────────────────────
Total: 226 tests passing
```

## Technical Details

### Dependencies Added
- `katex@0.16.25` - Core rendering engine
- `@types/katex@0.x` - TypeScript definitions

### Files Modified
1. **src/renderer/html-renderer.ts**
   - Updated `renderInlineMath()` method
   - Updated `renderMathBlock()` method
   - Added error handling

2. **tests/unit/math.test.ts**
   - Updated 15 existing test assertions
   - Added 3 new chemistry formula tests

### Performance
- **Server-side rendering**: Eliminates client-side computation
- **Static HTML output**: Better caching and CDN delivery
- **MathML included**: Better accessibility without JavaScript

## Specification Compliance

✅ **Complies with markdownRenderRules.md Section 13**

Requirement: "Mathematical and chemical formulas are rendered using KaTeX with the mhchem extension"
Status: **IMPLEMENTED**

Requirement: "Server-side rendering"
Status: **IMPLEMENTED**

Requirement: "Support for inline and block formulas"
Status: **IMPLEMENTED**

Requirement: "Support for chemical formulas via mhchem"
Status: **IMPLEMENTED**

## Examples in Markdown

### Mathematics
```markdown
Euler's identity: $e^{i\pi} + 1 = 0$

The binomial theorem:
$$
(x + y)^n = \sum_{k=0}^{n} \binom{n}{k} x^{n-k} y^k
$$
```

### Chemistry (mhchem)
```markdown
Water molecule: $\ce{H2O}$

Photosynthesis:
$$
\ce{6CO2 + 6H2O ->[light] C6H12O6 + 6O2}
$$

Ionic equation:
$$
\ce{H+ + OH- -> H2O}
$$
```

## Next Steps

The project is now ready for:
1. ✅ Server-side math rendering with full specification compliance
2. ⏳ Phase 2: Cloudflare Workers deployment
3. ⏳ Optional: Add custom CSS styling for math display

---

**Status**: ✅ Complete
**Test Coverage**: 226/226 passing
**Specification Compliance**: 100%
**Implementation Date**: November 5, 2025
