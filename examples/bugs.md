This project is a customized markdown parser. All features have been implemented. see the 'projectBlueprint.md' and 'NEXT_STEPS.md'. Before deployment, I want to confirm all syntaxes would be rendered properly. However, when I used this markdown parser to render 'features.md' to 'features.html', I found several bugs. Figure out which is easiest to fix and which is more challenging. Help me to fix them one by one from the easiest.

1. Lists

The list lacks a linebreak at the end and combines the following line to its last child. For example in 'Features.md' line 67 - 69, '1. Item 3' and 'Nested list' are shown in one line.

Status: partially solved. complex nesting still does not work well.

2. Math Formulas

mhchem does not work.

Status: solved.

3. Plugins

All plugins do not work. They are simply passed as plain text.

Status: solved. All plugins (YouTube, emoji, SMILES, reaction, badge, diagram) now work correctly.

4. Escaped Markdown Inside Emphasis

`**\*Escaped asterisk inside bold\***` and `**\*\*not escaped\*\***` do not work properly.
