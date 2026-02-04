import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create client with relaxed typing
export const supabase = createClient(supabaseUrl, supabaseKey);

// Export Database type from the types file
export type { Database } from '../types/database';
