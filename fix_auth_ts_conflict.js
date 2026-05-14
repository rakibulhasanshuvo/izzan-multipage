const fs = require('fs');
let authTs = fs.readFileSync('src/lib/auth.ts', 'utf8');

authTs = authTs.replace(/<<<<<<<[\s\S]*?=======\n/g, '');
authTs = authTs.replace(/>>>>>>> main\n/g, '');

fs.writeFileSync('src/lib/auth.ts', authTs);
