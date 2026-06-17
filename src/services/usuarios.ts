import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type UsuarioPerfilPayload = {
  nome?: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
  avatarUrl?: string;
  preferenciasConcluidas?: boolean;
  preferencias?: Record<string, unknown>;
  requisitos?: string[];
  roteirosSalvos?: string[];
};

export async function garantirPerfilUsuario(user: User, extra: UsuarioPerfilPayload = {}) {
  if (!db) throw new Error('Firebase nao configurado.');

  const ref = doc(db, 'usuarios', user.uid);
  const snap = await getDoc(ref);
  const data = snap.data();
  const now = new Date().toISOString();

  await setDoc(
    ref,
    {
      nome: extra.nome ?? user.displayName ?? data?.nome ?? 'Usuário',
      email: extra.email ?? user.email ?? data?.email ?? '',
      telefone: extra.telefone ?? data?.telefone ?? '',
      dataNascimento: extra.dataNascimento ?? data?.dataNascimento ?? '',
      avatarUrl: extra.avatarUrl ?? data?.avatarUrl ?? '',
      preferenciasConcluidas: extra.preferenciasConcluidas ?? data?.preferenciasConcluidas ?? false,
      preferencias: extra.preferencias ?? data?.preferencias ?? {},
      requisitos: extra.requisitos ?? data?.requisitos ?? [],
      roteirosSalvos: extra.roteirosSalvos ?? data?.roteirosSalvos ?? [],
      ...(snap.exists() ? {} : { createdAt: now }),
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function salvarPerfilUsuario(uid: string, payload: UsuarioPerfilPayload) {
  if (!db) throw new Error('Firebase nao configurado.');

  await setDoc(
    doc(db, 'usuarios', uid),
    {
      ...payload,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

/** Busca o nome de exibição de um usuário pelo uid. Retorna null se não encontrado. */
export async function buscarNomeUsuario(uid: string): Promise<string | null> {
  if (!db || !uid) return null;
  try {
    const snap = await getDoc(doc(db, 'usuarios', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return (data?.nome as string | undefined) || null;
  } catch {
    return null;
  }
}

