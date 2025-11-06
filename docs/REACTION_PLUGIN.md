# Chemical Reaction Plugin Documentation

## Overview

The **Reaction Plugin** enables rendering of chemical reaction schemes directly in markdown using reaction SMILES notation. It uses the SmilesDrawer library to visualize reactions with arrows, reagents, and customizable annotations.

## Syntax

### Basic Syntax

```markdown
{{reaction REACTANTS>REAGENTS>PRODUCTS}}
```

### With Options

```markdown
{{reaction REACTION_SMILES | option1: value1, option2: value2}}
```

## Examples

### Simple Reaction

```markdown
{{reaction C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-]}}
```

Renders: Allyl bromide + Sodium iodide → Allyl iodide + Sodium bromide

### Reaction with Text Below Arrow

```markdown
{{reaction C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-] | textBelowArrow: 90%}}
```

Displays "90%" below the reaction arrow to indicate yield.

### Esterification Reaction

```markdown
{{reaction CC(=O)O.CCO>H2SO4>CC(=O)OCC.O | textBelowArrow: Heat}}
```

Shows: Acetic acid + Ethanol → Ethyl acetate + Water
with "Heat" displayed below the arrow.

### Oxidation Reaction

```markdown
{{reaction CCCO.[O]>CrO3>CCC(=O)O}}
```

### Custom Theme

```markdown
{{reaction C=CCBr>CC(=O)C>C=CCI | theme: oldschool}}
```

Renders the reaction using the "oldschool" visual style.

### Multiple Options

```markdown
{{reaction C=CCBr>CC(=O)C>C=CCI | theme: oldschool, textBelowArrow: 90%}}
```

Combines theme and text annotations.

## Reaction SMILES Format

Reaction SMILES follow the pattern:

```
REACTANTS > REAGENTS > PRODUCTS
```

- **REACTANTS**: Starting materials, separated by `.` (dot)
- **REAGENTS**: Catalysts or conditions, shown above the arrow
- **PRODUCTS**: Products of the reaction, separated by `.` (dot)

### Examples of Reaction SMILES:

| Reaction Type  | SMILES                                        | Description               |
| -------------- | --------------------------------------------- | ------------------------- |
| Substitution   | `C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-]` | Halogen exchange          |
| Esterification | `CC(=O)O.CCO>H2SO4>CC(=O)OCC.O`               | Acid + Alcohol → Ester    |
| Oxidation      | `CCCO.[O]>CrO3>CCC(=O)O`                      | Alcohol → Carboxylic acid |
| Addition       | `C=C.HBr>>CHBrCH3`                            | Alkene + HBr              |

## Available Options

| Option           | Type   | Description                             | Example               |
| ---------------- | ------ | --------------------------------------- | --------------------- |
| `textBelowArrow` | string | Text displayed below the reaction arrow | `textBelowArrow: 90%` |
| `theme`          | string | Visual theme for rendering              | `theme: oldschool`    |
| `width`          | number | SVG width in pixels                     | `width: 1000`         |
| `height`         | number | SVG height in pixels                    | `height: 500`         |

## HTML Output

The plugin generates an SVG element with:

- **Unique ID**: Each reaction gets a unique identifier
- **Data attributes**: `data-smiles` contains the reaction SMILES
- **Options**: Custom options stored in `data-smiles-options`
- **Client-side rendering**: JavaScript renders the reaction when the page loads

Example HTML output:

```html
<div
  class="reaction-container"
  style="display: block; margin: 1em 0; text-align: center; overflow-x: auto;"
>
  <svg
    id="reaction-abc123"
    data-smiles="C=CCBr>CC(=O)C>C=CCI"
    data-smiles-options='{"textBelowArrow":"90%"}'
    style="max-width: 100%; height: auto;"
  ></svg>
  <p style="font-size: 0.85em; color: #666; margin: 0.5em 0;">
    <code>C=CCBr>CC(=O)C>C=CCI</code>
  </p>
</div>
```

## Requirements

The SmilesDrawer library must be loaded in the HTML document:

```html
<script src="https://unpkg.com/smiles-drawer@2.0.1/dist/smiles-drawer.min.js"></script>
```

The conversion script (`convert-md-to-html.js`) automatically includes this library.

## Differences from SMILES Plugin

| Feature  | SMILES Plugin    | Reaction Plugin        |
| -------- | ---------------- | ---------------------- |
| Purpose  | Single molecules | Reaction schemes       |
| Output   | Canvas element   | SVG element            |
| Arrow    | No               | Yes, with annotations  |
| Reagents | No               | Yes, shown above arrow |
| Size     | 300x300 fixed    | 800x400 scalable       |

## Use Cases

1. **Chemistry Education**: Show reaction mechanisms in course materials
2. **Research Papers**: Document synthetic routes
3. **Lab Reports**: Illustrate experimental procedures
4. **Chemical Databases**: Display reaction transformations
5. **Documentation**: Explain chemical processes

## Tips

1. **Keep it simple**: Complex reactions may be hard to render clearly
2. **Use textBelowArrow**: Add yields, conditions, or time
3. **Test SMILES**: Verify your SMILES notation is valid before using
4. **Combine with SMILES plugin**: Use both for showing individual molecules and reactions
5. **SVG scales well**: Reactions render clearly at any size

## Browser Compatibility

Works in all modern browsers that support:

- SVG rendering
- ES6 JavaScript
- HTML5 Canvas (for SmilesDrawer)

## Testing

Run the test suite:

```bash
npm test
```

The plugin has comprehensive tests covering:

- Simple reactions
- Reactions with options
- Multiple option combinations
- Unique ID generation
- Pattern matching
- Fallthrough behavior

## Related

- [SMILES Plugin](./smiles-plugin.md) - For individual molecular structures
- [SmilesDrawer Documentation](https://github.com/reymond-group/smilesDrawer)
- [Reaction SMILES Specification](https://www.daylight.com/dayhtml/doc/theory/theory.smirks.html)
