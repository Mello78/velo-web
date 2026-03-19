# VELO — Contesto progetto per Cowork / Claude

> Leggi questo file intero prima di fare qualsiasi modifica al progetto.

-----

## Cos'è VELO

App mobile + sito web per la pianificazione di matrimoni in Italia.
Targeting: coppie italiane + destination wedding stranieri + fornitori.
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

Deploy sito: `cd C:\Users\mello\velo-web-temp && git add -A && git commit -m "msg" && git push origin main`

-----

## Stack

**App mobile:** React Native + Expo SDK 54, TypeScript, Supabase
Avvio: `npx expo start --clear` — preview su Expo Go (shake to reload)

**Sito web:** Next.js App Router (NON Pages Router), Tailwind CSS, Supabase, Vercel

-----

## Struttura app mobile

```
app/
  _layout.tsx        # Root routing + splash (usa assets/images/logo_velo.png)
  auth.tsx           # Login/registrazione
  onboarding.tsx     # 8 step — autocomplete comuni + mappa provincia→zona VELO
  (tabs)/
    index.tsx        # Home — countdown + budget
    planning.tsx     # Checklist + ReligiousCeremonyGuide
    vendors.tsx      # Marketplace — filtri, chat, conferma vendor
    budget.tsx       # Budget tracker
    guests.tsx       # Ospiti con RSVP
    vision.tsx       # Stile + palette 18 colori
    profile.tsx      # Profilo coppia
    documents.tsx    # Guida documenti stranieri
  vendor/            # Dashboard vendor (profilo, disponibilità, milestones, chat)
lib/
  supabase.ts
  geocoding.ts       # haversineKm() + geocodeCity() via Nominatim
  i18n/              # LanguageProvider + it.ts + en.ts (traduzioni complete)
  data/countries.ts  # 20 paesi + ITALY_REGIONS
  data/comuni.ts     # ~400 comuni + PROVINCIA_TO_VELO_ZONA + cercaComuni()
components/
  VendorDetail.tsx
  ReligiousCeremonyGuide.tsx
  AIAssistant.tsx    # Disattivato (manca ANTHROPIC_API_KEY)
assets/images/
  logo_velo.png      # Logo completo trasparente
  favicon.png        # Icona V trasparente
```

-----

## Struttura sito web

```
app/
  layout.tsx          # Root — SplashLoader incluso
  page.tsx            # Home — usa NavBar responsivo
  fornitori/page.tsx  # Lista vendor (Client Component, ricerca per città + distanza)
  fornitori/[id]/page.tsx  # Dettaglio vendor
  vendor/page.tsx     # Portale vendor (login + dashboard 4 tab)
  admin/page.tsx      # Admin (solo mello.cn@gmail.com)
components/
  NavBar.tsx          # Navbar responsiva con hamburger mobile
  SimpleNav.tsx       # Navbar per pagine interne (da applicare a fornitori e vendor)
  LangToggle.tsx      # Toggle IT/EN → cookie NEXT_LOCALE
  SplashLoader.tsx    # Splash 2 sec primo caricamento
lib/
  supabase.ts
  translations.ts     # Tutte le stringhe IT + EN
public/
  logo_velo.png / favicon.png / favicon_180.png / favicon_512.png
```

-----

## Database Supabase — schema attuale

**public_vendors** — include `lat DOUBLE PRECISION` e `lng DOUBLE PRECISION` (aggiunte di recente). I 24 vendor esistenti hanno già le coordinate popolate. I nuovi vendor le ottengono via geocoding automatico (da implementare).

**couples** — partner1/2, wedding_date, budget, nationality, country_of_origin, wedding_region, wedding_city, wedding_style, wedding_season, ceremony_type, wedding_size, color1, color2

**vendor_accounts** — lat, lng, max_events_per_day, work_regions[], logo_url

**Altre tabelle:** tasks, guests, expenses, messages, vendors, custom_vendors, vendor_milestones, vendor_blocked_dates, vendor_invites, admin_users

**Edge Functions:** send-vendor-invite, velo-ai-chat (senza ANTHROPIC_API_KEY)

**Storage:** bucket `vendor-photos` (pubblico, max 5MB)

-----

## Zone VELO (non corrispondono a regioni amministrative)

|Zona             |Province principali                                      |
|-----------------|---------------------------------------------------------|
|Langhe & Piemonte|TO, CN, AT, AL, BI, NO, VC, VB, AO, PV                   |
|Lago di Como     |CO, LC, VA, SO, MI, MB, BG, CR, LO                       |
|Lago di Garda    |BS, VR, MN                                               |
|Venezia & Veneto |VE, PD, VI, TV, RO, BL, TN, BZ + Friuli + Marche + Emilia|
|Toscana          |FI, SI, PI, AR, PT, PO, LU, MS, GR, LI                   |
|Umbria           |PG, TR                                                   |
|Roma & Lazio     |RM, LT, FR, VT, RI + Abruzzo + Molise                    |
|Amalfi Coast     |NA, SA, CE, BN, AV                                       |
|Puglia           |BA, TA, FG, LE, BR, BT + Basilicata + Calabria           |
|Sicilia          |PA, CT, ME, SR, AG, TP, RG, CL, EN                       |
|Liguria          |GE, SP, SV, IM + Sardegna                                |

Mappa completa: `lib/data/comuni.ts` → `PROVINCIA_TO_VELO_ZONA`

-----

## AsyncStorage keys (app)

```
velo_user_mode, velo_partner1/2, velo_wedding_date, velo_budget
velo_nationality ('italian'|'foreign'), velo_country_code
velo_wedding_region (zona VELO), velo_wedding_city
velo_ceremony ('civil'|'religious'|'symbolic')
velo_style, velo_season, velo_size
velo_color1/2 (hex), velo_onboarded ('true'), velo_lang ('it'|'en')
velo_vendor_id (UUID vendor_account)
```

-----

## Regole critiche

1. **File completi sempre** — mai diff parziali
1. **BOM in Cursor** — se il codice non funziona, ricrea il file con PowerShell `New-Item`
1. **Import Supabase app** → `../lib/supabase` (un solo `..`)
1. **Next.js App Router** — lingua da cookie `NEXT_LOCALE` con `cookies()` di `next/headers`
1. **Nominatim** — header `User-Agent: VELOWedding/1.0` obbligatorio, max 1 req/sec
1. **Commit sito** → sempre dalla cartella `velo-web-temp`

-----

## Credenziali

- Admin sito: velowedding.it/admin → mello.cn@gmail.com
- Supabase: progetto `jogsdrxnqrbbqieozlmo`
- Vercel: autodeploy da GitHub main

*Aggiornato: marzo 2026*
