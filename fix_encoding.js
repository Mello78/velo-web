const fs = require('fs');
let content = fs.readFileSync('C:/Users/mello/velo-web-temp/app/vendor/page.tsx', 'latin1');
const buf = Buffer.from(content, 'latin1');
content = buf.toString('utf8');
fs.writeFileSync('C:/Users/mello/velo-web-temp/app/vendor/page.tsx', content, 'utf8');
console.log('Done, length:', content.length, 'has emoji:', content.includes('\u{1F4F7}'));
