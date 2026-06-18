import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type GuiaCadastroPayload = {
  nome: string;
  telefone: string;
  cidade: string;
  cidadeId: string;
  codigoIdentificacao: string;
  especializacao: string;
  idiomas: string[];
  experiencia: string;
  valor: string;
  tipoCobranca: 'pessoa' | 'grupo';
  descricao: string;
  foto_perfil?: string;
};

export type GuiaCadastro = GuiaCadastroPayload & {
  id: string;
  ownerUid: string;
  cidades: string[];
  cidadeIds: string[];
  status: 'pendente' | 'aprovado' | 'rejeitado';
  createdAt?: string;
  updatedAt?: string;
};

export async function buscarMeuCadastroGuia(uid: string): Promise<GuiaCadastro | null> {
  if (!db) return null;

  const snap = await getDoc(doc(db, 'guias', uid));
  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() } as GuiaCadastro;
}

export async function salvarCadastroGuia(uid: string, payload: GuiaCadastroPayload): Promise<void> {
  if (!db) throw new Error('Firebase nao configurado.');

  const ref = doc(db, 'guias', uid);
  const snap = await getDoc(ref);
  const now = new Date().toISOString();

  await setDoc(
    ref,
    {
      ...payload,
      ownerUid: uid,
      cidades: [payload.cidade],
      cidadeIds: [payload.cidadeId],
      status: snap.exists() ? snap.data().status ?? 'pendente' : 'pendente',
      ...(snap.exists() ? {} : { createdAt: now }),
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function excluirCadastroGuia(uid: string): Promise<void> {
  if (!db) throw new Error('Firebase nao configurado.');

  await deleteDoc(doc(db, 'guias', uid));
}
