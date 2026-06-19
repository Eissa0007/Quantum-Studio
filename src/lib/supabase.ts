import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Fallback to avoid breaking Local Storage operations if env vars are missing
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const checkSupabaseConnection = async () => {
  if (!supabase) {
    console.warn('Supabase connection warning: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.');
    return false;
  }
  
  try {
    const { error } = await supabase.from('projects').select('id').limit(1);
    if (error) {
      console.warn('Supabase connection warning: Schema not applied or invalid credentials.', error.message);
      return false;
    }
    console.log('✅ تم الاتصال بقاعدة بيانات Supabase بنجاح!');
    return true;
  } catch (err) {
    console.warn('Supabase connection warning:', err);
    return false;
  }
};

