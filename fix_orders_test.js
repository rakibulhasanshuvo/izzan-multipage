const fs = require('fs');

const file = 'src/app/api/orders/route.test.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /productMap is not defined/g;
if (code.match(regex)) {
  console.log("Found error inside tests.");
}
