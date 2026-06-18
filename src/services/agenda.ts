import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export type AgendaItem = {
  id: string;
  userId: string;
  data: string; // formato YYYY-MM-DD
  titulo: string;
  horario: string; // formato HH:mm, opcional na UI
  local: string;
  descricao: string;
  createdAt: string;
};

const COLLECTION_NAME = 'agendas';

export async function listarAgendas(userId: string): Promise<AgendaItem[]> {
  if (!db) return [];

  console.log("BUSCANDO AGENDAS:", userId);

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('data', 'asc'),
      orderBy('horario', 'asc')
    );

    const snapshot = await getDocs(q);

    console.log('[Agenda] Documentos encontrados no Firestore:', snapshot.size);

    const items = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const item = {
        ...data,
        id: docSnap.id,
        titulo: data.titulo ?? data.local ?? 'Evento',
        horario: data.horario ?? '',
        descricao: data.descricao ?? '',
      } as AgendaItem;
      console.log('[Agenda] Item lido:', JSON.stringify(item));
      return item;
    });

    return items;

  } catch (error) {
    console.log('[Agenda] ERRO AO CARREGAR AGENDAS:', error);
    return [];
  }
}

export async function criarAgenda(
  userId: string,
  data: string,
  titulo: string,
  horario: string,
  local: string,
  descricao: string
): Promise<AgendaItem> {
  if (!db) throw new Error('Firestore não inicializado');

  const newRef = doc(collection(db, COLLECTION_NAME));

  const item: AgendaItem = {
    id: newRef.id,
    userId,
    data,
    titulo,
    horario,
    local,
    descricao,
    createdAt: new Date().toISOString(),
  };

  console.log("=== CRIANDO AGENDA ===");
  console.log("USER ID:", userId);
  console.log("ITEM:", item);

  try {
    await setDoc(newRef, item);
    console.log("=== AGENDA SALVA ===");
  } catch (error) {
    console.log("ERRO FIRESTORE AGENDA:", error);
  }

  return item;
}

export async function atualizarAgenda(id: string, updates: Partial<Omit<AgendaItem, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
  if (!db) throw new Error('Firestore não inicializado');

  const ref = doc(db, COLLECTION_NAME, id);
  await updateDoc(ref, updates);
}

export async function excluirAgenda(id: string): Promise<void> {
  if (!db) throw new Error('Firestore não inicializado');

  const ref = doc(db, COLLECTION_NAME, id);
  await deleteDoc(ref);
}
