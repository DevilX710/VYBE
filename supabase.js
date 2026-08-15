const { createClient } = supabase;

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("VYBE Supabase connected:", supabaseClient);

async function loadSongs() {
  const { data, error } = await supabaseClient
    .from("songs")
    .select("*");

  if (error) {
    console.error("Error loading songs:", error);
    return;
  }

  console.log("Songs loaded:", data);
  renderSongs(data);
}

function renderSongs(songs) {
  const container = document.getElementById("quickPicksCards");
  if (!container) return;

  if (!songs || songs.length === 0) {
    container.innerHTML = `<p style="color:#888;">No songs uploaded yet.</p>`;
    return;
  }

  container.innerHTML = "";

  songs.forEach(song => {
    const title = song.title || "Untitled";
    const artist = song.artist || "VYBE";
    const audioUrl = song.audio_url || "";
    const coverUrl = song.cover_url || "";

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.song = title;
    card.dataset.artist = artist;
    card.dataset.audio = audioUrl;
    card.dataset.cover = coverUrl;
    card.onclick = () => selectSong(card);

    card.innerHTML = `
      <div class="cover">
        ${coverUrl
          ? `<img src="${coverUrl}" alt="${title}" style="width:100%;height:100%;object-fit:cover;border-radius:7px;">`
          : `<div class="cover-symbol">V</div>`
        }
      </div>
      <div class="card-title">${title}</div>
      <div class="artist">${artist}</div>
      <button class="play-card">▶</button>
    `;

    container.appendChild(card);
  });

  if (typeof refreshSearchCards === "function") {
    refreshSearchCards();
  }
}

loadSongs();
