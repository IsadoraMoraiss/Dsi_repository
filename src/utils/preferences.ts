import { Cidade } from '../data/mockCidades';
import { Roteiro } from '../data/mockRoteiros';
import { getAllCidadesDataset } from '../data/cidadesDataset';
import type { CategoriaDestinoId, MacrorregiaoId, PreferenciasViagem } from '../constants/preferencias';

export type UserPreferences = PreferenciasViagem;

const CIDADE_REGIAO_MAP = new Map<string, MacrorregiaoId>(
  getAllCidadesDataset()
    .map((cidade) => [cidade.nome.toLowerCase(), cidade.regiao as MacrorregiaoId]),
);

function normalizeCityName(nome: string) {
  return nome.split(',')[0].trim().toLowerCase();
}

const categoriaRoteiroKeywords: Record<CategoriaDestinoId, string[]> = {
  'praia-litoral': ['praia', 'verão', 'litoral'],
  natureza: ['natureza', 'eco', 'pantanal', 'floresta'],
  'serras-montanha': ['serra', 'montanha', 'inverno'],
  'termas-aguas': ['termas', 'água', 'lago'],
  'cultura-historico': ['cultura', 'histórico', 'histórico', 'passeios'],
  aventura: ['aventura', 'trilha', 'canyon'],
  'gastronomia-vinhos': ['gastronomia', 'vinho', 'café'],
  'religioso-fe': ['fé', 'romaria'],
};

/** Compatibilidade com mocks antigos (categoria única legada). */
const legadoCategoriaParaIds: Record<string, CategoriaDestinoId[]> = {
  Praia: ['praia-litoral'],
  Cultura: ['cultura-historico'],
  Gastronomia: ['gastronomia-vinhos'],
  Natureza: ['natureza'],
  Histórico: ['cultura-historico'],
};

function getCidadeCategorias(city: Cidade): string[] {
  if (city.categorias?.length) return city.categorias;
  return legadoCategoriaParaIds[city.categoria] ?? [];
}

function matchesRegiao(city: Cidade, regioes?: MacrorregiaoId[]) {
  if (!regioes?.length) return false;
  return regioes.includes(city.regiao as MacrorregiaoId);
}

function matchesCategorias(city: Cidade, categorias?: CategoriaDestinoId[]) {
  if (!categorias?.length) return false;
  const cityCats = getCidadeCategorias(city);
  return categorias.some((cat) => cityCats.includes(cat));
}

function cityMatchesPreferencias(city: Cidade, preferencias: UserPreferences): boolean {
  const temRegioes = (preferencias.regioes?.length ?? 0) > 0;
  const temCategorias = (preferencias.categorias?.length ?? 0) > 0;

  if (!temRegioes && !temCategorias) return true;
  if (temRegioes && !matchesRegiao(city, preferencias.regioes)) return false;
  if (temCategorias && !matchesCategorias(city, preferencias.categorias)) return false;
  return true;
}

function scoreCityByPreferences(city: Cidade, preferencias?: UserPreferences) {
  return (
    (matchesRegiao(city, preferencias?.regioes) ? 2 : 0) +
    (matchesCategorias(city, preferencias?.categorias) ? 3 : 0)
  );
}

/** Ordena por relevância às preferências sem excluir cidades fora do perfil. */
export function sortCitiesByPreferenceRelevance(cities: Cidade[], preferencias?: UserPreferences) {
  if (!preferencias?.regioes?.length && !preferencias?.categorias?.length) {
    return cities;
  }

  return [...cities]
    .map((city, index) => ({ city, score: scoreCityByPreferences(city, preferencias), index }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    })
    .map(({ city }) => city);
}

/** Filtra estritamente por preferências e ordena por relevância (região + categoria). */
export function rankCitiesByPreferences(cities: Cidade[], preferencias?: UserPreferences) {
  if (!preferencias?.regioes?.length && !preferencias?.categorias?.length) {
    return cities;
  }

  return sortCitiesByPreferenceRelevance(
    cities.filter((city) => cityMatchesPreferencias(city, preferencias)),
    preferencias,
  );
}

function matchesRoteiroCategorias(roteiro: Roteiro, categorias?: CategoriaDestinoId[]) {
  if (!categorias?.length) return false;
  const tipo = roteiro.tipo.toLowerCase();
  return categorias.some((cat) =>
    categoriaRoteiroKeywords[cat]?.some((kw) => tipo.includes(kw.toLowerCase())),
  );
}

function matchesRoteiroRegiao(roteiro: Roteiro, regioes?: MacrorregiaoId[]) {
  if (!regioes?.length) return false;
  return roteiro.cidades
    .map(normalizeCityName)
    .some((nome) => {
      const regiao = CIDADE_REGIAO_MAP.get(nome);
      return regiao != null && regioes.includes(regiao);
    });
}

export function rankRoteirosByPreferences(roteiros: Roteiro[], preferencias?: UserPreferences) {
  if (!preferencias?.regioes?.length && !preferencias?.categorias?.length) {
    return roteiros;
  }

  return [...roteiros]
    .filter((roteiro) => {
      if (preferencias?.categorias?.length && !matchesRoteiroCategorias(roteiro, preferencias.categorias)) {
        return false;
      }
      if (preferencias?.regioes?.length && !matchesRoteiroRegiao(roteiro, preferencias.regioes)) {
        return false;
      }
      return true;
    })
    .map((roteiro, index) => {
      const score = matchesRoteiroCategorias(roteiro, preferencias.categorias) ? 3 : 0;
      return { roteiro, score, index };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    })
    .map(({ roteiro }) => roteiro);
}
