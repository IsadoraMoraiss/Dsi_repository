import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  initializeAuth,
  // @ts-ignore - getReactNativePersistence é exportado em runtime mas pode nao ter tipos
  getReactNativePersistence,
} from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

if (!isFirebaseConfigured) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => `EXPO_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`)
    .join(', ');
  console.error(
    `[firebase] Configuracao ausente. Defina no .env: ${missing}. ` +
      'Sem isso, o login/cadastro nao funcionam. Reinicie o Expo com "npx expo start -c" apos criar o .env.',
  );
}

const app = isFirebaseConfigured
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp()
  : null;

function createAuth(): Auth | null {
  if (!app) return null;

  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (err: any) {
    // Ja foi inicializado (hot reload) -> usa a instancia existente
    if (err?.code === 'auth/already-initialized') {
      return getAuth(app);
    }
    console.warn('[firebase] Falha ao inicializar Auth com persistencia, usando getAuth:', err);
    return getAuth(app);
  }
}

export const auth: Auth | null = createAuth();
export const db: Firestore | null = app ? getFirestore(app) : null;
