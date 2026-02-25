import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mmcknsoocheepqoxyfql.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If credentials are missing, we create a proxy or a dummy behavior to avoid crashing the whole app
// but we alert the developer.
if (!supabaseAnonKey) {
    console.error('Supabase ANON KEY is missing! Real-time features will be disabled. Add VITE_SUPABASE_ANON_KEY to your .env');
}

export const supabase = supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as any; // Cast as any to avoid type errors in hooks, but we must check for it
