const WMO_EN = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const WMO_PL = {
  0: 'Bezchmurnie',
  1: 'Prawie bezchmurnie',
  2: 'Częściowe zachmurzenie',
  3: 'Pochmurno',
  45: 'Mgła',
  48: 'Szronowa mgła',
  51: 'Lekka mżawka',
  53: 'Mżawka',
  55: 'Intensywna mżawka',
  56: 'Marząca mżawka',
  57: 'Intensywna marząca mżawka',
  61: 'Lekki deszcz',
  63: 'Deszcz',
  65: 'Intensywny deszcz',
  66: 'Marznący deszcz',
  67: 'Intensywny marznący deszcz',
  71: 'Lekki śnieg',
  73: 'Śnieg',
  75: 'Intensywny śnieg',
  77: 'Ziarnisty śnieg',
  80: 'Lekkie opady',
  81: 'Opady deszczu',
  82: 'Ulewne opady',
  85: 'Opady śniegu',
  86: 'Intensywne opady śniegu',
  95: 'Burza',
  96: 'Burza z gradem',
  99: 'Burza z intensywnym gradem',
};

const UI = {
  en: {
    htmlLang: 'en',
    title: 'Weather',
    labelToday: 'Weather · today',
    minMax: 'Min / max',
    wind: 'Wind',
    rain: 'Rain',
    updated: 'Updated',
    errorHeading: 'Error',
    errors: {
      geocodingFailed: 'Geocoding failed',
      cityNotFound: 'City not found',
      forecastFailed: 'Forecast failed',
      loadWeather: 'Could not load weather',
      noData: 'No data',
      variableConditions: 'Variable conditions',
    },
  },
  pl: {
    htmlLang: 'pl',
    title: 'Pogoda',
    labelToday: 'Pogoda · dziś',
    minMax: 'Min / max',
    wind: 'Wiatr',
    rain: 'Opady',
    updated: 'Aktualizacja',
    errorHeading: 'Błąd',
    errors: {
      geocodingFailed: 'Geokodowanie nie powiodło się',
      cityNotFound: 'Nie znaleziono miasta',
      forecastFailed: 'Prognoza nie powiodła się',
      loadWeather: 'Nie udało się pobrać pogody',
      noData: 'Brak danych',
      variableConditions: 'Warunki zmienne',
    },
  },
};

export const SUPPORTED_LOCALES = ['en', 'pl'];

export function resolveLocale(value) {
  const normalized = String(value ?? 'en')
    .trim()
    .toLowerCase()
    .slice(0, 2);
  return SUPPORTED_LOCALES.includes(normalized) ? normalized : 'en';
}

export function getUi(locale) {
  return UI[resolveLocale(locale)];
}

export function wmoDescription(code, locale) {
  const table = resolveLocale(locale) === 'pl' ? WMO_PL : WMO_EN;
  const ui = getUi(locale);
  if (code == null || Number.isNaN(Number(code))) {
    return ui.errors.noData;
  }
  return table[Number(code)] ?? ui.errors.variableConditions;
}

export function geocodingLanguage(locale) {
  return resolveLocale(locale) === 'pl' ? 'pl' : 'en';
}
