import { weatherIconSvg } from './weatherIcons.js';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatClockTime(date, locale, timeZone) {
  try {
    return date.toLocaleTimeString(resolveLocaleTag(locale), {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    });
  } catch {
    return '—';
  }
}

function formatUpdatedAt(iso, locale, timeZone) {
  if (!iso) {
    return '—';
  }
  try {
    return formatClockTime(new Date(iso), locale, timeZone);
  } catch {
    return '—';
  }
}

function buildUpdatedLine({
  ui,
  locale,
  timeZone,
  weatherUpdatedAt,
  servedAt,
  showNextRefresh,
  pageRefreshSeconds,
  isError,
}) {
  const dataTime = isError
    ? '—'
    : formatUpdatedAt(weatherUpdatedAt, locale, timeZone);
  let line = `${ui.updated}: ${escapeHtml(dataTime)}`;
  if (showNextRefresh && servedAt instanceof Date) {
    const nextAt = new Date(servedAt.getTime() + pageRefreshSeconds * 1000);
    const nextTime = formatClockTime(nextAt, locale, timeZone);
    line += ` (${escapeHtml(nextTime)})`;
  }
  return line;
}

function resolveLocaleTag(locale) {
  return locale === 'pl' ? 'pl-PL' : 'en-GB';
}

export function renderWeatherPage({
  locale,
  ui,
  weather,
  errorMessage,
  servedAt,
  timeZone,
  showNextRefresh,
  pageRefreshSeconds,
}) {
  const err = errorMessage != null;
  const pageClass = err ? 'page error' : 'page';
  const refreshSeconds = pageRefreshSeconds ?? 900;

  const place = err ? ui.errorHeading : escapeHtml(weather.place);
  const temperature = err ? '—' : escapeHtml(weather.display.temperature);
  const conditionLabel = err
    ? escapeHtml(errorMessage)
    : escapeHtml(weather.current.description);
  const conditionVisual = err
    ? `<p class="description">${conditionLabel}</p>`
    : `<div class="weather-icon" role="img" aria-label="${conditionLabel}">${weatherIconSvg(weather.current.weatherCode)}</div>`;
  const minmax = err ? '—' : escapeHtml(weather.display.minMax);
  const wind = err ? '—' : escapeHtml(weather.display.wind);
  const rain = err ? '—' : escapeHtml(weather.display.rain);
  const updatedLine = buildUpdatedLine({
    ui,
    locale,
    timeZone: timeZone ?? 'UTC',
    weatherUpdatedAt: err ? null : weather.updatedAt,
    servedAt,
    showNextRefresh: Boolean(showNextRefresh),
    pageRefreshSeconds: refreshSeconds,
    isError: err,
  });

  return `<!DOCTYPE html>
<html lang="${escapeHtml(ui.htmlLang)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="${refreshSeconds}" />
    <title>${escapeHtml(ui.title)}</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <main class="${pageClass}">
      <header class="header">
        <p class="label">${escapeHtml(ui.labelToday)}</p>
        <h1 class="place">${place}</h1>
      </header>

      <section class="hero">
        <p class="temperature">${temperature}</p>
        ${conditionVisual}
      </section>

      <section class="grid">
        <div class="cell">
          <p class="cell-label">${escapeHtml(ui.minMax)}</p>
          <p class="cell-value">${minmax}</p>
        </div>
        <div class="cell">
          <p class="cell-label">${escapeHtml(ui.wind)}</p>
          <p class="cell-value">${wind}</p>
        </div>
        <div class="cell">
          <p class="cell-label">${escapeHtml(ui.rain)}</p>
          <p class="cell-value">${rain}</p>
        </div>
      </section>

      <footer class="footer">
        <p class="updated">${updatedLine}</p>
      </footer>
    </main>
  </body>
</html>`;
}
