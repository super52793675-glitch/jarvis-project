import { AssistantProvider } from "@/components/assistant/assistant-context";
import { ControlPanel, MePanel, TalkPanel, TranslatePanel } from "@/components/assistant/panels";
import { CalcPad, DialPad } from "@/components/assistant/tools";
import { useEngine } from "@/components/assistant/use-engine";
import { copy, formatClock, formatSpan, LOCALES } from "@/lib/i18n";
import { useLingxi } from "@/lib/assistant/store";
import { cx } from "@/lib/cx";
import { AudioLines, Languages, LayoutGrid, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AssistantApp() {
  const engine = useEngine();
  const locale = useLingxi((state) => state.locale);
  const setLocale = useLingxi((state) => state.setLocale);
  const timer = useLingxi((state) => state.timer);
  const dict = copy[locale];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = engine.stream;
  }, [engine.stream]);

  const statusLabel = {
    idle: dict.statusIdle,
    listening: dict.statusListening,
    thinking: dict.statusThinking,
    speaking: dict.statusSpeaking,
  }[engine.status];

  const left = timer && engine.now ? Math.max(0, (timer.endsAt - engine.now) / 1000) : 0;
  const nav = [
    { id: "talk" as const, label: dict.navTalk, icon: AudioLines },
    { id: "translate" as const, label: dict.navTranslate, icon: Languages },
    { id: "control" as const, label: dict.navApps, icon: LayoutGrid },
    { id: "me" as const, label: dict.navMe, icon: UserRound },
  ];

  return (
    <AssistantProvider value={engine}>
      <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
        <div className="mx-auto flex h-full w-full max-w-md flex-col md:border-x md:border-line">
          <header className="flex items-center gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <h1 className="font-display text-2xl leading-none">灵犀</h1>
              <p className="text-xs tracking-wide text-muted">LINGXI</p>
            </div>
            <div className="ml-auto flex gap-1">
              {LOCALES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cx(
                    "h-11 min-w-11 rounded-full px-2 text-sm",
                    locale === item.id ? "bg-accent font-medium text-ink" : "text-muted",
                  )}
                  onClick={() => setLocale(item.id)}
                  aria-pressed={locale === item.id}
                >
                  {item.short}
                </button>
              ))}
            </div>
          </header>
          <div className="flex items-center justify-between border-b border-line px-4 py-2 text-sm">
            <span className="tabular-nums text-muted">{engine.now ? formatClock(new Date(engine.now), locale) : "–"}</span>
            <span className={engine.status === "idle" ? "text-muted" : "text-accent"} aria-live="polite">
              {statusLabel}
            </span>
          </div>
          {timer && (
            <div className="flex items-center justify-between bg-accent px-4 py-2 text-ink">
              <span className="font-medium tabular-nums">{formatSpan(left)}</span>
              <span className="truncate text-sm">{timer.label || dict.navApps}</span>
            </div>
          )}
          {engine.stream && (
            <div className="border-b border-line px-4 py-3">
              <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full rounded-3xl bg-surface object-cover" />
              <p className="mt-2 text-sm text-muted">{dict.cameraHint}</p>
              <button type="button" className="mt-2 h-11 rounded-full border border-line px-4 text-sm" onClick={engine.closeTool}>
                {dict.close}
              </button>
            </div>
          )}
          <div className="min-h-0 flex-1">
            {engine.tab === "talk" && <TalkPanel />}
            {engine.tab === "translate" && <TranslatePanel />}
            {engine.tab === "control" && <ControlPanel />}
            {engine.tab === "me" && <MePanel />}
          </div>
          {engine.tab === "talk" && (
            <form
              className="flex gap-2 border-t border-line px-4 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                const text = draft.trim();
                if (!text) return;
                setDraft("");
                engine.runText(text);
              }}
            >
              <input
                ref={engine.composerRef}
                className="field"
                value={draft}
                placeholder={dict.typePlaceholder}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button type="submit" className="h-11 shrink-0 rounded-full bg-accent px-4 font-medium text-ink">
                {dict.send}
              </button>
            </form>
          )}
          {engine.tool === "calc" && <CalcPad />}
          {(engine.tool === "dial" || engine.tool === "sms") && <DialPad mode={engine.tool} />}
          <nav className="dock grid grid-cols-4 border-t border-line">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = engine.tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cx(
                    "flex h-16 flex-col items-center justify-center gap-1 text-xs",
                    active ? "text-accent" : "text-muted",
                  )}
                  aria-current={active ? "page" : undefined}
                  onClick={() => engine.setTab(item.id)}
                >
                  <Icon className="size-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </AssistantProvider>
  );
}
