import { wmoDescription } from './wmo.js';

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

function round1(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return null;
  }
  return Math.round(Number(value) * 10) / 10;
}

function formatNumber(value, suffix) {
  const n = round1(value);
  if (n == null) {
    return '—';
  }
  return `${n}${suffix}`;
}

export function createWeatherService(config) {
  let locationCache = null;
  let weatherCache = null;
  let weatherCacheExpiresAt = 0;

  async function resolveLocation() {
    if (locationCache) {
      return locationCache;
    }

    const params = new URLSearchParams({
      name: config.city,
      count: '10',
      language: 'pl',
      format: 'json',
    });

    const response = await fetch(`${GEO_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Geokodowanie nie powiodło się (${response.status})`);
    }

    const data = await response.json();
    const results = data.results ?? [];
    if (results.length === 0) {
      throw new Error(`Nie znaleziono miasta: ${config.city}`);
    }

    const country = config.country?.toUpperCase();
    const match =
      (country
        ? results.find((r) => r.country_code?.toUpperCase() === country)
        : null) ?? results[0];

    locationCache = {
      name: match.name,
      admin1: match.admin1 ?? '',
      country: match.country ?? '',
      countryCode: match.country_code ?? '',
      latitude: match.latitude,
      longitude: match.longitude,
      timezone: match.timezone ?? config.timezone,
    };

    return locationCache;
  }

  async function fetchForecast(location) {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      timezone: location.timezone,
      forecast_days: '1',
      current: [
        'temperature_2m',
        'weather_code',
        'wind_speed_10m',
        'precipitation',
      ].join(','),
      daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum'].join(
        ',',
      ),
      wind_speed_unit: 'kmh',
      precipitation_unit: 'mm',
    });

    const response = await fetch(`${FORECAST_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Prognoza nie powiodła się (${response.status})`);
    }

    return response.json();
  }

  function buildPayload(location, forecast) {
    const current = forecast.current ?? {};
    const daily = forecast.daily ?? {};
    const idx = 0;

    const place = location.name;

    return {
      place,
      country: location.country,
      updatedAt: current.time ?? new Date().toISOString(),
      current: {
        temperatureC: round1(current.temperature_2m),
        description: wmoDescription(current.weather_code),
        weatherCode: current.weather_code ?? null,
        windKmh: round1(current.wind_speed_10m),
        precipitationMm: round1(current.precipitation),
      },
      today: {
        minC: round1(daily.temperature_2m_min?.[idx]),
        maxC: round1(daily.temperature_2m_max?.[idx]),
        precipitationSumMm: round1(daily.precipitation_sum?.[idx]),
        date: daily.time?.[idx] ?? null,
      },
      display: {
        temperature: formatNumber(current.temperature_2m, '°C'),
        minMax: `${formatNumber(daily.temperature_2m_min?.[idx], '°C')} / ${formatNumber(daily.temperature_2m_max?.[idx], '°C')}`,
        wind: formatNumber(current.wind_speed_10m, ' km/h'),
        rain: formatNumber(daily.precipitation_sum?.[idx], ' mm'),
      },
    };
  }

  async function getWeather() {
    const now = Date.now();
    if (weatherCache && now < weatherCacheExpiresAt) {
      return weatherCache;
    }

    const location = await resolveLocation();
    const forecast = await fetchForecast(location);
    const payload = buildPayload(location, forecast);

    weatherCache = payload;
    weatherCacheExpiresAt = now + config.cacheTtlMs;

    return payload;
  }

  return {
    getWeather,
    async warmup() {
      await getWeather();
    },
  };
}
