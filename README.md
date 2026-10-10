# eink-dashboard

Mikrostrona pogody pod PocketBook PB634 (e‑ink): Open-Meteo, Node.js (Fastify), Docker.

## Uruchomienie (Docker)

```bash
cd eink-dashboard
docker compose up --build
```

Strona: [http://localhost:8080/](http://localhost:8080/) (alternatywnie port **80**: [http://localhost/](http://localhost/))

API: [http://localhost:8080/api/weather](http://localhost:8080/api/weather)

Test sieci (PocketBook / telefon w tej samej Wi‑Fi): [http://192.168.1.249:8080/ping](http://192.168.1.249:8080/ping) — powinno pokazać sam tekst `pogoda-ok` (podmień IP na adres tego komputera).

## iPhone / PocketBook nie łączy się (Mac w tej samej Wi‑Fi)

Na Macu `curl http://192.168.1.249:8080/ping` **nie dowodzi**, że iPhone też dojdzie — to często ten sam komputer (hairpin), nie inne urządzenie w LAN.

### 1. Cloudflare WARP — daemon z `KeepAlive`

`killall "Cloudflare WARP"` zabija tylko UI. **Daemon root nadal działa** i może się sam wznawiać:

```bash
pgrep -lf CloudflareWARP    # jeśli coś widać, WARP nadal aktywny
```

**Wyłączenie na test (hasło admina):**

```bash
sudo launchctl bootout system/com.cloudflare.1dot1dot1dot1.macos.warp.daemon
# albo
sudo killall CloudflareWARP
```

Potem z iPhone: `http://192.168.1.249:8080/ping` → `pogoda-ok`.

Przy włączonym WARP: aplikacja WARP → **Settings** → **Access Local Network** / `warp-cli override local-network start`, albo Split Tunnel **Exclude** `192.168.1.0/24`.

### 2. Obejście Docker Desktop (LAN → Mac)

Jeśli WARP jest off, a iPhone dalej nie łączy, spróbuj **bez Dockera** (Node bezpośrednio na Macu):

```bash
docker compose stop
npm run start:lan
```

Z iPhone: `http://192.168.1.249:8080/ping`. Jeśli **tak działa**, problem to sieć Dockera (np. gVisor) — na czas dev używaj `start:lan`, na Proxmox zostaw normalny obraz.

Opcjonalnie w Docker Desktop: wyłącz/włącz **Settings → Network**, albo w starszych wersjach `networkType`: `vpnkit` w pliku ustawień i restart Docker.

### 3. macOS Sequoia — Local Network dla Docker

**System Settings → Privacy & Security → Local Network** — włącz **Docker** (i ewentualnie **com.docker.backend**), potem restart Docker Desktop.

### 4. Router

Wyłącz **AP isolation / Guest network** — telefon i Mac muszą być w tej samej sieci (nie gościnnej), oba `192.168.1.x`.

---

## PocketBook nie otwiera strony (LAN)

1. **Pełny adres z `http://`** — wpisz dokładnie np. `http://192.168.1.249:8080/ping` (nie `https://`, bez spacji). Najpierw `/ping` — jeśli widać `pogoda-ok`, sieć działa; potem `http://192.168.1.249:8080/`.
2. **Ten sam Wi‑Fi** — na czytniku: Ustawienia → Wi‑Fi → Twoja sieć → IP musi być `192.168.1.x` (ta sama podsieć co komputer).
3. **Wyłącz proxy** — Ustawienia → Wi‑Fi → sieć → Więcej → **Proxy: wyłączone** (proxy blokuje lokalne IP).
4. **Przeglądarka** — włącz **JavaScript** i **obrazki** (Ustawienia przeglądarki).
5. **Port 80** — spróbuj `http://192.168.1.249/` (bez `:8080`), jeśli router lub czytnik gryzie się z portem 8080.
6. **Izolacja klientów Wi‑Fi** — wyłącz „AP isolation” / „Guest network” na routerze albo podłącz Maca i PocketBook do tej samej sieci głównej (nie gościnnej).
7. **Telefon jako kontrola** — z telefonu w Wi‑Fi otwórz ten sam URL; jeśli telefon nie łączy, problem to sieć/router, nie PocketBook.

## Konfiguracja

Skopiuj `.env.example` do `.env` i zmień wartości. W `docker-compose.yml` możesz wskazać `env_file: .env`.

| Zmienna | Domyślnie | Opis |
|---------|-----------|------|
| `WEATHER_CITY` | Kraków | Miasto (restart kontenera po zmianie) |
| `WEATHER_COUNTRY` | PL | Doprecyzowanie geokodowania |
| `PORT` | 3000 | Port w kontenerze |
| `CACHE_TTL_SECONDS` | 840 | Cache odpowiedzi backendu (~14 min) |

Strona odświeża się co **15 minut** (JavaScript + zapasowy meta refresh).

## Lokalnie bez Dockera

```bash
npm install
npm start
```

Domyślnie nasłuch na `http://0.0.0.0:3000`.

## Proxmox / Cloudflare

Uruchom ten sam obraz, opublikuj port 3000 (lub mapowanie przez reverse proxy). Aplikacja nie ma logowania — dostęp kontrolujesz po stronie tunelu / Cloudflare.
