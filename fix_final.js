const fs = require('fs');
let c = fs.readFileSync('C:/Users/mello/velo-web-temp/app/vendor/page.tsx', 'utf8');

// Fix 1: aggiungi setter EN dopo error check in translateToEnglish
const marker = "setTranslating(false); return }\r\n      if (vendor.public_vendor_id) {\r\n        await supabase.from('public_vendors').update({\r\n          description_en: data.description || null,";
const replacement = "setTranslating(false); return }\r\n      // Aggiorna state locale con traduzioni ricevute\r\n      if (data.bio) setBioEn(data.bio)\r\n      if (data.specialties_custom?.length) setSpecialtiesCustomEn(data.specialties_custom)\r\n      if (data.awards?.length) setAwardsEn(data.awards)\r\n      if (vendor.public_vendor_id) {\r\n        await supabase.from('public_vendors').update({\r\n          description_en: data.bio || data.description || null,";

if (c.includes(marker)) {
  c = c.replace(marker, replacement);
  console.log('Fix 1 OK');
} else {
  console.log('Fix 1 NOT FOUND');
}

// Fix 2: pulsante traduci nel tab Profilo — dopo la bio EN textarea, prima di phone
const profileBioEnd = 'placeholder="Describe yourself... (or use Translate in \u2728 Info)" />\r\n                    </div>\r\n                  </div>\r\n                </div>\r\n                <div>\r\n                  <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.phoneLabel}</label>';

const profileBioEndNew = 'placeholder="Describe yourself... (or use Translate in \u2728 Info)" />\r\n                    </div>\r\n                  </div>\r\n                  {vendor.public_vendor_id && (\r\n                    <div className="mt-2">\r\n                      <button onClick={translateToEnglish} disabled={translating}\r\n                        className="w-full py-2 rounded-xl border border-gold/30 text-gold text-xs hover:bg-gold/10 transition-colors disabled:opacity-50">\r\n                        {translating ? \'\ud83c\udf10 Traduzione in corso...\' : \'\ud83c\udf10 Traduci descrizione in inglese\'}\r\n                      </button>\r\n                      {translateMsg && <p className="text-center text-xs mt-1 text-green-400">{translateMsg}</p>}\r\n                    </div>\r\n                  )}\r\n                </div>\r\n                <div>\r\n                  <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.phoneLabel}</label>';

if (c.includes(profileBioEnd)) {
  c = c.replace(profileBioEnd, profileBioEndNew);
  console.log('Fix 2 OK');
} else {
  console.log('Fix 2 NOT FOUND - checking partial...');
  const idx = c.indexOf('Describe yourself');
  console.log('Context:', JSON.stringify(c.substring(idx, idx + 200)));
}

fs.writeFileSync('C:/Users/mello/velo-web-temp/app/vendor/page.tsx', c, 'utf8');
console.log('Done');
