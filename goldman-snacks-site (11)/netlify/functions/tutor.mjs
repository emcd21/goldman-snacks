// Goldman Snacks tutor: a small server function that passes questions to Claude
// and streams the answer back. Your Anthropic API key stays here on Netlify,
// never in the website's code.
//
// Environment variables (set them in Netlify: Site configuration → Environment variables):
//   ANTHROPIC_API_KEY  required. Your key from console.anthropic.com
//   TUTOR_PASSCODE     recommended. A word you type once in the chat; stops strangers using your credit
//   TUTOR_MODEL        optional. Defaults to claude-sonnet-5-5 (use claude-haiku-4-5-20251001 for a cheaper tutor)

const env = (k) => (globalThis.Netlify?.env?.get?.(k) ?? process.env[k] ?? "").trim();
const MAX_SYSTEM = 20000;   // characters of instructions + page text
const MAX_TURN = 6000;      // characters per message
const MAX_TURNS = 14;       // messages kept from the conversation
const MAX_TOKENS = 1200;    // length cap for each answer

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const key = env("ANTHROPIC_API_KEY");
  const code = env("TUTOR_PASSCODE");

  // A GET is a free health check: the chat uses it to see whether the tutor is set up.
  if (req.method === "GET") return json(200, { ok: !!key, needsCode: !!code });
  if (req.method !== "POST") return json(405, { error: "method" });
  if (!key) return json(503, { error: "not_configured" });
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

  let upstream;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: env("TUTOR_MODEL") || "claude-sonnet-5-5", max_tokens: MAX_TOKENS, system, messages: merged, stream: true }),
      signal: req.signal,
    });
  } catch {
    return json(502, { error: "upstream" });
  }
  if (!upstream.ok || !upstream.body) {
    const status = upstream.status === 429 || upstream.status === 529 ? 429 : upstream.status === 401 ? 503 : 502;
    let detail = ""; try { detail = (await upstream.json())?.error?.type || ""; } catch {}
    return json(status, { error: status === 429 ? "rate_limited" : status === 503 ? "bad_key" : "upstream", detail });
  }

  // Turn Anthropic's event stream into plain text, sent to the page as it arrives.
  const enc = new TextEncoder(), dec = new TextDecoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body.getReader();
      let buf = "";
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
            if (!line.startsWith("data:")) continue;
            let ev; try { ev = JSON.parse(line.slice(5)); } catch { continue; }
            if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") controller.enqueue(enc.encode(ev.delta.text));
            else if (ev.type === "message_delta" && ev.delta?.stop_reason === "max_tokens") controller.enqueue(enc.encode("\u0000TRUNCATED"));
            else if (ev.type === "error") controller.enqueue(enc.encode("\u0000ERROR"));
          }
        }
      } catch {
        controller.enqueue(enc.encode("\u0000ERROR"));
      }
      controller.close();
    },
    cancel() { try { upstream.body.cancel(); } catch {} },
  });
  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" } });
};

export const config = { path: "/api/tutor" };
