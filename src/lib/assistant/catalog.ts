import type { Locale } from "@/lib/i18n";

export type ToolId =
  | "camera"
  | "dial"
  | "sms"
  | "notes"
  | "calc"
  | "weather"
  | "timer"
  | "flashlight"
  | "translate"
  | "web";

export type AppDef = {
  id: string;
  group: "apps" | "tools";
  labels: Record<Locale, string>;
  aliases: string[];
  href?: string;
  search?: (query: string) => string;
  tool?: ToolId;
};

function L(en: string, zh: string, yue = zh, hant = zh): Record<Locale, string> {
  return { en, zh, yue, hant };
}

const enc = (base: string) => (query: string) => `${base}${encodeURIComponent(query)}`;

export const APPS: AppDef[] = [
  {
    id: "youtube",
    group: "apps",
    labels: L("YouTube", "油管", "YouTube", "YouTube"),
    aliases: ["youtube", "you tube", "yt", "油管", "优兔", "優兔"],
    href: "https://www.youtube.com",
    search: enc("https://www.youtube.com/results?search_query="),
  },
  {
    id: "bilibili",
    group: "apps",
    labels: L("Bilibili", "哔哩哔哩", "B站", "嗶哩嗶哩"),
    aliases: ["bilibili", "b站", "哔哩哔哩", "嗶哩嗶哩", "哔哩", "嗶哩"],
    href: "https://www.bilibili.com",
    search: enc("https://search.bilibili.com/all?keyword="),
  },
  {
    id: "maps",
    group: "apps",
    labels: L("Maps", "谷歌地图", "地圖", "地圖"),
    aliases: ["google maps", "maps", "谷歌地图", "谷歌地圖", "地图", "地圖"],
    href: "https://www.google.com/maps",
    search: enc("https://www.google.com/maps/search/?api=1&query="),
  },
  {
    id: "amap",
    group: "apps",
    labels: L("Amap", "高德地图", "高德地圖", "高德地圖"),
    aliases: ["amap", "高德地图", "高德地圖", "高德"],
    href: "https://www.amap.com",
    search: enc("https://uri.amap.com/search?keyword="),
  },
  {
    id: "spotify",
    group: "apps",
    labels: L("Spotify", "Spotify"),
    aliases: ["spotify"],
    href: "https://open.spotify.com",
    search: enc("https://open.spotify.com/search/"),
  },
  {
    id: "netease",
    group: "apps",
    labels: L("NetEase", "网易云", "網易雲", "網易雲"),
    aliases: ["netease", "网易云音乐", "網易雲音樂", "网易云", "網易雲"],
    href: "https://music.163.com",
    search: enc("https://music.163.com/#/search/m/?s="),
  },
  {
    id: "whatsapp",
    group: "apps",
    labels: L("WhatsApp", "WhatsApp"),
    aliases: ["whatsapp", "whats app"],
    href: "https://web.whatsapp.com",
    search: (query) => {
      const digits = query.replace(/[^\d]/g, "");
      return digits.length >= 6 ? `https://wa.me/${digits}` : "https://web.whatsapp.com";
    },
  },
  {
    id: "wechat",
    group: "apps",
    labels: L("WeChat", "微信"),
    aliases: ["wechat", "weixin", "微信"],
    href: "https://web.wechat.com",
  },
  {
    id: "instagram",
    group: "apps",
    labels: L("Instagram", "Instagram"),
    aliases: ["instagram", "ins"],
    href: "https://www.instagram.com",
    search: enc("https://www.instagram.com/explore/search/keyword/?q="),
  },
  {
    id: "gmail",
    group: "apps",
    labels: L("Gmail", "邮箱", "郵箱", "郵箱"),
    aliases: ["gmail", "google mail", "邮箱", "郵箱", "邮件", "郵件"],
    href: "https://mail.google.com",
  },
  {
    id: "x",
    group: "apps",
    labels: L("X", "X"),
    aliases: ["twitter", "推特", "x"],
    href: "https://x.com",
    search: enc("https://x.com/search?q="),
  },
  {
    id: "netflix",
    group: "apps",
    labels: L("Netflix", "Netflix"),
    aliases: ["netflix", "奈飞", "奈飛", "网飞", "網飛"],
    href: "https://www.netflix.com",
    search: enc("https://www.netflix.com/search?q="),
  },
  {
    id: "douyin",
    group: "apps",
    labels: L("Douyin", "抖音"),
    aliases: ["douyin", "抖音", "tiktok", "tik tok"],
    href: "https://www.douyin.com",
    search: enc("https://www.douyin.com/search/"),
  },
  {
    id: "weibo",
    group: "apps",
    labels: L("Weibo", "微博"),
    aliases: ["weibo", "微博"],
    href: "https://weibo.com",
    search: enc("https://s.weibo.com/weibo?q="),
  },
  {
    id: "rednote",
    group: "apps",
    labels: L("Rednote", "小红书", "小紅書", "小紅書"),
    aliases: ["rednote", "xiaohongshu", "小红书", "小紅書"],
    href: "https://www.xiaohongshu.com",
    search: enc("https://www.xiaohongshu.com/search_result?keyword="),
  },
  {
    id: "taobao",
    group: "apps",
    labels: L("Taobao", "淘宝", "淘寶", "淘寶"),
    aliases: ["taobao", "淘宝", "淘寶"],
    href: "https://www.taobao.com",
    search: enc("https://s.taobao.com/search?q="),
  },
  {
    id: "calendar",
    group: "apps",
    labels: L("Calendar", "日历", "日曆", "日曆"),
    aliases: ["calendar", "日历", "日曆", "日程"],
    href: "https://calendar.google.com",
  },
  {
    id: "camera",
    group: "tools",
    labels: L("Camera", "相机", "相機", "相機"),
    aliases: ["camera", "相机", "相機", "拍照", "影相"],
    tool: "camera",
  },
  {
    id: "phone",
    group: "tools",
    labels: L("Phone", "电话", "電話", "電話"),
    aliases: ["phone", "dialer", "电话", "電話", "拨号", "撥號"],
    tool: "dial",
  },
  {
    id: "sms",
    group: "tools",
    labels: L("Messages", "短信", "短訊", "簡訊"),
    aliases: ["messages", "sms", "短信", "短讯", "短訊", "信息", "訊息", "簡訊"],
    tool: "sms",
  },
  {
    id: "notes",
    group: "tools",
    labels: L("Notes", "笔记", "筆記", "筆記"),
    aliases: ["notes", "笔记", "筆記", "备忘录", "備忘錄", "备忘", "備忘"],
    tool: "notes",
  },
  {
    id: "calc",
    group: "tools",
    labels: L("Calculator", "计算器", "計數機", "計算機"),
    aliases: ["calculator", "calc", "计算器", "計算器", "计算机", "計算機", "計數機"],
    tool: "calc",
  },
  {
    id: "weather",
    group: "tools",
    labels: L("Weather", "天气", "天氣", "天氣"),
    aliases: ["weather", "天气", "天氣"],
    tool: "weather",
  },
  {
    id: "timer",
    group: "tools",
    labels: L("Timer", "计时", "計時", "計時"),
    aliases: ["timer", "clock", "计时器", "計時器", "倒计时", "倒計時", "闹钟", "鬧鐘", "时钟", "時鐘"],
    tool: "timer",
  },
  {
    id: "flashlight",
    group: "tools",
    labels: L("Light", "手电筒", "電筒", "手電筒"),
    aliases: ["flashlight", "torch", "手电筒", "手電筒", "电筒", "電筒", "开灯", "開燈", "开手电筒", "開手電筒"],
    tool: "flashlight",
  },
  {
    id: "translate",
    group: "tools",
    labels: L("Translate", "翻译", "翻譯", "翻譯"),
    aliases: ["translator", "翻译器", "翻譯器"],
    tool: "translate",
  },
  {
    id: "search",
    group: "tools",
    labels: L("Search", "搜索", "搜尋", "搜尋"),
    aliases: ["google", "百度"],
    tool: "web",
    href: "https://www.google.com",
    search: enc("https://www.google.com/search?q="),
  },
];

export function getApp(id: string) {
  return APPS.find((app) => app.id === id) ?? null;
}

export type AppHit = { app: AppDef; before: string; after: string };

export function findApp(text: string): AppHit | null {
  const lower = text.toLowerCase();
  let best: { app: AppDef; index: number; length: number } | null = null;
  for (const app of APPS) {
    for (const alias of app.aliases) {
      const needle = alias.toLowerCase();
      let from = 0;
      while (from < lower.length) {
        const index = lower.indexOf(needle, from);
        if (index < 0) break;
        const prev = index === 0 ? "" : lower[index - 1]!;
        const next = index + needle.length >= lower.length ? "" : lower[index + needle.length]!;
        const latin = /^[a-z0-9]/i.test(needle);
        const prevOk = !latin || !/[a-z0-9]/i.test(prev);
        const nextOk = !latin || !/[a-z0-9]/i.test(next);
        if (prevOk && nextOk && (!best || needle.length > best.length)) {
          best = { app, index, length: needle.length };
        }
        from = index + Math.max(needle.length, 1);
      }
    }
  }
  if (!best) return null;
  return {
    app: best.app,
    before: text.slice(0, best.index).trim(),
    after: text.slice(best.index + best.length).trim(),
  };
}

export function appUrl(app: AppDef, query?: string) {
  if (query && app.search) return app.search(query);
  return app.href ?? null;
}
