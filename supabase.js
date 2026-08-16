const { createClient } = supabase;

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// ======================================
// LOAD SONGS FROM SUPABASE
// ======================================

async function loadSongs() {

  const container =
    document.getElementById("quickPicksCards");

  if (!container) return;

  container.innerHTML =
    `<div style="color:#888;padding:20px">
      Loading your music...
    </div>`;

  const { data, error } =
    await supabaseClient
      .from("songs")
      .select("*")
      .order("created_at", { ascending: false });

  if (error) {

    console.error("Failed to load songs:", error);

    container.innerHTML =
      `<div style="color:#888;padding:20px">
        Couldn't load songs.
      </div>`;

    return;
  }

  console.log("VYBE songs loaded:", data);

  if (!data || data.length === 0) {

    container.innerHTML =
      `<div style="color:#888;padding:20px">
        No songs in your library yet.
      </div>`;

    return;
  }


  // Clear loading message
  container.innerHTML = "";


  // Create cards
  data.forEach(song => {

    const card =
      document.createElement("div");

    card.className = "card";

    card.dataset.song =
      song.title || "Unknown song";

    card.dataset.artist =
      song.artist || "Unknown artist";

    card.dataset.audio =
      song.audio_url || "";


    const cover =
      document.createElement("div");

    cover.className = "cover";


    if (song.cover_url) {

      const image =
        document.createElement("img");

      image.src = song.cover_url;

      image.alt =
        song.title || "Song cover";

      image.style.width = "100%";
      image.style.height = "100%";
      image.style.objectFit = "cover";
      image.style.borderRadius = "8px";

      cover.appendChild(image);

    } else {

      const symbol =
        document.createElement("div");

      symbol.className = "cover-symbol";

      symbol.textContent = "♪";

      cover.appendChild(symbol);
    }


    const title =
      document.createElement("div");

    title.className = "card-title";

    title.textContent =
      song.title || "Unknown song";


    const artist =
      document.createElement("div");

    artist.className = "artist";

    artist.textContent =
      song.artist || "Unknown artist";


    const playButton =
      document.createElement("button");

    playButton.className = "play-card";

    playButton.textContent = "▶";

    playButton.onclick = (event) => {

      event.stopPropagation();

      selectSong(card);

    };


    card.appendChild(cover);
    card.appendChild(title);
    card.appendChild(artist);
    card.appendChild(playButton);


    // Clicking the card also plays it
    card.addEventListener("click", () => {
      selectSong(card);
    });


    container.appendChild(card);

  });


  // Update search cards
  if (typeof refreshSearchCards === "function") {
    refreshSearchCards();
  }
}


// ======================================
// START
// ======================================

loadSongs();
