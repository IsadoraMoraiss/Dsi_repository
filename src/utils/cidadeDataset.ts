import type { Cidade } from '../data/mockCidades';
import type {
  CidadeDataset,
  FiltroAmbienteMapa,
  FiltroInfraestruturaMapa,
  FiltrosMapa,
} from '../types/cidadeDataset';

export const POPULOSO_MAPA_THRESHOLD = 100_000;
export const POPULOSO_TAG_THRESHOLD = 500_000;
export const MAX_MAP_MARKERS = 450;

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function inferirClimaCidade(cidade: CidadeDataset): Cidade['clima'] {
  const altitude = cidade.altitude ?? 0;
  const regiao = normalize(String(cidade.regiao ?? ''));

  if (altitude >= 800 || regiao === 'sul') return 'Frio';
  if (regiao === 'norte' || regiao === 'nordeste') return 'Quente';
  return 'Temperado';
}

function inferirEstilosCidade(cidade: CidadeDataset): string[] {
  const estilos = new Set<string>();
  const categorias = cidade.categorias ?? [];

  categorias.forEach((categoria) => {
    if (categoria === 'praia-litoral') estilos.add('Relaxamento');
    if (categoria === 'natureza') estilos.add('Ecoturismo');
    if (categoria === 'serras-montanha') estilos.add('Relaxamento');
    if (categoria === 'termas-aguas') estilos.add('Relaxamento');
    if (categoria === 'cultura-historico') estilos.add('Cultural');
    if (categoria === 'aventura') estilos.add('Aventura');
    if (categoria === 'gastronomia-vinhos') estilos.add('Gastronomia');
    if (categoria === 'religioso-fe') estilos.add('Cultural');
  });

  if (estilos.size === 0) {
    if (cidade.categoria === 'Praia') estilos.add('Relaxamento');
    if (cidade.categoria === 'Natureza') estilos.add('Ecoturismo');
    if (cidade.categoria === 'Cultura' || cidade.categoria === 'Histórico') estilos.add('Cultural');
    if (cidade.categoria === 'Gastronomia') estilos.add('Gastronomia');
  }

  return Array.from(estilos).slice(0, 3);
}

function inferirEnergiaCidade(cidade: CidadeDataset): Cidade['energia'] {
  if (cidade.capital || (cidade.populacaoEstimada ?? 0) > 1_000_000) return 'Intenso';
  if ((cidade.populacaoEstimada ?? 0) > 150_000 || cidade.uber) return 'Moderado';
  return 'Calmo';
}

export function formatPopulacao(pop: number | null | undefined): string {
  if (pop == null || !Number.isFinite(pop) || pop <= 0) return 'População não informada';
  if (pop >= 1_000_000) {
    const mi = pop / 1_000_000;
    return `${mi >= 10 ? Math.round(mi) : mi.toFixed(1).replace('.', ',')} mi habitantes`;
  }
  if (pop >= 1_000) {
    const mil = Math.round(pop / 1_000);
    return `${mil.toLocaleString('pt-BR')} mil habitantes`;
  }
  return `${Math.round(pop).toLocaleString('pt-BR')} habitantes`;
}

export function formatPibPerCapita(valor: number | null | undefined): string | null {
  if (valor == null || !Number.isFinite(valor) || valor <= 0) return null;
  return `PIB per capita: R$ ${Math.round(valor).toLocaleString('pt-BR')}/ano`;
}

export function getIdhmFaixa(idhm: number | null | undefined): { label: string; cor: string } | null {
  if (idhm == null || !Number.isFinite(idhm)) return null;
  if (idhm < 0.55) return { label: 'Baixo', cor: '#EF4444' };
  if (idhm < 0.65) return { label: 'Médio', cor: '#F59E0B' };
  if (idhm < 0.75) return { label: 'Médio-alto', cor: '#84CC16' };
  return { label: 'Alto', cor: '#22C55E' };
}

export function getCategoriaTurBadge(categoriaTur: string | null | undefined): {
  label: string;
  corFundo: string;
  corTexto: string;
} | null {
  if (!categoriaTur) return null;
  const cat = categoriaTur.toUpperCase();
  const map: Record<string, { label: string; corFundo: string; corTexto: string }> = {
    A: { label: 'Infraestrutura A', corFundo: '#14532D', corTexto: '#FFFFFF' },
    B: { label: 'Infraestrutura B', corFundo: '#16A34A', corTexto: '#FFFFFF' },
    C: { label: 'Infraestrutura C', corFundo: '#EAB308', corTexto: '#1F2937' },
    D: { label: 'Infraestrutura D', corFundo: '#F97316', corTexto: '#FFFFFF' },
    E: { label: 'Infraestrutura E', corFundo: '#9CA3AF', corTexto: '#1F2937' },
  };
  return map[cat] ?? null;
}

export function getGrupoInfraestrutura(categoriaTur: string | null | undefined): FiltroInfraestruturaMapa | null {
  if (!categoriaTur) return null;
  const cat = categoriaTur.toUpperCase();
  if (cat === 'A' || cat === 'B') return 'Alta';
  if (cat === 'C') return 'Média';
  if (cat === 'D' || cat === 'E') return 'Básica';
  return null;
}

function matchesAmbiente(cidade: CidadeDataset, ambiente: FiltroAmbienteMapa): boolean {
  if (ambiente === 'Todas') return true;
  const ru = normalize(cidade.ruralUrban ?? '');
  if (ambiente === 'Urbano') return ru === 'urbano';
  if (ambiente === 'Rural') return ru.startsWith('rural');
  if (ambiente === 'Intermediário') return ru.startsWith('intermediario');
  return true;
}

function matchesInfraestrutura(cidade: CidadeDataset, filtro: FiltroInfraestruturaMapa): boolean {
  if (filtro === 'Todas') return true;
  return getGrupoInfraestrutura(cidade.categoriaTur) === filtro;
}

export function gerarTagsCidade(cidade: CidadeDataset): string[] {
  const tags: string[] = [];
  const regiaoTurNorm = normalize(cidade.regiaoTur ?? '');

  if (cidade.populacaoEstimada != null && cidade.populacaoEstimada > POPULOSO_TAG_THRESHOLD) {
    tags.push('Populoso');
  }
  if (cidade.capital) tags.push('Capital');
  if (
    regiaoTurNorm &&
    ['litoral', 'costa', 'mar', 'praia'].some((k) => regiaoTurNorm.includes(k))
  ) {
    tags.push('Litoral');
  } else if (cidade.altitude != null && cidade.altitude < 50) {
    tags.push('Litoral');
  }
  if (cidade.altitude != null && cidade.altitude > 800) tags.push('Serra');
  if (
    regiaoTurNorm &&
    ['histor', 'ouro', 'colonial', 'inconfidente'].some((k) => regiaoTurNorm.includes(k))
  ) {
    tags.push('Histórico');
  }
  if (
    regiaoTurNorm &&
    ['chapada', 'amazonia', 'mata', 'pantanal', 'floresta'].some((k) => regiaoTurNorm.includes(k))
  ) {
    tags.push('Natureza');
  }
  if (cidade.uber) tags.push('Com Uber');
  const cat = cidade.categoriaTur?.toUpperCase();
  if (cat === 'A' || cat === 'B') tags.push(`Categoria ${cat}`);

  return tags.slice(0, 6);
}

export function filtrarCidadesMapa(cidades: CidadeDataset[], filtros: FiltrosMapa, busca = ''): CidadeDataset[] {
  const termo = busca.trim().toLowerCase();

  return cidades.filter((cidade) => {
    if (!Number.isFinite(cidade.latitude) || !Number.isFinite(cidade.longitude)) return false;
    if (!matchesAmbiente(cidade, filtros.ambiente)) return false;
    if (filtros.populoso && (cidade.populacaoEstimada ?? 0) <= POPULOSO_MAPA_THRESHOLD) return false;
    if (!matchesInfraestrutura(cidade, filtros.infraestrutura)) return false;
    if (filtros.comHotel && (cidade.hoteis ?? 0) <= 0) return false;
    if (filtros.capitais && !cidade.capital) return false;
    if (filtros.comUber && !cidade.uber) return false;

    if (termo) {
      const match =
        cidade.nome.toLowerCase().includes(termo) ||
        cidade.estado.toLowerCase().includes(termo) ||
        (cidade.regiaoTur ?? '').toLowerCase().includes(termo) ||
        gerarTagsCidade(cidade).some((t) => t.toLowerCase().includes(termo));
      if (!match) return false;
    }

    return true;
  });
}

/** Limita pins no mapa priorizando população e capitais. */
export function limitarMarcadoresMapa(cidades: CidadeDataset[]): {
  exibidas: CidadeDataset[];
  totalFiltradas: number;
  limitado: boolean;
} {
  const totalFiltradas = cidades.length;
  if (totalFiltradas <= MAX_MAP_MARKERS) {
    return { exibidas: cidades, totalFiltradas, limitado: false };
  }

  const ordenadas = [...cidades].sort((a, b) => {
    if (a.capital !== b.capital) return a.capital ? -1 : 1;
    return (b.populacaoEstimada ?? 0) - (a.populacaoEstimada ?? 0);
  });

  return {
    exibidas: ordenadas.slice(0, MAX_MAP_MARKERS),
    totalFiltradas,
    limitado: true,
  };
}

export function formatAltitudeLabel(altitude: number | null | undefined): string | null {
  if (altitude == null || !Number.isFinite(altitude)) return null;
  if (altitude > 500) return `Altitude: ${Math.round(altitude)} m`;
  if (altitude < 50) return 'Litoral / Planície';
  return null;
}

export function getWikipediaUrl(nome: string, estado: string): string {
  const titulo = encodeURIComponent(`${nome} (${estado})`.replace(/ /g, '_'));
  return `https://pt.wikipedia.org/wiki/${titulo}`;
}

export function toCidadeLegacy(cidade: CidadeDataset): Cidade {
  return {
    id: cidade.id,
    nome: cidade.nome,
    estado: cidade.estado,
    regiao: cidade.regiao,
    avaliacao: 4.5,
    categoria: cidade.categoria,
    categorias: cidade.categorias,
    imagemUrl: cidade.imagemUrl,
    clima: inferirClimaCidade(cidade),
    energia: inferirEnergiaCidade(cidade),
    estilos: inferirEstilosCidade(cidade),
    descricao: cidade.regiaoTur || cidade.categoria,
  };
}

export function buscarCidadesPorTermo(cidades: Cidade[], termo: string, limit = 40): Cidade[] {
  const t = normalize(termo.trim());
  if (!t) return [];

  return cidades
    .filter((c) => {
      const nome = normalize(c.nome);
      const estado = normalize(c.estado);
      const regiao = normalize(String(c.regiao ?? ''));
      return nome.includes(t) || estado.includes(t) || regiao.includes(t);
    })
    .slice(0, limit);
}

export function encontrarCidadePorNomeEstado(
  cidades: Cidade[],
  nome: string,
  estado: string,
): Cidade | undefined {
  const normNome = normalize(nome.trim());
  const normEstado = normalize(estado.trim());
  if (!normNome || !normEstado) return undefined;

  return cidades.find((c) => normalize(c.nome) === normNome && normalize(c.estado) === normEstado);
}
