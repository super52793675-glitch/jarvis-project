import { appUrl, getApp } from "@/lib/assistant/catalog";
import { askLingxi } from "@/lib/assistant/ai.functions";
import { actionToIntent, parseIntent, safeCalc, splitActions, type Intent } from "@/lib/assistant/intent";
import { cancelSpeech, speakAloud, speechSupported, startRecognition } from "@/lib/assistant/speech";
import { useLingxi, type Contact } from "@/lib/assistant/store";
import { describeWeather } from "@/lib/assistant/weather";
import {
  copy,
  detectLocale,
  fill,
  formatClock,
  formatDate,
  formatNumber,
  speechTag,
  spokenDuration,
  type Locale,
} from "@/lib/i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Status, Tab, Tool } from "@/components/assistant/assistant-context";

type Outcome = { text: string; href?: string; hrefLabel?: string };

function cleanTranslation(text: string) {
  const trimmed = text.trim().replace(/^ACTION:.*$/gim, "").trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("「") && trimmed.endsWith("」"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function resolveWho(who: string, contacts: Contact[]) {
  const compact = who.replace(/\s/g, "");
  const digits = who.replace(/[^\d+]/g, "");
  if (digits.length >= 3 && digits.length >= compact.length - 1) return { phone: digits, label: who };
  const found = contacts.find((contact) => {
    const name = contact.name.trim().toLowerCase();
    const target = who.trim().toLowerCase();
    return name === target || name.includes(target) || target.includes(name);
  });
  if (found?.phone) return { phone: found.phone, label: found.name };
  return { label: who };
}

function mapsHref(place: string, locale: Locale) {
  const q = encodeURIComponent(place);
  if (locale === "zh") return `https://uri.amap.com/search?keyword=${q}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

function webHref(query: string, locale: Locale) {
  const q = encodeURIComponent(query);
  if (locale === "zh") return `https://www.baidu.com/s?wd=${q}`;
  return `https://www.google.com/search?q=${q}`;
}

function launch(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function useEngine() {
  const locale = useLingxi((state) => state.locale);
  const timer = useLingxi((state) => state.timer);
  const [tab, setTab] = useState<Tab>("talk");
  const [status, setStatus] = useState<Status>("idle");
  const [listening, setListening] = useState(false);
  const [live, setLive] = useState("");
  const [speechError, setSpeechError] = useState(false);
  const [tool, setTool] = useState<Tool>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [trFrom, setTrFrom] = useState<Locale | "auto">("auto");
  const [trTo, setTrTo] = useState<Locale>("en");
  const [trSource, setTrSourceState] = useState("");
  const [trResult, setTrResult] = useState("");
  const [trBusy, setTrBusy] = useState(false);
  const [interpreter, setInterpreter] = useState(true);
  const [now, setNow] = useState<number | null>(null);
  const [forgetArmed, setForgetArmed] = useState(false);
  const composerRef = useRef<HTMLInputElement | null>(null);
  const tabRef = useRef(tab);
  const recRef = useRef<{ stop: () => void } | null>(null);
  const armed = useRef(false);
  const busy = useRef(false);
  const speaking = useRef(false);
  const lastSpoken = useRef("");
  const turn = useRef(0);
  const speakNext = useRef(false);
  const trKey = useRef("");
  tabRef.current = tab;

  const stopRec = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
    recRef.current = null;
  }, []);

  useEffect(() => {
    void useLingxi.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = speechTag(locale);
  }, [locale]);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const synth = window.speechSynthesis;
    synth?.getVoices();
    const pull = () => synth?.getVoices();
    synth?.addEventListener("voiceschanged", pull);
    return () => synth?.removeEventListener("voiceschanged", pull);
  }, []);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  const speak = useCallback((text: string, replyLocale: Locale) => {
    const say = text.trim();
    if (!say || !useLingxi.getState().voiceOn) return Promise.resolve();
    cancelSpeech();
    stopRec();
    setListening(false);
    speaking.current = true;
    setStatus("speaking");
    lastSpoken.current = say;
    return new Promise<void>((resolve) => {
      const done = () => {
        speaking.current = false;
        setStatus("idle");
        resolve();
        if (armed.current && useLingxi.getState().handsFree && !busy.current) {
          window.setTimeout(() => startRef.current(), 280);
        }
      };
      if (!speakAloud(say, speechTag(replyLocale), done)) done();
    });
  }, [stopRec]);

  const startRef = useRef<() => void>(() => {});

  const closeTool = useCallback(() => {
    setTool(null);
    setTorchOn(false);
    setStream((current) => {
      current?.getTracks().forEach((track) => track.stop());
      return null;
    });
  }, []);

  const ensureCamera = useCallback(async (torch: boolean) => {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (torch) {
        const track = next.getVideoTracks()[0];
        if (track) {
          const withTorch = { advanced: [{ torch: true }] } as unknown as MediaTrackConstraints;
          await track.applyConstraints(withTorch);
        }
      }
      setStream((current) => {
        current?.getTracks().forEach((track) => track.stop());
        return next;
      });
      setTorchOn(torch);
      setTool("camera");
      return true;
    } catch {
      return false;
    }
  }, []);

  const perform = useCallback(
    async (intent: Intent, replyLocale: Locale): Promise<Outcome> => {
      const dict = copy[replyLocale];
      const state = useLingxi.getState();
      switch (intent.type) {
        case "stop": {
          armed.current = false;
          stopRec();
          cancelSpeech();
          setListening(false);
          setStatus("idle");
          return { text: dict.stopped };
        }
        case "help":
          return { text: dict.help };
        case "who":
          return { text: dict.who };
        case "about": {
          if (!state.name && !state.city && state.facts.length === 0) return { text: dict.aboutEmpty };
          return {
            text: fill(dict.aboutFilled, {
              name: state.name || dict.unknown,
              city: state.city || dict.unknown,
              facts: state.facts.map((fact) => fact.text).join(replyLocale === "en" ? "; " : "；") || dict.none,
            }),
          };
        }
        case "locale": {
          state.setLocale(intent.locale);
          return { text: copy[intent.locale].localeSet };
        }
        case "time":
          return { text: fill(dict.timeNow, { time: formatClock(new Date(), replyLocale) }) };
        case "date":
          return { text: fill(dict.dateNow, { date: formatDate(new Date(), replyLocale) }) };
        case "timer": {
          state.setTimer({ endsAt: Date.now() + intent.seconds * 1000, label: intent.label });
          const spoken = spokenDuration(intent.seconds, replyLocale);
          const label = intent.label ? `${spoken} · ${intent.label}` : spoken;
          return { text: fill(dict.timerSet, { time: label }) };
        }
        case "cancel-timer":
          state.setTimer(null);
          return { text: dict.timerCancel };
        case "name":
          state.setName(intent.name);
          return { text: fill(dict.nameSet, { name: intent.name }) };
        case "city":
          state.setCity(intent.city);
          return { text: fill(dict.citySet, { city: intent.city }) };
        case "remember":
          state.addFact(intent.text);
          return { text: fill(dict.remembered, { text: intent.text }) };
        case "forget":
          state.forgetMemory();
          return { text: dict.forgot };
        case "note":
          if (!intent.text) {
            setTab("me");
            return { text: dict.notes };
          }
          state.addNote(intent.text);
          setTab("me");
          return { text: fill(dict.noted, { text: intent.text }) };
        case "calc": {
          const value = safeCalc(intent.expr);
          if (value == null) return { text: dict.calcBad };
          setTool("calc");
          return { text: fill(dict.calcIs, { expr: intent.expr, result: formatNumber(value) }) };
        }
        case "translate-mode":
          setTab("translate");
          return { text: dict.interpreterHint };
        case "translate": {
          setTab("translate");
          setTrTo(intent.to);
          speakNext.current = true;
          setTrSourceState(intent.text);
          return { text: "" };
        }
        case "weather":
          return { text: await describeWeather(intent.place, replyLocale) };
        case "navigate": {
          const href = mapsHref(intent.place, state.locale);
          launch(href);
          return {
            text: fill(dict.navigateReady, { place: intent.place }),
            href,
            hrefLabel: fill(dict.actionGo, { place: intent.place }),
          };
        }
        case "web": {
          const href = webHref(intent.query, state.locale);
          launch(href);
          return {
            text: fill(dict.webReady, { query: intent.query }),
            href,
            hrefLabel: fill(dict.actionOpen, { name: intent.query }),
          };
        }
        case "call":
        case "sms": {
          const who = resolveWho(intent.type === "call" ? intent.who : intent.who, state.contacts);
          if (!who.phone) {
            setTab("me");
            return { text: fill(intent.type === "call" ? dict.callNeed : dict.smsNeed, { who: who.label }) };
          }
          const href =
            intent.type === "call"
              ? `tel:${who.phone}`
              : `sms:${who.phone}${intent.body ? `?body=${encodeURIComponent(intent.body)}` : ""}`;
          return {
            text: fill(intent.type === "call" ? dict.callReady : dict.smsReady, { who: who.label }),
            href,
            hrefLabel: fill(intent.type === "call" ? dict.actionCall : dict.actionText, { who: who.label }),
          };
        }
        case "open": {
          const app = getApp(intent.appId);
          if (!app) return { text: dict.help };
          const name = app.labels[replyLocale];
          if (app.tool === "camera") {
            const ok = await ensureCamera(false);
            return { text: ok ? dict.cameraOn : dict.cameraFail };
          }
          if (app.tool === "flashlight") {
            if (torchOn) {
              closeTool();
              return { text: dict.flashlightOff };
            }
            const ok = await ensureCamera(true);
            return { text: ok ? dict.flashlightOn : dict.flashlightFail };
          }
          if (app.tool === "dial") {
            setTool("dial");
            setTab("control");
            return { text: name };
          }
          if (app.tool === "sms") {
            setTool("sms");
            setTab("control");
            return { text: name };
          }
          if (app.tool === "calc") {
            setTool("calc");
            setTab("control");
            return { text: name };
          }
          if (app.tool === "notes") {
            if (intent.query) state.addNote(intent.query);
            setTab("me");
            return { text: intent.query ? fill(dict.noted, { text: intent.query }) : dict.notes };
          }
          if (app.tool === "timer") {
            setTab("control");
            return { text: dict.timerHint };
          }
          if (app.tool === "translate") {
            setTab("translate");
            if (intent.query) {
              speakNext.current = true;
              setTrSourceState(intent.query);
            }
            return { text: dict.interpreterHint };
          }
          if (app.tool === "weather") return { text: await describeWeather(intent.query, replyLocale) };
          if (app.id === "search" && !intent.query) {
            setTab("talk");
            composerRef.current?.focus();
            return { text: dict.typePlaceholder };
          }
          const href =
            app.id === "search" && intent.query
              ? webHref(intent.query, state.locale)
              : appUrl(app, intent.query);
          if (!href) return { text: dict.help };
          launch(href);
          return {
            text: fill(dict.openReady, { name }),
            href,
            hrefLabel: fill(dict.actionOpen, { name }),
          };
        }
        default:
          return { text: dict.help };
      }
    },
    [closeTool, ensureCamera, stopRec, torchOn],
  );

  const finish = useCallback(
    async (outcome: Outcome, replyLocale: Locale) => {
      busy.current = false;
      if (!outcome.text) return;
      useLingxi.getState().addMessage({
        role: "assistant",
        text: outcome.text,
        href: outcome.href,
        hrefLabel: outcome.hrefLabel,
      });
      await speak(outcome.text, replyLocale);
    },
    [speak],
  );

  const runText = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      const state = useLingxi.getState();
      const replyLocale = state.replyMode === "follow" ? detectLocale(text, state.locale) : state.replyMode;
      state.addMessage({ role: "user", text });
      const intent = parseIntent(text);
      const mine = ++turn.current;
      if (!intent) {
        setStatus("thinking");
        busy.current = true;
        void (async () => {
          try {
            const history = useLingxi
              .getState()
              .messages.slice(0, -1)
              .slice(-8)
              .map((message) => ({
                role: message.role,
                content: message.text,
              }));
            const profile = useLingxi.getState();
            const result = await askLingxi({
              data: {
                kind: "chat",
                replyLocale,
                name: profile.name,
                city: profile.city,
                facts: profile.facts.map((fact) => fact.text),
                contacts: profile.contacts.map((contact) => `${contact.name} ${contact.phone}`),
                history,
                text,
              },
            });
            if (mine !== turn.current) return;
            if (!result.ok) {
              await finish({ text: copy[replyLocale].aiDown }, replyLocale);
              return;
            }
            const parts = splitActions(result.text);
            let outcome: Outcome | null = null;
            for (const action of parts.actions) {
              const next = actionToIntent(action);
              if (next) outcome = await perform(next, replyLocale);
            }
            const speech = parts.speech || outcome?.text || copy[replyLocale].aiDown;
            await finish(
              { text: speech, href: outcome?.href, hrefLabel: outcome?.hrefLabel },
              replyLocale,
            );
          } catch {
            if (mine === turn.current) await finish({ text: copy[replyLocale].aiDown }, replyLocale);
          } finally {
            if (mine === turn.current) {
              busy.current = false;
              setStatus((current) => (current === "thinking" ? "idle" : current));
            }
          }
        })();
        return;
      }
      busy.current = true;
      void perform(intent, replyLocale)
        .then((outcome) => finish(outcome, intent.type === "locale" ? intent.locale : replyLocale))
        .finally(() => {
          busy.current = false;
        });
    },
    [finish, perform],
  );

  const runRef = useRef(runText);
  runRef.current = runText;

  startRef.current = () => {
    if (!speechSupported()) {
      setSpeechError(true);
      armed.current = false;
      return;
    }
    stopRec();
    cancelSpeech();
    const rec = startRecognition({
      lang: speechTag(useLingxi.getState().locale),
      continuous: useLingxi.getState().handsFree,
      onPartial: (text) => setLive(text),
      onFinal: (text) => {
        if (text && text === lastSpoken.current) return;
        if (!useLingxi.getState().handsFree) armed.current = false;
        setLive("");
        busy.current = true;
        stopRec();
        setListening(false);
        if (tabRef.current === "translate") {
          speakNext.current = true;
          setTrSourceState(text);
          busy.current = false;
          return;
        }
        setStatus("idle");
        runRef.current(text);
      },
      onError: (error) => {
        if (error === "not-allowed" || error === "service-not-allowed") {
          armed.current = false;
          setSpeechError(true);
          setListening(false);
        }
      },
      onEnd: () => {
        setListening(false);
        recRef.current = null;
        if (armed.current && useLingxi.getState().handsFree && !speaking.current && !busy.current) {
          window.setTimeout(() => {
            if (armed.current) startRef.current();
          }, 250);
        }
      },
    });
    if (!rec) {
      setSpeechError(true);
      armed.current = false;
      return;
    }
    recRef.current = rec;
    setSpeechError(false);
    setListening(true);
    setStatus("listening");
  };

  const toggleListen = useCallback(() => {
    if (listening || armed.current) {
      armed.current = false;
      stopRec();
      setListening(false);
      setLive("");
      setStatus("idle");
      return;
    }
    armed.current = true;
    startRef.current();
  }, [listening, stopRec]);

  const openApp = useCallback(
    (id: string) => {
      const replyLocale = useLingxi.getState().locale;
      const app = getApp(id);
      useLingxi.getState().addMessage({ role: "user", text: app?.labels[replyLocale] ?? id });
      void perform({ type: "open", appId: id }, replyLocale).then((outcome) => finish(outcome, replyLocale));
    },
    [finish, perform],
  );

  const startTimer = useCallback(
    (seconds: number) => {
      const replyLocale = useLingxi.getState().locale;
      void perform({ type: "timer", seconds }, replyLocale).then((outcome) => finish(outcome, replyLocale));
    },
    [finish, perform],
  );

  const setTrSource = useCallback((text: string) => {
    speakNext.current = false;
    setTrSourceState(text);
  }, []);

  const swapLanguages = useCallback(() => {
    setTrFrom((current) => (current === "auto" ? trTo : trTo));
    setTrTo((current) => (trFrom === "auto" ? (current === "en" ? "zh" : "en") : trFrom));
    setTrResult("");
    trKey.current = "";
  }, [trFrom, trTo]);

  useEffect(() => {
    const text = trSource.trim();
    if (!text) {
      setTrResult("");
      setTrBusy(false);
      return;
    }
    const key = `${trFrom}|${trTo}|${text}`;
    if (trKey.current === key) return;
    const id = window.setTimeout(() => {
      trKey.current = key;
      setTrBusy(true);
      const shouldSpeak = speakNext.current;
      void askLingxi({ data: { kind: "translate", text, from: trFrom, to: trTo } })
        .then((result) => {
          if (`${trFrom}|${trTo}|${trSource.trim()}` !== key && trKey.current !== key) return;
          if (!result.ok) {
            setTrResult(copy[useLingxi.getState().locale].translateFail);
            return;
          }
          const translated = cleanTranslation(result.text);
          setTrResult(translated);
          if (shouldSpeak && interpreter && translated) {
            speakNext.current = false;
            void speak(translated, trTo);
          }
        })
        .catch(() => {
          if (trKey.current === key) setTrResult("");
        })
        .finally(() => {
          if (trKey.current === key) setTrBusy(false);
        });
    }, 400);
    return () => window.clearTimeout(id);
  }, [interpreter, speak, trFrom, trSource, trTo]);

  useEffect(() => {
    if (!timer) return;
    const id = window.setInterval(() => {
      const current = useLingxi.getState().timer;
      if (!current || Date.now() < current.endsAt) return;
      useLingxi.getState().setTimer(null);
      const replyLocale = useLingxi.getState().locale;
      const line = current.label
        ? `${copy[replyLocale].timerDone} ${current.label}`
        : copy[replyLocale].timerDone;
      useLingxi.getState().addMessage({ role: "assistant", text: line });
      void speak(line, replyLocale);
    }, 400);
    return () => window.clearInterval(id);
  }, [speak, timer]);

  const armForget = useCallback(() => setForgetArmed(true), []);
  const confirmForget = useCallback(() => {
    const replyLocale = useLingxi.getState().locale;
    useLingxi.getState().forgetMemory();
    setForgetArmed(false);
    void finish({ text: copy[replyLocale].forgot }, replyLocale);
  }, [finish]);

  const speakText = useCallback(
    (text: string, replyLocale: Locale) => {
      void speak(text, replyLocale);
    },
    [speak],
  );

  return {
    tab,
    setTab,
    status: listening ? "listening" : status,
    listening,
    live,
    speechError,
    toggleListen,
    runText,
    openApp,
    startTimer,
    tool,
    setTool,
    torchOn,
    stream,
    closeTool,
    trFrom,
    trTo,
    setTrFrom: (next: Locale | "auto") => {
      trKey.current = "";
      setTrFrom(next);
    },
    setTrTo: (next: Locale) => {
      trKey.current = "";
      setTrTo(next);
    },
    trSource,
    setTrSource,
    trResult,
    trBusy,
    swapLanguages,
    interpreter,
    setInterpreter,
    speakText,
    now,
    composerRef,
    forgetArmed,
    armForget,
    confirmForget,
  };
}
