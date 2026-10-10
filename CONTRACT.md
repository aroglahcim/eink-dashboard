# eink-dashboard — domain contract

Stable facts for agents and humans. Update this file when behavior or env contract changes.

## Product

- Single-page **today** weather view for a **fixed city** (env-configured).
- Target display: **~1072×1448** e‑ink, **B&W**, limited browser (PocketBook PB634 class).
- Page must fit **without vertical scroll** at default typography.

## Data source

- **Open-Meteo** forecast + geocoding APIs; **no API key**.
- Timezone: `TZ` env (default `Europe/Warsaw`).
- Forecast horizon: **1 day** (`forecast_days=1`) plus `current` fields documented in [`src/weather.js`](src/weather.js).

## Environment variables

| Variable | Default | Effect |
|----------|---------|--------|
| `WEATHER_CITY` | `Krakow` | Geocoding name |
| `WEATHER_COUNTRY` | `PL` | Geocoding filter (ISO country code) |
| `WEATHER_LANG` | `en` | UI locale: **`en`** or **`pl`** only |
| `PORT` | `3000` | Listen port |
| `HOST` | `0.0.0.0` | Bind address |
| `TZ` | `Europe/Warsaw` | Display + API timezone |
| `CACHE_TTL_SECONDS` | `840` | Server-side weather cache (~14 min) |
| `PAGE_REFRESH_SECONDS` | `900` | Browser reload interval (header + meta) |
| `UI_SHOW_NEXT_REFRESH` | off (`false`) | Footer shows approximate next reload time in parentheses |

Changing city or language requires **process restart** (no hot reload of env in app).

## UI contract

- **No client JavaScript** for rendering weather. Reload via HTTP **`Refresh`** header and matching **`<meta http-equiv="refresh">`** (`PAGE_REFRESH_SECONDS`, default 900).
- **Footer time (optional):** `UI_SHOW_NEXT_REFRESH` adds `(HH:MM)` = approximate next reload from **GET /** time + `PAGE_REFRESH_SECONDS`.
- **Grid (3 columns):** min/max °C, wind km/h, rain as **`{mm} · {percent}`** (either part may be omitted if missing).
- **Hero:** temperature (large) + **WMO icon** (SVG); human-readable condition string is **`aria-label` only**, not visible text on success path.
- **Errors:** text message in hero (no icon requirement).

## WMO `weather_code` → icon key

Mapping is defined in [`src/weatherIcons.js`](src/weatherIcons.js) (`iconKeyForWmoCode`). Groups:

| Codes | Icon key |
|-------|----------|
| 0 | `clear` |
| 1 | `mainly-clear` |
| 2 | `partly-cloudy` |
| 3 | `overcast` |
| 45, 48 | `fog` |
| 51–57 | `drizzle` |
| 61–67 | `rain` |
| 71–77 | `snow` |
| 80–82 | `rain-showers` |
| 85–86 | `snow-showers` |
| 95, 96, 99 | `thunderstorm` |
| other | `unknown` |

Text descriptions for the same codes live in [`src/i18n.js`](src/i18n.js) per locale.

## HTTP contract

| Path | Response |
|------|----------|
| `/` | `text/html; charset=utf-8` + header `Refresh: {PAGE_REFRESH_SECONDS}` |
| `/api/weather` | JSON payload or `{ error, locale }` with 502 |
| `/health` | `{ ok: true, locale }` |
| `/ping` | plain text **`eink-dashboard-ok`** |

## Docker

- **Production:** image from `Dockerfile` (non-root user, `HEALTHCHECK` on `/health`).
- **Development:** `docker-compose.yml` bind-mounts source and runs `node --watch` — not the production runtime shape.

## Explicitly out of scope

- Multi-day forecast UI
- Location search / GPS
- HTTPS or access control inside the app (handled externally, e.g. Cloudflare)
