# Quick Start: Math & Plugins

## 🧮 Math Formulas - Quick Reference

### Inline Math
```markdown
Einstein's famous equation: $E = mc^2$

Quadratic formula: $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$

Greek: $\alpha + \beta = \gamma$
```

### Block Math
```markdown
$$
\begin{align}
E &= mc^2 \\
F &= ma
\end{align}
$$
```

### Enable in Parser
```typescript
const parser = new Parser({ enableMath: true });
```

### Add MathJax to HTML
```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
```

---

## 🔌 Plugins - Quick Reference

### YouTube Embed
```markdown
{{youtube dQw4w9WgXcQ}}
```

### Emoji
```markdown
Great {{emoji thumbsup}} idea {{emoji rocket}}
```

### SMILES
```markdown
Ethanol: {{smiles CCO}}
```

### Badge
```markdown
Status: {{badge success: Deployed}}
```

### Mermaid Diagram
```markdown
{{diagram mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
}}
```

### Enable in Parser
```typescript
const parser = new Parser({ enablePlugins: true });
```

---

## 📊 Usage Examples

### Combined Example
```markdown
# Machine Learning Basics

The loss function is $L(w) = \frac{1}{2}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$.

{{emoji rocket}} Key concepts {{emoji star}}:

$$
\theta = \theta - \alpha \nabla J(\theta)
$$

Status: {{badge success: Ready to deploy}}

Workflow:
{{diagram mermaid
graph LR
    A[Data] --> B[Preprocess]
    B --> C[Train]
    C --> D[Evaluate]
    D --> E[Deploy]
}}
```

### Test Example
```markdown
## Physics Problem

The wave equation is:
$$
\frac{\partial^2 u}{\partial t^2} = c^2 \nabla^2 u
$$

This has solutions of the form:
$$u(x,t) = A\sin(kx - \omega t)$$

where $k = \frac{\omega}{c}$ and $\omega = 2\pi f$.

Difficulty: {{badge warning: Advanced}}
```

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test math.test.ts    # Math tests only
npm test plugins.test.ts # Plugin tests only
```

### Watch Mode
```bash
npm test -- --watch
```

---

## 📚 Documentation

- **Full Guide:** `constructionNotes/MATH_AND_PLUGINS_GUIDE.md`
- **Implementation:** `constructionNotes/MATH_AND_PLUGINS_COMPLETE.md`
- **Parser Docs:** `bluePrint/projectBlueprint.md`

---

## ✅ Checklist

### Using Math
- [ ] Parser has `enableMath: true`
- [ ] HTML includes MathJax script
- [ ] Math wrapped in `$...$` or `$$...$$`
- [ ] No spaces between `$` and content

### Using Plugins
- [ ] Parser has `enablePlugins: true`
- [ ] Plugin syntax `{{name content}}`
- [ ] Match built-in plugin names exactly
- [ ] Content properly formatted

### Integration
- [ ] All tests passing (223/223)
- [ ] Build successful (0 errors)
- [ ] TypeScript types valid
- [ ] Git commits clean

---

## 🚀 API Reference

### Parser Initialization
```typescript
import { Parser } from 'mdparser-cf';

const parser = new Parser({
  enableMath: true,
  enablePlugins: true,
  debugAST: false
});

const ast = parser.parse(markdown);
```

### Renderer
```typescript
import { HTMLRenderer } from 'mdparser-cf';

const renderer = new HTMLRenderer();
const output = renderer.render(ast);
console.log(output.html);
```

### Plugin Registry
```typescript
import { 
  PluginRegistry, 
  createDefaultPluginRegistry 
} from 'mdparser-cf/plugin-system';

const registry = createDefaultPluginRegistry();
// or
const custom = new PluginRegistry();
custom.registerInlinePlugin(myPlugin);
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Math not rendering | 1. Check `enableMath: true` 2. Include MathJax script |
| Plugin not working | 1. Check `enablePlugins: true` 2. Verify syntax matches pattern |
| `$` appearing in output | 1. Math might be disabled 2. Check escaping |
| Tests failing | 1. Run `npm test` 2. Check error messages 3. See guides |

---

## 📞 Support

- **Docs:** Full guides in `constructionNotes/`
- **Tests:** Examples in `tests/unit/math.test.ts` and `tests/unit/plugins.test.ts`
- **Issues:** Check TypeScript errors with `npm run type-check`

---

**Status:** ✅ All features working  
**Tests:** ✅ 223/223 passing  
**Ready:** ✅ For production
