// Goldman Snacks tutor: a small server function that passes questions to an AI model
// and streams the answer back. Your API key stays here on Netlify, never in the website's code.
//
// Environment variables (set them in Netlify: Site configuration → Environment variables).
// Set ONE of these keys:
//   GEMINI_API_KEY     free: a Google Gemini key from aistudio.google.com (no card needed)
//   ANTHROPIC_API_KEY  paid: a Claude key from platform.claude.com (about 1–2p per question)
// Also:
//   TUTOR_PASSCODE     recommended. A word you type once in the chat; stops strangers using your key
//   TUTOR_MODEL        optional. Pick a specific model (for example gemini-3.5-flash-lite or claude-haiku-4-5-20251001)

const env = (k) => (globalThis.Netlify?.env?.get?.(k) ?? process.env[k] ?? "").trim();
const MAX_SYSTEM = 20000;   // characters of instructions + page text
const MAX_TURN = 6000;      // characters per message
const MAX_TURNS = 14;       // messages kept from the conversation
const MAX_TOKENS = 1200;    // length cap for each Claude answer
// Gemini models to try, newest first. If one isn't available on your key (or its free quota is used up), the next is tried.
const GEMINI_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-2.5-flash"];

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const enc = new TextEncoder();

/* Read a server-sent-events body and call onData with each parsed `data:` JSON line. */
async function eachEvent(body, onData) {
  const reader = body.getReader(), dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      let ev; try { ev = JSON.parse(data); } catch { continue; }
      onData(ev);
    }
  }
}

/* A text stream for the page. `pump` pushes text with emit(); markers tell the page about a cut-off or error. */
function textStream(pump, onCancel) {
  return new ReadableStream({
    async start(c) {
      try { await pump((t) => c.enqueue(enc.encode(t))); }
      catch { c.enqueue(enc.encode("\u0000ERROR")); }
      c.close();
    },
    cancel() { try { onCancel && onCancel(); } catch {} },
  });
}

/* ---------- Claude (Anthropic) ---------- */
async function claude(key, system, messages, signal) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: env("TUTOR_MODEL") || "claude-sonnet-5-5", max_tokens: MAX_TOKENS, system, messages, stream: true }),
    signal,
  });
  if (!r.ok || !r.body) return { fail: r.status };
  return {
    stream: textStream(async (emit) => {
      await eachEvent(r.body, (ev) => {
        if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") emit(ev.delta.text);
        else if (ev.type === "message_delta" && ev.delta?.stop_reason === "max_tokens") emit("\u0000TRUNCATED");
        else if (ev.type === "error") emit("\u0000ERROR");
      });
    }, () => r.body.cancel()),
  };
}

/* ---------- Gemini (Google) ---------- */
// Voice mode wants the first words fast, so it tries the quick "lite" models first.
const FAST_MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-flash"];
async function gemini(key, system, messages, signal, fast) {
  const list = env("TUTOR_MODEL") ? [env("TUTOR_MODEL")] : fast ? FAST_MODELS : GEMINI_MODELS;
  const make = (think) => JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    // Less "thinking" before answering = the answer starts sooner.
    generationConfig: { maxOutputTokens: 4096, temperature: 0.4, ...(think ? { thinkingConfig: think } : {}) },
  });
  let last = 0;
  for (const model of list) {
    const think = /gemini-3/.test(model) ? { thinkingLevel: "low" } : /2\.5-flash/.test(model) ? { thinkingBudget: 0 } : null;
    const go = (b) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
      method: "POST", headers: { "x-goog-api-key": key, "content-type": "application/json" }, body: b, signal,
    });
    let r = await go(make(think));
    // If this model doesn't accept the thinking setting, ask again without it.
    if (r.status === 400 && think) { try { await r.body?.cancel(); } catch {} r = await go(make(null)); }
    if (r.ok && r.body) {
      return {
        stream: textStream(async (emit) => {
          await eachEvent(r.body, (ev) => {
            if (ev.error) { emit("\u0000ERROR"); return; }
            const cand = ev.candidates?.[0];
            for (const p of cand?.content?.parts || []) if (p.text && !p.thought) emit(p.text);
            if (cand?.finishReason === "MAX_TOKENS") emit("\u0000TRUNCATED");
          });
        }, () => r.body.cancel()),
      };
    }
    last = r.status;
    try { await r.body?.cancel(); } catch {}
    // Model not found / not allowed / out of free quota: try the next one. A bad key won't get better, so stop.
    if ((r.status === 400 || r.status === 401 || r.status === 403) && model === list[0] && await probeKey(key)) return { fail: 401 };
  }
  return { fail: last || 502 };
}
/* Is the Gemini key itself bad? (Listing models is free.) */
async function probeKey(key) {
  try { const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", { headers: { "x-goog-api-key": key } }); return r.status === 400 || r.status === 401 || r.status === 403; }
  catch { return false; }
}

export default async (req) => {
  const gkey = env("GEMINI_API_KEY"), akey = env("ANTHROPIC_API_KEY");
  const code = env("TUTOR_PASSCODE");

  // A GET is a free health check: the chat uses it to see whether the tutor is set up.
  if (req.method === "GET") return json(200, { ok: !!(gkey || akey), needsCode: !!code, provider: gkey ? "gemini" : akey ? "claude" : "" });
  if (req.method !== "POST") return json(405, { error: "method" });
  if (!gkey && !akey) return json(503, { error: "not_configured" });
  if (code && (req.headers.get("x-tutor-code") || "").trim() !== code) return json(401, { error: "passcode" });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }

  const system = String(body?.system || "").slice(0, MAX_SYSTEM);
  // Keep the last few turns, merge any back-to-back turns from the same side, and start on a user turn.
  const merged = [];
  for (const t of (Array.isArray(body?.messages) ? body.messages : []).slice(-MAX_TURNS)) {
    const role = t?.role === "assistant" ? "assistant" : t?.role === "user" ? "user" : null;
    const content = String(t?.content || "").slice(0, MAX_TURN).trim();
    if (!role || !content) continue;
    const last = merged[merged.length - 1];
    if (last && last.role === role) last.content += "\n\n" + content;
    else merged.push({ role, content });
  }
  while (merged.length && merged[0].role !== "user") merged.shift();
  if (!merged.length || merged[merged.length - 1].role !== "user") return json(400, { error: "no_question" });

  let out;
  try { out = gkey ? await gemini(gkey, system, merged, req.signal, !!body?.fast) : await claude(akey, system, merged, req.signal); }
  catch { return json(502, { error: "upstream" }); }
  if (out.fail) {
    const s = out.fail;
    if (s === 429 || s === 529) return json(429, { error: "rate_limited" });
    if (s === 401 || s === 403) return json(503, { error: "bad_key" });
    return json(502, { error: "upstream", status: s });
  }
  return new Response(out.stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" } });
};

export const config = { path: "/api/tutor" };
