const DESCRIPTIONS = {
  0: 'Bezchmurnie',
  1: 'Prawie bezchmurnie',
  2: 'Częściowe zachmurzenie',
  3: 'Pochmurno',
  45: 'Mgła',
  48: 'Szronowa mgła',
  51: 'Lekka mżawka',
  53: 'Mżawka',
  55: 'Intensywna mżawka',
  56: 'Marząca mżawka',
  57: 'Intensywna marząca mżawka',
  61: 'Lekki deszcz',
  63: 'Deszcz',
  65: 'Intensywny deszcz',
  66: 'Marznący deszcz',
  67: 'Intensywny marznący deszcz',
  71: 'Lekki śnieg',
  73: 'Śnieg',
  75: 'Intensywny śnieg',
  77: 'Ziarnisty śnieg',
  80: 'Lekkie opady',
  81: 'Opady deszczu',
  82: 'Ulewne opady',
  85: 'Opady śniegu',
  86: 'Intensywne opady śniegu',
  95: 'Burza',
  96: 'Burza z gradem',
  99: 'Burza z intensywnym gradem',
};

export function wmoDescription(code) {
  if (code == null || Number.isNaN(Number(code))) {
    return 'Brak danych';
  }
  return DESCRIPTIONS[Number(code)] ?? 'Warunki zmienne';
}
