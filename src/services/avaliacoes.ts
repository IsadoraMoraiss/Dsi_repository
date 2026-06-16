import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Avaliacao } from '../data/mockAvaliacoes';

const LEGACY_STORAGE_KEY = 'minhasAvaliacoes';
const STORAGE_KEY_PREFIX = 'minhasAvaliacoes:';

function storageKey(uid: string) {
  return `${STORAGE_KEY_PREFIX}${uid}`;
}

function normalize(text: string | undefined | null): string {
  if (!text) return '';
  try {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  } catch {
    return '';
  }
}

export function avaliacaoMatchesCidade(
  avaliacao: Pick<Avaliacao, 'cidadeId' | 'cidadeNome' | 'cidadeEstado'>,
  cidadeId: string | undefined,
  cidadeNome: string,
  cidadeEstado: string,
): boolean {
  if (cidadeId && avaliacao.cidadeId && cidadeId === avaliacao.cidadeId) {
    return true;
  }
  return (
    normalize(avaliacao.cidadeNome) === normalize(cidadeNome) &&
    normalize(avaliacao.cidadeEstado) === normalize(cidadeEstado)
  );
}

async function lerAvaliacoesDaChave(key: string): Promise<Avaliacao[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Avaliacao[]) : [];
  } catch (error) {
    console.warn('[avaliacoes] Errored ao carregar:', error);
    return [];
  }
}

export async function listarMinhasAvaliacoes(uid: string): Promise<Avaliacao[]> {
  const key = storageKey(uid);
  const salvas = await lerAvaliacoesDaChave(key);

  if (salvas.length > 0) {
    return salvas;
  }

  const antigas = await lerAvaliacoesDaChave(LEGACY_STORAGE_KEY);
  if (antigas.length === 0) {
    return [];
  }

  const migradas = antigas.map((av) => ({ ...av, autorUid: av.autorUid ?? uid }));
  await salvarMinhasAvaliacoes(uid, migradas);
  await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  return migradas;
}

export async function salvarMinhasAvaliacoes(uid: string, avaliacoes: Avaliacao[]): Promise<void> {
  await AsyncStorage.setItem(storageKey(uid), JSON.stringify(avaliacoes));
}

export async function adicionarAvaliacao(uid: string, avaliacao: Avaliacao): Promise<void> {
  const atuais = await listarMinhasAvaliacoes(uid);
  await salvarMinhasAvaliacoes(uid, [{ ...avaliacao, autorUid: uid }, ...atuais]);
}

export async function removerAvaliacao(uid: string, id: string): Promise<void> {
  const atuais = await listarMinhasAvaliacoes(uid);
  await salvarMinhasAvaliacoes(uid, atuais.filter((av) => av.id !== id));
}

export async function listarAvaliacoesPublicasDaCidade(
  cidadeId: string | undefined,
  cidadeNome: string,
  cidadeEstado: string,
  viewerUid?: string,
): Promise<Avaliacao[]> {
  const keys = await AsyncStorage.getAllKeys();
  const reviewKeys = keys.filter((key) => key === LEGACY_STORAGE_KEY || key.startsWith(STORAGE_KEY_PREFIX));
  const pares = await AsyncStorage.multiGet(reviewKeys);
  const todas = pares.flatMap(([key, raw]) => {
    if (!raw) return [];
    try {
      const avaliacoes = JSON.parse(raw) as Avaliacao[];
      if (key === LEGACY_STORAGE_KEY) return avaliacoes;
      const uid = key.slice(STORAGE_KEY_PREFIX.length);
      return avaliacoes.map((av) => ({ ...av, autorUid: av.autorUid ?? uid }));
    } catch (error) {
      console.warn('[avaliacoes] Erro ao carregar avaliacoes publicas:', error);
      return [];
    }
  });

  return todas.filter(
    (av) =>
      (av.publica || (viewerUid && av.autorUid === viewerUid)) &&
      avaliacaoMatchesCidade(av, cidadeId, cidadeNome, cidadeEstado),
  );
}

export function calcularMediaAvaliacoes(avaliacoes: Pick<Avaliacao, 'nota'>[]): number | null {
  if (avaliacoes.length === 0) return null;
  const soma = avaliacoes.reduce((total, av) => total + av.nota, 0);
  return soma / avaliacoes.length;
}
