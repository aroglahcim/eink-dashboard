# eink-dashboard

E-ink weather dashboard for PocketBook PB634: Open-Meteo, Node.js (Fastify), Docker.

**Agents:** read [AGENTS.md](AGENTS.md) and [CONTRACT.md](CONTRACT.md) before changing core behavior.

## Run with Docker

```bash
cd eink-dashboard
docker compose up --build
```

`src/` and `public/` are bind-mounted; the container runs `node --watch` so code changes reload the server without rebuilding the image.

Web UI: [http://localhost:8080/](http://localhost:8080/) (or port **80**: [http://localhost/](http://localhost/))

API: [http://localhost:8080/api/weather](http://localhost:8080/api/weather)

LAN check (phone or e-reader on the same Wi‑Fi): [http://192.168.1.249:8080/ping](http://192.168.1.249:8080/ping) — expect plain text `eink-dashboard-ok` (replace the IP with this machine’s address).

## iPhone / PocketBook cannot connect (same Wi‑Fi as Mac)

`curl http://192.168.1.249:8080/ping` **on the Mac** does not prove another device can reach the host — that is often hairpin on the same machine, not true LAN access.

### 1. Cloudflare WARP and `KeepAlive`

`killall "Cloudflare WARP"` only stops the UI. The **root daemon may still run** and restart:

```bash
pgrep -lf CloudflareWARP    # if listed, WARP is still active
```

**Stop for testing (admin password):**

```bash
sudo launchctl bootout system/com.cloudflare.1dot1dot1dot1.macos.warp.daemon
# or
sudo killall CloudflareWARP
```

Then from iPhone: `http://192.168.1.249:8080/ping` → `eink-dashboard-ok`.

With WARP enabled: WARP app → **Settings** → **Access Local Network** / `warp-cli override local-network start`, or Split Tunnel **Exclude** `192.168.1.0/24`.

### 2. Docker Desktop workaround (LAN → Mac)

If WARP is off and the phone still cannot connect, run **without Docker** (Node on the host):

```bash
docker compose stop
npm run start:lan
```

From iPhone: `http://192.168.1.249:8080/ping`. If that **works**, the issue is Docker networking (e.g. gVisor) — use `start:lan` for local dev; use the normal image on Proxmox.

Optionally in Docker Desktop: toggle **Settings → Network**, or set `networkType` to `vpnkit` in settings and restart Docker.

### 3. macOS — Local Network for Docker

**System Settings → Privacy & Security → Local Network** — enable **Docker** (and **com.docker.backend** if listed), then restart Docker Desktop.

### 4. Router

Disable **AP isolation / guest network** — phone and Mac must share the main LAN (both `192.168.1.x`), not a guest SSID.

---

## PocketBook browser (LAN)

1. Use a full **`http://`** URL, e.g. `http://192.168.1.249:8080/ping` (not `https://`). Try `/ping` first; then `http://192.168.1.249:8080/`.
2. **Same Wi‑Fi** — e-reader settings → Wi‑Fi → your network → IP must be `192.168.1.x`.
3. **Disable proxy** on the Wi‑Fi network (proxy blocks local IPs).
4. **Browser** — enable **JavaScript** and **images**.
5. **Port 80** — try `http://192.168.1.249/` if `:8080` fails on the device.
6. **Client isolation** — disable on the router or use the main network, not guest Wi‑Fi.
7. **Phone as control** — same URL from a phone; if the phone fails, fix network/router before blaming the e-reader.

## Configuration

Copy `.env.example` to `.env` and adjust values. Point `docker-compose.yml` at `env_file: .env` if you prefer.

| Variable | Default | Description |
|----------|---------|-------------|
| `WEATHER_CITY` | Krakow | City (restart container after change) |
| `WEATHER_COUNTRY` | PL | Geocoding hint |
| `WEATHER_LANG` | `en` | UI language: `en` or `pl` (restart after change) |
| `PORT` | 3000 | Port inside the container |
| `CACHE_TTL_SECONDS` | 840 | Backend response cache (~14 min) |
| `PAGE_REFRESH_SECONDS` | 900 | Browser reload interval (HTTP `Refresh` + meta) |
| `UI_SHOW_NEXT_REFRESH` | `false` | Show approximate next reload in footer `(HH:MM)` |

The page refreshes every **15 minutes** (`PAGE_REFRESH_SECONDS`, default 900) via the HTTP `Refresh` header and HTML meta refresh (no client-side JavaScript).

Set `UI_SHOW_NEXT_REFRESH=true` to append an approximate next reload time in the footer, e.g. `Updated: 21:00 (21:15)` — the time in parentheses is `servedAt + PAGE_REFRESH_SECONDS` when the server handled `GET /`.

All labels, weather descriptions, and errors are rendered on the server from `WEATHER_LANG`.

## Run without Docker

```bash
npm install
npm start
```

Listens on `http://0.0.0.0:3000` by default.

## Proxmox / Cloudflare

Run the same image and publish port 3000 (or map via reverse proxy). The app has no login — control access via tunnel / Cloudflare.
