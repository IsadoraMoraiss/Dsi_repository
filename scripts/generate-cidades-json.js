const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const csvPath = path.resolve(__dirname, '../assets/data/BRAZIL_CITIES.csv');
const jsonPath = path.resolve(__dirname, '../src/data/cidades.json');

const stateToRegion = {
  AC: 'Norte',
  AM: 'Norte',
  AP: 'Norte',
  PA: 'Norte',
  RO: 'Norte',
  RR: 'Norte',
  TO: 'Norte',
  MA: 'Nordeste',
  PI: 'Nordeste',
  CE: 'Nordeste',
  RN: 'Nordeste',
  PB: 'Nordeste',
  PE: 'Nordeste',
  AL: 'Nordeste',
  SE: 'Nordeste',
  BA: 'Nordeste',
  DF: 'Centro-Oeste',
  GO: 'Centro-Oeste',
  MT: 'Centro-Oeste',
  MS: 'Centro-Oeste',
  SP: 'Sudeste',
  RJ: 'Sudeste',
  MG: 'Sudeste',
  ES: 'Sudeste',
  PR: 'Sul',
  SC: 'Sul',
  RS: 'Sul',
};

const CATEGORY_RULES = [
  {
    id: 'praia-litoral',
    keywords: ['litoral', 'costa', 'praia', 'nautica', 'náutica', 'mar', 'delta', 'ilha'],
  },
  {
    id: 'natureza',
    keywords: [
      'chapada',
      'amazonia',
      'amazônia',
      'floresta',
      'cerrado',
      'pampa',
      'pantanal',
      'mata',
      'araucaria',
      'araucária',
      'xingu',
      'tapajos',
      'tapajós',
    ],
  },
  { id: 'serras-montanha', keywords: ['serra', 'serras', 'montanha', 'montanhas', 'picos', 'pico'] },
  {
    id: 'termas-aguas',
    keywords: [
      'termas',
      'aguas quentes',
      'águas quentes',
      'lago',
      'lagos',
      'rios',
      'corredores das aguas',
      'corredores das águas',
    ],
  },
  {
    id: 'cultura-historico',
    keywords: [
      'histor',
      'histór',
      'cultura',
      'ouro',
      'patrimon',
      'patrimôn',
      'inconfidente',
      'arte',
      'quilombo',
      'missoes',
      'missões',
      'bandeirante',
      'tradicao',
      'tradição',
    ],
  },
  { id: 'aventura', keywords: ['aventura', 'trilhas', 'canyon', 'canyons', 'cachoeira'] },
  { id: 'gastronomia-vinhos', keywords: ['vinho', 'vinhos', 'cafe', 'café', 'cachaca', 'cachaça', 'uva', 'gastronomia'] },
  { id: 'religioso-fe', keywords: ['fe', 'fé', 'romaria', 'fe e arte', 'fé e arte'] },
];

const CATEGORIA_LABEL = {
  'praia-litoral': 'Praia',
  natureza: 'Natureza',
  'serras-montanha': 'Natureza',
  'termas-aguas': 'Natureza',
  'cultura-historico': 'Cultura',
  aventura: 'Aventura',
  'gastronomia-vinhos': 'Gastronomia',
  'religioso-fe': 'Cultura',
};

const ALTITUDE_SERRA = 800;

function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function parseNum(val) {
  if (val == null || val === '') return null;
  const n = Number.parseFloat(String(val).replace(',', '.').trim());
  return Number.isFinite(n) ? n : null;
}

function parseIntSafe(val) {
  const n = parseNum(val);
  return n == null ? null : Math.round(n);
}

function inferCategorias(regiaoTur, altMeters) {
  const texto = normalize(regiaoTur);
  const found = new Set();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => texto.includes(normalize(kw)))) {
      found.add(rule.id);
    }
  }

  const alt = Number.parseFloat(String(altMeters).replace(',', '.'));
  if (!Number.isNaN(alt) && alt >= ALTITUDE_SERRA) {
    found.add('serras-montanha');
  }

  return [...found];
}

const csvText = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse(csvText, {
  delimiter: ';',
  header: true,
  skipEmptyLines: true,
});

const cities = parsed.data
  .filter((row) => row.CITY && row.STATE)
  .map((row, index) => {
    const nome = String(row.CITY).trim();
    const estado = String(row.STATE).trim();
    const regiao = stateToRegion[estado] ?? 'Outros';
    const regiaoTur = String(row.REGIAO_TUR || '').trim();
    const categoriaTur = String(row.CATEGORIA_TUR || '').trim().toUpperCase();
    const categorias = inferCategorias(regiaoTur, row.ALT);
    const categoriaPrincipal = categorias[0]
      ? CATEGORIA_LABEL[categorias[0]] || 'Cultura'
      : 'Cultura';

    const lat = parseNum(row.LAT);
    const lng = parseNum(row.LONG);

    return {
      id: String(index + 1),
      nome,
      estado,
      regiao,
      latitude: lat ?? 0,
      longitude: lng ?? 0,
      populacaoEstimada: parseNum(row.ESTIMATED_POP),
      regiaoTur: regiaoTur || null,
      categoriaTur: categoriaTur || null,
      ruralUrban: String(row.RURAL_URBAN || '').trim() || null,
      hoteis: parseIntSafe(row.HOTELS),
      leitos: parseIntSafe(row.BEDS),
      agenciasTurismo: parseIntSafe(row.Pr_Agencies),
      idhm: parseNum(row.IDHM),
      uber: String(row.UBER || '').trim() === '1',
      altitude: parseNum(row.ALT),
      capital: String(row.CAPITAL || '').trim() === '1',
      pibPerCapita: parseNum(row.GDP_CAPITA),
      categorias,
      categoria: categoriaPrincipal,
      imagemUrl: `https://picsum.photos/seed/${encodeURIComponent(nome)}/300/200`,
    };
  });

fs.writeFileSync(jsonPath, JSON.stringify(cities, null, 2), 'utf8');
console.log(`Generated ${cities.length} cities to ${jsonPath}`);

const comCategorias = cities.filter((c) => c.categorias.length > 0).length;
const turABC = cities.filter((c) => ['A', 'B', 'C'].includes(c.categoriaTur ?? '')).length;
console.log(`Cidades com categorias inferidas: ${comCategorias}`);
console.log(`Cidades categoria turistica A/B/C: ${turABC}`);
