import { useAssistant } from "@/components/assistant/assistant-context";
import { AppIcon } from "@/components/assistant/icons";
import { APPS } from "@/lib/assistant/catalog";
import { copy, formatSpan, LOCALES, type Locale } from "@/lib/i18n";
import { useLingxi } from "@/lib/assistant/store";
import { cx } from "@/lib/cx";
import { ArrowLeftRight, Copy, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function useDict() {
  return copy[useLingxi((state) => state.locale)];
}

export function TalkPanel() {
  const dict = useDict();
  const messages = useLingxi((state) => state.messages);
  const { live, listening, speechError, toggleListen, runText } = useAssistant();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, live]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-2 text-center">
            <p className="max-w-sm text-2xl leading-tight font-medium text-balance">{dict.intro}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted text-pretty">{dict.tagline}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cx(
                  "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user" ? "self-end bg-raised" : "self-start border border-line bg-surface",
                )}
              >
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                {message.href && message.hrefLabel && (
                  <a
                    className="mt-3 flex h-11 items-center justify-center rounded-full bg-accent px-4 font-medium text-ink"
                    href={message.href}
                    {...(message.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {message.hrefLabel}
                  </a>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>
      <div className="px-4 pb-2">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {dict.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="h-11 shrink-0 rounded-full border border-line bg-surface px-4 text-sm"
              onClick={() => runText(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
        {live && <p className="mb-3 text-center text-sm text-accent">{live}</p>}
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="relative grid place-items-center">
            {listening && (
              <>
                <span className="lingxi-ping absolute size-28 rounded-full border border-accent" />
                <span className="lingxi-ping lingxi-ping-2 absolute size-28 rounded-full border border-accent" />
              </>
            )}
            <button
              type="button"
              className="relative grid size-28 place-items-center rounded-full bg-accent text-ink"
              aria-pressed={listening}
              onClick={toggleListen}
            >
              {listening ? <Square className="size-7" fill="currentColor" /> : <Mic className="size-8" />}
            </button>
          </div>
          <p className="text-sm text-muted">{listening ? dict.stopListening : dict.tapToTalk}</p>
          {speechError && <p className="max-w-xs text-center text-sm text-muted">{dict.noSpeech}</p>}
        </div>
      </div>
    </div>
  );
}

const LANGS: Array<Locale | "auto"> = ["auto", "en", "zh", "yue", "hant"];

function langName(id: Locale | "auto", auto: string) {
  if (id === "auto") return auto;
  return LOCALES.find((item) => item.id === id)?.name ?? id;
}

export function TranslatePanel() {
  const dict = useDict();
  const {
    trFrom,
    trTo,
    setTrFrom,
    setTrTo,
    trSource,
    setTrSource,
    trResult,
    trBusy,
    swapLanguages,
    interpreter,
    setInterpreter,
    speakText,
    listening,
    toggleListen,
  } = useAssistant();
  const [copied, setCopied] = useState(false);

  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">{dict.from}</span>
          <select className="field" value={trFrom} onChange={(event) => setTrFrom(event.target.value as Locale | "auto")}>
            {LANGS.map((id) => (
              <option key={id} value={id}>
                {langName(id, dict.auto)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="mt-5 grid size-11 place-items-center rounded-full border border-line" onClick={swapLanguages} aria-label={dict.swap}>
          <ArrowLeftRight className="size-4" />
        </button>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">{dict.to}</span>
          <select className="field" value={trTo} onChange={(event) => setTrTo(event.target.value as Locale)}>
            {LOCALES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <textarea
        className="field mt-4 min-h-28 rounded-3xl"
        placeholder={dict.translatePh}
        value={trSource}
        onChange={(event) => setTrSource(event.target.value)}
      />
      <div className="mt-3 min-h-28 rounded-3xl border border-line bg-surface px-4 py-4">
        <p className="text-xs text-muted">{trBusy ? dict.translating : dict.result}</p>
        <p className="mt-2 min-h-16 whitespace-pre-wrap text-xl leading-snug">{trResult}</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button type="button" className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-2 text-sm font-medium text-ink" onClick={toggleListen}>
          {listening ? <Square className="size-4" fill="currentColor" /> : <Mic className="size-4" />}
          {listening ? dict.stopListening : dict.tapToTalk}
        </button>
        <button
          type="button"
          className="h-12 rounded-full border border-line"
          disabled={!trResult}
          onClick={() => speakText(trResult, trTo)}
        >
          {dict.speak}
        </button>
        <button
          type="button"
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-line"
          disabled={!trResult}
          onClick={() => {
            void navigator.clipboard?.writeText(trResult);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
        >
          <Copy className="size-4" />
          {copied ? dict.copied : dict.copy}
        </button>
      </div>
      <label className="mt-4 flex items-center justify-between gap-3 rounded-3xl border border-line px-4 py-3">
        <span>
          <span className="block font-medium">{dict.interpreter}</span>
          <span className="block text-sm text-muted">{dict.interpreterHint}</span>
        </span>
        <input
          type="checkbox"
          className="size-5 accent-accent"
          checked={interpreter}
          onChange={(event) => setInterpreter(event.target.checked)}
        />
      </label>
    </div>
  );
}

export function ControlPanel() {
  const dict = useDict();
  const locale = useLingxi((state) => state.locale);
  const timer = useLingxi((state) => state.timer);
  const now = useAssistant().now;
  const { openApp, startTimer } = useAssistant();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = APPS.filter((app) => {
    if (!needle) return true;
    return (
      app.labels[locale].toLowerCase().includes(needle) ||
      app.aliases.some((alias) => alias.toLowerCase().includes(needle))
    );
  });
  const apps = visible.filter((app) => app.group === "apps");
  const tools = visible.filter((app) => app.group === "tools");
  const left = timer && now ? Math.max(0, (timer.endsAt - now) / 1000) : 0;

  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      <input className="field" value={query} placeholder={dict.searchApps} onChange={(event) => setQuery(event.target.value)} />
      <p className="mt-3 text-sm text-muted">{dict.phoneHint}</p>
      {timer && (
        <div className="mt-4 flex items-center justify-between rounded-3xl bg-accent px-4 py-3 text-ink">
          <span className="font-medium tabular-nums">{formatSpan(left)}</span>
          <span className="text-sm">{timer.label}</span>
        </div>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[60, 300, 1500].map((seconds) => (
          <button key={seconds} type="button" className="h-12 rounded-2xl border border-line bg-surface text-sm" onClick={() => startTimer(seconds)}>
            {seconds / 60} {dict.minuteShort}
          </button>
        ))}
      </div>
      <Section title={dict.toolsTitle} ids={tools.map((app) => app.id)} locale={locale} onOpen={openApp} />
      <Section title={dict.appsTitle} ids={apps.map((app) => app.id)} locale={locale} onOpen={openApp} />
    </div>
  );
}

function Section({
  title,
  ids,
  locale,
  onOpen,
}: {
  title: string;
  ids: string[];
  locale: Locale;
  onOpen: (id: string) => void;
}) {
  if (ids.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="text-sm text-muted">{title}</h2>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {ids.map((id) => {
          const app = APPS.find((item) => item.id === id);
          if (!app) return null;
          return (
            <button key={id} type="button" className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl bg-surface px-1 py-3 text-center" onClick={() => onOpen(id)}>
              <AppIcon id={id} className="size-5" />
              <span className="text-xs leading-tight">{app.labels[locale]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function MePanel() {
  const dict = useDict();
  const locale = useLingxi((state) => state.locale);
  const name = useLingxi((state) => state.name);
  const city = useLingxi((state) => state.city);
  const facts = useLingxi((state) => state.facts);
  const contacts = useLingxi((state) => state.contacts);
  const notes = useLingxi((state) => state.notes);
  const voiceOn = useLingxi((state) => state.voiceOn);
  const handsFree = useLingxi((state) => state.handsFree);
  const replyMode = useLingxi((state) => state.replyMode);
  const setLocale = useLingxi((state) => state.setLocale);
  const setName = useLingxi((state) => state.setName);
  const setCity = useLingxi((state) => state.setCity);
  const setVoiceOn = useLingxi((state) => state.setVoiceOn);
  const setHandsFree = useLingxi((state) => state.setHandsFree);
  const setReplyMode = useLingxi((state) => state.setReplyMode);
  const addFact = useLingxi((state) => state.addFact);
  const removeFact = useLingxi((state) => state.removeFact);
  const addContact = useLingxi((state) => state.addContact);
  const removeContact = useLingxi((state) => state.removeContact);
  const addNote = useLingxi((state) => state.addNote);
  const removeNote = useLingxi((state) => state.removeNote);
  const clearMessages = useLingxi((state) => state.clearMessages);
  const { runText, forgetArmed, armForget, confirmForget } = useAssistant();
  const [fact, setFact] = useState("");
  const [person, setPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const blurbs: Record<Locale, string> = {
    en: dict.langEn,
    zh: dict.langZh,
    yue: dict.langYue,
    hant: dict.langHant,
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      <h2 className="text-sm text-muted">{dict.langTitle}</h2>
      <div className="mt-3 grid gap-2">
        {LOCALES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cx(
              "rounded-3xl border px-4 py-3 text-left",
              locale === item.id ? "border-accent bg-surface" : "border-line",
            )}
            onClick={() => setLocale(item.id)}
          >
            <span className="block font-medium">{item.name}</span>
            <span className="block text-sm text-muted">{blurbs[item.id]}</span>
          </button>
        ))}
      </div>
      <h2 className="mt-6 text-sm text-muted">{dict.replyTitle}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" className={cx("min-h-12 rounded-full border px-3 py-2 text-sm leading-tight", replyMode === "follow" ? "border-accent bg-accent text-ink" : "border-line")} onClick={() => setReplyMode("follow")}>
          {dict.replyFollow}
        </button>
        <button type="button" className={cx("min-h-12 rounded-full border px-3 py-2 text-sm leading-tight", replyMode === locale ? "border-accent bg-accent text-ink" : "border-line")} onClick={() => setReplyMode(locale)}>
          {dict.replyLock}
        </button>
      </div>
      <label className="mt-3 flex items-center justify-between rounded-3xl border border-line px-4 py-3">
        <span>{dict.voiceReplies}</span>
        <input type="checkbox" className="size-5 accent-accent" checked={voiceOn} onChange={(event) => setVoiceOn(event.target.checked)} />
      </label>
      <label className="mt-2 flex items-center justify-between rounded-3xl border border-line px-4 py-3">
        <span>
          <span className="block">{dict.handsFree}</span>
          <span className="block text-sm text-muted">{dict.handsFreeHint}</span>
        </span>
        <input type="checkbox" className="size-5 accent-accent" checked={handsFree} onChange={(event) => setHandsFree(event.target.checked)} />
      </label>

      <h2 className="mt-6 text-sm text-muted">{dict.memoryTitle}</h2>
      <p className="mt-2 text-sm text-muted">{dict.privacy}</p>
      <label className="mt-3 block text-sm">
        {dict.yourName}
        <input className="field mt-1" value={name} placeholder={dict.namePh} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="mt-3 block text-sm">
        {dict.yourCity}
        <input className="field mt-1" value={city} placeholder={dict.cityPh} onChange={(event) => setCity(event.target.value)} />
      </label>

      <h2 className="mt-6 text-sm text-muted">{dict.facts}</h2>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!fact.trim()) return;
          addFact(fact.trim());
          setFact("");
        }}
      >
        <input className="field" value={fact} placeholder={dict.factPh} onChange={(event) => setFact(event.target.value)} />
        <button type="submit" className="h-11 shrink-0 rounded-full bg-accent px-4 font-medium text-ink">{dict.add}</button>
      </form>
      {facts.length === 0 && <p className="mt-3 text-sm text-muted">{dict.emptyFacts}</p>}
      <ul className="mt-3 grid gap-2">
        {facts.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3">
            <span className="text-sm">{item.text}</span>
            <button type="button" className="h-11 shrink-0 text-sm text-muted" onClick={() => removeFact(item.id)}>{dict.cancel}</button>
          </li>
        ))}
      </ul>

      <h2 className="mt-6 text-sm text-muted">{dict.contacts}</h2>
      <form
        className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!person.trim() || !phone.trim()) return;
          addContact(person.trim(), phone.trim());
          setPerson("");
          setPhone("");
        }}
      >
        <input className="field" value={person} placeholder={dict.contactName} onChange={(event) => setPerson(event.target.value)} />
        <input className="field" value={phone} placeholder={dict.contactPhone} inputMode="tel" onChange={(event) => setPhone(event.target.value)} />
        <button type="submit" className="h-11 rounded-full bg-accent px-4 font-medium text-ink">{dict.add}</button>
      </form>
      {contacts.length === 0 && <p className="mt-3 text-sm text-muted">{dict.emptyContacts}</p>}
      <ul className="mt-3 grid gap-2">
        {contacts.map((contact) => (
          <li key={contact.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3">
            <span className="text-sm">{contact.name} · {contact.phone}</span>
            <button type="button" className="h-11 text-sm text-muted" onClick={() => removeContact(contact.id)}>{dict.cancel}</button>
          </li>
        ))}
      </ul>

      <h2 className="mt-6 text-sm text-muted">{dict.notes}</h2>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!note.trim()) return;
          addNote(note.trim());
          setNote("");
        }}
      >
        <input className="field" value={note} placeholder={dict.notePh} onChange={(event) => setNote(event.target.value)} />
        <button type="submit" className="h-11 shrink-0 rounded-full bg-accent px-4 font-medium text-ink">{dict.add}</button>
      </form>
      {notes.length === 0 && <p className="mt-3 text-sm text-muted">{dict.emptyNotes}</p>}
      <ul className="mt-3 grid gap-2">
        {notes.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 rounded-2xl bg-surface px-4 py-3">
            <span className="text-sm">{item.text}</span>
            <button type="button" className="h-11 text-sm text-muted" onClick={() => removeNote(item.id)}>{dict.cancel}</button>
          </li>
        ))}
      </ul>

      <h2 className="mt-6 text-sm text-muted">{dict.tryThese}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {dict.examples.map((example) => (
          <button key={example} type="button" className="h-11 rounded-full border border-line px-4 text-sm" onClick={() => runText(example)}>
            {example}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <button type="button" className="h-12 rounded-full border border-line" onClick={() => clearMessages()}>{dict.clearChat}</button>
        <button
          type="button"
          className="h-12 rounded-full border border-line"
          onClick={() => (forgetArmed ? confirmForget() : armForget())}
        >
          {forgetArmed ? dict.forgetConfirm : dict.forget}
        </button>
      </div>
    </div>
  );
}
