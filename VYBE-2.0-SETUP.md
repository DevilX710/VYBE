# VYBE 2.0 — Audius

This branch adds Audius search and streaming without removing the existing Supabase uploader/library.

## How it works
- Existing uploaded songs continue to come from Supabase.
- `audius.js` adds Audius search to the existing search input.
- Enter a search term and VYBE requests streamable Audius tracks.
- Audius result cards use the existing `selectSong()` player hook and the official Audius `/tracks/{id}/stream` endpoint.
- No Audius API key is required for the read-only search endpoints used by this first version; Audius documents that most read-only endpoints work without credentials.

## Notes
Audius says its API supports searching and streaming tracks, and its read-only endpoints generally work without credentials. An API key can be added later for higher rate limits.

The first version intentionally keeps the existing VYBE player and Supabase features intact rather than replacing the whole app.
