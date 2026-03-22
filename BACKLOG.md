# VELO — Backlog appunti Mello (22 marzo 2026)

---

## ✅ COMPLETATI in sessione 22 marzo 2026

- [x] Build Vercel: fix tutti gli import @/ → percorsi relativi
- [x] Vendor portal web: registrazione, logo, foto, tutti i campi editabili
- [x] Admin: pulsante "Attiva in vetrina" + "Aggiorna vetrina" + email cliccabile inviti
- [x] Fornitori web: ricerca città ↔ filtro zona si resettano a vicenda
- [x] App vendors: filtro città auto-geocodifica la città del matrimonio al caricamento
- [x] App vendors: pulsante 🗑️ rimuovi fornitore dalla lista (solo se non confermato)
- [x] App vendors: check categoria duplicata alla conferma (avviso se già confermato stesso tipo)
- [x] App vendors: acconto nel reminder mostra cifra fissa o percentuale
- [x] App guests: campo Gruppo → select Famiglia/Parenti/Amici/Colleghi/Altro
- [x] App vendor/availability: data bloccata in formato GG/MM/AAAA con auto-inserimento /
- [x] App vendor/reminder: toggle cifra fissa / percentuale sul preventivo
- [x] App planning: task roadmap tradotti in inglese per le coppie straniere
- [x] DB: colonne photo1/2/3_url e location aggiunte a vendor_accounts
- [x] DB: colonna deposit_type aggiunta a vendor_reminders
- [x] Google OAuth: fix parsing token dal fragment + redirect dopo login

---



- [ ] Da web non si possono aggiungere foto al profilo fornitore
- [ ] Nessun campo per il logo nella registrazione fornitore
- [ ] Una volta compilato il profilo, il fornitore NON appare nella lista fornitori visibili
- [ ] Nessun modo per approvare/attivare un fornitore dall'admin
- [ ] Ci sono campi nel frontend fornitori che non si possono compilare → tutto ciò che è visibile deve essere editabile
- [ ] Il fornitore deve potersi iscrivere anche da web (non solo da app)
- [ ] Il fornitore deve poter fare tutto sia da app che da web (parità funzionale)
- [ ] Non funziona sull'app la filtrazione fornitori in base alla città cercata (coppia italiana)
- [ ] Una volta scelto un fornitore e aggiunto alla lista, non c'è modo di eliminarlo
- [ ] Fornitore proposto per invito: non visibile nell'admin per inviare la mail
- [ ] Invito fornitore: attivare anche via cellulare (SMS o WhatsApp)
- [ ] Non funziona il login con Apple
- [ ] Non funziona il login con Google

---

## 🟡 IMPORTANTE — Geolocalizzazione e ricerca

- [ ] Rimuovere le "zone VELO" come sistema primario → passare a province e regioni standard
- [ ] Le zone restano SOLO come suggerimento per gli stranieri (location belle)
- [ ] Coppie italiane: inseriscono il comune → tutto geolocalizzato su province/regioni
- [ ] Stranieri: possono scegliere location suggerite OPPURE qualsiasi comune → geolocalizzato
- [ ] Fornitori: indicano il comune dove sono + le province/regioni dove operano
- [ ] Ricerca custom nel campo: se l'utente cerca un comune, disabilita automaticamente il filtro zona precedente (es. ho selezionato "Lago di Como" poi cerco "Cuneo" → "Lago di Como" viene rimosso)
- [ ] Location: devono indicare numero massimo di ospiti → per ricerca intelligente

---

## 🟡 IMPORTANTE — Traduzione automatica vetrina fornitore

- [ ] Quello che il fornitore scrive in italiano nella sua vetrina → tradotto automaticamente in inglese (AI)
- [ ] In alternativa: aggiungere campi duplicati per la versione inglese

---

## 🟡 IMPORTANTE — Budget e preventivi

- [ ] Come gestire il budget dei fornitori già in lista (vendor)? Valutare se lasciare manuale
- [ ] Implementare analisi AI del preventivo esterno (upload PDF → VELO AI lo analizza)
- [ ] VELO AI suggerisce → migliorare i messaggi oppure disabilitare temporaneamente

---

## 🟡 IMPORTANTE — Conferma fornitore con controllo categoria

- [ ] Se confermo un fotografo, il sistema deve controllare se ne ho già confermato un altro della stessa categoria e chiedere ulteriore conferma
- [ ] Categorie da definire: ricevimento, partecipazioni, bomboniere, foto, musica, auto, animazione, fiori, video, torte, trucco, parrucco, abiti

---

## 🟡 IMPORTANTE — Varie app

- [ ] Inserimento ospiti: aggiungere select per tipo (famiglia, parenti, amici, colleghi) per velocizzare
- [ ] Date bloccate: formato data italiano (gg/mm/aaaa)
- [ ] Promemoria conferma fornitore: campo libero OPPURE due campi per l'acconto (cifra fissa o percentuale sul preventivo)
- [ ] Road map: tradurre i vari punti sull'app

---

## 🟢 SEO / Naming

- [ ] Valutare cambio nome/tagline: "wedding planner per l'Italia" → qualcosa senza "wedding planner" (meglio per SEO?)
- [ ] Gestire meglio la parte geografica per il SEO (province, regioni, comuni come keyword)

---

*Aggiornato: 22 marzo 2026*

---

## 🔧 MIGRATION SQL necessaria (da eseguire su Supabase)

Aggiungere colonne foto al vendor_accounts (serve per il nuovo flusso upload foto dal web):

```sql
ALTER TABLE vendor_accounts
  ADD COLUMN IF NOT EXISTS photo1_url TEXT,
  ADD COLUMN IF NOT EXISTS photo2_url TEXT,
  ADD COLUMN IF NOT EXISTS photo3_url TEXT;
```

Eseguirla da: Supabase Dashboard → SQL Editor

---

*Aggiornato: 22 marzo 2026 — sessione autonoma*

---

## 📧 EMAIL — Setup Resend (10 minuti quando sei pronto)

Resend è un servizio email gratuito fino a 3.000 email/mese.
Sito: https://resend.com

### Setup:
1. Crea account su resend.com (gratis)
2. Vai su "API Keys" → crea una chiave → copiala
3. Supabase Dashboard → Edge Functions → send-vendor-invite → Secrets
4. Aggiungi: RESEND_API_KEY = <la tua chiave>
5. Verifica il dominio velowedding.it in Resend (DNS record TXT)

### Email da implementare:
- **Auguri matrimonio** (giorno del matrimonio) → "Auguri da VELO 💛"
- **Richiesta review** (+7 giorni) → link diretto all'app per recensire i fornitori  
- **Invito vendor** → già strutturata, basta aggiungere Resend

### Già fatto senza email:
- Modal auguri nell'app (appare il giorno del matrimonio)
- Schermata review nell'app (appare +7 giorni dopo)
- Tabella reviews nel DB con trigger aggiornamento rating automatico

