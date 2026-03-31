const fs = require('fs');
const path = 'C:/Users/mello/velo-web-temp/app/vendor/page.tsx';
let c = fs.readFileSync(path, 'utf8');

// 1. Rimuovi doppio 'use client'
c = c.replace("'use client'\n'use client'\n", "'use client'\n");
console.log('1. double use client:', !c.startsWith("'use client'\n'use client'") ? 'OK' : 'FAIL');

// 2. setConversations → setChatConversations nel mark-as-read
c = c.replace(
  "setConversations((prev: any[]) => prev.map((c: any) =>\n          c.coupleUserId === coupleUserId ? { ...c, unread: 0 } : c\n        ))",
  "setChatConversations((prev: any[]) => prev.map((c: any) =>\n          c.coupleUserId === coupleUserId ? { ...c, unread: 0 } : c\n        ))"
);
console.log('2. setChatConversations fix:', c.includes('setChatConversations((prev') ? 'OK' : 'FAIL');

// 3. Aggiunge description_en nella sincronizzazione public_vendors in save()
c = c.replace(
  "          bio_en: bioEn || null,\n          awards_en: awardsEn.filter(Boolean),\n          specialties_custom_en: specialtiesCustomEn.filter(Boolean),\n          years_experience: parseInt(yearsExp) || 0,\n          awards: awards.filter(Boolean),\n          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),\n        }).eq('id', vendor.public_vendor_id)",
  "          bio_en: bioEn || null,\n          description_en: bioEn || null,\n          awards_en: awardsEn.filter(Boolean),\n          specialties_custom_en: specialtiesCustomEn.filter(Boolean),\n          years_experience: parseInt(yearsExp) || 0,\n          awards: awards.filter(Boolean),\n          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),\n        }).eq('id', vendor.public_vendor_id)"
);
console.log('3. description_en in save():', c.includes("description_en: bioEn || null") ? 'OK' : 'FAIL');

fs.writeFileSync(path, c, 'utf8');
console.log('Done, lines:', c.split('\n').length);
