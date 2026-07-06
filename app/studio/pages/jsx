"use client";

// app/studio/page.jsx
//
// AURASYNC — STUDIO (responsive website version)
// One page, three sections you can jump between (Remix / Merch / Engine).
// Built to scale from a phone screen up through iPad and desktop — no fixed
// "phone frame," everything reflows with the viewport.
//
// SETUP NOTES:
// 1. Firebase import below assumes a `lib/firebase.js` file exporting
//    `app` (and optionally `auth`). Adjust the import path/names if yours
//    differ.
// 2. Firebase Storage must be enabled (Build > Storage) with rules that
//    allow authenticated writes.
// 3. Needs these env vars set in Vercel: ANTHROPIC_API_KEY,
//    SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, YOUTUBE_API_KEY.
// 4. Icons use Font Awesome. Add this to <head> in app/layout.js if it's
//    not already there:
//    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
// 5. Checkout is a mock confirmation on purpose — Stripe is deferred until
//    after the live product ships.

import { useState, useRef, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app, auth } from "@/lib/firebase"; // ADJUST THIS IMPORT to match your firebase file

const PRODUCTS = [
  {
    id: "crystalline-waves",
    title: "Crystalline Waves",
    price: "₹1,499",
    dims: "2160 x 3840 (4K UHD Mobile Framework)",
    desc: "A high-definition canvas rendering presenting deep aquatic gradients intersecting with reflective natural light layers.",
    icon: "fa-droplet",
    tint: "from-blue-950/40 to-slate-950 text-cyan-800",
  },
  {
    id: "abyssal-fluid-flow",
    title: "Abyssal Fluid Flow",
    price: "₹1,850",
    dims: "3840 x 2160 (4K Desktop Matrix)",
    desc: "Abstract generative vectors mapping shifting mineral lines and ice shades found in deep glacial channels.",
    icon: "fa-wave-square",
    tint: "from-teal-950/40 to-slate-950 text-teal-800",
  },
];

const TABS = [
  { id: "remix", label: "Remix", icon: "fa-cubes" },
  { id: "merch", label: "Merch", icon: "fa-bag-shopping" },
  { id: "engine", label: "Engine", icon: "fa-brain" },
];

export default function StudioPage() {
  const [tab, setTab] = useState("remix");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  // --- Upload state ---
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const fileInputRef = useRef(null);

  // --- Music picker state ---
  const [musicSheetOpen, setMusicSheetOpen] = useState(false);
  const [musicTab, setMusicTab] = useState("spotify");
  const [spotifyQuery, setSpotifyQuery] = useState("");
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [youtubeQuery, setYoutubeQuery] = useState("");
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playingPreviewId, setPlayingPreviewId] = useState(null);
  const previewAudioRef = useRef(null);

  // --- Chat state ---
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey, I'm Let's Sync. Upload something and tell me the vibe you're going for — I'll help you pick the music." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  useEffect(() => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    const onEnded = () => setPlayingPreviewId(null);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  function togglePreview(track) {
    const audio = previewAudioRef.current;
    if (!audio || !track.previewUrl) return;
    if (playingPreviewId === track.id) {
      audio.pause();
      setPlayingPreviewId(null);
      return;
    }
    audio.src = track.previewUrl;
    audio.play();
    setPlayingPreviewId(track.id);
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploadStatus("idle");
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!file) return;
    setUploadStatus("uploading");
    try {
      const storage = getStorage(app);
      const uid = auth?.currentUser?.uid || "anon";
      const path = `uploads/${uid}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      await getDownloadURL(storageRef);
      setUploadStatus("done");
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadStatus("error");
    }
  }

  async function searchSpotify() {
    if (!spotifyQuery.trim()) return;
    setSpotifyLoading(true);
    try {
      const res = await fetch(`/api/spotify?q=${encodeURIComponent(spotifyQuery)}`);
      const data = await res.json();
      setSpotifyResults(data.tracks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSpotifyLoading(false);
    }
  }

  async function searchYoutube() {
    if (!youtubeQuery.trim()) return;
    setYoutubeLoading(true);
    try {
      const res = await fetch(`/api/youtube?q=${encodeURIComponent(youtubeQuery)}`);
      const data = await res.json();
      setYoutubeResults(data.videos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setYoutubeLoading(false);
    }
  }

  function addToCart(product) {
    setCart((c) => [...c, product]);
    setCheckoutMessage("");
  }

  function handleCheckout() {
    if (cart.length === 0) {
      setCheckoutMessage("Your cart is empty — add something first.");
      return;
    }
    setCheckoutMessage(
      `Order placeholder confirmed for ${cart.length} item${cart.length > 1 ? "s" : ""}. Payments aren't live yet — this is a preview flow.`
    );
    setCart([]);
  }

  async function sendChat() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { role: "assistant", content: "Something broke on my end — try sending that again." }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <audio ref={previewAudioRef} className="hidden" />

      {/* Header / nav — same on every screen size */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-slate-300 to-slate-500 shadow-inner" />
            <span className="font-mono text-sm tracking-[0.25em] uppercase">aurasync</span>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors ${
                  tab === t.id || (t.id === "merch" && tab === "dive")
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <i className={`fas ${t.icon} text-sm`} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ---------------- REMIX ---------------- */}
        {tab === "remix" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 sm:p-8 text-center md:text-left flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 mx-auto md:mx-0 rounded-full bg-gradient-to-br from-white via-slate-300 to-slate-500 shadow-inner flex-shrink-0" />
              <div>
                <div className="inline-block border border-slate-800 px-4 py-0.5 rounded-xl bg-slate-950 font-mono text-sm tracking-[0.25em] uppercase mb-3">
                  aurasync
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Upload a photo or video, then pair it with music to create your Sync — works the same whether you're on your phone, iPad, or desktop.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                  <i className="fas fa-sliders-h mr-1.5" /> AV Remix
                </span>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />

              {!previewUrl && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 sm:h-56 bg-slate-950 rounded-2xl border border-slate-900 border-dashed flex flex-col items-center justify-center text-center p-4 hover:border-indigo-800 transition-colors"
                >
                  <i className="fas fa-photo-film text-3xl text-slate-700 mb-2" />
                  <span className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">
                    Click to choose a photo or video
                  </span>
                </button>
              )}

              {previewUrl && (
                <div className="space-y-3">
                  <div className="w-full h-48 sm:h-56 bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden flex items-center justify-center">
                    {file?.type.startsWith("video") ? (
                      <video src={previewUrl} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Upload preview" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 text-[11px] font-mono uppercase tracking-widest py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:border-slate-700"
                    >
                      Change
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploadStatus === "uploading"}
                      className="flex-1 text-[11px] font-mono uppercase tracking-widest py-2.5 rounded-xl bg-indigo-500 text-white disabled:opacity-50 hover:bg-indigo-400"
                    >
                      {uploadStatus === "uploading" ? "Uploading…" : "Upload"}
                    </button>
                  </div>

                  {uploadStatus === "error" && (
                    <div className="bg-rose-950/40 p-2 rounded-xl border border-rose-900/40 text-[11px] text-rose-400 font-mono text-center">
                      Upload failed. Check Storage rules and try again.
                    </div>
                  )}

                  {uploadStatus === "done" && (
                    <div className="space-y-3">
                      <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-900/40 text-[11px] text-emerald-400 font-mono text-center">
                        Uploaded — pick your music below.
                      </div>

                      {(selectedTrack || selectedVideo) && (
                        <div className="space-y-2">
                          {selectedTrack && (
                            <div className="flex items-center gap-2 bg-slate-950 border border-slate-900 rounded-xl p-2">
                              <i className="fab fa-spotify text-emerald-400 text-sm" />
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] text-slate-200 truncate">{selectedTrack.name}</div>
                                <div className="text-[10px] text-slate-500 truncate">{selectedTrack.artists}</div>
                              </div>
                              <button
                                onClick={() => togglePreview(selectedTrack)}
                                disabled={!selectedTrack.previewUrl}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                                  selectedTrack.previewUrl ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-600"
                                }`}
                              >
                                <i className={`fas ${playingPreviewId === selectedTrack.id ? "fa-pause" : "fa-play"}`} />
                              </button>
                              <button onClick={() => setSelectedTrack(null)} className="text-slate-600 hover:text-rose-400 text-xs">
                                <i className="fas fa-xmark" />
                              </button>
                            </div>
                          )}
                          {selectedVideo && (
                            <div className="flex items-center gap-2 bg-slate-950 border border-slate-900 rounded-xl p-2">
                              <i className="fab fa-youtube text-rose-400 text-sm" />
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] text-slate-200 truncate">{selectedVideo.title}</div>
                                <div className="text-[10px] text-slate-500 truncate">{selectedVideo.channel}</div>
                              </div>
                              <button onClick={() => setSelectedVideo(null)} className="text-slate-600 hover:text-rose-400 text-xs">
                                <i className="fas fa-xmark" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setMusicSheetOpen(true)}
                        className="w-full text-[11px] font-mono uppercase tracking-widest py-2.5 rounded-xl bg-slate-800 text-slate-100 flex items-center justify-center gap-2 hover:bg-slate-700"
                      >
                        <i className="fas fa-music" />
                        {selectedTrack || selectedVideo ? "Edit music" : "Add music"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- MERCH ---------------- */}
        {tab === "merch" && (
          <div className="space-y-5">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-slate-500 block">
                Exclusive Portfolio
              </span>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight">Digital Compositions</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {PRODUCTS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setTab("dive");
                  }}
                  className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-2 flex flex-col justify-between h-52 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <div className={`w-full h-32 bg-gradient-to-b ${p.tint} rounded-xl flex items-center justify-center`}>
                    <i className={`fas ${p.icon} text-xl opacity-60`} />
                  </div>
                  <div className="pt-2 px-1">
                    <div className="text-xs font-medium text-slate-200 truncate">{p.title}</div>
                    <span className="text-[11px] text-indigo-400 font-mono">{p.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-3 text-xs text-slate-300">
                {cart.length} item{cart.length > 1 ? "s" : ""} in cart
              </div>
            )}
            {checkoutMessage && (
              <div className="bg-indigo-950/40 border border-indigo-900/40 p-3 rounded-2xl text-xs text-indigo-300">
                {checkoutMessage}
              </div>
            )}
          </div>
        )}

        {/* ---------------- PRODUCT DETAIL ---------------- */}
        {tab === "dive" && selectedProduct && (
          <div className="max-w-2xl mx-auto space-y-4">
            <button
              onClick={() => setTab("merch")}
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center space-x-1 py-1"
            >
              <i className="fas fa-arrow-left text-[9px]" /> <span>Return to collection</span>
            </button>
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 sm:p-8 space-y-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono tracking-widest mb-0.5">
                  Asset Title
                </span>
                <h3 className="text-base font-bold">{selectedProduct.title}</h3>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono tracking-widest mb-0.5">
                  Resolution Specs
                </span>
                <div className="text-slate-300 font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-900 text-xs">
                  {selectedProduct.dims}
                </div>
              </div>
              <div className="bg-indigo-950/30 border border-indigo-900/40 p-4 rounded-2xl w-full">
                <p className="text-xs text-slate-300 leading-relaxed">{selectedProduct.desc}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => addToCart(selectedProduct)}
                  className="flex-1 bg-slate-800 text-white font-medium py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider hover:bg-slate-700"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 bg-amber-500 text-slate-950 font-medium py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider hover:bg-amber-400"
                >
                  Secure Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- ENGINE (CHAT) ---------------- */}
        {tab === "engine" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-5 sm:p-6 flex flex-col h-[70vh] min-h-[420px]">
              <div className="text-center border-b border-slate-800 pb-3 mb-3">
                <i className="fas fa-robot text-2xl text-indigo-400 mb-1" />
                <h2 className="text-xs font-bold uppercase font-mono tracking-widest">Let's Sync</h2>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`text-[12px] leading-relaxed p-3 rounded-2xl max-w-[85%] ${
                      m.role === "user" ? "bg-indigo-600/80 ml-auto text-white" : "bg-slate-950 border border-slate-900 text-slate-300"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {chatLoading && <div className="text-[11px] text-slate-500 font-mono px-2">Let's Sync is typing…</div>}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Ask Let's Sync…"
                  className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-3 py-2.5 text-[12px] text-slate-200 outline-none focus:border-indigo-700"
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading}
                  className="bg-indigo-500 text-white text-[12px] px-4 rounded-xl disabled:opacity-50 hover:bg-indigo-400"
                >
                  <i className="fas fa-paper-plane" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ---------------- MUSIC PICKER MODAL ---------------- */}
      {musicSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMusicSheetOpen(false)} />
          <div className="relative bg-slate-950 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[70vh] flex flex-col">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-200">Add Music</h3>
              <button onClick={() => setMusicSheetOpen(false)} className="text-slate-500 hover:text-white text-sm">
                <i className="fas fa-xmark" />
              </button>
            </div>

            <div className="flex px-4 gap-2 pb-2">
              <button
                onClick={() => setMusicTab("spotify")}
                className={`flex-1 text-[11px] font-mono uppercase tracking-wider py-2 rounded-xl border ${
                  musicTab === "spotify" ? "bg-emerald-950/40 border-emerald-800 text-emerald-400" : "border-slate-800 text-slate-500"
                }`}
              >
                <i className="fab fa-spotify mr-1.5" />Spotify
              </button>
              <button
                onClick={() => setMusicTab("youtube")}
                className={`flex-1 text-[11px] font-mono uppercase tracking-wider py-2 rounded-xl border ${
                  musicTab === "youtube" ? "bg-rose-950/40 border-rose-800 text-rose-400" : "border-slate-800 text-slate-500"
                }`}
              >
                <i className="fab fa-youtube mr-1.5" />YouTube
              </button>
            </div>

            <div className="px-4 pb-3 flex gap-2">
              {musicTab === "spotify" ? (
                <>
                  <input
                    value={spotifyQuery}
                    onChange={(e) => setSpotifyQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchSpotify()}
                    placeholder="Search songs or artists…"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-emerald-700"
                  />
                  <button onClick={searchSpotify} className="bg-emerald-600 text-white text-[12px] px-3 rounded-xl">
                    <i className="fas fa-magnifying-glass" />
                  </button>
                </>
              ) : (
                <>
                  <input
                    value={youtubeQuery}
                    onChange={(e) => setYoutubeQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchYoutube()}
                    placeholder="Search videos or artists…"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-rose-700"
                  />
                  <button onClick={searchYoutube} className="bg-rose-600 text-white text-[12px] px-3 rounded-xl">
                    <i className="fas fa-magnifying-glass" />
                  </button>
                </>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
              {musicTab === "spotify" && (
                <>
                  {spotifyLoading && <div className="text-[11px] text-slate-500 font-mono text-center py-4">Searching Spotify…</div>}
                  {!spotifyLoading && spotifyResults.length === 0 && (
                    <div className="text-[11px] text-slate-600 font-mono text-center py-4">Search for a track to get started.</div>
                  )}
                  {spotifyResults.map((t) => (
                    <div key={t.id} className="w-full flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-2 hover:border-emerald-800">
                      {t.artworkUrl ? (
                        <img src={t.artworkUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                          <i className="fab fa-spotify text-emerald-500 text-xs" />
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedTrack(t);
                          setMusicSheetOpen(false);
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="text-[12px] text-slate-200 truncate">{t.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{t.artists}</div>
                      </button>
                      <button
                        onClick={() => togglePreview(t)}
                        disabled={!t.previewUrl}
                        title={t.previewUrl ? "Play 30s preview" : "No preview available"}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          t.previewUrl ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-600 cursor-not-allowed"
                        }`}
                      >
                        <i className={`fas ${playingPreviewId === t.id ? "fa-pause" : "fa-play"}`} />
                      </button>
                    </div>
                  ))}
                </>
              )}

              {musicTab === "youtube" && (
                <>
                  {youtubeLoading && <div className="text-[11px] text-slate-500 font-mono text-center py-4">Searching YouTube…</div>}
                  {!youtubeLoading && youtubeResults.length === 0 && (
                    <div className="text-[11px] text-slate-600 font-mono text-center py-4">Search for a video to get started.</div>
                  )}
                  {youtubeResults.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVideo(v);
                        setMusicSheetOpen(false);
                      }}
                      className="w-full flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-2 text-left hover:border-rose-800"
                    >
                      {v.thumbnailUrl ? (
                        <img src={v.thumbnailUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                          <i className="fab fa-youtube text-rose-500 text-xs" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] text-slate-200 truncate">{v.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">{v.channel}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
