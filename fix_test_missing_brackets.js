const fs = require('fs');

const fixBrackets = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    const diff = openBraces - closeBraces;
    content += '\n' + '});\n'.repeat(diff/2) + '}\n'.repeat(diff % 2) + '\n';
    fs.writeFileSync(path, content);
  }
};

fixBrackets('src/app/api/admin/products/route.test.ts');
