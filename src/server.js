import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { createWeatherService } from './weather.js';
import { loadIndexTemplate, renderIndexHtml } from './renderIndex.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const config = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',
  city: process.env.WEATHER_CITY ?? 'Kraków',
  country: process.env.WEATHER_COUNTRY ?? 'PL',
  timezone: process.env.TZ ?? 'Europe/Warsaw',
  cacheTtlMs: Number(process.env.CACHE_TTL_SECONDS ?? 840) * 1000,
};

const weather = createWeatherService(config);
const indexTemplate = loadIndexTemplate(publicDir);

const app = Fastify({
  logger: true,
});

app.get('/ping', async (_request, reply) => {
  reply.type('text/plain; charset=utf-8').send('pogoda-ok');
});

app.get('/health', async () => ({ ok: true }));

app.get('/', async (_request, reply) => {
  try {
    const data = await weather.getWeather();
    reply
      .type('text/html; charset=utf-8')
      .send(renderIndexHtml(indexTemplate, data));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Nie udało się pobrać pogody';
    reply
      .type('text/html; charset=utf-8')
      .send(renderIndexHtml(indexTemplate, { error: message }));
  }
});

app.get('/api/weather', async (_request, reply) => {
  try {
    const data = await weather.getWeather();
    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Nie udało się pobrać pogody';
    reply.code(502);
    return { error: message };
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
    'Pogoda niedostępna przy starcie — spróbuj ponownie przy pierwszym żądaniu',
  );
}

await app.listen({ port: config.port, host: config.host });
