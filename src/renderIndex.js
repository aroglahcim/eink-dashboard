import fs from 'node:fs';
import path from 'node:path';

let cachedTemplate = null;

export function loadIndexTemplate(publicDir) {
  if (!cachedTemplate) {
    cachedTemplate = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
  }
  return cachedTemplate;
}

export function renderIndexHtml(template, weatherPayload) {
  const boot = `<script>window.__WEATHER__=${JSON.stringify(weatherPayload)};</script>`;
  return template.replace('</head>', `${boot}\n  </head>`);
}
