# Reaction Plugin Troubleshooting

## Error: SmilesDrawer.parse expects valid SMILES but found ">"

This error occurs because the `SmilesDrawer.parse()` function is designed for individual molecules and doesn't understand reaction SMILES format (which uses `>` as a separator).

## Solution Approaches

### Approach 1: Use SmiDrawer.apply() (Recommended)

The SmilesDrawer library has a convenience method `SmiDrawer.apply()` that automatically detects and renders reactions.

### Approach 2: Manual Reaction Parsing

If `SmiDrawer.apply()` is not available, we need to:

1. Split the reaction SMILES by `>` to get: `reactants > reagents > products`
2. Parse each component separately using `SmilesDrawer.parse()`
3. Manually arrange them with an arrow in between

### Approach 3: Use img elements instead of SVG

Generate reaction images server-side or use a different rendering approach.

## Current Implementation

We're using Approach 1 with fallback handling. The global script in `convert-md-to-html.js` detects SVG elements with reaction SMILES (containing `>`) and uses `SmiDrawer.apply()`.

## Testing

To test if reactions are working:

1. Open `examples/features.html` in a browser
2. Open the browser's Developer Console (F12)
3. Look for these messages:
   - ✅ "Successfully rendered reaction X" = Working!
   - ❌ "SmiDrawer is not defined" or "SmiDrawer.apply is not a function" = API issue
4. Check the page for reaction diagrams

## Fallback: If SmiDrawer.apply() doesn't work

If you see `SmiDrawer.apply is not a function`, the library version might not support it. In this case, we need to implement manual parsing:

```javascript
// Split reaction SMILES
const parts = smiles.split('>');
const reactants = parts[0]; // e.g., "C=CCBr.[Na+].[I-]"
const reagents = parts[1]; // e.g., "CC(=O)C"
const products = parts[2]; // e.g., "C=CCI.[Na+].[Br-]"

// Parse and draw each component separately
// Then manually add arrow and labels
```

This is more complex and requires custom SVG composition.
