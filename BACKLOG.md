# VELO — Backlog aggiornato (25 marzo 2026)

> ⚠️ NON CANONICO / BACKLOG OPERATIVO STORICO
> Fonte canonica corrente: VELO_CURRENT_STATE.md
> WEB COUPLE EXPANSION — Practical Actions v1 = ✅ CLOSED + LIVE

---

## ✅ COMPLETATI (tutte le sessioni)

### Sessione 22 marzo 2026
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

### Sessione 25 marzo 2026
- [x] Bug vetrina fornitori: specialità custom non visibili → fix sincronizzazione vendor_accounts → public_vendors
- [x] Bug chat fornitori ↔ sposi: join couples senza FK rimosso, query separata, RLS corretta
- [x] Chat: immagini (upload su bucket chat-images), traduzione messaggi on-demand (velo-translate-message)
- [x] Chat: badge messaggi non letti (tab Fornitori app + vendor home), mark-as-read automatico
- [x] Bug login fornitore app: race condition token refresh → checkingRef guard + cache AsyncStorage
- [x] App vendor/availability: bug pulsante − non salvava → fix salvataggio diretto su click
- [x] App vendor/index: rimossa sezione "Messaggi recenti" ridondante
- [x] Realtime messaggi abilitato su Supabase (supabase_realtime publication)
- [x] Dashboard web fornitori: tab Messaggi, Info, Foto, Stats, disponibilità — parità funzionale con app
- [x] Web vendor chat: immagini in upload e visualizzazione
- [x] Web: fix cache no-store su Supabase client (specialità custom visibili in tempo reale)
- [x] Web: specialties_custom + bio_en/description_en + awards_en nella pagina dettaglio fornitore
- [x] Geolocalizzazione: verificato — province/regioni standard come sistema primario, zone VELO solo suggerimento stranieri ✓ nessuna modifica necessaria
- [x] Traduzioni IT/EN sito web: completate per tutta la dashboard fornitore (35 nuove chiavi)
- [x] Edge function velo-translate-message: deployata e attiva
- [x] Resend email: velo-send-emails già costruita (auguri + review request) — cron job giornaliero 09:00 UTC attivato
- [x] Invito fornitore: send-vendor-invite aggiornata con Resend (email branded); admin ha link mailto + SMS + WhatsApp ✓
- [x] Login Google/Apple: confermato — funziona solo in build pubblicata, non in Expo Go locale (by design)

---

## 🔴 DA FARE — Alta priorità

- [x] **RESEND_API_KEY** — ✅ AGGIUNTO (27/03) su Supabase Dashboard → Edge Functions → Secrets
  - Nome: `RESEND_API_KEY`
  - Serve per: velo-send-emails (auguri + review) e send-vendor-invite
  - Setup Resend: resend.com → API Keys → verifica dominio velowedding.it

---

## 🟡 IN ATTESA (decisioni esterne)

- [ ] **Partita IVA**: selezione codice ATECO pendente — aprire quando pronto
- [ ] **Trademark EUIPO**: attendere avanzamento registrazione nazionale UIBM prima di procedere a livello europeo

---

## 🟡 IMPORTANTE — Da fare

- [ ] **Login Apple**: non funziona (da verificare in build pubblicata — potrebbe essere by design come Google)
- [ ] **Analisi AI preventivo esterno**: upload PDF → VELO AI analizza e suggerisce (struttura base già presente con QuoteAnalyzer)
- [ ] **SEO**: gestire province/regioni/comuni come keyword; valutare tagline senza "wedding planner"
- [ ] **Notifiche push**: nessun sistema di notifica push implementato — le coppie non ricevono notifica quando arriva un messaggio dal fornitore (solo badge all'apertura dell'app)
- [ ] **Full invite email automation**: da verificare end-to-end — **CONFLICT**: TASK.md dice "non invia email reali", BACKLOG.md dice RESEND_API_KEY ✅ aggiunto. Segnalato come "da verificare" 🔲 Later

---

## 🟢 COMPLETATO MA DA MONITORARE

- [ ] **Geolocalizzazione**: sistema province/regioni verificato ✓ — monitorare feedback utenti
- [ ] **Zone VELO**: usate solo come suggerimento per stranieri ✓ — non rimuovere

---

## 📧 EMAIL — Stato Resend

**Stato**: RESEND_API_KEY risulta documentata come aggiunta (27/03/2026, vedi sopra).
Edge functions deployate. Cron job attivo.

**Full invite email automation = NOT CLOSED** — da verificare end-to-end prima di dichiarare chiusa.

Email che DOVREBBERO funzionare se la key è attiva e il dominio verificato:
- Auguri matrimonio il giorno delle nozze (`velo-send-emails`)
- Richiesta recensione +7 giorni dopo (`velo-send-emails`)
- Invito fornitore (`send-vendor-invite`)

**Non dichiarare questa sezione CLOSED senza prova end-to-end.**

---

*Aggiornato: 25 marzo 2026. Banner NON CANONICO aggiunto: 30 aprile 2026.*
