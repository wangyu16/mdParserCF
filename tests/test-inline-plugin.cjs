const { Parser } = require('../dist/index.umd.js');
const { HTMLRenderer } = require('../dist/index.umd.js');

const parser = new Parser({ debugAST: false });
const renderer = new HTMLRenderer();

const markdown = 'Test emoji: {{emoji smile}}';
const ast = parser.parse(markdown);

console.log('AST:', JSON.stringify(ast, null, 2));

const html = renderer.render(ast);
console.log('\nHTML:', html.html);
