import { createFileRoute } from "@tanstack/react-router";

const MAX_BODY_BYTES = 16_000;
const MAX_HISTORY = 12;
const MAX_TEXT = 2_000;

function safeText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function unauthorized() {
  return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export const Route = createFileRoute("/api/jarvis/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expectedToken = process.env.JARVIS_ACCESS_TOKEN;
        const suppliedToken = request.headers.get("x-jarvis-token") ?? "";
        if (!expectedToken || suppliedToken.length !== expectedToken.length) return unauthorized();
        let tokenDifference = 0;
        for (let i = 0; i < expectedToken.length; i += 1) {
          tokenDifference |= suppliedToken.charCodeAt(i) ^ expectedToken.charCodeAt(i);
        }
        if (tokenDifference !== 0) return unauthorized();

        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) return Response.json({ ok: false, error: "service_unavailable" }, { status: 503 });
        const declaredLength = Number(request.headers.get("content-length") ?? "0");
        if (declaredLength > MAX_BODY_BYTES) return Response.json({ ok: false, error: "request_too_large" }, { status: 413 });

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }
        if (!raw || typeof raw !== "object") return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
        const body = raw as Record<string, unknown>;
        const text = safeText(body.text, MAX_TEXT);
        if (!text) return Response.json({ ok: false, error: "empty_message" }, { status: 400 });
        const history = (Array.isArray(body.history) ? body.history : [])
          .slice(-MAX_HISTORY)
          .map((item) => {
            const row = item as Record<string, unknown>;
            return {
              role: row.role === "assistant" ? "assistant" : "user",
              content: safeText(row.content, MAX_TEXT),
            };
          })
          .filter((item) => item.content);
        const language = safeText(body.language, 24) || "the language used by the user";

        try {
          const upstream = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            signal: AbortSignal.timeout(25_000),
            body: JSON.stringify({
              model: process.env.XAI_MODEL || "grok-4.7",
              temperature: 0.5,
              max_tokens: 500,
              messages: [
                {
                  role: "system",
                  content: [
                    "You are Jarvis, a capable personal AI assistant running on the user's Android phone.",
                    `Reply in ${language}. Be clear, practical, and concise.`,
                    "Do not claim to have performed actions on the phone. You may explain the next safe step, but device actions are not yet connected to this chat endpoint.",
                    "Ask before any sensitive or irreversible action.",
                  ].join(" "),
                },
                ...history,
                { role: "user", content: text },
              ],
            }),
          });
          if (!upstream.ok) return Response.json({ ok: false, error: "ai_provider_error" }, { status: 502 });
          const data = (await upstream.json()) as { choices?: { message?: { content?: string } }[] };
          const reply = data.choices?.[0]?.message?.content?.trim();
          if (!reply) return Response.json({ ok: false, error: "empty_ai_reply" }, { status: 502 });
          return Response.json({ ok: true, reply });
        } catch {
          return Response.json({ ok: false, error: "ai_provider_unreachable" }, { status: 502 });
        }
      },
    },
  },
});
