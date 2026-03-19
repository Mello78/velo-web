# VELO — Contesto progetto per Cowork / Claude

> Leggi questo file intero prima di fare qualsiasi modifica al progetto.

-----

## Cos'è VELO

App mobile + sito web per la pianificazione di matrimoni in Italia.
Targeting: coppie italiane + destination wedding stranieri + fornitori del settore.
Posizionamento: luxury, dark editorial, palette nero/oro/crema.
Tagline: *from yes to forever*

-----

## Repository e deploy

|Cosa            |Dove                                               |
|----------------|---------------------------------------------------|
|App mobile      |`C:\Users\mello\VeloWedding\`                      |
|Sito web        |`C:\Users\mello\velo-web-temp\`                    |
|GitHub sito     |https://github.com/Mello78/velo-web.git            |
|Sito live       |https://velowedding.it (Vercel, autodeploy da main)|
|Supabase project|`jogsdrxnqrbbqieozlmo` (EU Central)                |

Per deployare il sito: `git add -A && git commit -m "msg" && git push origin main`

-----

## Stack tecnico

**App mobile**

- React Native + Expo SDK 54
- TypeScript
- Supabase (auth + PostgreSQL)
- Expo Go per preview (shake to reload)
- Sviluppato su Windows 11 con Cursor AI
- Avvio: `npx expo start --clear` (porta 8081)

**Sito web**

- Next.js App Router (NON Pages Router)
- Tailwind CSS
- Supabase per dati vendor
- Deploy: Vercel

-----

## Struttura app mobile

```
app/
  _layout.tsx          # Root routing + splash screen (usa logo_velo.png)
  auth.tsx             # Login/registrazione
  onboarding.tsx       # 8 step con autocomplete comuni italiani
  (tabs)/
    index.tsx          # Home — countdown + budget
    planning.tsx       # Checklist + guida cerimonia religiosa
    vendors.tsx        # Marketplace fornitori
    budget.tsx         # Budget tracker
    guests.tsx         # Gestione ospiti
    vision.tsx         # Stile matrimonio + palette colori
    profile.tsx        # Profilo coppia
    documents.tsx      # Guida documenti per stranieri
  vendor/              # Area fornitori (dashboard, profilo, disponibilità)
lib/
  supabase.ts
  i18n/index.tsx       # LanguageProvider IT/EN
  i18n/it.ts           # Traduzioni italiano
  i18n/en.ts           # Traduzioni inglese
  data/countries.ts    # 20 paesi + ITALY_REGIONS
  data/comuni.ts       # ~400 comuni italiani con coordinate + mappa provincia→zona VELO
components/
  VendorDetail.tsx
  ReligiousCeremonyGuide.tsx
  AIAssistant.tsx      # Disattivato — manca ANTHROPIC_API_KEY in Supabase
assets/images/
  logo_velo.png        # Logo completo con testo (PNG trasparente)
  favicon.png          # Solo icona V (PNG trasparente)
```

-----

## Struttura sito web

```
app/
  layout.tsx           # Root layout — include SplashLoader
  page.tsx             # Home — usa NavBar component
  fornitori/
    page.tsx           # Lista vendor con filtri regione/categoria
    [id]/page.tsx      # Dettaglio vendor
  vendor/page.tsx      # Portale vendor (login + dashboard)
  admin/page.tsx       # Admin panel (solo mello.cn@gmail.com)
components/
  NavBar.tsx           # Navbar responsiva con hamburger mobile
  SimpleNav.tsx        # Navbar semplice per pagine interne
  LangToggle.tsx       # Toggle IT/EN (salva cookie NEXT_LOCALE)
  SplashLoader.tsx     # Splash 2 secondi al primo caricamento
lib/
  supabase.ts          # Client Supabase
  translations.ts      # Tutte le stringhe IT + EN
public/
  logo_velo.png        # Logo completo (sfondo trasparente)
  favicon.png          # Icona V (sfondo trasparente)
  favicon_180.png      # Apple touch icon
  favicon_512.png      # PWA icon
```

-----

## Database Supabase (schema attuale)

### Tabelle principali

- **couples** — id, user_id, partner1, partner2, wedding_date, budget, nationality, country_of_origin, wedding_region, wedding_style, wedding_season, ceremony_type, wedding_size, color1, color2, wedding_city
- **public_vendors** — id, name, category, location, region, description, price_from, price_to, rating, review_count, verified, featured, photo1/2/3_url, logo_url, instagram, facebook, tiktok, website, whatsapp, phone, languages[], specialties[], styles[], work_regions[], **lat, lng** ← coordinate geografiche appena aggiunte
- **vendor_accounts** — profilo privato vendor, include lat/lng, max_events_per_day, work_regions[]
- **tasks** — planning coppia
- **guests** — lista ospiti
- **expenses** — budget tracker
- **messages** — chat coppia↔vendor
- **vendors** — vendor aggiunti dalla coppia (lista personale)
- **custom_vendors** — vendor personali fuori da VELO
- **vendor_milestones** — scadenziario vendor (max 4 per vendor)
- **vendor_blocked_dates** — date bloccate manualmente
- **vendor_invites** — traccia inviti vendor
- **admin_users** — solo mello.cn@gmail.com

### Edge Functions attive

- `send-vendor-invite`
- `velo-ai-chat` (attiva ma senza ANTHROPIC_API_KEY — chatbot disattivato)

### Storage

- Bucket `vendor-photos` (pubblico, max 5MB)

-----

## Logica zone geografiche

L'app usa zone VELO (non regioni amministrative):

- Langhe & Piemonte → province TO, CN, AT, AL, BI, NO, VC, VB, AO, PV
- Lago di Como → province CO, LC, VA, SO, MI, MB, BG, CR, LO
- Lago di Garda → province BS, VR, MN
- Venezia & Veneto → province VE, PD, VI, TV, RO, BL, TN, BZ + Friuli + Marche + Emilia
- Toscana → province FI, SI, PI, AR, PT, PO, LU, MS, GR, LI
- Umbria → province PG, TR
- Roma & Lazio → province RM, LT, FR, VT, RI + Abruzzo + Molise
- Amalfi Coast → province NA, SA, CE, BN, AV
- Puglia → province BA, TA, FG, LE, BR, BT + Basilicata + Calabria
- Sicilia → tutte le province siciliane
- Liguria → province GE, SP, SV, IM + Sardegna

Mappa completa: `lib/data/comuni.ts` → `PROVINCIA_TO_VELO_ZONA`

-----

## Funzionalità in sviluppo (TODO)

### Ricerca vendor per distanza geografica ← IN CORSO

- DB: colonne lat/lng già aggiunte a public_vendors ✓
- Coordinate dei 24 vendor esistenti già popolate ✓
- Sito: campo cerca città → geocoding Nominatim (gratuito) → ordina per distanza
- App: stessa logica + opzione GPS

### Altre pendenze

- Immagini Vision (da scegliere insieme)
- Test onboarding su Expo Go
- AI chatbot (aggiungere ANTHROPIC_API_KEY in Supabase Secrets)
- Google OAuth (credenziali Google Cloud Console)
- Apple OAuth ($99/anno Apple Developer)
- Prima build TestFlight
- Email invito vendor (Resend/SendGrid in Edge Function)
- Statistiche vendor reali nel portale web
- Notifiche push nuovi messaggi
- Versione inglese sito — traduzione completa già fatta, toggle IT/EN funzionante

-----

## Credenziali e accessi

- **Admin sito**: velowedding.it/admin → mello.cn@gmail.com
- **Supabase dashboard**: supabase.com → progetto jogsdrxnqrbbqieozlmo
- **Vercel**: autodeploy da GitHub main branch
- **GitHub**: https://github.com/Mello78/velo-web.git

-----

## Regole di sviluppo importanti

1. **File completi** — Claude scrive sempre file interi, non diff parziali
1. **BOM characters** — se copi codice in Cursor e non funziona, ricrea il file con PowerShell `New-Item`
1. **Path Supabase** — import da `../lib/supabase` non `../../lib/supabase`
1. **App Router** — il sito usa Next.js App Router, NON Pages Router. Non usare `useRouter` per cambio lingua
1. **Lingua sito** — rilevata dal cookie `NEXT_LOCALE` nelle Server Components con `cookies()` di next/headers
1. **Expo Go** — due terminali: uno per `npx expo start --clear`, uno per i package
1. **TypeScript** — deve essere in devDependencies nell'app
1. **AsyncStorage keys app**:
- `velo_user_mode` → 'couple' | 'vendor'
- `velo_partner1`, `velo_partner2`, `velo_wedding_date`, `velo_budget`
- `velo_nationality` → 'italian' | 'foreign'
- `velo_wedding_region` → zona VELO (es. 'Langhe & Piemonte')
- `velo_wedding_city` → città specifica
- `velo_ceremony` → 'civil' | 'religious' | 'symbolic'
- `velo_style`, `velo_season`, `velo_size`
- `velo_color1`, `velo_color2`
- `velo_onboarded` → 'true'
- `velo_lang` → 'it' | 'en'

-----

*Aggiornato: marzo 2026*
