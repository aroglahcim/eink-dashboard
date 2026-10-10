/**
 * WMO weather interpretation codes (Open-Meteo `weather_code`).
 * @see https://open-meteo.com/en/docs
 */
export function iconKeyForWmoCode(code) {
  const c = Number(code);
  if (Number.isNaN(c)) {
    return 'unknown';
  }
  if (c === 0) {
    return 'clear';
  }
  if (c === 1) {
    return 'mainly-clear';
  }
  if (c === 2) {
    return 'partly-cloudy';
  }
  if (c === 3) {
    return 'overcast';
  }
  if (c === 45 || c === 48) {
    return 'fog';
  }
  if (c >= 51 && c <= 57) {
    return 'drizzle';
  }
  if (c >= 61 && c <= 67) {
    return 'rain';
  }
  if (c >= 71 && c <= 77) {
    return 'snow';
  }
  if (c >= 80 && c <= 82) {
    return 'rain-showers';
  }
  if (c >= 85 && c <= 86) {
    return 'snow-showers';
  }
  if (c === 95 || c === 96 || c === 99) {
    return 'thunderstorm';
  }
  return 'unknown';
}

const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';

const ICONS = {
  clear: `<svg ${SVG_ATTRS}><circle cx="32" cy="32" r="10" fill="currentColor" stroke="none"/><path d="M32 8v6M32 50v6M8 32h6M50 32h6M14.5 14.5l4.2 4.2M45.3 45.3l4.2 4.2M49.5 14.5l-4.2 4.2M18.7 45.3l-4.2 4.2"/></svg>`,

  'mainly-clear': `<svg ${SVG_ATTRS}><circle cx="24" cy="22" r="8" fill="currentColor" stroke="none"/><path d="M18 20h2M24 12v2M30 20h2M20 14l1.5 1.5M28 14l-1.5 1.5"/><path d="M20 44a14 14 0 0 1 26-4 10 10 0 1 1-9 14H22a8 8 0 0 1-2-10z" fill="currentColor" stroke="none"/></svg>`,

  'partly-cloudy': `<svg ${SVG_ATTRS}><circle cx="22" cy="20" r="7" fill="currentColor" stroke="none"/><path d="M16 18h2M22 11v2M28 18h2"/><path d="M18 46a16 16 0 0 1 30-2 11 11 0 0 1-20 8H20a10 10 0 0 1-2-6z" fill="currentColor" stroke="none"/></svg>`,

  overcast: `<svg ${SVG_ATTRS}><path d="M14 42a18 18 0 0 1 34-2 12 12 0 0 1 2 24H18a10 10 0 0 1-4-22z" fill="currentColor" stroke="none"/></svg>`,

  fog: `<svg ${SVG_ATTRS}><path d="M12 28h40M10 36h44M14 44h36M12 52h40"/></svg>`,

  drizzle: `<svg ${SVG_ATTRS}><path d="M16 30a16 16 0 0 1 32 0 10 10 0 0 1-2 20H18a8 8 0 0 1-2-20z" fill="currentColor" stroke="none"/><path d="M24 54v4M32 52v4M40 54v4"/></svg>`,

  rain: `<svg ${SVG_ATTRS}><path d="M14 28a18 18 0 0 1 36 0 11 11 0 0 1-2 22H16a9 9 0 0 1-2-22z" fill="currentColor" stroke="none"/><path d="M22 54v8M32 52v8M42 54v8"/></svg>`,

  snow: `<svg ${SVG_ATTRS}><path d="M14 28a18 18 0 0 1 36 0 11 11 0 0 1-2 22H16a9 9 0 0 1-2-22z" fill="currentColor" stroke="none"/><path d="M24 54l0 6M24 51l-3 3M24 51l3 3M40 54l0 6M40 51l-3 3M40 51l3 3M32 52l0 6M32 49l-3 3M32 49l3 3"/></svg>`,

  'rain-showers': `<svg ${SVG_ATTRS}><path d="M12 26a20 20 0 0 1 40 0 12 12 0 0 1-2 24H14a10 10 0 0 1-2-24z" fill="currentColor" stroke="none"/><path d="M18 54l4 8M30 52l4 8M42 54l4 8"/></svg>`,

  'snow-showers': `<svg ${SVG_ATTRS}><path d="M12 26a20 20 0 0 1 40 0 12 12 0 0 1-2 24H14a10 10 0 0 1-2-24z" fill="currentColor" stroke="none"/><path d="M20 56l0 5M20 53l-2.5 2.5M20 53l2.5 2.5M44 56l0 5M44 53l-2.5 2.5M44 53l2.5 2.5M32 54l0 5M32 51l-2.5 2.5M32 51l2.5 2.5"/></svg>`,

  thunderstorm: `<svg ${SVG_ATTRS}><path d="M14 28a18 18 0 0 1 36 0 11 11 0 0 1-2 22H16a9 9 0 0 1-2-22z" fill="currentColor" stroke="none"/><path d="M34 48l-6 10h6l-4 8" fill="currentColor" stroke="none"/></svg>`,

  unknown: `<svg ${SVG_ATTRS}><path d="M18 38a14 14 0 0 1 28 0 9 9 0 0 1-1 18H19a7 7 0 0 1-1-18z" fill="currentColor" stroke="none"/><path d="M32 28v-4M32 22h.01"/></svg>`,
};

export function weatherIconSvg(code) {
  const key = iconKeyForWmoCode(code);
  return ICONS[key] ?? ICONS.unknown;
}
