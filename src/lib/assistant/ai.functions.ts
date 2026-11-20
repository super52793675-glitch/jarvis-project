import { createServerFn } from "@tanstack/react-start";

type ReplyLocale = "en" | "zh" | "yue" | "hant";

type ChatInput = {
  kind: "chat";
  replyLocale: ReplyLocale;
  name: string;
  city: string;
  facts: string[];
  contacts: string[];
  history: { role: "user" | "assistant"; content: string }[];
  text: string;
};

type TranslateInput = {
  kind: "translate";
  text: string;
  from: "auto" | ReplyLocale;
  to: ReplyLocale;
};

const LOCALES = new Set(["en", "zh", "yue", "hant"]);

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

const LANG: Record<ReplyLocale, string> = {
  en: "English",
  zh: "Mandarin Chinese written in Simplified Chinese",
  yue: "spoken Hong Kong Cantonese (use 咗、嘅、喺、佢、唔、哋), not Mandarin",
  hant: "Traditional Chinese with Mandarin wording",
};

function asChat(raw: Record<string, unknown>): ChatInput {
  const replyLocale = String(raw.replyLocale ?? "zh");
  if (!LOCALES.has(replyLocale)) throw new Error("bad locale");
  const history = (Array.isArray(raw.history) ? raw.history : [])
    .slice(-8)
    .map((item) => {
      const row = item as { role?: string; content?: string };
      return {
        role: row.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: clip(row.content, 500),
      };
    })
    .filter((item) => item.content);
  const text = clip(raw.text, 800);
  if (!text) throw new Error("empty");
  return {
    kind: "chat",
    replyLocale: replyLocale as ReplyLocale,
    name: clip(raw.name, 40),
    city: clip(raw.city, 40),
    facts: (Array.isArray(raw.facts) ? raw.facts : []).map((item) => clip(item, 160)).filter(Boolean).slice(0, 20),
    contacts: (Array.isArray(raw.contacts) ? raw.contacts : [])
      .map((item) => clip(item, 48))
      .filter(Boolean)
      .slice(0, 20),
    history,
    text,
  };
}

function asTranslate(raw: Record<string, unknown>): TranslateInput {
  const to = String(raw.to ?? "");
  const from = String(raw.from ?? "auto");
  if (!LOCALES.has(to)) throw new Error("bad locale");
  if (from !== "auto" && !LOCALES.has(from)) throw new Error("bad locale");
  const text = clip(raw.text, 800);
  if (!text) throw new Error("empty");
  return { kind: "translate", text, from: from as TranslateInput["from"], to: to as ReplyLocale };
}

export const askLingxi = createServerFn({ method: "POST" })
  .validator((input: unknown): ChatInput | TranslateInput => {
    const raw = (input ?? {}) as Record<string, unknown>;
    if (raw.kind === "translate") return asTranslate(raw);
    return asChat(raw);
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "unavailable" };

    const messages =
      data.kind === "translate"
        ? [
            {
              role: "system",
              content: [
                "You are a translator.",
                `Translate the user text into ${LANG[data.to]}.`,
                data.from === "auto" ? "Detect the source language." : `The source language is ${LANG[data.from]}.`,
                "Output only the translation. No quotes, labels, or notes.",
              ].join(" "),
            },
            { role: "user", content: data.text },
          ]
        : [
            {
              role: "system",
              content: [
                "You are Jarvis, the user’s personal AI life agent. Be warm, natural, context-aware, and concise enough for spoken conversation.",
                `Reply only in ${LANG[data.replyLocale]}.`,
                "Keep it speakable: 1 to 3 short sentences. No markdown, no bullets, no emoji.",
                "When the user clearly wants an action, add one final line and nothing else on it: ACTION: <action>.",
                "Allowed: ACTION: open <app>, ACTION: timer <seconds>, ACTION: note <text>, ACTION: remember <text>, ACTION: navigate <place>, ACTION: call <who>, ACTION: sms <who>, ACTION: weather <place>, ACTION: flashlight, ACTION: camera.",
                "Apps: youtube, maps, amap, spotify, netease, whatsapp, wechat, instagram, gmail, x, netflix, bilibili, douyin, weibo, rednote, taobao, camera, phone, sms, notes, calc, weather, calendar, timer, flashlight, search, translate.",
                "If they did not ask you to do something, do not add ACTION.",
                "Never claim you changed system settings or saw private accounts.",
                `User name: ${data.name || "unknown"}. City: ${data.city || "unknown"}. Facts: ${data.facts.join(" | ") || "none"}. Contacts: ${data.contacts.join(" | ") || "none"}.`,
              ].join("\n"),
            },
            ...data.history.map((item) => ({ role: item.role, content: item.content })),
            { role: "user", content: data.text },
          ];

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({
        model: "grok-4.7",
        temperature: data.kind === "translate" ? 0.2 : 0.5,
        max_tokens: data.kind === "translate" ? 400 : 220,
        messages,
      }),
    });
    if (!response.ok) return { ok: false as const, error: "upstream" };
    const body = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "empty" };
    return { ok: true as const, text };
  });
