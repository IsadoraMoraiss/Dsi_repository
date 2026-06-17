import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export type ChecklistItem = {
  id: string;
  userId: string;
  titulo: string;
  prazo?: string;
  concluido: boolean;
  createdAt: string;
};

const COLLECTION_NAME = 'checklists';

export async function listarChecklists(userId: string): Promise<ChecklistItem[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as ChecklistItem);
}

export async function criarChecklist(userId: string, titulo: string, prazo?: string): Promise<ChecklistItem> {
  if (!db) throw new Error('Firestore não inicializado');

  const newRef = doc(collection(db, COLLECTION_NAME));

  const item: ChecklistItem = {
    id: newRef.id,
    userId,
    titulo,
    prazo,
    concluido: false,
    createdAt: new Date().toISOString(),
  };

  console.log("=== CRIANDO CHECKLIST ===");
  console.log("USER ID:", userId);
  console.log("ITEM:", item);

  try {
    await setDoc(newRef, item);
    console.log("=== CHECKLIST SALVO ===");
  } catch (error) {
    console.log("ERRO FIRESTORE:", error);
  }
  return item;
}

export async function atualizarChecklist(id: string, updates: Partial<Omit<ChecklistItem, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
  if (!db) throw new Error('Firestore não inicializado');

  const ref = doc(db, COLLECTION_NAME, id);
  await updateDoc(ref, updates);
}

export async function excluirChecklist(id: string): Promise<void> {
  if (!db) throw new Error('Firestore não inicializado');

  const ref = doc(db, COLLECTION_NAME, id);
  await deleteDoc(ref);
}
