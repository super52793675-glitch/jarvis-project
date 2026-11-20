import { copy, fill, weatherPhrase, type Locale } from "@/lib/i18n";

type GeoResult = { name?: string; latitude?: number; longitude?: number };
type Forecast = { current?: { temperature_2m?: number; weather_code?: number } };

async function placeToPoint(place: string) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1`,
  );
  if (!response.ok) return null;
  const body = (await response.json()) as { results?: GeoResult[] };
  const hit = body.results?.[0];
  if (!hit || hit.latitude == null || hit.longitude == null) return null;
  return { name: hit.name || place, latitude: hit.latitude, longitude: hit.longitude };
}

function here(): Promise<{ latitude: number; longitude: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60_000 },
    );
  });
}

export async function describeWeather(place: string | undefined, locale: Locale) {
  const dict = copy[locale];
  try {
    const point = place ? await placeToPoint(place) : await here().then((pos) => (pos ? { ...pos, name: "" } : null));
    if (!point) return place ? fill(dict.weatherUnknown, { place }) : dict.weatherNeed;
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${point.latitude}&longitude=${point.longitude}&current=temperature_2m,weather_code&timezone=auto`,
    );
    if (!response.ok) return dict.weatherFail;
    const body = (await response.json()) as Forecast;
    const temp = body.current?.temperature_2m;
    const code = body.current?.weather_code;
    if (temp == null || code == null) return dict.weatherFail;
    const label = point.name || (locale === "en" ? "Here" : locale === "yue" ? "呢度" : "这里");
    return fill(dict.weatherNow, {
      place: label,
      temp: Math.round(temp),
      desc: weatherPhrase(code, locale),
    });
  } catch {
    return dict.weatherFail;
  }
}
