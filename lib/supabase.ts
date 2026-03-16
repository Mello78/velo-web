import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jogsdrxnqrbbqieozlmo.supabase.co'
const supabaseAnonKey = 'sb_publishable_7uh_vtnvUMlJEZlMfPJAbQ_QX14wHor'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
