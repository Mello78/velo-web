# TASK — Funzionalità da completare

> Prima leggi CONTEXT.md. Esegui i task nell'ordine indicato.

---

## TASK 1 — Immagini Vision nell'app

**In attesa di Mello** — le immagini vanno scelte insieme in chat con Claude.

**File:** `C:\Users\mello\VeloWedding\app\(tabs)\vision.tsx`

Attualmente usa placeholder Unsplash. Quando Mello sceglie le immagini,
aggiornare gli URL per ogni stile e stagione nel file.

**Non toccare questo file finché Mello non conferma le immagini.**

---

## TASK 2 — Attivare AI Chatbot

Il componente AIAssistant.tsx esiste già. L'Edge Function velo-ai-chat
è deployata su Supabase ma manca la chiave API.

**Cosa fare:**
1. Andare su console.anthropic.com → crea API key ($5 crediti iniziali)
2. Supabase Dashboard → Edge Functions → velo-ai-chat → Secrets
3. Aggiungere secret: ANTHROPIC_API_KEY = <la chiave>
4. In auth.tsx o nel tab chat, riabilitare il componente AIAssistant

Costo stimato: ~$0.001 per conversazione con Claude Haiku.

---

## TASK 3 — Email invito vendor

La Edge Function send-vendor-invite esiste ma non invia email reali.

**Cosa fare:**
1. Creare account su resend.com (gratuito fino a 3.000 email/mese)
2. Ottenere API key Resend
3. Supabase → Edge Functions → send-vendor-invite → aggiornare il codice
   per chiamare l'API Resend con template email VELO

**Template email da creare:**
- Oggetto: "Sei stato invitato su VELO — la piattaforma per i matrimoni in Italia"
- Body: nome del vendor che invita + link a velowedding.it/vendor

---

## TASK 4 — Notifiche push per nuovi messaggi

Quando un vendor risponde in chat, la coppia deve ricevere una notifica.
Viceversa quando la coppia scrive, il vendor riceve notifica.

**Stack consigliato:** Expo Push Notifications + Supabase Realtime

**Cosa fare:**
1. Installare: `npx expo install expo-notifications`
2. In _layout.tsx: richiedere permesso notifiche e salvare il token Expo Push
   nella tabella couples (colonna push_token) o vendor_accounts
3. Creare Edge Function send-push-notification che chiama l'API Expo
4. Trigger: quando viene inserito un nuovo messaggio in tabella messages,
   chiamare la Edge Function con il push token del destinatario

---

## TASK 5 — Statistiche vendor reali nel portale web

Attualmente il tab Statistiche mostra tutto "—".

**File:** `C:\Users\mello\velo-web-temp\app\vendor\page.tsx`

**Query da fare su Supabase per ogni vendor_account:**
```sql
-- Coppie che seguono il vendor (hanno aggiunto il vendor alla loro lista)
SELECT COUNT(*) FROM vendors WHERE public_vendor_id = $vendor_public_id

-- Conferme ricevute
SELECT COUNT(*) FROM vendors
WHERE public_vendor_id = $vendor_public_id AND confirmed = true

-- Messaggi ricevuti
SELECT COUNT(*) FROM messages
WHERE vendor_id IN (
  SELECT id FROM vendors WHERE public_vendor_id = $vendor_public_id
)
```

Sostituire i "—" con i valori reali nel tab stats.

---

## Stato attuale (marzo 2026)

### Completato ✅
- Google OAuth configurato su Supabase
- Bottone Google (e Apple su iOS) in auth.tsx
- Coordinate lat/lng nel DB — 24 vendor con coordinate popolate
- Navbar responsiva su tutte le pagine del sito
- Traduzione IT/EN completa sito con toggle lingua
- Autocomplete comuni nell'onboarding con mappa provincia→zona VELO
- lib/geocoding.ts con haversineKm + geocodeCity
- Geocoding automatico al salvataggio profilo vendor
- Campo ricerca citta' + ordinamento per distanza nel sito
- Campo ricerca citta' + ordinamento per distanza nell'app
- Guida cerimonia religiosa IT/EN (ReligiousCeremonyGuide)
- Sistema disponibilita' vendor (date bloccate + capacita' per giorno)
- Scadenziario vendor → task automatici nel planning coppia

### In attesa di Mello
- Immagini Vision (TASK 1)
- Test onboarding completo su Expo Go
- Prima build TestFlight (Apple Developer $99)
- Chiave API Anthropic per chatbot (TASK 2)

### Prossimi sviluppi
- TASK 2: Attivare AI chatbot
- TASK 3: Email invito vendor (Resend)
- TASK 4: Notifiche push messaggi
- TASK 5: Statistiche vendor reali
- Apple OAuth (richiede Apple Developer $99)
