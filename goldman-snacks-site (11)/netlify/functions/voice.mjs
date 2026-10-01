// Goldman Snacks tutor voice: turns a piece of the tutor's answer into natural speech with Gemini's
// text-to-speech, using the same free GEMINI_API_KEY as the tutor. Returns a WAV file.
// If the free voice allowance runs out, the page falls back to the computer's own voice.
//
// Optional environment variables:
//   TUTOR_VOICE        a Gemini voice name (default Kore). Others: Puck, Charon, Aoede, Leda, Orus, Zephyr, Sulafat, Achird…
//   TUTOR_VOICE_MODEL  a specific Gemini speech model

const env = (k) => (globalThis.Netlify?.env?.get?.(k) ?? process.env[k] ?? "").trim();
const MODELS = ["gemini-2.5-flash-preview-tts", "gemini-2.5-flash-tts", "gemini-3.5-flash-tts"];
const MAX_TEXT = 1500;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

/* Gemini returns raw 16-bit PCM; wrap it in a WAV header so the browser can play it. */
function wav(pcm, rate) {
  const h = new DataView(new ArrayBuffer(44));
  const s = (o, t) => { for (let i = 0; i < t.length; i++) h.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); h.setUint32(4, 36 + pcm.length, true); s(8, "WAVE"); s(12, "fmt ");
  h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true); h.setUint32(24, rate, true);
  h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true); s(36, "data"); h.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length); out.set(new Uint8Array(h.buffer), 0); out.set(pcm, 44); return out;
}

export default async (req) => {
  const key = env("GEMINI_API_KEY"), code = env("TUTOR_PASSCODE");
  if (req.method === "GET") return json(200, { ok: !!key });
  if (req.method !== "POST") return json(405, { error: "method" });
  if (!key) return json(503, { error: "not_configured" });
  if (code && (req.headers.get("x-tutor-code") || "").trim() !== code) return json(401, { error: "passcode" });
  let body; try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  const text = String(body?.text || "").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
  if (!/[A-Za-z0-9]/.test(text)) return json(400, { error: "no_text" });

  const voice = env("TUTOR_VOICE") || "Kore";
  const list = env("TUTOR_VOICE_MODEL") ? [env("TUTOR_VOICE_MODEL")] : MODELS;
  const payload = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: "Say this in a warm, natural British English accent, like a friendly university tutor talking to a student, at a relaxed pace: " + text }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
  });
  let last = 0;
  for (const model of list) {
    let r;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body: payload, signal: req.signal,
      });
    } catch { return json(502, { error: "upstream" }); }
    if (r.ok) {
      const j = await r.json().catch(() => null);
      const part = j?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
      if (!part) { last = 502; continue; }
      const rate = +(/rate=(\d+)/.exec(part.inlineData.mimeType || "")?.[1] || 24000);
      const pcm = Uint8Array.from(atob(part.inlineData.data), (c) => c.charCodeAt(0));
      return new Response(wav(pcm, rate), { headers: { "content-type": "audio/wav", "cache-control": "no-store", "x-voice-model": model } });
    }
    last = r.status;
    try { await r.body?.cancel(); } catch {}
  }
  if (last === 429) return json(429, { error: "rate_limited" });
  return json(502, { error: "upstream", status: last });
};

export const config = { path: "/api/voice" };
