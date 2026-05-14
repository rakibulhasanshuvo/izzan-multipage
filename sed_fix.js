const fs = require('fs');

const fixFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  const lines = content.split('\n');
  let newLines = [];
  let inConflict = false;
  let keep = false;
  for (let line of lines) {
    if (line.startsWith('<<<<<<<')) {
      inConflict = true;
      keep = false;
    } else if (line.startsWith('=======')) {
      if (inConflict) {
        keep = true;
      }
    } else if (line.startsWith('>>>>>>>')) {
      inConflict = false;
      keep = false;
    } else {
      if (!inConflict || keep) {
        newLines.push(line);
      }
    }
  }
  fs.writeFileSync(path, newLines.join('\n'));
};

fixFile('src/app/api/orders/route.test.ts');
fixFile('src/app/api/admin/products/route.test.ts');
