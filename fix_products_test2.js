const fs = require('fs');

const path = 'src/app/api/admin/products/route.test.ts';
let code = fs.readFileSync(path, 'utf8');

// The original conflict looks like this:
// <<<<<<< fix-patch-test-suite-...
//   });
// =======
//   // test code
//   });
// >>>>>>> main
// So instead of a generic replace which might mess up braces, let's just find and remove the <<<<<<< up to =======,
// and then the >>>>>>> main.

const lines = code.split('\n');
const newLines = [];
let inConflict = false;
let keep = true;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith('<<<<<<<')) {
    inConflict = true;
    keep = false;
  } else if (line.startsWith('=======')) {
    keep = true;
  } else if (line.startsWith('>>>>>>>')) {
    inConflict = false;
  } else {
    if (!inConflict || keep) {
      newLines.push(line);
    }
  }
}

fs.writeFileSync(path, newLines.join('\n'));
