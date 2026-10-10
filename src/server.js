import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { getUi, resolveLocale } from './i18n.js';
import { renderWeatherPage } from './renderPage.js';
import { createWeatherService } from './weather.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const locale = resolveLocale(process.env.WEATHER_LANG);
const ui = getUi(locale);

function envFlag(name, defaultValue = false) {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === '') {
    return defaultValue;
  }
  const value = String(raw).trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}

const config = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',
  city: process.env.WEATHER_CITY ?? 'Krakow',
  country: process.env.WEATHER_COUNTRY ?? 'PL',
  timezone: process.env.TZ ?? 'Europe/Warsaw',
  locale,
  cacheTtlMs: Number(process.env.CACHE_TTL_SECONDS ?? 840) * 1000,
  pageRefreshSeconds: Number(process.env.PAGE_REFRESH_SECONDS ?? 900),
  showNextRefresh: envFlag('UI_SHOW_NEXT_REFRESH', false),
};

const weather = createWeatherService(config);

const app = Fastify({
  logger: true,
});

function htmlPage(weatherData, errorMessage, servedAt) {
  return renderWeatherPage({
    locale,
    ui,
    weather: weatherData,
    errorMessage,
    servedAt,
    timeZone: config.timezone,
    showNextRefresh: config.showNextRefresh,
    pageRefreshSeconds: config.pageRefreshSeconds,
  });
}

function setPageRefreshHeader(reply) {
  reply.header('Refresh', String(config.pageRefreshSeconds));
}

app.get('/ping', async (_request, reply) => {
  reply.type('text/plain; charset=utf-8').send('eink-dashboard-ok');
});

app.get('/health', async () => ({ ok: true, locale }));

app.get('/', async (_request, reply) => {
  const servedAt = new Date();
  setPageRefreshHeader(reply);
  try {
    const data = await weather.getWeather();
    reply.type('text/html; charset=utf-8').send(htmlPage(data, null, servedAt));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ui.errors.loadWeather;
    reply.type('text/html; charset=utf-8').send(htmlPage(null, message, servedAt));
  }
});

app.get('/api/weather', async (_request, reply) => {
  try {
    const data = await weather.getWeather();
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ui.errors.loadWeather;
    reply.code(502);
    return { error: message, locale };
  }
});

await app.register(fastifyStatic, {
  root: publicDir,
  prefix: '/',
  index: false,
});

try {
  await weather.warmup();
} catch (error) {
  app.log.warn(
    { err: error },
    'Weather unavailable at startup; retry on first request',
  );
}

await app.listen({ port: config.port, host: config.host });
