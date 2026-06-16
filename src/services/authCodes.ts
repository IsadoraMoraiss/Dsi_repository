import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export type EmailCode = {
  id: string;
  email: string;
  code: string;
  type: 'verification' | 'resetPassword';
  expiresAt: string;
  used: boolean;
};

const COLLECTION_NAME = 'emailCodes';

/**
 * Gera um código numérico de 6 dígitos.
 */
export function generateNumericCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Cria e armazena um novo código no Firestore.
 * O código expira em 10 minutos por padrão.
 */
export async function createAndSendCode(email: string, type: 'verification' | 'resetPassword'): Promise<string> {
  if (!db) throw new Error('Firestore não inicializado');

  const code = generateNumericCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expirar em 10 minutos

  const newRef = doc(collection(db, COLLECTION_NAME));
  const emailCode: EmailCode = {
    id: newRef.id,
    email,
    code,
    type,
    expiresAt: expiresAt.toISOString(),
    used: false,
  };

  await setDoc(newRef, emailCode);

  // TODO: Em um ambiente de produção, usaríamos uma Cloud Function acionada pela criação
  // deste documento para enviar o e-mail (ex: via SendGrid, Resend, etc).
  // Aqui apenas simulamos o envio logando o código no console.
  console.log(`[SIMULAÇÃO DE EMAIL] Enviado para ${email} o código: ${code}`);

  return code;
}

/**
 * Valida o código informado pelo usuário.
 */
export async function validateCode(email: string, code: string, type: 'verification' | 'resetPassword'): Promise<boolean> {
  if (!db) return false;

  const q = query(
    collection(db, COLLECTION_NAME),
    where('email', '==', email),
    where('code', '==', code),
    where('type', '==', type),
    where('used', '==', false)
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return false; // Código não encontrado ou já usado
  }

  // Verifica expiração
  let validDoc = null;
  const now = new Date();

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data() as EmailCode;
    const expiration = new Date(data.expiresAt);
    if (expiration > now) {
      validDoc = { ...data, id: docSnapshot.id };
      break;
    }
  }

  if (!validDoc) {
    return false; // Todos os códigos expiraram
  }

  // Marca como usado
  await updateDoc(doc(db, COLLECTION_NAME, validDoc.id), { used: true });

  return true;
}
