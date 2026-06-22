import { Cidade } from '../data/mockCidades';
import { Roteiro } from '../data/mockRoteiros';
import { getAllCidadesDataset } from '../data/cidadesDataset';
import type {
  CategoriaDestinoId,
  MacrorregiaoId,
  PreferenciasViagem,
} from '../constants/preferencias';

export type UserPreferences = Partial<PreferenciasViagem> & {
  clima?: string[];
  duracao?: string[];
  estilo?: string[];
};

const CIDADE_REGIAO_MAP = new Map<string, MacrorregiaoId>(
  getAllCidadesDataset().map((cidade) => [cidade.nome.toLowerCase(), cidade.regiao as MacrorregiaoId]),
);

const categoriaRoteiroKeywords: Record<CategoriaDestinoId, string[]> = {
  'praia-litoral': ['praia', 'verao', 'litoral'],
  natureza: ['natureza', 'eco', 'pantanal', 'floresta'],
  'serras-montanha': ['serra', 'montanha', 'inverno'],
  'termas-aguas': ['termas', 'agua', 'lago'],
  'cultura-historico': ['cultura', 'historico', 'passeios'],
  aventura: ['aventura', 'trilha', 'canyon'],
  'gastronomia-vinhos': ['gastronomia', 'vinho', 'cafe'],
  'religioso-fe': ['fe', 'romaria'],
};

const legadoCategoriaParaIds: Record<string, CategoriaDestinoId[]> = {
  Praia: ['praia-litoral'],
  Cultura: ['cultura-historico'],
  Gastronomia: ['gastronomia-vinhos'],
  Natureza: ['natureza'],
  Historico: ['cultura-historico'],
  'Histórico': ['cultura-historico'],
};

const estiloCidadeKeywords: Record<string, string[]> = {
  aventura: ['aventura', 'ecoturismo'],
  cultural: ['cultural'],
  gastronomia: ['gastronomia'],
  relaxamento: ['relaxamento'],
  ecoturismo: ['ecoturismo', 'aventura'],
};

const estiloRoteiroKeywords: Record<string, string[]> = {
  aventura: ['aventura', 'trilha', 'eco', 'natureza', 'canyon'],
  cultural: ['cultura', 'historico', 'passeio', 'pontos turisticos'],
  gastronomia: ['gastronomia', 'vinho', 'cafe'],
  relaxamento: ['praia', 'verao', 'litoral', 'conforto'],
  ecoturismo: ['eco', 'natureza', 'aventura', 'floresta', 'pantanal'],
};

function normalizeText(text: string | undefined | null) {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeCityName(nome: string) {
  return normalizeText(nome.split(',')[0]);
}

function getCidadeCategorias(city: Cidade): string[] {
  if (city.categorias?.length) return city.categorias;
  return legadoCategoriaParaIds[city.categoria] ?? [];
}

function hasRegions(preferencias?: UserPreferences) {
  return (preferencias?.regioes?.length ?? 0) > 0;
}

function hasCategorias(preferencias?: UserPreferences) {
  return (preferencias?.categorias?.length ?? 0) > 0;
}

function hasClima(preferencias?: UserPreferences) {
  return (preferencias?.clima ?? []).some((item) => normalizeText(item) !== 'qualquer');
}

function hasEstilo(preferencias?: UserPreferences) {
  return (preferencias?.estilo?.length ?? 0) > 0;
}

function hasDuracao(preferencias?: UserPreferences) {
  return (preferencias?.duracao?.length ?? 0) > 0;
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

function matchesClima(city: Cidade, clima?: string[]) {
  if (!hasClima({ clima })) return false;
  const cityClima = normalizeText(city.clima);
  return (clima ?? []).some((item) => normalizeText(item) === cityClima);
}

function matchesEstiloCidade(city: Cidade, estilo?: string[]) {
  if (!estilo?.length) return false;
  const estilosCidade = city.estilos.map(normalizeText);
  return estilo.some((item) => {
    const keywords = estiloCidadeKeywords[normalizeText(item)] ?? [normalizeText(item)];
    return keywords.some((keyword) => estilosCidade.includes(keyword));
  });
}

function cityMatchesPreferencias(city: Cidade, preferencias: UserPreferences): boolean {
  if (hasRegions(preferencias) && !matchesRegiao(city, preferencias.regioes)) return false;
  if (hasCategorias(preferencias) && !matchesCategorias(city, preferencias.categorias)) return false;
  if (hasClima(preferencias) && !matchesClima(city, preferencias.clima)) return false;
  if (hasEstilo(preferencias) && !matchesEstiloCidade(city, preferencias.estilo)) return false;
  return true;
}

function scoreCityByPreferences(city: Cidade, preferencias?: UserPreferences) {
  return (
    (matchesRegiao(city, preferencias?.regioes) ? 2 : 0) +
    (matchesCategorias(city, preferencias?.categorias) ? 3 : 0) +
    (matchesClima(city, preferencias?.clima) ? 2 : 0) +
    (matchesEstiloCidade(city, preferencias?.estilo) ? 2 : 0)
  );
}

function hasCityPreferenceSignals(preferencias?: UserPreferences) {
  return (
    hasRegions(preferencias) ||
    hasCategorias(preferencias) ||
    hasClima(preferencias) ||
    hasEstilo(preferencias)
  );
}

export function sortCitiesByPreferenceRelevance(cities: Cidade[], preferencias?: UserPreferences) {
  if (!hasCityPreferenceSignals(preferencias)) {
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

export function rankCitiesByPreferences(cities: Cidade[], preferencias?: UserPreferences) {
  if (!hasCityPreferenceSignals(preferencias)) {
    return cities;
  }

  const filtradas = cities.filter((city) => cityMatchesPreferencias(city, preferencias ?? {}));
  if (filtradas.length === 0) {
    return sortCitiesByPreferenceRelevance(cities, preferencias);
  }

  return sortCitiesByPreferenceRelevance(filtradas, preferencias);
}

function matchesRoteiroCategorias(roteiro: Roteiro, categorias?: CategoriaDestinoId[]) {
  if (!categorias?.length) return false;
  const haystack = normalizeText(`${roteiro.tipo} ${roteiro.nome}`);
  return categorias.some((cat) =>
    (categoriaRoteiroKeywords[cat] ?? []).some((kw) => haystack.includes(normalizeText(kw))),
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

function bucketDuracaoRoteiro(duracao: string): string {
  const normalized = normalizeText(duracao);
  if (normalized === '1 dia') return '1 dia';

  const numeros = normalized.match(/\d+/g)?.map(Number) ?? [];
  const max = numeros.length > 0 ? Math.max(...numeros) : 0;

  if (max <= 1 && numeros.length > 0) return '1 dia';
  if (max <= 3) return '2-3 dias';
  if (max <= 7) return '4-7 dias';
  return '7+ dias';
}

function matchesRoteiroDuracao(roteiro: Roteiro, duracao?: string[]) {
  if (!duracao?.length) return false;
  const bucket = bucketDuracaoRoteiro(roteiro.duracao);
  return duracao.some((item) => normalizeText(item) === normalizeText(bucket));
}

function matchesRoteiroEstilo(roteiro: Roteiro, estilo?: string[]) {
  if (!estilo?.length) return false;
  const haystack = normalizeText(`${roteiro.nome} ${roteiro.tipo} ${roteiro.cidades.join(' ')}`);
  return estilo.some((item) => {
    const keywords = estiloRoteiroKeywords[normalizeText(item)] ?? [normalizeText(item)];
    return keywords.some((keyword) => haystack.includes(keyword));
  });
}

function hasRoteiroPreferenceSignals(preferencias?: UserPreferences) {
  return (
    hasCategorias(preferencias) ||
    hasRegions(preferencias) ||
    hasDuracao(preferencias) ||
    hasEstilo(preferencias)
  );
}

export function rankRoteirosByPreferences(roteiros: Roteiro[], preferencias?: UserPreferences) {
  if (!hasRoteiroPreferenceSignals(preferencias)) {
    return roteiros;
  }

  const filtrados = [...roteiros]
    .filter((roteiro) => {
      if (hasCategorias(preferencias) && !matchesRoteiroCategorias(roteiro, preferencias?.categorias)) {
        return false;
      }
      if (hasRegions(preferencias) && !matchesRoteiroRegiao(roteiro, preferencias?.regioes)) {
        return false;
      }
      if (hasDuracao(preferencias) && !matchesRoteiroDuracao(roteiro, preferencias?.duracao)) {
        return false;
      }
      if (hasEstilo(preferencias) && !matchesRoteiroEstilo(roteiro, preferencias?.estilo)) {
        return false;
      }
      return true;
    });

  const base = filtrados.length > 0 ? filtrados : [...roteiros];

  return base
    .map((roteiro, index) => {
      const score =
        (matchesRoteiroCategorias(roteiro, preferencias?.categorias) ? 3 : 0) +
        (matchesRoteiroRegiao(roteiro, preferencias?.regioes) ? 2 : 0) +
        (matchesRoteiroDuracao(roteiro, preferencias?.duracao) ? 2 : 0) +
        (matchesRoteiroEstilo(roteiro, preferencias?.estilo) ? 2 : 0);
      return { roteiro, score, index };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    })
    .map(({ roteiro }) => roteiro);
}

function sortRoteirosByPreferenceRelevance(roteiros: Roteiro[], preferencias?: UserPreferences) {
  if (!hasRoteiroPreferenceSignals(preferencias)) {
    return roteiros;
  }

  return [...roteiros]
    .map((roteiro, index) => {
      const score =
        (matchesRoteiroCategorias(roteiro, preferencias?.categorias) ? 3 : 0) +
        (matchesRoteiroRegiao(roteiro, preferencias?.regioes) ? 2 : 0) +
        (matchesRoteiroDuracao(roteiro, preferencias?.duracao) ? 2 : 0) +
        (matchesRoteiroEstilo(roteiro, preferencias?.estilo) ? 2 : 0);
      return { roteiro, score, index };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    })
    .map(({ roteiro }) => roteiro);
}

export function buscarRoteirosPorTermo(
  roteiros: Roteiro[],
  termo: string,
  preferencias?: UserPreferences,
) {
  const termoNormalizado = normalizeText(termo);
  if (!termoNormalizado) return [];

  const encontrados = roteiros.filter((roteiro) => {
    const nome = normalizeText(roteiro.nome);
    const tipo = normalizeText(roteiro.tipo);
    const cidades = roteiro.cidades.map(normalizeText);
    return (
      nome.includes(termoNormalizado) ||
      tipo.includes(termoNormalizado) ||
      cidades.some((cidade) => cidade.includes(termoNormalizado))
    );
  });

  return sortRoteirosByPreferenceRelevance(encontrados, preferencias);
}
