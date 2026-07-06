// app/api/spotify/route.js
//
// Searches Spotify tracks using the Client Credentials flow (no user login
// needed — fine for search/browse, not needed for playback control here).
//
// Requires env vars in Vercel:
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET

export const runtime = "nodejs";

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not set");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify token request failed: ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Refresh a little early to be safe
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    if (!q || !q.trim()) {
      return Response.json({ tracks: [] });
    }

    const token = await getAccessToken();
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!searchRes.ok) {
      const text = await searchRes.text();
      console.error("Spotify search failed:", text);
      return Response.json({ error: "Spotify search failed" }, { status: 502 });
    }

    const data = await searchRes.json();
    const tracks = (data.tracks?.items || []).map((t) => ({
      id: t.id,
      name: t.name,
      artists: t.artists.map((a) => a.name).join(", "),
      album: t.album?.name,
      artworkUrl: t.album?.images?.[2]?.url || t.album?.images?.[0]?.url || null,
      previewUrl: t.preview_url, // may be null — Spotify limits 30s previews
      externalUrl: t.external_urls?.spotify,
      durationMs: t.duration_ms,
    }));

    return Response.json({ tracks });
  } catch (err) {
    console.error("Spotify route error:", err);
    return Response.json({ error: "Something went wrong searching Spotify." }, { status: 500 });
  }
}
