// ======================================
// VYBE SONG LOADER + AUDIUS 2.0
// ======================================

console.log("VYBE song loader starting...");

// Load the Audius integration alongside the existing Supabase library.
(function loadAudiusIntegration() {
  if (document.querySelector('script[data-vybe-audius]')) return;

  const script = document.createElement("script");
  script.src = "audius.js";
  script.dataset.vybeAudius = "1";
  script.async = true;
  document.head.appendChild(script);
})();

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

    const baseUrl = SUPABASE_URL
      .replace(/\/rest\/v1\/?$/, "")
      .replace(/\/$/, "");

    const endpoint =
      `${baseUrl}/rest/v1/songs?select=*&order=created_at.desc`;

    console.log("VYBE requesting:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log("VYBE response:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("VYBE Supabase error:", response.status, errorText);
      container.innerHTML = `
        <div style="color:#ff7777;padding:20px">
          Couldn't load your music.
        </div>
      `;
      return;
    }

    const songs = await response.json();
    console.log("VYBE songs received:", songs);
    console.log("VYBE song count:", songs.length);

    if (!Array.isArray(songs) || songs.length === 0) {
      container.innerHTML = `
        <div style="color:#888;padding:20px">
          No songs in your library yet. Use the search bar to find music on Audius.
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    songs.forEach(song => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.song = song.title || "Unknown song";
      card.dataset.artist = song.artist || "Unknown artist";
      card.dataset.audio = song.audio_url || "";

      const cover = document.createElement("div");
      cover.className = "cover";

      if (song.cover_url) {
        const img = document.createElement("img");
        img.src = song.cover_url;
        img.alt = song.title || "Song cover";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        cover.appendChild(img);
      } else {
        const symbol = document.createElement("div");
        symbol.className = "cover-symbol";
        symbol.textContent = "♪";
        cover.appendChild(symbol);
      }

      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = song.title || "Unknown song";

      const artist = document.createElement("div");
      artist.className = "artist";
      artist.textContent = song.artist || "Unknown artist";

      const playButton = document.createElement("button");
      playButton.className = "play-card";
      playButton.type = "button";
      playButton.textContent = "▶";

      playButton.addEventListener("click", function(event) {
        event.stopPropagation();
        if (typeof selectSong === "function") selectSong(card);
      });

      card.addEventListener("click", function() {
        if (typeof selectSong === "function") selectSong(card);
      });

      card.appendChild(cover);
      card.appendChild(title);
      card.appendChild(artist);
      card.appendChild(playButton);
      container.appendChild(card);
    });

    console.log(`VYBE: ${songs.length} song cards created`);

    if (typeof refreshSearchCards === "function") {
      refreshSearchCards();
    }

  } catch (error) {
    console.error("VYBE song loading failed:", error);
    container.innerHTML = `
      <div style="color:#ff7777;padding:20px">
        Something went wrong while loading music.
      </div>
    `;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSongs);
} else {
  loadSongs();
}
