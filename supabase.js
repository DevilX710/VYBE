const { createClient } = supabase;

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("VYBE Supabase connected");

// ======================================
// LOAD SONGS
// ======================================

async function loadSongs() {

  const container = document.getElementById("quickPicksCards");

  if (!container) {
    console.error("VYBE: quickPicksCards not found");
    return;
  }

  container.innerHTML = `
    <div style="color:#888;padding:20px">
      Loading your music...
    </div>
  `;

  try {

    console.log("VYBE: requesting songs...");

    const { data, error } = await supabaseClient
      .from("songs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("VYBE songs error:", error);

      container.innerHTML = `
        <div style="color:#ff7777;padding:20px">
          Couldn't load your music.
        </div>
      `;

      return;
    }

    console.log("VYBE songs received:", data);
    console.log("VYBE song count:", data ? data.length : 0);

    if (!data || data.length === 0) {

      container.innerHTML = `
        <div style="color:#888;padding:20px">
          No songs in your library yet.
        </div>
      `;

      return;
    }

    // Clear loading state
    container.innerHTML = "";

    // ======================================
    // CREATE SONG CARDS
    // ======================================

    data.forEach((song) => {

      const card = document.createElement("div");

      card.className = "card";

      card.dataset.song =
        song.title || "Unknown song";

      card.dataset.artist =
        song.artist || "Unknown artist";

      card.dataset.audio =
        song.audio_url || "";

      // --------------------------------------
      // COVER
      // --------------------------------------

      const cover = document.createElement("div");

      cover.className = "cover";

      if (song.cover_url) {

        const image = document.createElement("img");

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

      // --------------------------------------
      // TITLE
      // --------------------------------------

      const title =
        document.createElement("div");

      title.className = "card-title";

      title.textContent =
        song.title || "Unknown song";

      // --------------------------------------
      // ARTIST
      // --------------------------------------

      const artist =
        document.createElement("div");

      artist.className = "artist";

      artist.textContent =
        song.artist || "Unknown artist";

      // --------------------------------------
      // PLAY BUTTON
      // --------------------------------------

      const playButton =
        document.createElement("button");

      playButton.className = "play-card";

      playButton.type = "button";

      playButton.textContent = "▶";

      playButton.addEventListener("click", function(event) {

        event.stopPropagation();

        if (typeof selectSong === "function") {
          selectSong(card);
        }

      });

      // --------------------------------------
      // CARD CLICK
      // --------------------------------------

      card.addEventListener("click", function() {

        if (typeof selectSong === "function") {
          selectSong(card);
        }

      });

      // --------------------------------------
      // BUILD CARD
      // --------------------------------------

      card.appendChild(cover);
      card.appendChild(title);
      card.appendChild(artist);
      card.appendChild(playButton);

      container.appendChild(card);

    });

    console.log(
      "VYBE: created",
      data.length,
      "song cards"
    );

    // Update search system
    if (typeof refreshSearchCards === "function") {
      refreshSearchCards();
    }

  } catch (err) {

    console.error(
      "VYBE unexpected error:",
      err
    );

    container.innerHTML = `
      <div style="color:#ff7777;padding:20px">
        Something went wrong while loading music.
      </div>
    `;
  }
}


// ======================================
// START AFTER DOM IS READY
// ======================================

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    loadSongs
  );

} else {

  loadSongs();

}
