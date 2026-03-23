const fs = require('fs');
let c = fs.readFileSync('C:/Users/mello/velo-web-temp/app/vendor/page.tsx', 'utf8');

// Fix 1: rimuovi 'use client' duplicato
c = c.replace("'use client'\n'use client'", "'use client'");

// Fix 2: translateToEnglish - aggiungi setter per i campi EN
const oldTranslate = "if (vendor.public_vendor_id) {\n        await supabase.from('public_vendors').update({\n          description_en: data.description || null,";
const newTranslate = "if (data.bio) setBioEn(data.bio)\n      if (data.specialties_custom?.length) setSpecialtiesCustomEn(data.specialties_custom)\n      if (data.awards?.length) setAwardsEn(data.awards)\n      if (vendor.public_vendor_id) {\n        await supabase.from('public_vendors').update({\n          description_en: data.bio || data.description || null,";
if (c.includes(oldTranslate)) {
  c = c.replace(oldTranslate, newTranslate);
  console.log('Fix 2 OK');
} else {
  console.log('Fix 2 NOT FOUND');
}

fs.writeFileSync('C:/Users/mello/velo-web-temp/app/vendor/page.tsx', c, 'utf8');
console.log('Done. no_duplicate_use_client:', !c.includes("'use client'\n'use client'"));
