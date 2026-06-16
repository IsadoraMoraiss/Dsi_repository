import { Cidade } from '../data/mockCidades';
import { roteirosRecomendados, Roteiro } from '../data/mockRoteiros';
import { calcularDistanciaKm } from '../services/sugestoes';

export const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  recife: { lat: -8.0476, lon: -34.877 },
  olinda: { lat: -8.0089, lon: -34.8553 },
  fortaleza: { lat: -3.7319, lon: -38.5267 },
  natal: { lat: -5.7793, lon: -35.2009 },
  'joao pessoa': { lat: -7.1195, lon: -34.845 },
  maceio: { lat: -9.6498, lon: -35.7089 },
  salvador: { lat: -12.9777, lon: -38.5016 },
  bonito: { lat: -21.1261, lon: -56.4836 },
  gramado: { lat: -29.3734, lon: -50.8762 },
  canela: { lat: -29.3639, lon: -50.8156 },
  curitiba: { lat: -25.4284, lon: -49.2733 },
  florianopolis: { lat: -27.5949, lon: -48.5482 },
  'sao paulo': { lat: -23.5558, lon: -46.6396 },
  'rio de janeiro': { lat: -22.9068, lon: -43.1729 },
  brasilia: { lat: -15.7939, lon: -47.8828 },
  manaus: { lat: -3.119, lon: -60.0217 },
  belem: { lat: -1.4558, lon: -48.5039 },
  'ouro preto': { lat: -20.3856, lon: -43.5035 },
  'bento goncalves': { lat: -29.1668, lon: -51.5167 },
  'campos do jordao': { lat: -22.7394, lon: -45.5914 },
};

const COR_POR_TIPO: Record<string, string> = {
  aventura: '#F59E0B',
  inverno: '#6366F1',
  verão: '#3B82F6',
  verao: '#3B82F6',
  natureza: '#10B981',
  conforto: '#8B5CF6',
  econômico: '#0891B2',
  economico: '#0891B2',
  passeios: '#059669',
  cultura: '#0891B2',
};

function normalizarLabel(label: string) {
  return label.trim().toLowerCase();
}

/** Encontra cidade no dataset a partir do texto "Nome, UF" ou só "Nome". */
export function encontrarCidadePorLabel(label: string, todasCidades: Cidade[]): Cidade | undefined {
  const norm = normalizarLabel(label);
  const exato = todasCidades.find((c) => normalizarLabel(`${c.nome}, ${c.estado}`) === norm);
  if (exato) return exato;

  const soNome = norm.split(',')[0]?.trim();
  if (!soNome) return undefined;

  return todasCidades.find((c) => normalizarLabel(c.nome) === soNome);
}

/** Resolve paradas do roteiro (ids + objetos Cidade) mesmo quando só há labels salvos. */
export function resolverCidadesDoRoteiro(
  roteiro: { cidades: string[]; cidadeIds?: string[] },
  todasCidades: Cidade[],
): { ids: string[]; detalhadas: Cidade[] } {
  const porId = (roteiro.cidadeIds ?? [])
    .map((id) => todasCidades.find((c) => c.id === id))
    .filter((c): c is Cidade => Boolean(c));

  if (porId.length > 0) {
    return {
      ids: porId.map((c) => c.id),
      detalhadas: porId,
    };
  }

  const detalhadas = roteiro.cidades
    .map((label) => encontrarCidadePorLabel(label, todasCidades))
    .filter((c): c is Cidade => Boolean(c));

  return {
    ids: detalhadas.map((c) => c.id),
    detalhadas,
  };
}

export function calcularDistanciaTotalKm(cidades: Cidade[]): number {
  if (cidades.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < cidades.length - 1; i += 1) {
    total += calcularDistanciaKm(cidades[i], cidades[i + 1], CITY_COORDS);
  }
  return total;
}

export function distanciaExibidaRoteiro(
  roteiro: Pick<Roteiro, 'distanciaKm'>,
  cidadesDetalhadas: Cidade[],
): number {
  if (roteiro.distanciaKm > 0) return roteiro.distanciaKm;
  return calcularDistanciaTotalKm(cidadesDetalhadas);
}

function normalizarCidadesLista(cidades: string[]) {
  return [...cidades].map((c) => c.trim().toLowerCase()).sort().join('|');
}

function normalizarNome(nome: string) {
  return nome.trim().toLowerCase();
}

const CORES_INVALIDAS = new Set(['#ffffff', '#fff', 'white', 'transparent', '']);

/** Cor branca / vazia do Firestore não deve pintar o card. */
export function isCorInvalida(cor?: string | null): boolean {
  if (!cor?.trim()) return true;
  return CORES_INVALIDAS.has(cor.trim().toLowerCase());
}

export function mockPorNomeRoteiro(nome: string) {
  const alvo = normalizarNome(nome);
  return roteirosRecomendados.find((mock) => normalizarNome(mock.nome) === alvo);
}

/** Roteiro salvo/favoritado a partir dos exemplos do app (mock). */
export function ehRoteiroDaComunidade(roteiro: Pick<Roteiro, 'nome' | 'cidades'>): boolean {
  if (mockPorNomeRoteiro(roteiro.nome)) return true;

  const chave = `${normalizarNome(roteiro.nome)}|${normalizarCidadesLista(roteiro.cidades ?? [])}`;
  return roteirosRecomendados.some((mock) => {
    const chaveMock = `${normalizarNome(mock.nome)}|${normalizarCidadesLista(mock.cidades ?? [])}`;
    return chave === chaveMock;
  });
}

export function mockRecomendadoCorrespondente(roteiro: Pick<Roteiro, 'nome' | 'cidades'>) {
  const porNome = mockPorNomeRoteiro(roteiro.nome);
  if (porNome) return porNome;

  const chave = `${normalizarNome(roteiro.nome)}|${normalizarCidadesLista(roteiro.cidades ?? [])}`;
  return roteirosRecomendados.find((mock) => {
    const chaveMock = `${normalizarNome(mock.nome)}|${normalizarCidadesLista(mock.cidades ?? [])}`;
    return chave === chaveMock;
  });
}

/** Cor escolhida na criação ou cor do roteiro de exemplo / tipo. */
export function corDoRoteiro(roteiro: Pick<Roteiro, 'cor' | 'tipo' | 'nome' | 'cidades'>): string {
  const mock = mockRecomendadoCorrespondente(roteiro);

  // Roteiros do catálogo do app: sempre a cor do exemplo (evita #FFFFFF no Firestore)
  if (ehRoteiroDaComunidade(roteiro) && mock?.cor) {
    return mock.cor;
  }

  if (!isCorInvalida(roteiro.cor)) {
    return roteiro.cor!.trim();
  }

  if (mock?.cor) return mock.cor;

  const tipo = roteiro.tipo.toLowerCase();
  for (const [chave, valor] of Object.entries(COR_POR_TIPO)) {
    if (tipo.includes(chave)) return valor;
  }

  return '#8B5CF6';
}

/** Texto abaixo do título na tela de detalhes. */
export function subtituloAutorRoteiro(
  roteiro: Pick<Roteiro, 'nome' | 'cidades' | 'autorNome'>,
  isDono: boolean,
): string {
  if (ehRoteiroDaComunidade(roteiro)) {
    return 'Sugerido pela Equipe do Brasil em Foco';
  }
  return `Criado por ${roteiro.autorNome || 'Membro da Comunidade'}`;
}

export function autorExibicaoRoteiro(
  roteiro: Pick<Roteiro, 'nome' | 'cidades' | 'autorNome'>,
  isDono: boolean,
): string {
  if (ehRoteiroDaComunidade(roteiro)) return 'Equipe do Brasil em Foco';
  if (isDono) return 'Você';
  return roteiro.autorNome || 'Membro da Comunidade';
}

/** Roteiro criado pelo usuário em "Criar roteiro" (não é cópia do catálogo). */
export function ehRoteiroCriadoPeloUsuario(
  roteiro: Pick<Roteiro, 'nome' | 'cidades'> & { origemComunidade?: boolean },
): boolean {
  if (roteiro.origemComunidade) return false;
  return !ehRoteiroDaComunidade(roteiro);
}
