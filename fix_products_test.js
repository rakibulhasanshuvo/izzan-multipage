const fs = require('fs');
let code = fs.readFileSync('src/app/api/admin/products/route.test.ts', 'utf8');

// Just remove diff markers properly by throwing away the bad incoming blocks
const regex = /<<<<<<<[^=]+=======\r?\n([\s\S]*?)>>>>>>> [^\r\n]+/g;
code = code.replace(regex, '$1');
fs.writeFileSync('src/app/api/admin/products/route.test.ts', code);
