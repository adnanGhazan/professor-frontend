const fs = require('fs');
console.log(fs.statSync('app/research/page.tsx').mtime);
