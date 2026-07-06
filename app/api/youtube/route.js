// app/api/youtube/route.js
//
// Searches YouTube videos using the Data API v3.
//
// Requires env var in Vercel:
//   YOUTUBE_API_KEY   (a Google Cloud "API key" restricted to YouTube Data
//                      API v3 — NOT a Stripe key. If searches fail with an
//                      auth error, double check this in Vercel's dashboard.)

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    if (!q || !q.trim()) {
      return Response.json({ videos: [] });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "YOUTUBE_API_KEY is not set" }, { status: 500 });
    }

    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("videoCategoryId", "10"); // Music category
    url.searchParams.set("maxResults", "10");
    url.searchParams.set("q", q);
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());

    if (!res.ok) {
      const text = await res.text();
      console.error("YouTube search failed:", text);
      return Response.json({ error: "YouTube search failed" }, { status: 502 });
    }

    const data = await res.json();
    const videos = (data.items || [])
      .filter((item) => item.id?.videoId)
      .map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails?.default?.url,
        publishedAt: item.snippet.publishedAt,
      }));

    return Response.json({ videos });
  } catch (err) {
    console.error("YouTube route error:", err);
    return Response.json({ error: "Something went wrong searching YouTube." }, { status: 500 });
  }
}
