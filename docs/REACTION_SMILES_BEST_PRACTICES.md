# Reaction SMILES Best Practices

## Overview

When using the reaction plugin, certain SMILES notation patterns work better than others with the SmilesDrawer library.

## Known Issues

### 1. HTMLCanvasElement Error (Non-Critical)

**Error Message:**

```
Failed to execute 'querySelectorAll' ... '[object HTMLCanvasElement]' is not a valid selector
```

**Cause:** Internal issue within the SmilesDrawer library

**Impact:** Non-critical - reactions still render correctly despite this console warning

**Workaround:** None needed - the error is caught and doesn't prevent rendering

### 2. SMILES Notation Best Practices

#### ✅ Recommended Notation

| Chemical          | ❌ Avoid | ✅ Use Instead          | Reason                          |
| ----------------- | -------- | ----------------------- | ------------------------------- |
| Sulfuric acid     | `H2SO4`  | `[H+]`                  | Explicit H atoms cause warnings |
| Hydrochloric acid | `HCl`    | `[Cl-]` or `[H+].[Cl-]` | Cleaner ionic notation          |
| Chromium reagent  | `CrO3`   | `[Cr]`                  | Avoids explicit numbers         |
| Atomic oxygen     | `[O]`    | `[O2]` or `O=O`         | Molecular oxygen more stable    |

#### Examples

**Esterification (Good):**

```
{{reaction CC(=O)O.CCO>[H+]>CC(=O)OCC.O | textBelowArrow: Heat}}
```

**Oxidation (Good):**

```
{{reaction CCCO>[Cr].[O2]>CCC(=O)O}}
```

**Substitution (Good):**

```
{{reaction C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-]}}
```

## Reaction Format

```
{{reaction REACTANTS>REAGENTS>PRODUCTS | option: value}}
```

- **Reactants:** Multiple compounds separated by `.`
- **Reagents:** Catalysts/conditions (can be empty: `>>`)
- **Products:** Multiple compounds separated by `.`

### No Reagents Example

```
{{reaction CC(=O)Cl.CCO>>CC(=O)OCC.[Cl-]}}
```

## Debugging Tips

1. **Check Browser Console:** Look for SMILES parsing warnings
2. **Test Individual Components:** Use the SMILES plugin to test individual molecules first
3. **Simplify Reagents:** If a reaction fails, try simplifying the reagent notation
4. **Use Bracketed Notation:** For ions and reactive species, use `[...]` notation

## Working Examples

See `examples/test-reactions.md` for a comprehensive set of working examples:

- Simple reactions
- Reactions with text below arrow
- Custom themes
- Multiple reagents
- Ionic species

## Further Resources

- [SmilesDrawer Documentation](https://github.com/reymond-group/smilesDrawer)
- [SMILES Notation Guide](https://en.wikipedia.org/wiki/Simplified_molecular-input_line-entry_system)
- Project documentation: `docs/REACTION_PLUGIN.md`
