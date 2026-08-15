const { createClient } = supabase;

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("VYBE Supabase connected:", supabaseClient);
