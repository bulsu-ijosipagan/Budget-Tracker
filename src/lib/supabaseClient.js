import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isLikelySupabaseKey = (value) =>
  typeof value === "string" &&
  /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value);

if (!supabaseUrl || !supabaseAnonKey || !isLikelySupabaseKey(supabaseAnonKey)) {
  throw new Error(
    "Supabase is not configured correctly. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the values from your Supabase project settings.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
