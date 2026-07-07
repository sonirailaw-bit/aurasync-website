// app/api/chat/route.js
//
// Server-side route for the "Let's Sync" AI assistant shown in the
// AURA AUTOMATION HUB tab. Keeps the Anthropic API key on the server —
// never call the Anthropic API directly from the client.
//
// Requires an env var already set in Vercel: ANTHROPIC_API_KEY

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are "Let's Sync", the friendly in-app AI assistant for AuraSync,
an app that helps people pair uploaded photos/videos with music (Spotify + YouTube audio)
to create a synced audio-visual "Sync". Keep answers short, warm, and practical. Help users
with: choosing music that matches the mood of their media, troubleshooting uploads, and
explaining how sharing works. If asked about anything unrelated to AuraSync, gently steer
back to what you can help with in the app.`;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "messages array is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY is not set in the environment" },
        { status: 500 }
      );
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", errText);
      return Response.json(
        { error: "Failed to reach the AI assistant. Try again in a moment." },
        { status: 502 }
      );
    }

    const data = await anthropicRes.json();
    const reply = data.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n") || "Sorry, I didn't catch that — could you try rephrasing?";

    return Response.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return Response.json({ error: "Something went wrong on our end." }, { status: 500 });
  }
}
