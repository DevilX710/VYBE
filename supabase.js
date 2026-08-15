const { createClient } = supabase;

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("VYBE Supabase connected:", supabaseClient);

async function testSongs() {
  const { data, error } = await supabaseClient
    .from("songs")
    .select("*")
    .limit(5);

  console.log("Songs:", data);
  console.log("Songs error:", error);
}

testSongs();
