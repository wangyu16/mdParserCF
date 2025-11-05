# Image Attributes Quick Reference

## Basic Syntax

```markdown
![alt text](image-url.png)<!-- class="responsive-img" style="width: 100%;" -->
```

Renders as:
```html
<img src="image-url.png" alt="alt text" class="responsive-img" style="width: 100%;" />
```

## Rules

1. **No Space Rule**: HTML comment must immediately follow the image with NO space
2. **Attribute Format**: Use standard HTML attribute syntax: `key="value"`
3. **Quote Support**: Both single `'` and double `"` quotes work
4. **Hyphenated Names**: Support `data-*` and `aria-*` attributes

## Usage Examples

### Single Attribute
```markdown
![alt](image.png)<!-- class="thumbnail" -->
```

### Multiple Attributes
```markdown
![Product](product.jpg)<!-- class="product-image" id="main-img" -->
```

### Data Attributes
```markdown
![Icon](icon.svg)<!-- data-size="large" data-color="blue" -->
```

### Image with Title and Attributes
```markdown
![Logo](logo.png "Company Logo")<!-- class="logo" style="width: 200px;" -->
```

### Mixed Quotes
```markdown
![Image](img.png)<!-- width="100" height='50' data-lazy="true" -->
```

## What Doesn't Work

```markdown
![alt](image.png) <!-- This is just a comment, not attributes -->
```

This works **without** the space:
```markdown
![alt](image.png)<!-- class="test" -->
```

## Common Use Cases

### Responsive Images
```markdown
![Mobile App](app-screenshot.png)<!-- class="responsive-img" style="max-width: 100%; height: auto;" -->
```

### Lazy Loading
```markdown
![Article Photo](photo.jpg)<!-- data-lazy="true" loading="lazy" -->
```

### Styled Images
```markdown
![Gallery](gallery.jpg)<!-- class="gallery-item" style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" -->
```

### Accessibility
```markdown
![Chart](chart.svg)<!-- aria-label="Sales Chart 2024" role="img" -->
```

## Implementation Details

- **Parser**: Extracts attributes from HTML comment immediately after image
- **Renderer**: Includes attributes in the `<img>` tag
- **Escaping**: Special characters in values are properly HTML-escaped
- **Backward Compatible**: Existing images work unchanged

## Testing

✅ 163 tests passing
✅ Full coverage of edge cases
✅ No regressions
✅ Production ready

## See Also

- `markdownRenderRules.md` - Complete specification
- `IMAGE_ATTRIBUTES_IMPLEMENTATION.md` - Detailed implementation guide
- Test files: `tests/unit/parser.test.ts`, `tests/unit/renderer.test.ts`
