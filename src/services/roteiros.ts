/**
 * Índice composto necessário no Firestore Console (coleção `roteiros`):
 *   privado (Ascending) + favoritosCount (Descending)
 * Sem esse índice, listarRoteirosEmAlta() falha na query.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Cidade } from '../data/mockCidades';
import { roteirosRecomendados, Roteiro } from '../data/mockRoteiros';
import { escolherImagemRoteiro } from '../utils/roteiroImagem';
import {
  calcularDistanciaTotalKm,
  corDoRoteiro,
  ehRoteiroDaComunidade,
  mockRecomendadoCorrespondente,
  resolverCidadesDoRoteiro,
} from '../utils/roteiroUtils';
import { db } from './firebase';

const ULTIMOS_ROTEIROS_KEY = 'ultimosRoteirosVistos';
const MAX_ULTIMOS_ROTEIROS = 10;

export type UserRoteiro = Roteiro & {
  uid: string;
  clima?: string;
  energia?: string;
  automatico?: boolean;
  origemComunidade?: boolean;
  observacoes?: string;
  descricao?: string;
  cidadeIds?: string[];
  autorNome?: string;
  temas?: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

function cidadeLabel(cidade: Cidade) {
  return `${cidade.nome}, ${cidade.estado}`;
}

function calcularDuracao(totalCidades: number, distanciaKm: number = 0) {
  if (totalCidades <= 1) return '1 dia';
  if (totalCidades > 6 || distanciaKm > 1800) return '7+ dias';
  if (totalCidades > 3 || distanciaKm > 700) return '4-7 dias';
  if (distanciaKm > 250) return '2-3 dias';
  if (totalCidades <= 3) return '2-3 dias';
  return '7+ dias';
}

function calcularTipo(cidades: Cidade[]) {
  if (cidades.some((cidade) => ['Praia', 'Natureza'].includes(cidade.categoria))) return 'Aventura';
  if (cidades.some((cidade) => ['Cultura', 'Histórico', 'Historico', 'Gastronomia'].includes(cidade.categoria))) {
    return 'Conforto';
  }
  return 'Econômico';
}

function roteiroFromDoc(id: string, data: Record<string, any>): UserRoteiro {
  return {
    id,
    uid: data.uid,
    nome: data.nome ?? 'Roteiro',
    cidades: Array.isArray(data.cidades) ? data.cidades : [],
    cidadeIds: Array.isArray(data.cidadeIds) ? data.cidadeIds : [],
    distanciaKm: Number(data.distanciaKm ?? 0),
    duracao: data.duracao ?? 'A definir',
    tipo: data.tipo ?? 'Personalizado',
    clima: data.clima,
    energia: data.energia,
    cor: data.cor ?? '#8B5CF6',
    privado: data.privado ?? true,
    favoritado: data.favoritado ?? false,
    favoritosCount: Number(data.favoritosCount ?? 0),
    visualizacoesCount: Number(data.visualizacoesCount ?? 0),
    imagemUrl: data.imagemUrl,
    automatico: data.automatico,
    origemComunidade: data.origemComunidade === true,
    observacoes: data.observacoes,
    descricao: data.descricao,
    autorNome: data.autorNome,
    temas: Array.isArray(data.temas) ? data.temas : [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function isProvavelIdFirestore(roteiroId: string) {
  return roteiroId.length > 8;
}

function normalizarCidades(cidades: string[]) {
  return [...cidades].map((c) => c.trim().toLowerCase()).sort().join('|');
}

function chaveConteudoRoteiro(roteiro: Pick<Roteiro, 'nome' | 'cidades'>) {
  return `${roteiro.nome.trim().toLowerCase()}|${normalizarCidades(roteiro.cidades ?? [])}`;
}

/** Remove duplicatas (mesmo nome + cidades), priorizando favoritado. */
function deduplicarRoteirosPorConteudo(roteiros: UserRoteiro[]): UserRoteiro[] {
  const byKey = new Map<string, UserRoteiro>();

  for (const roteiro of roteiros) {
    const key = chaveConteudoRoteiro(roteiro);
    const anterior = byKey.get(key);
    if (!anterior) {
      byKey.set(key, roteiro);
      continue;
    }
    if (roteiro.favoritado && !anterior.favoritado) {
      byKey.set(key, roteiro);
    }
  }

  return Array.from(byKey.values());
}

function encontrarRoteiroEquivalente(roteiros: UserRoteiro[], roteiro: Roteiro) {
  return roteiros.find(
    (r) =>
      r.id === roteiro.id ||
      chaveConteudoRoteiro(r) === chaveConteudoRoteiro(roteiro) ||
      mesmoRoteiroConteudo(r, roteiro),
  );
}

async function removerDuplicatasFirestore(uid: string, roteiros: UserRoteiro[]) {
  if (!db) return;

  const grupos = new Map<string, UserRoteiro[]>();
  for (const roteiro of roteiros) {
    const key = chaveConteudoRoteiro(roteiro);
    const lista = grupos.get(key) ?? [];
    lista.push(roteiro);
    grupos.set(key, lista);
  }

  for (const grupo of grupos.values()) {
    if (grupo.length <= 1) continue;

    const principal =
      grupo.find((r) => r.favoritado) ??
      grupo.reduce((a, b) => ((a.updatedAt ? 1 : 0) >= (b.updatedAt ? 1 : 0) ? a : b));

    for (const duplicata of grupo) {
      if (duplicata.id === principal.id) continue;
      try {
        await deleteDoc(doc(db, 'roteiros', duplicata.id));
      } catch (error) {
        console.warn('[roteiros] Nao foi possivel remover duplicata:', duplicata.id, error);
      }
    }
  }
}

export async function listarRoteirosUsuario(
  uid: string,
  todasCidades?: Cidade[],
): Promise<UserRoteiro[]> {
  if (!db) return [];

  const snap = await getDocs(query(collection(db, 'roteiros'), where('uid', '==', uid)));
  let roteiros = snap.docs.map((docSnap) => roteiroFromDoc(docSnap.id, docSnap.data()));
  await removerDuplicatasFirestore(uid, roteiros);

  if (todasCidades?.length) {
    roteiros = await Promise.all(roteiros.map((r) => enriquecerRoteiroUsuario(r, todasCidades)));
  }

  return deduplicarRoteirosPorConteudo(roteiros);
}

export async function listarRoteirosEmAlta(limitNum = 5): Promise<UserRoteiro[]> {
  if (!db) return [];

  try {
    const snap = await getDocs(
      query(
        collection(db, 'roteiros'),
        where('privado', '==', false),
        orderBy('favoritosCount', 'desc'),
        limit(limitNum),
      ),
    );
    return snap.docs.map((docSnap) => roteiroFromDoc(docSnap.id, docSnap.data()));
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code !== 'failed-precondition') {
      throw error;
    }

    // Fallback sem índice composto: filtra no servidor e ordena no app
    const snap = await getDocs(query(collection(db, 'roteiros'), where('privado', '==', false)));
    return snap.docs
      .map((docSnap) => roteiroFromDoc(docSnap.id, docSnap.data()))
      .sort((a, b) => (b.favoritosCount ?? 0) - (a.favoritosCount ?? 0))
      .slice(0, limitNum);
  }
}

export async function registrarVisualizacaoRoteiro(roteiroId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(ULTIMOS_ROTEIROS_KEY);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  const next = [roteiroId, ...ids.filter((id) => id !== roteiroId)].slice(0, MAX_ULTIMOS_ROTEIROS);
  await AsyncStorage.setItem(ULTIMOS_ROTEIROS_KEY, JSON.stringify(next));

  if (!db || !isProvavelIdFirestore(roteiroId)) return;

  try {
    const snap = await getDoc(doc(db, 'roteiros', roteiroId));
    if (!snap.exists()) return;

    await updateDoc(doc(db, 'roteiros', roteiroId), {
      visualizacoesCount: increment(1),
    });
  } catch (error) {
    console.warn('[roteiros] Nao foi possivel incrementar visualizacoesCount:', error);
  }
}

export async function buscarUltimosRoteiroVistos(uid?: string): Promise<UserRoteiro[]> {
  const raw = await AsyncStorage.getItem(ULTIMOS_ROTEIROS_KEY);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  if (!ids.length || !db) return [];

  const roteiros: UserRoteiro[] = [];
  for (const id of ids) {
    if (!isProvavelIdFirestore(id)) {
      const mock = roteirosRecomendados.find((r) => r.id === id);
      if (mock) {
        roteiros.push({ ...mock, uid: uid ?? '' } as UserRoteiro);
      }
      continue;
    }

    try {
      const snap = await getDoc(doc(db, 'roteiros', id));
      if (!snap.exists()) continue;

      const roteiro = roteiroFromDoc(snap.id, snap.data());
      const podeVer = roteiro.uid === uid || roteiro.privado === false;
      if (podeVer) roteiros.push(roteiro);
    } catch (error) {
      console.warn('[roteiros] Erro ao buscar roteiro visto:', id, error);
    }
  }
  return roteiros;
}

function mesmoRoteiroConteudo(a: Roteiro, b: Roteiro) {
  return (
    a.nome.trim().toLowerCase() === b.nome.trim().toLowerCase() &&
    normalizarCidades(a.cidades ?? []) === normalizarCidades(b.cidades ?? [])
  );
}

/**
 * Favorita/desfavorita roteiro do usuário. Roteiros mock/recomendados viram cópia na conta do usuário.
 */
export async function toggleFavoritarRoteiro(uid: string, roteiro: Roteiro): Promise<boolean> {
  if (!db) throw new Error('Firebase nao configurado.');

  const snap = await getDocs(query(collection(db, 'roteiros'), where('uid', '==', uid)));
  const todos = snap.docs.map((docSnap) => roteiroFromDoc(docSnap.id, docSnap.data()));
  const copiaExistente = encontrarRoteiroEquivalente(todos, roteiro);

  if (copiaExistente) {
    const novoFavorito = !copiaExistente.favoritado;
    const ehCopiaCatalogo =
      copiaExistente.origemComunidade || ehRoteiroDaComunidade(copiaExistente);

    if (!novoFavorito && ehCopiaCatalogo) {
      await deleteDoc(doc(db, 'roteiros', copiaExistente.id));
      return false;
    }

    await updateDoc(doc(db, 'roteiros', copiaExistente.id), {
      favoritado: novoFavorito,
      updatedAt: serverTimestamp(),
    });
    return novoFavorito;
  }

  try {
    const snap = await getDoc(doc(db, 'roteiros', roteiro.id));
    if (snap.exists()) {
      const data = roteiroFromDoc(snap.id, snap.data());
      if (data.uid === uid) {
        const novoFavorito = !data.favoritado;
        await updateDoc(doc(db, 'roteiros', roteiro.id), {
          favoritado: novoFavorito,
          updatedAt: serverTimestamp(),
        });
        return novoFavorito;
      }
    }
  } catch {
    // segue para criar cópia
  }

  const mock = mockRecomendadoCorrespondente(roteiro);
  const todasCidades = require('../data/cidades.json') as Cidade[];
  const { ids: cidadeIdsResolvidos } = resolverCidadesDoRoteiro(roteiro, todasCidades);
  const distanciaCalculada = calcularDistanciaTotalKm(
    cidadeIdsResolvidos
      .map((id) => todasCidades.find((c) => c.id === id))
      .filter((c): c is Cidade => Boolean(c)),
  );
  const imagemUrl =
    roteiro.imagemUrl ??
    mock?.imagemUrl ??
    escolherImagemRoteiro({
      tipo: roteiro.tipo,
      clima: (roteiro as UserRoteiro).clima,
      nome: roteiro.nome,
    });
  const cor = roteiro.cor ?? mock?.cor ?? '#8B5CF6';

  await addDoc(collection(db, 'roteiros'), {
    uid,
    nome: roteiro.nome,
    cidades: roteiro.cidades ?? [],
    cidadeIds:
      Array.isArray((roteiro as UserRoteiro).cidadeIds) && (roteiro as UserRoteiro).cidadeIds!.length > 0
        ? (roteiro as UserRoteiro).cidadeIds!
        : cidadeIdsResolvidos,
    distanciaKm:
      roteiro.distanciaKm && roteiro.distanciaKm > 0
        ? roteiro.distanciaKm
        : mock?.distanciaKm && mock.distanciaKm > 0
          ? mock.distanciaKm
          : distanciaCalculada,
    duracao: roteiro.duracao ?? 'A definir',
    tipo: roteiro.tipo ?? 'Personalizado',
    clima: 'A definir',
    energia: 'A definir',
    observacoes: (roteiro as UserRoteiro).observacoes ?? '',
    descricao: roteiro.descricao ?? '',
    temas: (roteiro as UserRoteiro).temas ?? [],
    cor,
    imagemUrl,
    privado: true,
    automatico: false,
    favoritado: true,
    origemComunidade: true,
    favoritosCount: 0,
    visualizacoesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return true;
}

/** Busca roteiro por ID respeitando privacidade (público ou dono). */
export async function buscarRoteiroPorId(
  roteiroId: string,
  viewerUid?: string,
): Promise<UserRoteiro | null> {
  if (!db) return null;

  const snap = await getDoc(doc(db, 'roteiros', roteiroId));
  if (!snap.exists()) return null;

  const roteiro = roteiroFromDoc(snap.id, snap.data());
  if (roteiro.privado && roteiro.uid !== viewerUid) return null;
  return roteiro;
}

export async function buscarRoteiroUsuario(uid: string, roteiroId: string): Promise<UserRoteiro | null> {
  const roteiro = await buscarRoteiroPorId(roteiroId, uid);
  return roteiro?.uid === uid ? roteiro : null;
}

/** Cópia do roteiro (catálogo ou outro) salva na conta do usuário. */
export async function buscarCopiaSalvaUsuario(uid: string, roteiro: Roteiro): Promise<UserRoteiro | null> {
  if (!db) return null;

  const snap = await getDocs(query(collection(db, 'roteiros'), where('uid', '==', uid)));
  const todos = snap.docs.map((docSnap) => roteiroFromDoc(docSnap.id, docSnap.data()));
  return encontrarRoteiroEquivalente(todos, roteiro) ?? null;
}

export async function sincronizarMetadadosRoteiro(
  roteiroId: string,
  dados: { distanciaKm?: number; cidadeIds?: string[]; cor?: string },
) {
  if (!db) return;

  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (dados.distanciaKm !== undefined) updates.distanciaKm = dados.distanciaKm;
  if (dados.cidadeIds !== undefined) updates.cidadeIds = dados.cidadeIds;
  if (dados.cor !== undefined) updates.cor = dados.cor;

  if (Object.keys(updates).length <= 1) return;

  await updateDoc(doc(db, 'roteiros', roteiroId), updates);
}

export async function criarRoteiroUsuario({
  uid,
  nome,
  cidades,
  cidadeIds,
  duracao,
  tipo,
  clima,
  energia,
  observacoes,
  descricao,
  temas,
  cor,
  privado,
  automatico = false,
  distanciaKm,
  imagemUrl,
  cidadesDetalhadas,
}: {
  uid: string;
  nome: string;
  cidades: string[];
  cidadeIds: string[];
  duracao: string;
  tipo: string;
  clima: string;
  energia: string;
  observacoes?: string;
  descricao?: string;
  temas?: string[];
  cor: string;
  privado: boolean;
  automatico?: boolean;
  distanciaKm?: number;
  imagemUrl?: string;
  cidadesDetalhadas?: Cidade[];
}) {
  if (!db) throw new Error('Firebase nao configurado.');

  const capa =
    imagemUrl ??
    escolherImagemRoteiro({
      tipo,
      clima,
      nome,
      cidadesDetalhadas,
    });

  return addDoc(collection(db, 'roteiros'), {
    uid,
    nome,
    cidades,
    cidadeIds,
    distanciaKm: distanciaKm ?? 0,
    duracao,
    tipo,
    clima,
    energia,
    observacoes: observacoes ?? '',
    descricao: descricao ?? '',
    temas: temas ?? [],
    cor,
    imagemUrl: capa,
    privado,
    automatico,
    favoritado: false,
    favoritosCount: 0,
    visualizacoesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function atualizarRoteiroUsuario(
  roteiroId: string,
  {
    nome,
    cidades,
    cidadeIds,
    duracao,
    tipo,
    clima,
    energia,
    observacoes,
    descricao,
    temas,
    cor,
    distanciaKm,
  }: {
    nome?: string;
    cidades?: string[];
    cidadeIds?: string[];
    duracao?: string;
    tipo?: string;
    clima?: string;
    energia?: string;
    observacoes?: string;
    descricao?: string;
    temas?: string[];
    cor?: string;
    distanciaKm?: number;
  }
) {
  if (!db) throw new Error('Firebase nao configurado.');

  const updates: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (nome !== undefined) updates.nome = nome;
  if (cidades !== undefined) updates.cidades = cidades;
  if (cidadeIds !== undefined) updates.cidadeIds = cidadeIds;
  if (duracao !== undefined) updates.duracao = duracao;
  if (tipo !== undefined) updates.tipo = tipo;
  if (clima !== undefined) updates.clima = clima;
  if (energia !== undefined) updates.energia = energia;
  if (observacoes !== undefined) updates.observacoes = observacoes;
  if (descricao !== undefined) updates.descricao = descricao;
  if (temas !== undefined) updates.temas = temas;
  if (cor !== undefined) updates.cor = cor;
  if (distanciaKm !== undefined) updates.distanciaKm = distanciaKm;

  await updateDoc(doc(db, 'roteiros', roteiroId), updates);
}

export async function removerCidadeDoRoteiro(roteiroId: string, cidadeLabel: string, cidadeId: string) {
  if (!db) throw new Error('Firebase nao configurado.');

  await updateDoc(doc(db, 'roteiros', roteiroId), {
    cidades: arrayRemove(cidadeLabel),
    cidadeIds: arrayRemove(cidadeId),
    updatedAt: serverTimestamp(),
  });
}

export async function deletarRoteiroUsuario(roteiroId: string) {
  if (!db) throw new Error('Firebase nao configurado.');

  await deleteDoc(doc(db, 'roteiros', roteiroId));
}

export async function adicionarRoteiroRecomendadoAoUsuario(
  uid: string,
  roteiro: UserRoteiro,
): Promise<{ id: string; jaExistia: boolean }> {
  if (!db) throw new Error('Firebase nao configurado.');

  const snap = await getDocs(query(collection(db, 'roteiros'), where('uid', '==', uid)));
  const todos = snap.docs.map((docSnap) => roteiroFromDoc(docSnap.id, docSnap.data()));
  const existente = encontrarRoteiroEquivalente(todos, roteiro);

  if (existente) {
    await updateDoc(doc(db, 'roteiros', existente.id), {
      distanciaKm: roteiro.distanciaKm ?? existente.distanciaKm,
      duracao: roteiro.duracao ?? existente.duracao,
      tipo: roteiro.tipo ?? existente.tipo,
      descricao: roteiro.descricao ?? existente.descricao ?? '',
      imagemUrl: roteiro.imagemUrl ?? existente.imagemUrl,
      favoritado: true,
      origemComunidade: true,
      updatedAt: serverTimestamp(),
    });
    return { id: existente.id, jaExistia: true };
  }

  const mock = mockRecomendadoCorrespondente(roteiro);
  const todasCidades = require('../data/cidades.json') as Cidade[];
  const { ids: cidadeIdsResolvidos } = resolverCidadesDoRoteiro(roteiro, todasCidades);
  const distanciaCalculada = calcularDistanciaTotalKm(
    cidadeIdsResolvidos
      .map((id) => todasCidades.find((c) => c.id === id))
      .filter((c): c is Cidade => Boolean(c)),
  );
  const imagemUrl =
    roteiro.imagemUrl ??
    mock?.imagemUrl ??
    escolherImagemRoteiro({ tipo: roteiro.tipo, nome: roteiro.nome });
  const cor = roteiro.cor ?? mock?.cor ?? '#8B5CF6';

  const ref = await addDoc(collection(db, 'roteiros'), {
    uid,
    nome: roteiro.nome,
    cidades: roteiro.cidades ?? [],
    cidadeIds: roteiro.cidadeIds?.length ? roteiro.cidadeIds : cidadeIdsResolvidos,
    distanciaKm:
      roteiro.distanciaKm && roteiro.distanciaKm > 0
        ? roteiro.distanciaKm
        : mock?.distanciaKm && mock.distanciaKm > 0
          ? mock.distanciaKm
          : distanciaCalculada,
    duracao: roteiro.duracao,
    tipo: roteiro.tipo,
    clima: 'A definir',
    energia: 'A definir',
    observacoes: roteiro.observacoes ?? '',
    descricao: roteiro.descricao ?? '',
    temas: roteiro.temas ?? [],
    cor,
    imagemUrl,
    privado: true,
    automatico: false,
    favoritado: true,
    origemComunidade: true,
    favoritosCount: 0,
    visualizacoesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: ref.id, jaExistia: false };
}

export async function removerRoteiroSalvoComunidade(uid: string, roteiro: Roteiro): Promise<boolean> {
  const copia = await buscarCopiaSalvaUsuario(uid, roteiro);
  if (!copia) return false;
  await deletarRoteiroUsuario(copia.id);
  return true;
}

/** Preenche cidadeIds, distância e cor quando faltam (roteiros antigos ou da comunidade). */
export async function enriquecerRoteiroUsuario(
  roteiro: UserRoteiro,
  todasCidades: Cidade[],
): Promise<UserRoteiro> {
  const { ids, detalhadas } = resolverCidadesDoRoteiro(roteiro, todasCidades);
  const mock = mockRecomendadoCorrespondente(roteiro);

  const distanciaKm =
    roteiro.distanciaKm > 0
      ? roteiro.distanciaKm
      : mock?.distanciaKm && mock.distanciaKm > 0
        ? mock.distanciaKm
        : calcularDistanciaTotalKm(detalhadas);

  const cor = corDoRoteiro(roteiro);
  const cidadeIds = ids.length > 0 ? ids : roteiro.cidadeIds ?? [];
  const precisaSync =
    (roteiro.distanciaKm === 0 && distanciaKm > 0) ||
    (cidadeIds.length > 0 && (roteiro.cidadeIds?.length ?? 0) === 0) ||
    cor !== roteiro.cor;

  if (precisaSync && isProvavelIdFirestore(roteiro.id)) {
    await sincronizarMetadadosRoteiro(roteiro.id, {
      distanciaKm: distanciaKm > 0 ? distanciaKm : undefined,
      cidadeIds: cidadeIds.length > 0 ? cidadeIds : undefined,
      cor: cor !== roteiro.cor ? cor : undefined,
    });
  }

  return {
    ...roteiro,
    distanciaKm,
    cidadeIds,
    cor,
    descricao: roteiro.descricao || mock?.descricao,
    autorNome: ehRoteiroDaComunidade(roteiro) ? 'Brasil em Foco' : roteiro.autorNome,
  };
}

export async function adicionarCidadeAoRoteiroAutomatico(uid: string, cidade: Cidade) {
  if (!db) throw new Error('Firebase nao configurado.');

  const snap = await getDocs(query(collection(db, 'roteiros'), where('uid', '==', uid), limit(50)));
  const roteiros = snap.docs.map((docSnap) => roteiroFromDoc(docSnap.id, docSnap.data()));
  const manual = roteiros.find((roteiro) => !roteiro.automatico);

  if (manual) {
    await updateDoc(doc(db, 'roteiros', manual.id), {
      cidades: arrayUnion(cidadeLabel(cidade)),
      cidadeIds: arrayUnion(cidade.id),
      updatedAt: serverTimestamp(),
    });
    return manual.nome;
  }

  const automatico = roteiros.find((roteiro) => roteiro.automatico);
  if (automatico) {
    const totalCidades = new Set([...(automatico.cidadeIds ?? []), cidade.id]).size;
    await updateDoc(doc(db, 'roteiros', automatico.id), {
      cidades: arrayUnion(cidadeLabel(cidade)),
      cidadeIds: arrayUnion(cidade.id),
      duracao: calcularDuracao(totalCidades),
      updatedAt: serverTimestamp(),
    });
    return automatico.nome;
  }

  await criarRoteiroUsuario({
    uid,
    nome: 'Roteiro 1',
    cidades: [cidadeLabel(cidade)],
    cidadeIds: [cidade.id],
    duracao: '1 dia',
    tipo: calcularTipo([cidade]),
    clima: cidade.categoria === 'Praia' ? 'Ensolarado' : 'Temperado',
    energia: cidade.categoria === 'Histórico' ? 'Calmo' : 'Moderado',
    observacoes: 'Criado automaticamente ao adicionar uma cidade.',
    cor: '#8B5CF6',
    privado: true,
    automatico: true,
  });

  return 'Roteiro 1';
}
