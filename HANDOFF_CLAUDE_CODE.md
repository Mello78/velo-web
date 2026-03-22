# VELO — Handoff per Claude Code

## Stato sessione: 22 marzo 2026

---

## Il progetto

App mobile + sito web per pianificazione matrimoni in Italia.
- **App mobile:** React Native + Expo SDK 54 — `C:\Users\mello\VeloWedding\`
- **Sito web:** Next.js 14 App Router — `C:\Users\mello\velo-web-temp\`
- **GitHub:** https://github.com/Mello78/velo-web.git
- **Live:** https://velowedding.it (Vercel, autodeploy da main)
- **Supabase:** `jogsdrxnqrbbqieozlmo` (EU Central)

---

## PROBLEMA URGENTE DA RISOLVERE — Build Vercel fallisce

Vercel dà errore `npm run build exited with 1`.

**Causa:** Webpack non risolve gli import `@/lib/supabase` in alcuni file.
Il file `lib/supabase.ts` importa `@supabase/supabase-js` e questo causa
problemi di risoluzione con il path alias `@/` durante il build di produzione.

**Fix già applicato parzialmente:**
- `app/admin/page.tsx` → import già cambiato in `../../lib/supabase` ✅
- `tsconfig.json` → aggiunto `"baseUrl": "."` ✅
- `next.config.js` → rimossa opzione `turbopack` non supportata ✅

**Fix ancora da fare (2 file):**

1. `app/fornitori/page.tsx` riga 3:
   ```ts
   // DA:
   import { supabase } from '@/lib/supabase'
   // A:
   import { supabase } from '../../lib/supabase'
   ```

2. `app/vendor/page.tsx` riga 3:
   ```ts
   // DA:
   import { supabase } from '@/lib/supabase'
   // A:
   import { supabase } from '../../lib/supabase'
   ```

**Dopo il fix:**
```
cd C:\Users\mello\velo-web-temp
node_modules\.bin\next build
```
Se il build passa:
```
git add -A && git commit -m "fix-import-paths-build" && git push origin main
```

---

## Struttura completa del sito web

```
app/
  layout.tsx          # Root — SplashLoader incluso
  page.tsx            # Home — usa NavBar component responsivo
  fornitori/
    page.tsx          # Lista vendor — 'use client', fetch Supabase, filtri + ricerca per distanza
    [id]/page.tsx     # Dettaglio vendor — Server Component con cookies()
  vendor/page.tsx     # Portale vendor — 'use client', login + dashboard 4 tab
  admin/page.tsx      # Admin panel — solo mello.cn@gmail.com
components/
  NavBar.tsx          # Navbar responsiva con hamburger mobile
  SimpleNav.tsx       # Navbar per pagine interne
  LangToggle.tsx      # Toggle IT/EN → salva cookie NEXT_LOCALE
  SplashLoader.tsx    # Splash 2 sec al primo caricamento
lib/
  supabase.ts         # createClient — import relativo negli altri file!
  translations.ts     # Stringhe IT + EN complete
public/
  favicon.png / favicon_180.png / favicon_512.png / logo_velo.png
CONTEXT.md            # Contesto completo del progetto
TASK.md               # Task pendenti
```

---

## Regole critiche Next.js per questo progetto

1. **Import supabase** → usare SEMPRE percorsi relativi:
   - Da `app/` → `../../lib/supabase`
   - Da `app/sottocartella/` → `../../../lib/supabase`
   - MAI usare `@/lib/supabase` (rompe il build)

2. **Import translations e components** → `@/lib/translations` e `@/components/X` funzionano ✅

3. **Lingua** → rilevata da cookie `NEXT_LOCALE` con `cookies()` di `next/headers`
   nelle Server Components. Nei Client Components via `document.cookie`.

4. **Next.js versione:** 14.2.35 (NON 15/16)

5. **moduleResolution nel tsconfig:** `"node"` (non "bundler")

---

## Cosa è già funzionante

- ✅ Home page responsiva con NavBar hamburger
- ✅ Pagina fornitori con ricerca per città + ordinamento per distanza (haversine)
- ✅ Dettaglio vendor completo
- ✅ Portale vendor con dashboard 4 tab
- ✅ Admin panel
- ✅ Toggle IT/EN su tutte le pagine
- ✅ Splash animata al primo caricamento
- ✅ Favicon e logo corretti
- ✅ Coordinate lat/lng su tutti i 24 vendor nel DB

---

## Task pendenti (vedi TASK.md nel repo)

1. **URGENTE:** Fix build Vercel (descritto sopra)
2. Email invito vendor (Resend, gratuito)
3. Notifiche push messaggi
4. Statistiche vendor reali nel portale
5. AI chatbot (aggiungere ANTHROPIC_API_KEY in Supabase Secrets)

---

## App mobile — info utili

- Avvio: `npx expo start --clear` dalla cartella `C:\Users\mello\VeloWedding\`
- Google OAuth già implementato in `app/auth.tsx`
- Geocoding e ricerca per distanza già implementati
- `lib/geocoding.ts` esiste con `haversineKm` e `geocodeCity`

---

## Credenziali

- Admin: velowedding.it/admin → mello.cn@gmail.com
- Supabase project: jogsdrxnqrbbqieozlmo
- Vercel: autodeploy da GitHub main branch
