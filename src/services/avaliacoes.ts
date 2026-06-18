import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  collection,
} from 'firebase/firestore';
import type { Avaliacao } from '../data/mockAvaliacoes';
import { db } from './firebase';

const LEGACY_STORAGE_KEY = 'minhasAvaliacoes';
const STORAGE_KEY_PREFIX = 'minhasAvaliacoes:';
const COLLECTION_NAME = 'avaliacoes';

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

function avaliacaoFromDoc(id: string, data: Record<string, any>): Avaliacao {
  return {
    id,
    autorUid: data.autorUid ?? data.uid,
    autorNome: data.autorNome,
    avatarUrl: data.avatarUrl,
    avatarLetra: data.avatarLetra,
    cidadeId: data.cidadeId,
    cidadeNome: data.cidadeNome ?? '',
    cidadeEstado: data.cidadeEstado ?? '',
    nota: Number(data.nota ?? 0),
    data: data.data ?? '',
    comentario: data.comentario ?? '',
    publica: data.publica === true,
  };
}

function sortByCreatedDesc(a: Avaliacao, b: Avaliacao) {
  return Number(b.id) - Number(a.id);
}

export async function listarMinhasAvaliacoes(uid: string): Promise<Avaliacao[]> {
  const byId = new Map<string, Avaliacao>();

  if (db) {
    const consultas = await Promise.allSettled([
      getDocs(query(collection(db, COLLECTION_NAME), where('uid', '==', uid))),
      getDocs(query(collection(db, COLLECTION_NAME), where('autorUid', '==', uid))),
    ]);

    consultas.forEach((result) => {
      if (result.status === 'fulfilled') {
        result.value.docs
          .map((docSnap) => avaliacaoFromDoc(docSnap.id, docSnap.data()))
          .forEach((avaliacao) => byId.set(avaliacao.id, avaliacao));
      } else {
        console.warn('[avaliacoes] Nao foi possivel consultar avaliacoes do usuario:', result.reason);
      }
    });
  }

  const key = storageKey(uid);
  const salvas = await lerAvaliacoesDaChave(key);

  salvas.forEach((avaliacao) => byId.set(avaliacao.id, { ...avaliacao, autorUid: avaliacao.autorUid ?? uid }));

  const antigas = await lerAvaliacoesDaChave(LEGACY_STORAGE_KEY);
  if (antigas.length > 0) {
    const migradas = antigas.map((av) => ({ ...av, autorUid: av.autorUid ?? uid }));
    migradas.forEach((avaliacao) => byId.set(avaliacao.id, avaliacao));
    await salvarMinhasAvaliacoes(uid, migradas);
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  return Array.from(byId.values()).sort(sortByCreatedDesc);
}

export async function salvarMinhasAvaliacoes(uid: string, avaliacoes: Avaliacao[]): Promise<void> {
  await AsyncStorage.setItem(storageKey(uid), JSON.stringify(avaliacoes));
}

export async function adicionarAvaliacao(uid: string, avaliacao: Avaliacao): Promise<void> {
  if (db) {
    const ref = doc(db, COLLECTION_NAME, avaliacao.id);
    await setDoc(ref, {
      ...avaliacao,
      uid,
      autorUid: uid,
      nota: Number(avaliacao.nota),
      cidadeId: avaliacao.cidadeId ?? null,
      publica: avaliacao.publica === true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  const atuais = await listarMinhasAvaliacoes(uid);
  await salvarMinhasAvaliacoes(uid, [{ ...avaliacao, autorUid: uid }, ...atuais]);
}

export async function removerAvaliacao(uid: string, id: string): Promise<void> {
  if (db) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return;
  }

  const atuais = await listarMinhasAvaliacoes(uid);
  await salvarMinhasAvaliacoes(uid, atuais.filter((av) => av.id !== id));
}

export async function listarAvaliacoesPublicasDaCidade(
  cidadeId: string | undefined,
  cidadeNome: string,
  cidadeEstado: string,
  viewerUid?: string,
): Promise<Avaliacao[]> {
  if (db && cidadeId) {
    const publicasSnap = await getDocs(
      query(collection(db, COLLECTION_NAME), where('cidadeId', '==', cidadeId), where('publica', '==', true)),
    );

    const avaliacoes = publicasSnap.docs
      .map((docSnap) => avaliacaoFromDoc(docSnap.id, docSnap.data()))
      .sort(sortByCreatedDesc);

    if (!viewerUid) return avaliacoes;

    const minhasSnap = await getDocs(
      query(collection(db, COLLECTION_NAME), where('cidadeId', '==', cidadeId), where('uid', '==', viewerUid)),
    );
    const byId = new Map(avaliacoes.map((av) => [av.id, av]));
    minhasSnap.docs
      .map((docSnap) => avaliacaoFromDoc(docSnap.id, docSnap.data()))
      .forEach((av) => byId.set(av.id, av));

    return Array.from(byId.values()).sort(sortByCreatedDesc);
  }

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
  const notasValidas = avaliacoes
    .map((av) => Number(av.nota))
    .filter((nota) => Number.isFinite(nota) && nota >= 1 && nota <= 5);

  if (notasValidas.length === 0) return null;
  const soma = notasValidas.reduce((total, nota) => total + nota, 0);
  return soma / notasValidas.length;
}
