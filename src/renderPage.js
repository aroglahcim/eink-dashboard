import { weatherIconSvg } from './weatherIcons.js';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatUpdatedAt(iso, locale) {
  if (!iso) {
    return '—';
  }
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(resolveLocaleTag(locale), {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '—';
  }
}

function resolveLocaleTag(locale) {
  return locale === 'pl' ? 'pl-PL' : 'en-GB';
}

export function renderWeatherPage({ locale, ui, weather, errorMessage }) {
  const err = errorMessage != null;
  const pageClass = err ? 'page error' : 'page';

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
  const updatedLine = err
    ? `${ui.updated}: —`
    : `${ui.updated}: ${escapeHtml(formatUpdatedAt(weather.updatedAt, locale))}`;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(ui.htmlLang)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="900" />
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
