import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jogsdrxnqrbbqieozlmo.supabase.co'
const supabaseAnonKey = 'sb_publishable_7uh_vtnvUMlJEZlMfPJAbQ_QX14wHor'

// Disabilita la Data Cache di Next.js per le fetch Supabase.
// Senza questo, Next.js App Router cача le risposte e le modifiche
// ai dati (es. specialties_custom) non appaiono finché non si rideploya.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url: RequestInfo | URL, options: RequestInit = {}) =>
      fetch(url, { ...options, cache: 'no-store' }),
  },
})
