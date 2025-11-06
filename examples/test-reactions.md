# Chemical Reaction Plugin Tests

## Simple Reaction

This is a simple reaction using the `{{reaction}}` plugin:

{{reaction C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-]}}

## Reaction with Text Below Arrow

You can add text below the reaction arrow using options:

{{reaction C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-] | textBelowArrow: 90%}}

## Reaction with Custom Theme

Using the oldschool theme:

{{reaction C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-] | theme: oldschool, textBelowArrow: 90%}}

## Simple Esterification Reaction

{{reaction CC(=O)O.CCO>[H+]>CC(=O)OCC.O | textBelowArrow: Heat}}

## Comparison: SMILES vs Reaction

Single molecule using SMILES plugin:
{{smiles C=CCBr}}

Reaction scheme using reaction plugin:
{{reaction C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-] | textBelowArrow: 90%}}

## Multiple Reactions

First reaction:
{{reaction CC(=O)Cl.CCO>>CC(=O)OCC.[Cl-]}}

Second reaction:
{{reaction CCCO>[Cr].[O2]>CCC(=O)O}}
