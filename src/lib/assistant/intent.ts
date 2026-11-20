import { findApp, type AppDef } from "@/lib/assistant/catalog";
import type { Locale } from "@/lib/i18n";

export type Intent =
  | { type: "open"; appId: string; query?: string }
  | { type: "web"; query: string }
  | { type: "time" }
  | { type: "date" }
  | { type: "weather"; place?: string }
  | { type: "timer"; seconds: number; label?: string }
  | { type: "cancel-timer" }
  | { type: "note"; text?: string }
  | { type: "remember"; text: string }
  | { type: "forget" }
  | { type: "name"; name: string }
  | { type: "city"; city: string }
  | { type: "call"; who: string }
  | { type: "sms"; who: string; body?: string }
  | { type: "navigate"; place: string }
  | { type: "calc"; expr: string }
  | { type: "translate-mode" }
  | { type: "translate"; text: string; to: Locale }
  | { type: "locale"; locale: Locale }
  | { type: "stop" }
  | { type: "help" }
  | { type: "who" }
  | { type: "about" };

const CN: Record<string, number> = {
  零: 0,
  〇: 0,
  一: 1,
  二: 2,
  两: 2,
  兩: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

function norm(input: string) {
  return input
    .replace(/[!！?？。，,、~～]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumberToken(token: string) {
  if (/^\d+(?:\.\d+)?$/.test(token)) return Number(token);
  if (token === "半") return 0.5;
  if (token === "十") return 10;
  const ten = token.indexOf("十");
  if (ten >= 0 && /^[零〇一二两三兩四五六七八九十]+$/.test(token)) {
    const left = token.slice(0, ten);
    const right = token.slice(ten + 1);
    const tens = left === "" ? 1 : CN[left];
    if (tens == null) return null;
    if (right === "") return tens * 10;
    if (right.length === 1 && CN[right] != null) return tens * 10 + CN[right]!;
    return null;
  }
  if (token.length === 1 && CN[token] != null) return CN[token]!;
  return null;
}

function parseDuration(text: string) {
  const match = text.match(
    /(\d+(?:\.\d+)?|[零〇一二两三兩四五六七八九十半]+)\s*(小时|小時|个小时|個小時|个钟|個鐘|钟头|鐘頭|分钟|分鐘|分|mins?|minutes?|秒|秒钟|秒鐘|secs?|seconds?|hours?|hrs?)/i,
  );
  if (!match || match.index == null) return null;
  const amount = parseNumberToken(match[1]!.toLowerCase());
  if (amount == null) return null;
  const unit = match[2]!.toLowerCase();
  let seconds = amount * 60;
  if (/小时|小時|个小时|個小時|个钟|個鐘|钟头|鐘頭|hour|hr/.test(unit)) seconds = amount * 3600;
  else if (/秒|sec/.test(unit)) seconds = amount;
  if (seconds < 1 || seconds > 24 * 3600) return null;
  let label = `${text.slice(0, match.index)} ${text.slice(match.index + match[0].length)}`;
  label = label
    .replace(
      /倒计时|倒計時|计时|計時|倒数|倒數|设一个|設一個|设個|設個|设置|設置|提醒我|叫我|timer|countdown|set a|set|for|后|後|的|请|請|帮我|幫我|一个|一個|個|个|闹钟|鬧鐘/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
  return { seconds: Math.round(seconds), label: label || undefined };
}

function destLocale(word: string): Locale | null {
  const value = word.trim().toLowerCase();
  if (/^(english|英文|英语|英語)$/.test(value)) return "en";
  if (/^(cantonese|粤语|粵語|广东话|廣東話)$/.test(value)) return "yue";
  if (/^(traditional(?:\s+chinese)?|繁体中文|繁體中文|繁体|繁體)$/.test(value)) return "hant";
  if (/^(chinese|mandarin|中文|普通话|普通話|国语|國語|简体中文|簡體中文|简体|簡體)$/.test(value)) {
    return "zh";
  }
  return null;
}

export function parseLocaleSwitch(text: string): Locale | null {
  const cleaned = norm(text);
  if (!cleaned || cleaned.length > 28) return null;
  const stripped = cleaned
    .replace(
      /^(?:please\s+)?(?:switch to|use|speak|talk in|change to|讲|講|用|转|轉|换成|換成|切换到|切換到|改成|改为|改為)\s*/i,
      "",
    )
    .trim();
  return destLocale(stripped) ?? destLocale(cleaned);
}

function queryFromAfter(after: string) {
  const query = after
    .replace(/^(?:上|里面|裡|里)?\s*(?:and\s+)?(?:search(?:\s+for)?|搜一下|搜下|搜索|搜尋|搜|搵|找|播放|播|放|for)\s*/i, "")
    .trim();
  return query || undefined;
}

function hadSearchVerb(after: string) {
  return (
    /^(?:上|里面|裡|里)?\s*(?:and\s+)?(?:search(?:\s+for)?|for)(?:\s|$)/i.test(after) ||
    /^(?:上|里面|裡|里)?\s*(?:搜一下|搜下|搜索|搜尋|搜|搵|找|播放|播|放)/.test(after)
  );
}

function openFromHit(hit: { app: AppDef; before: string; after: string }, allowBareAfter: boolean): Intent | null {
  if (hit.before.trim()) return null;
  if (!hit.after.trim()) return { type: "open", appId: hit.app.id };
  if (allowBareAfter || hadSearchVerb(hit.after)) {
    return { type: "open", appId: hit.app.id, query: queryFromAfter(hit.after) };
  }
  return null;
}

function parseOpen(text: string): Intent | null {
  const verb = text.match(
    /^(?:please\s+|can you\s+|could you\s+|帮我|幫我|唔該|唔该|请|請|麻烦|麻煩)?(?:打开|打開|开启|開啟|启动|啟動|open|launch|start|開|开)\s*(.*)$/i,
  );
  if (verb) {
    const target = verb[1]!.replace(/^(?:一下|下|个|個)\s*/, "").trim();
    if (!target) return null;
    const hit = findApp(target);
    if (!hit) return null;
    return openFromHit(hit, true);
  }
  const hit = findApp(text);
  if (!hit) return null;
  return openFromHit(hit, false);
}

export function safeCalc(expr: string): number | null {
  const source = expr.replace(/\s/g, "");
  if (!/^[\d+\-*/().%]+$/.test(source) || !/\d/.test(source)) return null;
  let index = 0;
  const peek = () => source[index];
  function parseExpr(): number {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = peek();
      index += 1;
      const right = parseTerm();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }
  function parseTerm(): number {
    let value = parseFactor();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = peek();
      index += 1;
      const right = parseFactor();
      if ((op === "/" || op === "%") && right === 0) throw new Error("div");
      value = op === "*" ? value * right : op === "/" ? value / right : value % right;
    }
    return value;
  }
  function parseFactor(): number {
    if (peek() === "+" || peek() === "-") {
      const sign = peek();
      index += 1;
      const value = parseFactor();
      return sign === "-" ? -value : value;
    }
    if (peek() === "(") {
      index += 1;
      const value = parseExpr();
      if (peek() !== ")") throw new Error("paren");
      index += 1;
      return value;
    }
    const start = index;
    while (/[\d.]/.test(peek() ?? "")) index += 1;
    if (start === index) throw new Error("num");
    const value = Number(source.slice(start, index));
    if (!Number.isFinite(value)) throw new Error("num");
    return value;
  }
  try {
    const value = parseExpr();
    if (index !== source.length || !Number.isFinite(value)) return null;
    return value;
  } catch {
    return null;
  }
}

function parseCalc(text: string): Intent | null {
  let source = text.replace(/^(?:what(?:'s| is)|calculate|calc|计算|計算|等于多少|等於多少)\s*/i, "");
  source = source.replace(/等于|等於|=/g, "");
  source = source.replace(/乘以|乘/g, "*").replace(/除以|除/g, "/").replace(/加/g, "+").replace(/减|減/g, "-");
  source = source.replace(/[x×]/gi, "*").replace(/÷/g, "/");
  if (!/^[\d\s+\-*/().%]+$/.test(source) || !/\d/.test(source) || !/[+\-*/%]/.test(source)) return null;
  const expr = source.replace(/\s/g, "");
  if (safeCalc(expr) == null) return null;
  return { type: "calc", expr };
}

function parseTranslate(text: string): Intent | null {
  const wrapped = text.match(
    /^(?:把|将|將)\s*(.+?)\s*(?:翻译|翻譯|译成|譯成|译做|譯做|译|譯)(?:成|做|到|为|為)?\s*(.+)$/i,
  );
  if (wrapped) {
    const to = destLocale(wrapped[2]!);
    if (to && wrapped[1]!.trim()) return { type: "translate", text: wrapped[1]!.trim(), to };
  }
  const direct = text.match(
    /^(?:translate|翻译一下|翻譯一下|翻译|翻譯)\s+(.+?)\s+(?:to|into|成|做|到)\s+(.+)$/i,
  );
  if (direct) {
    const to = destLocale(direct[2]!);
    if (to && direct[1]!.trim()) return { type: "translate", text: direct[1]!.trim(), to };
  }
  if (/^(?:translate|translator|翻译|翻譯|翻译模式|翻譯模式|即时翻译|即時翻譯|实时翻译|传译|傳譯)$/i.test(text)) {
    return { type: "translate-mode" };
  }
  return null;
}

export function parseIntent(input: string): Intent | null {
  const text = norm(input);
  if (!text) return null;

  if (/^(?:stop|shut up|be quiet|停止|停|收声|收聲|闭嘴|閉嘴|静音|靜音)$/i.test(text)) {
    return { type: "stop" };
  }
  if (
    /^(?:cancel(?: the)? timer|stop timer|取消计时|取消計時|取消倒计时|取消倒計時|取消倒数|取消倒數|关掉计时|關掉計時)$/i.test(
      text,
    )
  ) {
    return { type: "cancel-timer" };
  }
  if (/^(?:who are you|what(?:'s| is) your name|你是谁|你是誰|你係邊個|你叫什么|你叫什麼|你叫咩|你叫咩名)$/i.test(text)) {
    return { type: "who" };
  }
  if (/^(?:help|what can you do|你会什么|你會什麼|你可以做什麼|你可以做咩|指令|commands|怎么用|怎麼用|点用|點用)$/i.test(text)) {
    return { type: "help" };
  }
  if (
    /^(?:what do you know about me|about me|我的资料|我的資料|关于我|關於我|你知道我什么|你知道我什麼|你知我啲咩)$/i.test(
      text,
    )
  ) {
    return { type: "about" };
  }
  const locale = parseLocaleSwitch(text);
  if (locale && text.length <= 28) return { type: "locale", locale };
  if (
    /^(?:what(?:'s| is) the time|what time is it(?: now)?|time|现在几点(?:了|钟|鐘)?|現在幾點(?:了|鐘)?|而家幾點(?:鐘|呀|啊)?|几点了|幾點啦|现在时间|現在時間|而家時間|报时|報時)$/i.test(
      text,
    )
  ) {
    return { type: "time" };
  }
  if (
    /^(?:what(?:'s| is) (?:the )?date|what day is it|today'?s date|今天几号|今天幾號|今日几号|今日幾號|今天星期几|今天星期幾|今日星期几|今日星期幾|今日日期|今天日期|日期)$/i.test(
      text,
    )
  ) {
    return { type: "date" };
  }
  const keyedTimer = /timer|countdown|倒计时|倒計時|计时|計時|倒数|倒數|闹钟|鬧鐘|提醒我|叫我/i.test(text);
  const duration = parseDuration(text);
  if (duration && (keyedTimer || /^(\d+|[零〇一二两三兩四五六七八九十半]+)\s*(分钟|分鐘|分|秒|小时|小時)/.test(text))) {
    return { type: "timer", seconds: duration.seconds, label: duration.label };
  }
  const name = text.match(/^(?:my name is|i am called|call me|我叫|我的名字是|我名叫|叫我)\s*(.+)$/i);
  if (name && !/^你/.test(name[1]!.trim()) && name[1]!.trim().length <= 24) {
    return { type: "name", name: name[1]!.trim() };
  }
  const city = text.match(/^(?:i live in|my city is|我住在|我住|我喺)\s*(.+)$/i);
  if (city) {
    const place = city[1]!.replace(/住$/, "").trim();
    if (place && place.length <= 24) return { type: "city", city: place };
  }
  const memory = text.match(/^(?:remember(?: that)?|请记住|請記住|记住|記住|记低|記低|记下|記下)\s*(.+)$/i);
  if (memory) return { type: "remember", text: memory[1]!.trim() };
  if (/^(?:forget everything|clear memory|清空记忆|清空記憶|忘掉所有|清除记忆|清除記憶)$/i.test(text)) {
    return { type: "forget" };
  }
  if (/^(?:call|phone|dial|打电话|打電話)$/i.test(text)) return { type: "open", appId: "phone" };
  const call = text.match(
    /^(?:call|phone|dial|打电话给|打電話給|打电话畀|打電話畀|打给|打給|打俾|打畀|拨打|撥打)\s*(.+)$/i,
  );
  if (call) return { type: "call", who: call[1]!.trim() };
  if (/^(?:text|sms|发短信|發短信|发信息|發訊息|发短讯|發短訊)$/i.test(text)) {
    return { type: "open", appId: "sms" };
  }
  const sms = text.match(
    /^(?:text|sms|message|发短信给|發短信給|发短讯给|發短訊畀|发消息给|發消息給|短信给|短訊畀)\s*(.+)$/i,
  );
  if (sms) {
    const rest = sms[1]!.trim();
    const said = rest.match(/^(.+?)(?:说|說|:|：)\s*(.+)$/);
    if (said) return { type: "sms", who: said[1]!.trim(), body: said[2]!.trim() };
    const parts = rest.split(/\s+/);
    if (parts.length >= 2 && /^[a-z]/i.test(parts[0]!)) {
      return { type: "sms", who: parts[0]!, body: parts.slice(1).join(" ") };
    }
    return { type: "sms", who: rest };
  }
  const go = text.match(/^(?:navigate to|directions to|take me to|导航到|導航到|导航去|導航去|带我去|帶我去|怎么去|怎麼去|点去|點去|点样去|點樣去|去到|去)\s*(.+)$/i);
  if (go) {
    const hit = findApp(go[1]!);
    const opened = hit ? openFromHit(hit, true) : null;
    if (opened) return opened;
    return { type: "navigate", place: go[1]!.trim() };
  }
  if (/^(?:今天|今日)?(?:的)?(?:天气|天氣)(?:怎么样|怎麼樣|如何|点样|點樣|点|點)?$/i.test(text) || /^(?:what(?:'s| is) the weather(?: like)?|weather)$/i.test(text)) {
    return { type: "weather" };
  }
  const weatherIn = text.match(/^(?:weather)\s+(?:in|at|for)\s+(.+)$/i);
  if (weatherIn) return { type: "weather", place: weatherIn[1]!.trim() };
  const weatherTail = text.match(/^(.+?)\s*(?:的)?(?:天气|天氣)(?:怎么样|怎麼樣|如何|点|點)?$/i);
  if (weatherTail && !/^(?:今天|今日)$/.test(weatherTail[1]!.trim())) {
    return { type: "weather", place: weatherTail[1]!.trim() };
  }
  const note = text.match(/^(?:take a note|make a note|note|记笔记|記筆記|记一下|記一下|备忘|備忘)\s*(.*)$/i);
  if (note) return { type: "note", text: note[1]?.trim() || undefined };
  const translated = parseTranslate(text);
  if (translated) return translated;
  const calc = parseCalc(text);
  if (calc) return calc;
  const onApp = text.match(/^在\s*(.+)$/);
  if (onApp) {
    const hit = findApp(onApp[1]!);
    const opened = hit ? openFromHit(hit, false) : null;
    if (opened?.type === "open" && opened.query) return opened;
    if (hit && hadSearchVerb(hit.after)) {
      return { type: "open", appId: hit.app.id, query: queryFromAfter(hit.after) };
    }
  }
  const played = text.match(/^(?:play|播放|播)\s*(.+)$/i);
  if (played) {
    const hit = findApp(played[1]!);
    const opened = hit ? openFromHit(hit, false) : null;
    if (opened) return opened;
    return { type: "open", appId: "youtube", query: played[1]!.trim() };
  }
  const opened = parseOpen(text);
  if (opened) return opened;
  const searchOn = text.match(/^(?:search|find)\s+(.+?)\s+(?:on|in)\s+(.+)$/i);
  if (searchOn) {
    const hit = findApp(searchOn[2]!);
    if (hit && !hit.before.trim()) return { type: "open", appId: hit.app.id, query: searchOn[1]!.trim() };
    return { type: "web", query: searchOn[1]!.trim() };
  }
  const web = text.match(/^(?:search(?:\s+for)?|google|搜一下|搜下|搜索|搜尋|搵下|搵|找一下|帮我搜|幫我搜)\s*(.+)$/i);
  if (web) return { type: "web", query: web[1]!.trim() };
  return null;
}

export function splitActions(text: string) {
  const actions: string[] = [];
  const kept: string[] = [];
  for (const line of text.split(/\n/)) {
    const match = line.trim().match(/^ACTION:\s*(.+)$/i);
    if (match) actions.push(match[1]!.trim());
    else kept.push(line);
  }
  return { speech: kept.join("\n").trim(), actions };
}

export function actionToIntent(raw: string): Intent | null {
  const [head, ...rest] = raw.trim().split(/\s+/);
  const arg = rest.join(" ").trim();
  if (!head) return null;
  switch (head.toLowerCase()) {
    case "open": {
      const hit = findApp(arg);
      if (!hit || hit.before) return null;
      return { type: "open", appId: hit.app.id, query: queryFromAfter(hit.after) };
    }
    case "timer": {
      const seconds = Number(arg);
      if (!Number.isFinite(seconds) || seconds <= 0) return null;
      return { type: "timer", seconds };
    }
    case "note":
      return { type: "note", text: arg || undefined };
    case "remember":
      return arg ? { type: "remember", text: arg } : null;
    case "navigate":
      return arg ? { type: "navigate", place: arg } : null;
    case "call":
      return arg ? { type: "call", who: arg } : { type: "open", appId: "phone" };
    case "sms":
      return arg ? { type: "sms", who: arg } : { type: "open", appId: "sms" };
    case "weather":
      return { type: "weather", place: arg || undefined };
    case "flashlight":
      return { type: "open", appId: "flashlight" };
    case "camera":
      return { type: "open", appId: "camera" };
    case "calc":
      return arg ? { type: "calc", expr: arg } : { type: "open", appId: "calc" };
    case "locale": {
      const next = parseLocaleSwitch(arg);
      return next ? { type: "locale", locale: next } : null;
    }
    default:
      return null;
  }
}
