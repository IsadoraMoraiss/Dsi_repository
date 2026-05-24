import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Avaliacao } from '../data/mockAvaliacoes';

const STORAGE_KEY = 'minhasAvaliacoes';

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function avaliacaoMatchesCidade(
  avaliacao: Pick<Avaliacao, 'cidadeId' | 'cidadeNome' | 'cidadeEstado'>,
  cidadeId: string | undefined,
  cidadeNome: string,
  cidadeEstado: string,
): boolean {
  if (cidadeId && avaliacao.cidadeId) {
    return avaliacao.cidadeId === cidadeId;
  }
  return (
    normalize(avaliacao.cidadeNome) === normalize(cidadeNome) &&
    normalize(avaliacao.cidadeEstado) === normalize(cidadeEstado)
  );
}

export async function listarMinhasAvaliacoes(): Promise<Avaliacao[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Avaliacao[]) : [];
  } catch (error) {
    console.warn('[avaliacoes] Errored ao carregar:', error);
    return [];
  }
}

export async function salvarMinhasAvaliacoes(avaliacoes: Avaliacao[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(avaliacoes));
}

export async function adicionarAvaliacao(avaliacao: Avaliacao): Promise<void> {
  const atuais = await listarMinhasAvaliacoes();
  await salvarMinhasAvaliacoes([avaliacao, ...atuais]);
}

export async function removerAvaliacao(id: string): Promise<void> {
  const atuais = await listarMinhasAvaliacoes();
  await salvarMinhasAvaliacoes(atuais.filter((av) => av.id !== id));
}

export async function listarAvaliacoesPublicasDaCidade(
  cidadeId: string | undefined,
  cidadeNome: string,
  cidadeEstado: string,
): Promise<Avaliacao[]> {
  const todas = await listarMinhasAvaliacoes();
  return todas.filter(
    (av) => av.publica && avaliacaoMatchesCidade(av, cidadeId, cidadeNome, cidadeEstado),
  );
}

export function calcularMediaAvaliacoes(avaliacoes: Pick<Avaliacao, 'nota'>[]): number | null {
  if (avaliacoes.length === 0) return null;
  const soma = avaliacoes.reduce((total, av) => total + av.nota, 0);
  return soma / avaliacoes.length;
}
