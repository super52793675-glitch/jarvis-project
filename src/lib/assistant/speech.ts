type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: RecEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

function ctor() {
  if (typeof window === "undefined") return null;
  const host = window as Window & {
    SpeechRecognition?: new () => Rec;
    webkitSpeechRecognition?: new () => Rec;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

export function speechSupported() {
  return ctor() != null;
}

export function startRecognition(opts: {
  lang: string;
  continuous: boolean;
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}) {
  const Recognition = ctor();
  if (!Recognition) return null;
  const rec = new Recognition();
  rec.lang = opts.lang;
  rec.continuous = opts.continuous;
  rec.interimResults = true;
  rec.onresult = (event) => {
    let interim = "";
    let finalText = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const row = event.results[i];
      if (!row) continue;
      if (row.isFinal) finalText += row[0].transcript;
      else interim += row[0].transcript;
    }
    if (interim.trim()) opts.onPartial(interim.trim());
    if (finalText.trim()) opts.onFinal(finalText.trim());
  };
  rec.onerror = (event) => opts.onError(event.error);
  rec.onend = () => opts.onEnd();
  try {
    rec.start();
  } catch {
    return null;
  }
  return rec;
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const target = lang.toLowerCase();
  const exact = voices.find((voice) => voice.lang.toLowerCase() === target);
  if (exact) return exact;
  if (target.includes("hk")) {
    return (
      voices.find((voice) => /hk|yue|cantonese/i.test(`${voice.lang} ${voice.name}`)) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("zh"))
    );
  }
  const prefix = target.split("-")[0] ?? target;
  return voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix));
}

export function cancelSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function speakAloud(text: string, lang: string, onEnd: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd();
    return null;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  const voice = pickVoice(window.speechSynthesis.getVoices(), lang);
  if (voice) utterance.voice = voice;
  utterance.rate = lang.startsWith("en") ? 1 : 1.02;
  utterance.onend = onEnd;
  utterance.onerror = () => onEnd();
  window.speechSynthesis.speak(utterance);
  return utterance;
}
