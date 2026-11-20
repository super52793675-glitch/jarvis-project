export type Locale = "en" | "zh" | "yue" | "hant";

export const LOCALES: { id: Locale; short: string; speech: string; name: string }[] = [
  { id: "en", short: "EN", speech: "en-US", name: "English" },
  { id: "zh", short: "普", speech: "zh-CN", name: "普通话" },
  { id: "yue", short: "粵", speech: "zh-HK", name: "粵語" },
  { id: "hant", short: "繁", speech: "zh-TW", name: "繁體" },
];

export function speechTag(locale: Locale) {
  return LOCALES.find((l) => l.id === locale)?.speech ?? "en-US";
}

export function intlTag(locale: Locale) {
  if (locale === "zh") return "zh-CN";
  if (locale === "yue") return "zh-HK";
  if (locale === "hant") return "zh-TW";
  return "en-US";
}

export type Dict = {
  tagline: string;
  navTalk: string;
  navTranslate: string;
  navApps: string;
  navMe: string;
  statusIdle: string;
  statusListening: string;
  statusThinking: string;
  statusSpeaking: string;
  tapToTalk: string;
  stopListening: string;
  noSpeech: string;
  typePlaceholder: string;
  send: string;
  suggestions: string[];
  examples: string[];
  intro: string;
  openReady: string;
  timeNow: string;
  dateNow: string;
  timerSet: string;
  timerDone: string;
  timerCancel: string;
  timerHint: string;
  noted: string;
  remembered: string;
  nameSet: string;
  citySet: string;
  callReady: string;
  callNeed: string;
  smsReady: string;
  smsNeed: string;
  navigateReady: string;
  calcIs: string;
  calcBad: string;
  localeSet: string;
  stopped: string;
  help: string;
  who: string;
  aboutEmpty: string;
  aboutFilled: string;
  unknown: string;
  none: string;
  weatherNeed: string;
  weatherNow: string;
  weatherUnknown: string;
  weatherFail: string;
  aiDown: string;
  flashlightOn: string;
  flashlightOff: string;
  flashlightFail: string;
  cameraOn: string;
  cameraFail: string;
  webReady: string;
  phoneHint: string;
  privacy: string;
  yourName: string;
  yourCity: string;
  namePh: string;
  cityPh: string;
  facts: string;
  factPh: string;
  add: string;
  contacts: string;
  contactName: string;
  contactPhone: string;
  notes: string;
  notePh: string;
  voiceReplies: string;
  handsFree: string;
  handsFreeHint: string;
  replyFollow: string;
  replyLock: string;
  clearChat: string;
  forget: string;
  forgetConfirm: string;
  tryThese: string;
  from: string;
  to: string;
  auto: string;
  swap: string;
  copy: string;
  copied: string;
  speak: string;
  interpreter: string;
  interpreterHint: string;
  translating: string;
  translateFail: string;
  translatePh: string;
  result: string;
  searchApps: string;
  appsTitle: string;
  toolsTitle: string;
  minuteShort: string;
  cancel: string;
  close: string;
  dialPh: string;
  call: string;
  text: string;
  cameraHint: string;
  langTitle: string;
  replyTitle: string;
  memoryTitle: string;
  langEn: string;
  langZh: string;
  langYue: string;
  langHant: string;
  emptyFacts: string;
  emptyContacts: string;
  emptyNotes: string;
  actionOpen: string;
  actionCall: string;
  actionText: string;
  actionGo: string;
  forgot: string;
  cleared: string;
};

const en: Dict = {
  tagline: "Say it. I'll open it, translate it, remember it.",
  navTalk: "Talk",
  navTranslate: "Translate",
  navApps: "Apps",
  navMe: "Me",
  statusIdle: "Ready",
  statusListening: "Listening",
  statusThinking: "Thinking",
  statusSpeaking: "Speaking",
  tapToTalk: "Tap to talk",
  stopListening: "Stop",
  noSpeech: "This browser has no speech recognition. Typing still works.",
  typePlaceholder: "Type a command",
  send: "Send",
  suggestions: ["Open YouTube", "What time is it?", "Weather", "Translate"],
  examples: [
    "Open YouTube",
    "What time is it?",
    "Weather",
    "Set a timer for 5 minutes",
    "Remember I like Cantonese",
    "Translate hello to Cantonese",
  ],
  intro: "I'm Lingxi. English, Mandarin, Cantonese, and Traditional Chinese.",
  openReady: "Opening {name}.",
  timeNow: "It's {time}.",
  dateNow: "Today is {date}.",
  timerSet: "{time} timer started.",
  timerDone: "Time's up.",
  timerCancel: "Timer cancelled.",
  timerHint: "Tell me how long, or tap 1, 5, or 25 minutes.",
  noted: "Noted. {text}",
  remembered: "I'll remember: {text}",
  nameSet: "Got it, {name}.",
  citySet: "You're in {city}.",
  callReady: "Tap to call {who}.",
  callNeed: "I don't have a number for {who}. Add them under Me.",
  smsReady: "Tap to text {who}.",
  smsNeed: "I don't have a number for {who}.",
  navigateReady: "Route to {place}.",
  calcIs: "{expr} = {result}",
  calcBad: "I couldn't calculate that.",
  localeSet: "English is on.",
  stopped: "Stopped.",
  help: "I open apps, translate, set timers, check weather, navigate, call, and remember you. Try: open YouTube.",
  who: "I'm Lingxi, your voice assistant. I speak English, Mandarin, Cantonese, and Traditional Chinese.",
  aboutEmpty: "I don't know you yet. Tell me your name, city, or something to remember.",
  aboutFilled: "Name: {name}. City: {city}. Facts: {facts}.",
  unknown: "unknown",
  none: "none yet",
  weatherNeed: "Which city? Tell me, or allow location.",
  weatherNow: "{place} is {temp}°, {desc}.",
  weatherUnknown: "I couldn't find {place}.",
  weatherFail: "Weather is unavailable right now.",
  aiDown: "I can't reach my brain right now. Opening apps, timers, time, and memory still work.",
  flashlightOn: "Flashlight on. This works on a phone that allows the camera light.",
  flashlightOff: "Flashlight off.",
  flashlightFail: "This device blocked the flashlight.",
  cameraOn: "Camera is open.",
  cameraFail: "Camera permission was blocked.",
  webReady: "Searching {query}.",
  phoneHint: "On your phone this opens the real app. Here it opens the website.",
  privacy: "What you tell me stays on this device.",
  yourName: "Your name",
  yourCity: "City",
  namePh: "What should I call you?",
  cityPh: "Hong Kong",
  facts: "Things I know",
  factPh: "Remember that…",
  add: "Add",
  contacts: "People",
  contactName: "Name",
  contactPhone: "Phone",
  notes: "Notes",
  notePh: "A note",
  voiceReplies: "Speak replies",
  handsFree: "Keep listening",
  handsFreeHint: "Stays on after each sentence.",
  replyFollow: "Match what I say",
  replyLock: "Stay in this language",
  clearChat: "Clear chat",
  forget: "Forget me",
  forgetConfirm: "Tap again to forget",
  tryThese: "Try saying",
  from: "From",
  to: "To",
  auto: "Auto",
  swap: "Swap",
  copy: "Copy",
  copied: "Copied",
  speak: "Speak",
  interpreter: "Live interpreter",
  interpreterHint: "I translate each phrase and say it.",
  translating: "Translating",
  translateFail: "Couldn't translate. Try again.",
  translatePh: "Speak or type",
  result: "Translation",
  searchApps: "Search apps",
  appsTitle: "Apps",
  toolsTitle: "On this phone",
  minuteShort: "min",
  cancel: "Cancel",
  close: "Close",
  dialPh: "Number",
  call: "Call",
  text: "Text",
  cameraHint: "Point the camera. The light is the flashlight.",
  langTitle: "Language",
  replyTitle: "Replies",
  memoryTitle: "About you",
  langEn: "English interface, voice, and replies",
  langZh: "Mandarin, simplified Chinese",
  langYue: "Cantonese, Hong Kong speech",
  langHant: "Traditional Chinese",
  emptyFacts: "Nothing yet. Say “remember I like tea”.",
  emptyContacts: "Add someone, then say “call” their name.",
  emptyNotes: "No notes yet.",
  actionOpen: "Open {name}",
  actionCall: "Call {who}",
  actionText: "Text {who}",
  actionGo: "Go to {place}",
  forgot: "I forgot the personal details stored here.",
  cleared: "Chat cleared.",
};

const zh: Dict = {
  tagline: "说一句，我就去做。",
  navTalk: "助理",
  navTranslate: "翻译",
  navApps: "控制",
  navMe: "我",
  statusIdle: "待命",
  statusListening: "正在听",
  statusThinking: "在想",
  statusSpeaking: "正在说",
  tapToTalk: "点一下说",
  stopListening: "停止",
  noSpeech: "这个浏览器没有语音识别，打字也可以。",
  typePlaceholder: "输入指令",
  send: "发送",
  suggestions: ["打开油管", "现在几点", "今天天气", "翻译"],
  examples: [
    "打开油管",
    "现在几点",
    "今天天气",
    "倒计时 5 分钟",
    "记住我喜欢粤语",
    "把你好翻译成英文",
  ],
  intro: "我是灵犀。普通话、粤语、繁体、英文，说哪种都可以。",
  openReady: "正在打开{name}。",
  timeNow: "现在 {time}。",
  dateNow: "今天是{date}。",
  timerSet: "已开始倒数 {time}。",
  timerDone: "时间到。",
  timerCancel: "计时已取消。",
  timerHint: "说时长，或者点 1、5、25 分钟。",
  noted: "记下了。{text}",
  remembered: "记住了：{text}",
  nameSet: "好，{name}。",
  citySet: "你在{city}。",
  callReady: "点一下打给{who}。",
  callNeed: "我没有{who}的号码。到「我」里加一个联系人。",
  smsReady: "点一下发短信给{who}。",
  smsNeed: "我没有{who}的号码。",
  navigateReady: "去{place}。",
  calcIs: "{expr} = {result}",
  calcBad: "这个算不了。",
  localeSet: "已换成普通话。",
  stopped: "停了。",
  help: "我可以打开应用、即时翻译、计时、查天气、导航、打电话，也会记住你。试试说：打开油管。",
  who: "我是灵犀，你的语音助理。普通话、粤语、繁体和英文我都听得懂。",
  aboutEmpty: "我还不认识你。告诉我名字、城市，或者说「记住」。",
  aboutFilled: "名字：{name}。城市：{city}。我知道：{facts}。",
  unknown: "还不知道",
  none: "还没有",
  weatherNeed: "哪个城市？告诉我，或允许定位。",
  weatherNow: "{place}现在 {temp}°，{desc}。",
  weatherUnknown: "找不到{place}。",
  weatherFail: "天气暂时查不到。",
  aiDown: "我暂时连不上大脑，不过打开应用、计时、时间和记忆还能用。",
  flashlightOn: "手电筒开了。手机允许相机灯光时才会亮。",
  flashlightOff: "手电筒关了。",
  flashlightFail: "这台设备用不了手电筒。",
  cameraOn: "相机开了。",
  cameraFail: "相机权限被拒绝了。",
  webReady: "正在搜{query}。",
  phoneHint: "在手机上会打开真正的应用；这里会打开对应网站。",
  privacy: "你告诉我的，只留在这台设备上。",
  yourName: "怎么称呼你",
  yourCity: "城市",
  namePh: "你的名字",
  cityPh: "上海",
  facts: "我记得的事",
  factPh: "记住……",
  add: "添加",
  contacts: "联系人",
  contactName: "名字",
  contactPhone: "电话",
  notes: "笔记",
  notePh: "写一条",
  voiceReplies: "语音回复",
  handsFree: "连续聆听",
  handsFreeHint: "说完一句会继续听。",
  replyFollow: "跟我说",
  replyLock: "锁定普通话",
  clearChat: "清空对话",
  forget: "忘掉我",
  forgetConfirm: "再点一次确认",
  tryThese: "可以这样说",
  from: "从",
  to: "到",
  auto: "自动",
  swap: "对调",
  copy: "复制",
  copied: "已复制",
  speak: "朗读",
  interpreter: "即时传译",
  interpreterHint: "你说完一句，我马上译出来并读出声。",
  translating: "正在翻译",
  translateFail: "翻译失败，再试一次。",
  translatePh: "说话或输入",
  result: "译文",
  searchApps: "搜索应用",
  appsTitle: "应用",
  toolsTitle: "手机功能",
  minuteShort: "分钟",
  cancel: "取消",
  close: "关闭",
  dialPh: "号码",
  call: "拨打",
  text: "短信",
  cameraHint: "对着镜头。开灯就是手电筒。",
  langTitle: "语言版本",
  replyTitle: "回复语言",
  memoryTitle: "关于你",
  langEn: "英文界面、语音和回复",
  langZh: "普通话 · 简体",
  langYue: "粤语 · 广东话识别和口语",
  langHant: "繁体中文",
  emptyFacts: "还没有。试试说「记住我喜欢奶茶」。",
  emptyContacts: "加一个人，然后说「打电话给」他的名字。",
  emptyNotes: "还没有笔记。",
  actionOpen: "打开{name}",
  actionCall: "打给{who}",
  actionText: "短信给{who}",
  actionGo: "前往{place}",
  forgot: "存在这台设备上的个人资料已经忘掉。",
  cleared: "对话已清空。",
};

const yue: Dict = {
  tagline: "講一句，我即刻做。",
  navTalk: "助理",
  navTranslate: "翻譯",
  navApps: "控制",
  navMe: "我",
  statusIdle: "待命",
  statusListening: "聽緊",
  statusThinking: "諗緊",
  statusSpeaking: "講緊",
  tapToTalk: "撳一下講",
  stopListening: "停",
  noSpeech: "呢個瀏覽器冇語音識別，打字都得。",
  typePlaceholder: "打句指令",
  send: "送出",
  suggestions: ["開 YouTube", "而家幾點", "今日天氣", "翻譯"],
  examples: [
    "開 YouTube",
    "而家幾點",
    "今日天氣",
    "倒數 5 分鐘",
    "記住我鍾意粵語",
    "將你好譯做英文",
  ],
  intro: "我係靈犀。英文、普通話、粵語、繁體，講邊樣都得。",
  openReady: "而家開{name}。",
  timeNow: "而家 {time}。",
  dateNow: "今日係{date}。",
  timerSet: "倒數 {time} 開始咗。",
  timerDone: "時間到。",
  timerCancel: "計時取消咗。",
  timerHint: "講幾耐，或者撳 1、5、25 分鐘。",
  noted: "記低咗。{text}",
  remembered: "記住咗：{text}",
  nameSet: "好，{name}。",
  citySet: "你喺{city}。",
  callReady: "撳一下打畀{who}。",
  callNeed: "我未有{who}嘅電話。去「我」加個聯絡人。",
  smsReady: "撳一下傳短訊畀{who}。",
  smsNeed: "我未有{who}嘅電話。",
  navigateReady: "去{place}。",
  calcIs: "{expr} = {result}",
  calcBad: "呢個計唔到。",
  localeSet: "而家用粵語。",
  stopped: "停咗。",
  help: "我可以開 app、即時翻譯、倒數、天氣、導航、打電話，同記住你。試下講：開 YouTube。",
  who: "我係靈犀，你嘅語音助理。粵語、普通話、繁體同英文我都聽得明。",
  aboutEmpty: "我仲未識你。話我知你叫咩、住邊，或者叫我記住一件事。",
  aboutFilled: "名：{name}。城市：{city}。我知：{facts}。",
  unknown: "未知",
  none: "未有",
  weatherNeed: "你喺邊度？話我知城市，或者准我睇位置。",
  weatherNow: "{place}而家 {temp}°，{desc}。",
  weatherUnknown: "搵唔到{place}。",
  weatherFail: "天氣暫時查唔到。",
  aiDown: "我暫時連唔上大腦，不過開 app、計時、時間、記憶都仲用得。",
  flashlightOn: "電筒開咗。手機准相機燈先會着。",
  flashlightOff: "電筒關咗。",
  flashlightFail: "呢部機開唔到電筒。",
  cameraOn: "相機開咗。",
  cameraFail: "相機權限被拒。",
  webReady: "搵緊{query}。",
  phoneHint: "喺手機度會開真正個 app；呢度會開個網站。",
  privacy: "你話我知嘅嘢，只留喺呢部機。",
  yourName: "點稱呼你",
  yourCity: "城市",
  namePh: "你個名",
  cityPh: "香港",
  facts: "我記得嘅事",
  factPh: "記住……",
  add: "加",
  contacts: "聯絡人",
  contactName: "名",
  contactPhone: "電話",
  notes: "筆記",
  notePh: "寫一句",
  voiceReplies: "出聲覆你",
  handsFree: "連續聽",
  handsFreeHint: "講完一句會繼續聽。",
  replyFollow: "跟我講",
  replyLock: "鎖定粵語",
  clearChat: "清對話",
  forget: "忘掉我",
  forgetConfirm: "再撳一次確認",
  tryThese: "可以咁講",
  from: "由",
  to: "到",
  auto: "自動",
  swap: "對調",
  copy: "複製",
  copied: "複製咗",
  speak: "讀出嚟",
  interpreter: "即時傳譯",
  interpreterHint: "你講完一句，我即刻譯出聲。",
  translating: "譯緊",
  translateFail: "譯唔到，再試一次。",
  translatePh: "講或者打字",
  result: "譯文",
  searchApps: "搵 app",
  appsTitle: "應用",
  toolsTitle: "手機功能",
  minuteShort: "分鐘",
  cancel: "取消",
  close: "關閉",
  dialPh: "號碼",
  call: "打",
  text: "短訊",
  cameraHint: "對住鏡頭。開燈就係電筒。",
  langTitle: "語言版本",
  replyTitle: "回覆語言",
  memoryTitle: "關於你",
  langEn: "英文界面、語音同回覆",
  langZh: "普通話 · 簡體",
  langYue: "粵語 · 廣東話識別同口語",
  langHant: "繁體中文",
  emptyFacts: "未有。試下講「記住我鍾意奶茶」。",
  emptyContacts: "加個人，然後講「打畀」佢個名。",
  emptyNotes: "未有筆記。",
  actionOpen: "開{name}",
  actionCall: "打畀{who}",
  actionText: "短訊畀{who}",
  actionGo: "去{place}",
  forgot: "留喺呢部機嘅個人資料已經忘掉。",
  cleared: "對話清咗。",
};

const hant: Dict = {
  tagline: "說一句，我就去做。",
  navTalk: "助理",
  navTranslate: "翻譯",
  navApps: "控制",
  navMe: "我",
  statusIdle: "待命",
  statusListening: "正在聽",
  statusThinking: "在想",
  statusSpeaking: "正在說",
  tapToTalk: "點一下說",
  stopListening: "停止",
  noSpeech: "這個瀏覽器沒有語音辨識，打字也可以。",
  typePlaceholder: "輸入指令",
  send: "送出",
  suggestions: ["打開 YouTube", "現在幾點", "今天天氣", "翻譯"],
  examples: [
    "打開 YouTube",
    "現在幾點",
    "今天天氣",
    "倒數 5 分鐘",
    "記住我喜歡粵語",
    "把你好翻譯成英文",
  ],
  intro: "我是靈犀。國語、粵語、繁體、英文，說哪種都可以。",
  openReady: "正在打開{name}。",
  timeNow: "現在 {time}。",
  dateNow: "今天是{date}。",
  timerSet: "已開始倒數 {time}。",
  timerDone: "時間到。",
  timerCancel: "計時已取消。",
  timerHint: "說多久，或者點 1、5、25 分鐘。",
  noted: "記下了。{text}",
  remembered: "記住了：{text}",
  nameSet: "好，{name}。",
  citySet: "你在{city}。",
  callReady: "點一下打給{who}。",
  callNeed: "我沒有{who}的號碼。到「我」裡加一個聯絡人。",
  smsReady: "點一下傳訊給{who}。",
  smsNeed: "我沒有{who}的號碼。",
  navigateReady: "前往{place}。",
  calcIs: "{expr} = {result}",
  calcBad: "這個算不了。",
  localeSet: "已換成繁體。",
  stopped: "停了。",
  help: "我可以打開應用、即時翻譯、計時、查天氣、導航、打電話，也會記住你。試試說：打開 YouTube。",
  who: "我是靈犀，你的語音助理。國語、粵語、繁體和英文我都聽得懂。",
  aboutEmpty: "我還不認識你。告訴我名字、城市，或說「記住」。",
  aboutFilled: "名字：{name}。城市：{city}。我知道：{facts}。",
  unknown: "還不知道",
  none: "還沒有",
  weatherNeed: "哪個城市？告訴我，或允許定位。",
  weatherNow: "{place}現在 {temp}°，{desc}。",
  weatherUnknown: "找不到{place}。",
  weatherFail: "天氣暫時查不到。",
  aiDown: "我暫時連不上，不過打開應用、計時、時間和記憶還能用。",
  flashlightOn: "手電筒開了。手機允許相機燈光時才會亮。",
  flashlightOff: "手電筒關了。",
  flashlightFail: "這台裝置用不了手電筒。",
  cameraOn: "相機開了。",
  cameraFail: "相機權限被拒絕了。",
  webReady: "正在搜尋{query}。",
  phoneHint: "在手機會打開真正的應用；這裡會打開對應網站。",
  privacy: "你告訴我的，只留在這台裝置上。",
  yourName: "怎麼稱呼你",
  yourCity: "城市",
  namePh: "你的名字",
  cityPh: "台北",
  facts: "我記得的事",
  factPh: "記住……",
  add: "新增",
  contacts: "聯絡人",
  contactName: "名字",
  contactPhone: "電話",
  notes: "筆記",
  notePh: "寫一條",
  voiceReplies: "語音回覆",
  handsFree: "連續聆聽",
  handsFreeHint: "說完一句會繼續聽。",
  replyFollow: "跟著我說",
  replyLock: "鎖定繁體",
  clearChat: "清空對話",
  forget: "忘掉我",
  forgetConfirm: "再點一次確認",
  tryThese: "可以這樣說",
  from: "從",
  to: "到",
  auto: "自動",
  swap: "對調",
  copy: "複製",
  copied: "已複製",
  speak: "朗讀",
  interpreter: "即時傳譯",
  interpreterHint: "你說完一句，我馬上譯出來並讀出聲。",
  translating: "正在翻譯",
  translateFail: "翻譯失敗，再試一次。",
  translatePh: "說話或輸入",
  result: "譯文",
  searchApps: "搜尋應用",
  appsTitle: "應用",
  toolsTitle: "手機功能",
  minuteShort: "分鐘",
  cancel: "取消",
  close: "關閉",
  dialPh: "號碼",
  call: "撥打",
  text: "簡訊",
  cameraHint: "對著鏡頭。開燈就是手電筒。",
  langTitle: "語言版本",
  replyTitle: "回覆語言",
  memoryTitle: "關於你",
  langEn: "英文介面、語音和回覆",
  langZh: "普通話 · 簡體",
  langYue: "粵語 · 廣東話辨識和口語",
  langHant: "繁體中文",
  emptyFacts: "還沒有。試試說「記住我喜歡奶茶」。",
  emptyContacts: "加一個人，然後說「打電話給」他的名字。",
  emptyNotes: "還沒有筆記。",
  actionOpen: "打開{name}",
  actionCall: "打給{who}",
  actionText: "簡訊給{who}",
  actionGo: "前往{place}",
  forgot: "存在這台裝置上的個人資料已經忘掉。",
  cleared: "對話已清空。",
};

export const copy: Record<Locale, Dict> = { en, zh, yue, hant };

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : "",
  );
}

export function detectLocale(text: string, ui: Locale): Locale {
  if (
    /[嘅咗嗰喺哋嚟睇畀俾囉啲]|而家|點解|係咪|唔[該好係會知想]|冇|邊度|聽日|尋日|幾多|咁|喺度/.test(
      text,
    )
  ) {
    return "yue";
  }
  if (!/[\u3400-\u9fff]/.test(text)) return "en";
  const simp = /[这来说后会国门车东长风学网视听乐笔体么开关问为个还从点线员龙马写时让吗里现样进过发对电门]/;
  const trad = /[這來說後會國門車東長風學網視聽樂筆體麼開關問為個還從點線員龍馬寫時讓嗎裡現樣進過發對電門]/;
  const hasS = simp.test(text);
  const hasT = trad.test(text);
  if (hasS && !hasT) return "zh";
  if (hasT && !hasS) return ui === "yue" ? "yue" : "hant";
  if (ui === "en") return "zh";
  return ui;
}

export function formatClock(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(intlTag(locale), {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(intlTag(locale), {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatSpan(totalSeconds: number) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}:${String(mm).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function spokenDuration(seconds: number, locale: Locale) {
  const unit = (enOne: string, enMany: string, zhWord: string, other: string, n: number) => {
    if (locale === "en") return `${n} ${n === 1 ? enOne : enMany}`;
    if (locale === "zh") return `${n} ${zhWord}`;
    return `${n} ${other}`;
  };
  if (seconds % 3600 === 0) return unit("hour", "hours", "小时", "小時", seconds / 3600);
  if (seconds % 60 === 0) return unit("minute", "minutes", "分钟", "分鐘", seconds / 60);
  return unit("second", "seconds", "秒", "秒", seconds);
}

export function formatNumber(n: number) {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 1e6) / 1e6);
}

const WEATHER = {
  clear: { en: "clear", zh: "晴", yue: "晴天", hant: "晴" },
  cloud: { en: "cloudy", zh: "多云", yue: "多雲", hant: "多雲" },
  fog: { en: "foggy", zh: "有雾", yue: "有霧", hant: "有霧" },
  drizzle: { en: "drizzle", zh: "毛毛雨", yue: "毛毛雨", hant: "毛毛雨" },
  rain: { en: "rain", zh: "下雨", yue: "落雨", hant: "下雨" },
  snow: { en: "snow", zh: "下雪", yue: "落雪", hant: "下雪" },
  storm: { en: "thunderstorms", zh: "雷雨", yue: "打雷", hant: "雷雨" },
} as const;

export function weatherPhrase(code: number, locale: Locale) {
  let key: keyof typeof WEATHER = "cloud";
  if (code === 0) key = "clear";
  else if (code <= 3) key = "cloud";
  else if (code <= 48) key = "fog";
  else if (code <= 57) key = "drizzle";
  else if (code <= 67) key = "rain";
  else if (code <= 77) key = "snow";
  else if (code <= 82) key = "rain";
  else key = "storm";
  return WEATHER[key][locale];
}
