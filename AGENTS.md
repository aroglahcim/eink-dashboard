# eink-dashboard — agent guide

## Purpose

Minimal **weather dashboard** for **PocketBook PB634** (and similar e‑ink browsers): one screen, high contrast, no scroll. Data from **Open-Meteo** (no API key). **Not** a general web app, auth layer, or multi-page site.

## Tooling

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Run locally | `npm start` (port 3000) |
| LAN dev on host | `npm run start:lan` (port 8080) |
| Docker dev | `docker compose up --build` (bind-mounts `src/`, `public/`; `node --watch`) |
| Production image | `docker build .` — use Dockerfile `CMD`, not compose `command` override |

Node **≥ 22**. ESM (`"type": "module"`). Package manager: **npm** (`package-lock.json` committed).

Env: copy `.env.example` → `.env` for local overrides; **never commit** `.env`.

## Architecture

- **Server-side only UI** — HTML from [`src/renderPage.js`](src/renderPage.js). No client JavaScript for data or i18n.
- **Refresh** — HTTP `Refresh` header + matching meta tag; interval `PAGE_REFRESH_SECONDS` (default 900). Optional footer hint via `UI_SHOW_NEXT_REFRESH`.
- **Static assets** — only [`public/style.css`](public/style.css) via `@fastify/static`.
- **Routes** — `GET /` (HTML), `GET /api/weather` (JSON), `GET /health`, `GET /ping` → `eink-dashboard-ok`.

## Conventions

- **Language** — `WEATHER_LANG` (`en` \| `pl`); all copy and WMO text in [`src/i18n.js`](src/i18n.js). Restart process after env change.
- **Weather icons** — monochrome inline SVG from [`src/weatherIcons.js`](src/weatherIcons.js); visible condition icon, text in `aria-label` from `wmoDescription`.
- **Location** — `WEATHER_CITY`, `WEATHER_COUNTRY`; geocoding cached in memory until restart.
- **Backend cache** — in-memory forecast TTL `CACHE_TTL_SECONDS` (default 840).
- **Commits** — conventional commits (`feat:`, `fix:`, `docs:`, …); English in code and docs unless user asks otherwise.

## Safety

- Do not commit secrets (`.env`, tokens). Open-Meteo needs no credentials.
- Do not add auth bypass “for dev” on production paths.
- Keep UI minimal for e‑ink: avoid heavy JS bundles, animations, and color-only cues.

## Key paths

| Path | Role |
|------|------|
| [`src/server.js`](src/server.js) | Fastify app, env config |
| [`src/weather.js`](src/weather.js) | Open-Meteo client + payload |
| [`src/i18n.js`](src/i18n.js) | Locales + WMO strings |
| [`src/weatherIcons.js`](src/weatherIcons.js) | WMO code → SVG |
| [`src/renderPage.js`](src/renderPage.js) | Full HTML SSR |
| [`public/style.css`](public/style.css) | E‑ink layout |
| [`Dockerfile`](Dockerfile) | Production image |
| [`docker-compose.yml`](docker-compose.yml) | **Local dev only** (volumes + watch) |
| [`CONTRACT.md`](CONTRACT.md) | Stable domain facts |

## External references

- Open-Meteo API: https://open-meteo.com/en/docs (`weather_code` = WMO interpretation)
- GitHub: https://github.com/aroglahcim/eink-dashboard
- Repo provisioning (Terraform): `arog-lahcim/terraform` → `github-aroglahcim-org/repositories.tf` entry `eink-dashboard`
- CI: [`.github/workflows/docker-image.yml`](.github/workflows/docker-image.yml) → GHCR + Docker Hub on push to `main`

## Out of scope (unless requested)

- User accounts, admin UI, city picker in browser
- Client-side frameworks or SPA routing
- Proxmox / Cloudflare tunnel setup (documented in README only)
