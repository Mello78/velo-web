const fs = require('fs');
let c = fs.readFileSync('C:/Users/mello/velo-web-temp/app/vendor/page.tsx', 'utf8');

// Fix 1: translateToEnglish - aggiungi setBioEn e altri setter dopo data.error check
const oldAfterError = c.substring(24452, 24452 + 300);
console.log('Section to replace:', JSON.stringify(oldAfterError));
