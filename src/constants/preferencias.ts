/** Macrorregiões derivadas do campo STATE do BRAZIL_CITIES.csv */
export const MACRORREGIOES = [
  { id: 'Norte', label: 'Norte' },
  { id: 'Nordeste', label: 'Nordeste' },
  { id: 'Centro-Oeste', label: 'Centro-Oeste' },
  { id: 'Sudeste', label: 'Sudeste' },
  { id: 'Sul', label: 'Sul' },
] as const;

/**
 * Categorias inferidas via REGIAO_TUR (+ ALT para serras).
 * IDs estáveis para Firestore array-contains / array-contains-any.
 */
export const CATEGORIAS_DESTINO = [
  { id: 'praia-litoral', label: 'Praia / Litoral', emoji: '🏖️' },
  { id: 'natureza', label: 'Natureza', emoji: '🌿' },
  { id: 'serras-montanha', label: 'Serras / Montanha', emoji: '🏔️' },
  { id: 'termas-aguas', label: 'Termas e Águas', emoji: '💧' },
  { id: 'cultura-historico', label: 'Cultura / Histórico', emoji: '🏛️' },
  { id: 'aventura', label: 'Aventura', emoji: '🧗' },
  { id: 'gastronomia-vinhos', label: 'Gastronomia / Vinhos', emoji: '🍷' },
  { id: 'religioso-fe', label: 'Religioso / Fé', emoji: '⛪' },
] as const;

export type MacrorregiaoId = (typeof MACRORREGIOES)[number]['id'];
export type CategoriaDestinoId = (typeof CATEGORIAS_DESTINO)[number]['id'];

const categoriaLabelMap = Object.fromEntries(
  CATEGORIAS_DESTINO.map((c) => [c.id, c.label]),
) as Record<CategoriaDestinoId, string>;

export function getCategoriaLabel(id: string): string {
  return categoriaLabelMap[id as CategoriaDestinoId] ?? id;
}

export function getCategoriaChipLabel(id: string): string {
  const item = CATEGORIAS_DESTINO.find((c) => c.id === id);
  return item ? `${item.emoji} ${item.label}` : id;
}

export type PreferenciasViagem = {
  regioes: MacrorregiaoId[];
  categorias: CategoriaDestinoId[];
};

export function montarRequisitos(preferencias: PreferenciasViagem): string[] {
  const regioes = preferencias.regioes ?? [];
  const categorias = (preferencias.categorias ?? []).map(getCategoriaChipLabel);
  return [...regioes, ...categorias].slice(0, 8);
}

/** Regras espelhadas em scripts/generate-cidades-json.js */
export const INFERENCIA_CATEGORIA_KEYWORDS: { id: CategoriaDestinoId; keywords: string[] }[] = [
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
    keywords: ['termas', 'aguas quentes', 'águas quentes', 'lago', 'lagos', 'rios', 'corredores das aguas', 'corredores das águas'],
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

export const ALTITUDE_SERRA_METROS = 800;
