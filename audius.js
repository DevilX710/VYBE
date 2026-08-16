// VYBE 2.0 — Audius music search + streaming
// Independent of Supabase so your existing uploaded-song system keeps working.

const VYBE_AUDIUS_BASE = "https://api.audius.co/v1";
let vybeAudiusResults = [];

function audiusArtwork(track) {
  return track?.artwork?._480x480 || track?.artwork?._1000x1000 || track?.artwork?._150x150 || "";
}

function audiusArtist(track) {
  return track?.user?.name || track?.user?.handle || "Unknown artist";
}

function audiusStreamUrl(trackId) {
  return `${VYBE_AUDIUS_BASE}/tracks/${encodeURIComponent(trackId)}/stream`;
}

function audiusCard(track) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.song = track.title || "Unknown song";
  card.dataset.artist = audiusArtist(track);
  card.dataset.audio = audiusStreamUrl(track.id);
  card.dataset.cover = audiusArtwork(track);
  card.dataset.source = "audius";
  card.dataset.trackId = track.id;

  const cover = document.createElement("div");
  cover.className = "cover";
  const artwork = audiusArtwork(track);
  if (artwork) {
    const img = document.createElement("img");
    img.src = artwork;
    img.alt = `${track.title || "Song"} cover`;
    img.loading = "lazy";
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
  title.textContent = track.title || "Unknown song";

  const artist = document.createElement("div");
  artist.className = "artist";
  artist.textContent = audiusArtist(track);

  const play = document.createElement("button");
  play.className = "play-card";
  play.type = "button";
  play.textContent = "▶";
  play.title = "Play";
  play.addEventListener("click", event => {
    event.stopPropagation();
    if (typeof selectSong === "function") selectSong(card);
  });

  card.addEventListener("click", () => {
    if (typeof selectSong === "function") selectSong(card);
  });

  card.append(cover, title, artist, play);
  return card;
}

async function searchAudius(query) {
  const q = String(query || "").trim();
  if (!q) return [];

  const url = `${VYBE_AUDIUS_BASE}/tracks/search?query=${encodeURIComponent(q)}&limit=20&sort_method=relevant`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Audius search failed: ${response.status}`);

  const json = await response.json();
  return Array.isArray(json.data)
    ? json.data.filter(track => track?.id && track?.isStreamable !== false && track?.isStreamable !== "false")
    : [];
}

function findVYBESearchInput() {
  return document.querySelector('#search, .search, input[type="search"], input[placeholder*="Search" i], input[placeholder*="song" i]');
}

function findVYBESearchContainer() {
  return document.getElementById("quickPicksCards") || document.querySelector(".cards");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>\'"]/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", "\"":"&quot;"
  }[character]));
}

function renderAudiusResults(results, query) {
  const container = findVYBESearchContainer();
  if (!container) return;

  container.innerHTML = "";
  if (!results.length) {
    container.innerHTML = `<div style="color:#888;padding:20px">No Audius tracks found for “${escapeHTML(query)}”.</div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  results.forEach(track => fragment.appendChild(audiusCard(track)));
  container.appendChild(fragment);
}

let audiusSearchTimer;
let audiusSearchRequest = 0;

function setupAudiusSearch() {
  const input = findVYBESearchInput();
  if (!input || input.dataset.audiusReady === "1") return;
  input.dataset.audiusReady = "1";

  input.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    const query = input.value.trim();
    if (!query) return;

    clearTimeout(audiusSearchTimer);
    audiusSearchTimer = setTimeout(async () => {
      const container = findVYBESearchContainer();
      if (container) container.innerHTML = `<div style="color:#888;padding:20px">Searching Audius…</div>`;

      const requestId = ++audiusSearchRequest;
      try {
        const results = await searchAudius(query);
        if (requestId !== audiusSearchRequest) return;
        vybeAudiusResults = results;
        renderAudiusResults(results, query);
      } catch (error) {
        console.error("VYBE Audius search error:", error);
        if (requestId === audiusSearchRequest && container) {
          container.innerHTML = `<div style="color:#ff7777;padding:20px">Audius search failed. Try again.</div>`;
        }
      }
    }, 100);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupAudiusSearch);
} else {
  setupAudiusSearch();
}

window.VYBE_AUDIUS = {
  search: searchAudius,
  streamUrl: audiusStreamUrl,
  searchResults: () => vybeAudiusResults
};
